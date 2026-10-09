import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createProperty, createTenant, ensureReminderSettings, getDashboardOverview, getTenantById, listInvoicesByTenant, listPayments, listPaymentsByTenant, listProperties, listReminderLogs, listReminderLogsByTenant, listTenantsWithProperty, updateReminderSettings, updateTenant } from "./db";
import { processTenantPayment, runAutomatedReminderCheck, sendManualReminder } from "./rentEngine";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const landlord = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.supabase || !ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "A Supabase landlord session is required." });
  return next({ ctx: { ...ctx, supabase: ctx.supabase, user: ctx.user } });
});

const safeText = (max: number, min = 1) => z.string().trim().min(min).max(max);
const phone = safeText(32, 5).regex(/^\+?[0-9 ()-]+$/, "Enter a valid phone number.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM time.");
const boundedId = z.number().int().positive();
const boundedLimit = (fallback: number, max: number) => z.number().int().min(1).max(max).default(fallback);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true as const }; }),
  }),
  dashboard: router({ stats: landlord.query(({ ctx }) => getDashboardOverview(ctx.supabase)) }),
  properties: router({
    list: landlord.query(({ ctx }) => listProperties(ctx.supabase)),
    create: landlord.input(z.object({ name: safeText(120, 2), address: safeText(240, 3), city: safeText(80).default("Metropolis"), managerName: safeText(120, 2), managerPhone: phone, managerEmail: z.string().trim().email().max(254), currency: z.literal("KSh") })).mutation(({ ctx, input }) => createProperty(ctx.supabase, input, ctx.user.id)),
  }),
  tenants: router({
    list: landlord.query(({ ctx }) => listTenantsWithProperty(ctx.supabase)),
    getById: landlord.input(z.object({ id: boundedId })).query(async ({ ctx, input }) => { const record = await getTenantById(ctx.supabase, input.id); if (!record) return null; const [invoices, payments, logs] = await Promise.all([listInvoicesByTenant(ctx.supabase, input.id), listPaymentsByTenant(ctx.supabase, input.id), listReminderLogsByTenant(ctx.supabase, input.id)]); return { ...record, invoices, payments, logs }; }),
    create: landlord.input(z.object({ propertyId: boundedId, unitNumber: safeText(32), fullName: safeText(120, 2), email: z.string().trim().email().max(254), phone, rentAmount: z.number().finite().positive().max(100_000_000), dueDayOfMonth: z.number().int().min(1).max(31).default(1), gracePeriodDays: z.number().int().min(0).max(15).default(5), initialDebt: z.number().finite().min(0).max(100_000_000).default(0), reminderChannel: z.enum(["sms", "email", "both"]).default("both"), notes: safeText(1000).optional() })).mutation(({ ctx, input }) => createTenant(ctx.supabase, { propertyId: input.propertyId, unitNumber: input.unitNumber, fullName: input.fullName, email: input.email, phone: input.phone, rentAmount: input.rentAmount.toFixed(2), dueDayOfMonth: input.dueDayOfMonth, gracePeriodDays: input.gracePeriodDays, currentBalance: input.initialDebt.toFixed(2), status: input.initialDebt > 0 ? "overdue" : "active", autoRemindersEnabled: true, reminderChannel: input.reminderChannel, notes: input.notes ?? null })),
    updateDebt: landlord.input(z.object({ tenantId: boundedId, newBalance: z.number().finite().min(0).max(100_000_000), notes: safeText(1000).optional() })).mutation(({ ctx, input }) => updateTenant(ctx.supabase, input.tenantId, { currentBalance: input.newBalance.toFixed(2), status: input.newBalance === 0 ? "paid" : "overdue", ...(input.notes ? { notes: input.notes } : {}) }).then(() => ({ success: true as const }))),
    toggleAutoReminders: landlord.input(z.object({ tenantId: boundedId, enabled: z.boolean() })).mutation(({ ctx, input }) => updateTenant(ctx.supabase, input.tenantId, { autoRemindersEnabled: input.enabled }).then(() => ({ success: true as const }))),
  }),
  payments: router({
    listRecent: landlord.input(z.object({ limit: boundedLimit(20, 100) })).query(({ ctx, input }) => listPayments(ctx.supabase, input.limit)),
    record: landlord.input(z.object({ tenantId: boundedId, amount: z.number().finite().positive().max(100_000_000), paymentMethod: z.enum(["cash", "bank_transfer", "mpesa_sms", "check", "zelle"]).default("bank_transfer"), referenceNumber: safeText(120).optional() })).mutation(({ ctx, input }) => processTenantPayment(ctx.supabase, input)),
  }),
  reminders: router({
    listLogs: landlord.input(z.object({ limit: boundedLimit(50, 200) })).query(({ ctx, input }) => listReminderLogs(ctx.supabase, input.limit)),
    sendSingle: landlord.input(z.object({ tenantId: boundedId, triggerType: z.enum(["approaching", "due_today", "overdue", "manual"]).optional(), customMessage: safeText(1000).optional(), channel: z.enum(["sms", "email"]).optional() })).mutation(({ ctx, input }) => sendManualReminder(ctx.supabase, input)),
    runBatchCheck: landlord.mutation(({ ctx }) => runAutomatedReminderCheck(ctx.supabase, "manual_dashboard_trigger")),
  }),
  settings: router({
    get: landlord.query(({ ctx }) => ensureReminderSettings(ctx.supabase)),
    update: landlord.input(z.object({ daysBeforeDueNotice: z.number().int().min(1).max(14), sendOnDueDate: z.boolean(), overdueFrequencyDays: z.number().int().min(1).max(14), quietHoursStart: time, quietHoursEnd: time, autoDispatchEnabled: z.boolean(), smsTemplateApproaching: safeText(500, 10), smsTemplateOverdue: safeText(500, 10), smsTemplateReceipt: safeText(500, 10) })).mutation(({ ctx, input }) => updateReminderSettings(ctx.supabase, input)),
  }),
});
export type AppRouter = typeof appRouter;
