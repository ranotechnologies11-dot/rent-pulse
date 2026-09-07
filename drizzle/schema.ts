import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull().default("Metropolis"),
  managerName: varchar("managerName", { length: 120 }).notNull().default("Property Desk"),
  managerPhone: varchar("managerPhone", { length: 50 }).notNull().default("+1 (555) 019-2834"),
  managerEmail: varchar("managerEmail", { length: 191 }).notNull().default("billing@rentpulse.local"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  unitNumber: varchar("unitNumber", { length: 50 }).notNull(),
  fullName: varchar("fullName", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  rentAmount: decimal("rentAmount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  dueDayOfMonth: int("dueDayOfMonth").notNull().default(1),
  gracePeriodDays: int("gracePeriodDays").notNull().default(5),
  currentBalance: decimal("currentBalance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["active", "grace", "overdue", "paid"]).notNull().default("active"),
  autoRemindersEnabled: boolean("autoRemindersEnabled").notNull().default(true),
  reminderChannel: mysqlEnum("reminderChannel", ["sms", "email", "both"]).notNull().default("both"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }).notNull().unique(),
  periodLabel: varchar("periodLabel", { length: 80 }).notNull(),
  amountDue: decimal("amountDue", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }).notNull().default("0.00"),
  dueDate: timestamp("dueDate").notNull(),
  graceUntilDate: timestamp("graceUntilDate").notNull(),
  status: mysqlEnum("status", ["unpaid", "partially_paid", "paid", "overdue"]).notNull().default("unpaid"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  invoiceId: int("invoiceId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull().default("bank_transfer"),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  balanceAfterPayment: decimal("balanceAfterPayment", { precision: 10, scale: 2 }).notNull(),
  nextDueDateAfterPayment: timestamp("nextDueDateAfterPayment"),
  receiptMessage: text("receiptMessage").notNull(),
  paidAt: timestamp("paidAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const reminderLogs = mysqlTable("reminderLogs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  invoiceId: int("invoiceId"),
  triggerType: mysqlEnum("triggerType", [
    "approaching",
    "due_today",
    "overdue",
    "payment_receipt",
    "manual",
    "scheduled_heartbeat"
  ]).notNull(),
  channel: mysqlEnum("channel", ["sms", "email"]).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  messageTitle: varchar("messageTitle", { length: 255 }).notNull(),
  messageBody: text("messageBody").notNull(),
  balanceMentioned: decimal("balanceMentioned", { precision: 10, scale: 2 }).notNull(),
  dueDateMentioned: timestamp("dueDateMentioned"),
  status: mysqlEnum("status", ["queued", "sent", "delivered", "failed"]).notNull().default("sent"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReminderLog = typeof reminderLogs.$inferSelect;
export type InsertReminderLog = typeof reminderLogs.$inferInsert;

export const reminderSettings = mysqlTable("reminderSettings", {
  id: int("id").autoincrement().primaryKey(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  daysBeforeDueNotice: int("daysBeforeDueNotice").notNull().default(3),
  sendOnDueDate: boolean("sendOnDueDate").notNull().default(true),
  overdueFrequencyDays: int("overdueFrequencyDays").notNull().default(2),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }).notNull().default("21:00"),
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }).notNull().default("08:00"),
  autoDispatchEnabled: boolean("autoDispatchEnabled").notNull().default(true),
  smsTemplateApproaching: text("smsTemplateApproaching").notNull(),
  smsTemplateOverdue: text("smsTemplateOverdue").notNull(),
  smsTemplateReceipt: text("smsTemplateReceipt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReminderSettings = typeof reminderSettings.$inferSelect;
export type InsertReminderSettings = typeof reminderSettings.$inferInsert;
