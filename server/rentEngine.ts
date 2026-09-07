import { format } from "date-fns";
import {
  createInvoice,
  createReminderLog,
  ensureReminderSettings,
  getDb,
  getTenantById,
  listInvoicesByTenant,
  recordPayment,
  updateInvoice,
  updateTenant,
} from "./db";
import { invoices, properties, tenants } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export function formatCurrency(amount: string | number, currency = "USD") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number.isNaN(num) ? 0 : num);
}

export function compileTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, val);
  }
  return result;
}

export function computeNextDueDate(dueDayOfMonth: number, baseDate = new Date()): Date {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const thisMonthDue = new Date(year, month, dueDayOfMonth, 12, 0, 0);

  if (baseDate.getDate() <= dueDayOfMonth) {
    return thisMonthDue;
  }
  return new Date(year, month + 1, dueDayOfMonth, 12, 0, 0);
}

export async function processTenantPayment(params: {
  tenantId: number;
  amount: number;
  paymentMethod?: string;
  referenceNumber?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const record = await getTenantById(params.tenantId);
  if (!record) throw new Error("Tenant not found");
  const { tenant, property } = record;

  const currentBal = parseFloat(tenant.currentBalance);
  const paymentAmount = Math.max(0, params.amount);
  const newBalance = Math.max(0, currentBal - paymentAmount);

  // Determine next due date
  const nextDue = computeNextDueDate(tenant.dueDayOfMonth, new Date());
  const formattedNextDue = format(nextDue, "MMMM d, yyyy");

  // Determine new tenant status
  let nextStatus: "active" | "grace" | "overdue" | "paid" = "active";
  if (newBalance === 0) {
    nextStatus = "paid";
  } else {
    const todayDay = new Date().getDate();
    if (todayDay > tenant.dueDayOfMonth + tenant.gracePeriodDays) {
      nextStatus = "overdue";
    } else if (todayDay > tenant.dueDayOfMonth) {
      nextStatus = "grace";
    } else {
      nextStatus = "active";
    }
  }

  // Exact required message prompt phrasing:
  // "This is your balance, and this is what is left for you to pay. By this time, you need to pay it."
  const receiptMessage = `This is your balance: ${formatCurrency(
    newBalance,
    property.currency
  )}, and this is what is left for you to pay. By ${formattedNextDue}, you need to pay it. (Payment received: ${formatCurrency(
    paymentAmount,
    property.currency
  )} via ${params.paymentMethod ?? "bank transfer"}${
    params.referenceNumber ? ` ref: ${params.referenceNumber}` : ""
  })`;

  // Save payment record
  const paymentId = await recordPayment({
    tenantId: tenant.id,
    amount: paymentAmount.toFixed(2),
    paymentMethod: params.paymentMethod || "bank_transfer",
    referenceNumber: params.referenceNumber || `PAY-${Date.now().toString().slice(-6)}`,
    balanceAfterPayment: newBalance.toFixed(2),
    nextDueDateAfterPayment: nextDue,
    receiptMessage,
  });

  // Apply to existing open invoices
  const openInvoices = await listInvoicesByTenant(tenant.id);
  let remainingCredit = paymentAmount;
  for (const inv of openInvoices) {
    if (remainingCredit <= 0) break;
    const invDue = parseFloat(inv.amountDue);
    const invPaid = parseFloat(inv.amountPaid);
    const invOwed = Math.max(0, invDue - invPaid);
    if (invOwed > 0) {
      const settle = Math.min(remainingCredit, invOwed);
      const updatedPaid = invPaid + settle;
      remainingCredit -= settle;
      await updateInvoice(inv.id, {
        amountPaid: updatedPaid.toFixed(2),
        status: updatedPaid >= invDue ? "paid" : "partially_paid",
      });
    }
  }

  // Update tenant balance and status
  await updateTenant(tenant.id, {
    currentBalance: newBalance.toFixed(2),
    status: nextStatus,
  });

  // Dispatch payment receipt reminder log
  await createReminderLog({
    tenantId: tenant.id,
    triggerType: "payment_receipt",
    channel: tenant.reminderChannel === "email" ? "email" : "sms",
    recipient: tenant.reminderChannel === "email" ? tenant.email : tenant.phone,
    messageTitle: `Payment confirmation & updated balance: ${formatCurrency(
      newBalance,
      property.currency
    )}`,
    messageBody: receiptMessage,
    balanceMentioned: newBalance.toFixed(2),
    dueDateMentioned: nextDue,
    status: "delivered",
  });

  return {
    paymentId,
    previousBalance: currentBal.toFixed(2),
    newBalance: newBalance.toFixed(2),
    paymentAmount: paymentAmount.toFixed(2),
    receiptMessage,
    nextDueDate: nextDue,
    nextStatus,
  };
}

export async function sendManualReminder(params: {
  tenantId: number;
  triggerType?: "approaching" | "due_today" | "overdue" | "manual";
  customMessage?: string;
  channel?: "sms" | "email";
}) {
  const record = await getTenantById(params.tenantId);
  if (!record) throw new Error("Tenant not found");
  const { tenant, property } = record;
  const settings = await ensureReminderSettings();

  const nextDue = computeNextDueDate(tenant.dueDayOfMonth, new Date());
  const dueDateStr = format(nextDue, "MMMM d, yyyy");
  const balanceStr = formatCurrency(tenant.currentBalance, property.currency);
  const rentStr = formatCurrency(tenant.rentAmount, property.currency);

  const triggerType = params.triggerType ?? (parseFloat(tenant.currentBalance) > 0 ? "overdue" : "approaching");
  const channel = params.channel ?? (tenant.reminderChannel === "email" ? "email" : "sms");
  const recipient = channel === "email" ? tenant.email : tenant.phone;

  let body = params.customMessage;
  if (!body) {
    const rawTemplate =
      triggerType === "overdue"
        ? settings.smsTemplateOverdue
        : settings.smsTemplateApproaching;

    body = compileTemplate(rawTemplate, {
      tenant_name: tenant.fullName,
      unit_number: tenant.unitNumber,
      property_name: property.name,
      rent_amount: rentStr,
      balance: balanceStr,
      due_date: dueDateStr,
      manager_phone: property.managerPhone,
    });
  }

  const title =
    triggerType === "overdue"
      ? `Overdue Notice: ${balanceStr} balance for Unit ${tenant.unitNumber}`
      : `Upcoming Rent Reminder: Due on ${dueDateStr}`;

  const logId = await createReminderLog({
    tenantId: tenant.id,
    triggerType,
    channel,
    recipient,
    messageTitle: title,
    messageBody: body,
    balanceMentioned: tenant.currentBalance,
    dueDateMentioned: nextDue,
    status: "delivered",
  });

  return {
    logId,
    recipient,
    channel,
    title,
    body,
    balance: tenant.currentBalance,
    dueDate: nextDue,
  };
}

export async function runAutomatedReminderCheck(triggerSource = "manual_or_cron") {
  const db = await getDb();
  if (!db) return { processed: 0, sent: 0, details: [] };

  const settings = await ensureReminderSettings();
  const allTenants = await db
    .select({
      tenant: tenants,
      property: properties,
    })
    .from(tenants)
    .innerJoin(properties, eq(tenants.propertyId, properties.id));

  const now = new Date();
  const currentDay = now.getDate();
  const results: Array<{
    tenantId: number;
    tenantName: string;
    unit: string;
    type: string;
    sent: boolean;
    balance: string;
    reason: string;
  }> = [];

  for (const { tenant, property } of allTenants) {
    if (!tenant.autoRemindersEnabled) {
      results.push({
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        unit: tenant.unitNumber,
        type: "skipped",
        sent: false,
        balance: tenant.currentBalance,
        reason: "Auto-reminders disabled for tenant",
      });
      continue;
    }

    const dueDay = tenant.dueDayOfMonth;
    const balanceNum = parseFloat(tenant.currentBalance);
    const daysUntilDue = dueDay - currentDay;

    let targetType: "approaching" | "due_today" | "overdue" | null = null;

    if (balanceNum > 0) {
      if (currentDay > dueDay + tenant.gracePeriodDays) {
        targetType = "overdue";
      } else if (currentDay === dueDay) {
        targetType = "due_today";
      } else if (daysUntilDue > 0 && daysUntilDue <= settings.daysBeforeDueNotice) {
        targetType = "approaching";
      }
    }

    if (targetType) {
      const nextDue = computeNextDueDate(tenant.dueDayOfMonth, now);
      const body = compileTemplate(
        targetType === "overdue"
          ? settings.smsTemplateOverdue
          : settings.smsTemplateApproaching,
        {
          tenant_name: tenant.fullName,
          unit_number: tenant.unitNumber,
          property_name: property.name,
          rent_amount: formatCurrency(tenant.rentAmount, property.currency),
          balance: formatCurrency(tenant.currentBalance, property.currency),
          due_date: format(nextDue, "MMMM d, yyyy"),
          manager_phone: property.managerPhone,
        }
      );

      const title =
        targetType === "overdue"
          ? `[Auto Alert] Overdue Rent: ${formatCurrency(
              tenant.currentBalance,
              property.currency
            )}`
          : `[Auto Alert] Rent Due Soon: ${format(nextDue, "MMM d")}`;

      const channel = tenant.reminderChannel === "email" ? "email" : "sms";
      await createReminderLog({
        tenantId: tenant.id,
        triggerType: targetType,
        channel,
        recipient: channel === "email" ? tenant.email : tenant.phone,
        messageTitle: title,
        messageBody: body,
        balanceMentioned: tenant.currentBalance,
        dueDateMentioned: nextDue,
        status: "delivered",
      });

      results.push({
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        unit: tenant.unitNumber,
        type: targetType,
        sent: true,
        balance: tenant.currentBalance,
        reason: `Triggered by automated rules (${targetType})`,
      });
    } else {
      results.push({
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        unit: tenant.unitNumber,
        type: "none",
        sent: false,
        balance: tenant.currentBalance,
        reason: "No notification condition met (balance settled or not within window)",
      });
    }
  }

  return {
    source: triggerSource,
    processed: allTenants.length,
    sent: results.filter((r) => r.sent).length,
    details: results,
  };
}
