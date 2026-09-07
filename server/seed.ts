import { drizzle } from "drizzle-orm/mysql2";
import {
  invoices,
  payments,
  properties,
  reminderLogs,
  reminderSettings,
  tenants,
} from "../drizzle/schema";
import { format } from "date-fns";

async function runSeed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const db = drizzle(process.env.DATABASE_URL);

  console.log("Checking existing seed data...");
  const existingProperties = await db.select().from(properties);
  if (existingProperties.length > 0) {
    console.log("Data already exists, skipping initial seed.");
    process.exit(0);
  }

  console.log("Inserting properties...");
  await db.insert(properties).values([
    {
      name: "Highland Residences",
      address: "742 Evergreen Terrace, Unit Complex A",
      city: "Springfield",
      managerName: "Marcus Vance",
      managerPhone: "+1 (555) 392-1084",
      managerEmail: "marcus.vance@highlandpm.com",
      currency: "USD",
    },
    {
      name: "Oakridge Courtyard",
      address: "1208 Elm Park Blvd",
      city: "Riverside",
      managerName: "Elena Rostova",
      managerPhone: "+1 (555) 774-9022",
      managerEmail: "elena@oakridgeproperties.com",
      currency: "USD",
    },
  ]);

  const props = await db.select().from(properties);
  const p1 = props[0].id;
  const p2 = props[1].id;

  console.log("Inserting tenants with varied debt and payment statuses...");
  await db.insert(tenants).values([
    {
      propertyId: p1,
      unitNumber: "204B",
      fullName: "Maya Lin",
      email: "maya.lin@example.com",
      phone: "+1 (555) 234-8891",
      rentAmount: "1850.00",
      dueDayOfMonth: 1,
      gracePeriodDays: 5,
      currentBalance: "1850.00",
      status: "overdue",
      autoRemindersEnabled: true,
      reminderChannel: "both",
      notes: "September rent still outstanding. Friendly reminder queued.",
    },
    {
      propertyId: p1,
      unitNumber: "102A",
      fullName: "David Chen",
      email: "david.chen@example.com",
      phone: "+1 (555) 612-4433",
      rentAmount: "2100.00",
      dueDayOfMonth: 1,
      gracePeriodDays: 5,
      currentBalance: "600.00",
      status: "overdue",
      autoRemindersEnabled: true,
      reminderChannel: "sms",
      notes: "Made partial payment on the 3rd. Remaining balance is $600.",
    },
    {
      propertyId: p2,
      unitNumber: "305",
      fullName: "Amara Johnson",
      email: "amara.j@example.com",
      phone: "+1 (555) 498-3310",
      rentAmount: "1650.00",
      dueDayOfMonth: 1,
      gracePeriodDays: 5,
      currentBalance: "0.00",
      status: "paid",
      autoRemindersEnabled: true,
      reminderChannel: "both",
      notes: "Rent cleared early. Zero debt.",
    },
    {
      propertyId: p2,
      unitNumber: "410",
      fullName: "Liam O'Connor",
      email: "liam.oc@example.com",
      phone: "+1 (555) 901-2244",
      rentAmount: "1950.00",
      dueDayOfMonth: 10,
      gracePeriodDays: 3,
      currentBalance: "1950.00",
      status: "active",
      autoRemindersEnabled: true,
      reminderChannel: "both",
      notes: "Due on the 10th. Approaching reminder window active.",
    },
  ]);

  const allTenants = await db.select().from(tenants);

  console.log("Inserting invoices and initial payments...");
  for (const t of allTenants) {
    const isPaid = parseFloat(t.currentBalance) === 0;
    const isPartial =
      parseFloat(t.currentBalance) > 0 &&
      parseFloat(t.currentBalance) < parseFloat(t.rentAmount);

    const paidVal = isPaid
      ? t.rentAmount
      : isPartial
      ? (parseFloat(t.rentAmount) - parseFloat(t.currentBalance)).toFixed(2)
      : "0.00";

    const dueDate = new Date(2026, 8, t.dueDayOfMonth, 12, 0, 0);
    const graceDate = new Date(
      2026,
      8,
      t.dueDayOfMonth + t.gracePeriodDays,
      23,
      59,
      59
    );

    await db.insert(invoices).values({
      tenantId: t.id,
      invoiceNumber: `INV-202609-${t.unitNumber.replace(/[^A-Za-z0-9]/g, "")}`,
      periodLabel: "September 2026 Rent",
      amountDue: t.rentAmount,
      amountPaid: paidVal,
      dueDate,
      graceUntilDate: graceDate,
      status: isPaid ? "paid" : isPartial ? "partially_paid" : "overdue",
    });

    if (parseFloat(paidVal) > 0) {
      const nextDue = new Date(2026, 9, t.dueDayOfMonth, 12, 0, 0);
      const nextDueStr = format(nextDue, "MMMM d, yyyy");
      const balStr = `$${t.currentBalance}`;

      const receiptMsg = `This is your balance: ${balStr}, and this is what is left for you to pay. By ${nextDueStr}, you need to pay it. (Payment received: $${paidVal} via ACH transfer ref: ACH-${t.id}992)`;

      await db.insert(payments).values({
        tenantId: t.id,
        amount: paidVal,
        paymentMethod: "ach_transfer",
        referenceNumber: `ACH-202609-${t.id}`,
        balanceAfterPayment: t.currentBalance,
        nextDueDateAfterPayment: nextDue,
        receiptMessage: receiptMsg,
      });

      await db.insert(reminderLogs).values({
        tenantId: t.id,
        triggerType: "payment_receipt",
        channel: t.reminderChannel === "email" ? "email" : "sms",
        recipient: t.reminderChannel === "email" ? t.email : t.phone,
        messageTitle: `Payment received: $${paidVal} (Balance: ${balStr})`,
        messageBody: receiptMsg,
        balanceMentioned: t.currentBalance,
        dueDateMentioned: nextDue,
        status: "delivered",
      });
    }

    if (parseFloat(t.currentBalance) > 0) {
      const nextDue = new Date(2026, 8, t.dueDayOfMonth, 12, 0, 0);
      await db.insert(reminderLogs).values({
        tenantId: t.id,
        triggerType: t.status === "overdue" ? "overdue" : "approaching",
        channel: "sms",
        recipient: t.phone,
        messageTitle: `Rent Reminder for Unit ${t.unitNumber}`,
        messageBody: `Hi ${t.fullName}, this is an automatic reminder that your balance is $${t.currentBalance}. Please submit your payment promptly.`,
        balanceMentioned: t.currentBalance,
        dueDateMentioned: nextDue,
        status: "delivered",
      });
    }
  }

  console.log("Setting up reminder settings...");
  await db.insert(reminderSettings).values({
    daysBeforeDueNotice: 3,
    sendOnDueDate: true,
    overdueFrequencyDays: 2,
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    autoDispatchEnabled: true,
    smsTemplateApproaching:
      "Hi {{tenant_name}}, friendly reminder from {{property_name}}: your rent of {{rent_amount}} is due on {{due_date}}. Outstanding balance: {{balance}}. Contact: {{manager_phone}}.",
    smsTemplateOverdue:
      "URGENT: Hi {{tenant_name}}, your rent payment to {{property_name}} is overdue. Your outstanding debt is {{balance}}. Please make payment immediately or contact {{manager_phone}}.",
    smsTemplateReceipt:
      "Payment Received! Thank you {{tenant_name}}. This is your balance: {{balance_after}}, and this is what is left for you to pay. By {{next_due_date}}, you need to pay it.",
  });

  console.log("Seed complete!");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
