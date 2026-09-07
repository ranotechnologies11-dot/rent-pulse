import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertInvoice,
  InsertPayment,
  InsertProperty,
  InsertReminderLog,
  InsertReminderSettings,
  InsertTenant,
  InsertUser,
  invoices,
  payments,
  properties,
  reminderLogs,
  reminderSettings,
  tenants,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// Properties
export async function listProperties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).orderBy(desc(properties.id));
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const res = await db.insert(properties).values(data);
  return res[0]?.insertId;
}

// Tenants
export async function listTenantsWithProperty() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: tenants.id,
      propertyId: tenants.propertyId,
      propertyName: properties.name,
      propertyCity: properties.city,
      managerPhone: properties.managerPhone,
      unitNumber: tenants.unitNumber,
      fullName: tenants.fullName,
      email: tenants.email,
      phone: tenants.phone,
      rentAmount: tenants.rentAmount,
      dueDayOfMonth: tenants.dueDayOfMonth,
      gracePeriodDays: tenants.gracePeriodDays,
      currentBalance: tenants.currentBalance,
      status: tenants.status,
      autoRemindersEnabled: tenants.autoRemindersEnabled,
      reminderChannel: tenants.reminderChannel,
      notes: tenants.notes,
      createdAt: tenants.createdAt,
      updatedAt: tenants.updatedAt,
    })
    .from(tenants)
    .innerJoin(properties, eq(tenants.propertyId, properties.id))
    .orderBy(desc(tenants.currentBalance), tenants.fullName);
}

export async function getTenantById(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({
      tenant: tenants,
      property: properties,
    })
    .from(tenants)
    .innerJoin(properties, eq(tenants.propertyId, properties.id))
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return rows[0];
}

export async function createTenant(data: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const res = await db.insert(tenants).values(data);
  return res[0]?.insertId;
}

export async function updateTenant(tenantId: number, patch: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(tenants).set(patch).where(eq(tenants.id, tenantId));
}

// Invoices
export async function listInvoicesByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(desc(invoices.dueDate));
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const res = await db.insert(invoices).values(data);
  return res[0]?.insertId;
}

export async function updateInvoice(invoiceId: number, patch: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(invoices).set(patch).where(eq(invoices.id, invoiceId));
}

// Payments
export async function listPayments(limitCount = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: payments.id,
      tenantId: payments.tenantId,
      tenantName: tenants.fullName,
      unitNumber: tenants.unitNumber,
      amount: payments.amount,
      paymentMethod: payments.paymentMethod,
      referenceNumber: payments.referenceNumber,
      balanceAfterPayment: payments.balanceAfterPayment,
      receiptMessage: payments.receiptMessage,
      paidAt: payments.paidAt,
    })
    .from(payments)
    .innerJoin(tenants, eq(payments.tenantId, tenants.id))
    .orderBy(desc(payments.paidAt))
    .limit(limitCount);
}

export async function listPaymentsByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(payments)
    .where(eq(payments.tenantId, tenantId))
    .orderBy(desc(payments.paidAt));
}

export async function recordPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const res = await db.insert(payments).values(data);
  return res[0]?.insertId;
}

// Reminder Logs
export async function listReminderLogs(limitCount = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: reminderLogs.id,
      tenantId: reminderLogs.tenantId,
      tenantName: tenants.fullName,
      unitNumber: tenants.unitNumber,
      triggerType: reminderLogs.triggerType,
      channel: reminderLogs.channel,
      recipient: reminderLogs.recipient,
      messageTitle: reminderLogs.messageTitle,
      messageBody: reminderLogs.messageBody,
      balanceMentioned: reminderLogs.balanceMentioned,
      dueDateMentioned: reminderLogs.dueDateMentioned,
      status: reminderLogs.status,
      sentAt: reminderLogs.sentAt,
    })
    .from(reminderLogs)
    .innerJoin(tenants, eq(reminderLogs.tenantId, tenants.id))
    .orderBy(desc(reminderLogs.sentAt))
    .limit(limitCount);
}

export async function listReminderLogsByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reminderLogs)
    .where(eq(reminderLogs.tenantId, tenantId))
    .orderBy(desc(reminderLogs.sentAt));
}

export async function createReminderLog(data: InsertReminderLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const res = await db.insert(reminderLogs).values(data);
  return res[0]?.insertId;
}

// Settings
export async function getReminderSettings() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(reminderSettings).limit(1);
  return rows[0] ?? null;
}

export async function ensureReminderSettings(): Promise<typeof reminderSettings.$inferSelect> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await getReminderSettings();
  if (existing) return existing;

  const defaultTemplates = {
    daysBeforeDueNotice: 3,
    sendOnDueDate: true,
    overdueFrequencyDays: 2,
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    autoDispatchEnabled: true,
    smsTemplateApproaching:
      "Hi {{tenant_name}}, friendly reminder from {{property_name}}: your upcoming rent of {{rent_amount}} is due on {{due_date}}. Your total outstanding balance is {{balance}}. Please make your payment on or before the due date.",
    smsTemplateOverdue:
      "Notice: Hi {{tenant_name}}, your rent payment to {{property_name}} is currently overdue. Your outstanding balance is {{balance}}. Immediate payment is required to avoid further actions.",
    smsTemplateReceipt:
      "Payment Received! Thank you {{tenant_name}}. We received {{payment_amount}}. This is your balance: {{balance_after}}, and this is what is left for you to pay. By {{next_due_date}}, you need to pay it.",
  };

  await db.insert(reminderSettings).values(defaultTemplates);
  const rows = await db.select().from(reminderSettings).limit(1);
  return rows[0]!;
}

export async function updateReminderSettings(patch: Partial<InsertReminderSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const current = await ensureReminderSettings();
  await db.update(reminderSettings).set(patch).where(eq(reminderSettings.id, current.id));
  return getReminderSettings();
}

// Overview stats
export async function getDashboardOverview() {
  const db = await getDb();
  if (!db) {
    return {
      totalProperties: 0,
      totalTenants: 0,
      totalDebt: "0.00",
      overdueTenantsCount: 0,
      collectedThisMonth: "0.00",
    };
  }

  const [propCount] = await db.select({ count: sql<number>`count(*)` }).from(properties);
  const [tenantStats] = await db
    .select({
      count: sql<number>`count(*)`,
      totalDebt: sql<string>`coalesce(sum(${tenants.currentBalance}), 0)`,
      overdueCount: sql<number>`coalesce(sum(case when ${tenants.currentBalance} > 0 and ${tenants.status} = 'overdue' then 1 else 0 end), 0)`,
    })
    .from(tenants);

  const [paymentStats] = await db
    .select({
      totalPaid: sql<string>`coalesce(sum(${payments.amount}), 0)`,
    })
    .from(payments);

  return {
    totalProperties: Number(propCount?.count || 0),
    totalTenants: Number(tenantStats?.count || 0),
    totalDebt: Number(tenantStats?.totalDebt || 0).toFixed(2),
    overdueTenantsCount: Number(tenantStats?.overdueCount || 0),
    collectedThisMonth: Number(paymentStats?.totalPaid || 0).toFixed(2),
  };
}
