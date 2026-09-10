import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createProperty, createTenant, ensureReminderSettings, getDashboardOverview, getReminderSettings, getTenantById, listInvoicesByTenant, listPayments, listPaymentsByTenant, listProperties, listReminderLogs, listReminderLogsByTenant, listTenantsWithProperty, updateReminderSettings, updateTenant } from "./db";
import { processTenantPayment, runAutomatedReminderCheck, sendManualReminder } from "./rentEngine";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const landlord = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.supabase || !ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "A Supabase landlord session is required." });
  return next({ ctx: { ...ctx, supabase: ctx.supabase, user: ctx.user } });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(({ ctx }) => ctx.user), logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true as const }; }) }),
  dashboard: router({ stats: landlord.query(({ ctx }) => getDashboardOverview(ctx.supabase)) }),
  properties: router({
    list: landlord.query(({ ctx }) => listProperties(ctx.supabase)),
    create: landlord.input(z.object({ name: z.string().min(2), address: z.string().min(3), city: z.string().default("Metropolis"), managerName: z.string().min(2), managerPhone: z.string().min(5), managerEmail: z.string().email(), currency: z.string().default("KSh") })).mutation(({ ctx, input }) => createProperty(ctx.supabase, input, ctx.user.id)),
  }),
  tenants: router({
    list: landlord.query(({ ctx }) => listTenantsWithProperty(ctx.supabase)),
    getById: landlord.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => { const record = await getTenantById(ctx.supabase, input.id); if (!record) return null; const [invoices, payments, logs] = await Promise.all([listInvoicesByTenant(ctx.supabase, input.id), listPaymentsByTenant(ctx.supabase, input.id), listReminderLogsByTenant(ctx.supabase, input.id)]); return { ...record, invoices, payments, logs }; }),
    create: landlord.input(z.object({ propertyId: z.number(), unitNumber: z.string().min(1), fullName: z.string().min(2), email: z.string().email(), phone: z.string().min(5), rentAmount: z.number().positive(), dueDayOfMonth: z.number().int().min(1).max(31).default(1), gracePeriodDays: z.number().int().min(0).max(15).default(5), initialDebt: z.number().min(0).default(0), reminderChannel: z.enum(["sms", "email", "both"]).default("both"), notes: z.string().optional() })).mutation(({ ctx, input }) => createTenant(ctx.supabase, { propertyId: input.propertyId, unitNumber: input.unitNumber, fullName: input.fullName, email: input.email, phone: input.phone, rentAmount: input.rentAmount.toFixed(2), dueDayOfMonth: input.dueDayOfMonth, gracePeriodDays: input.gracePeriodDays, currentBalance: input.initialDebt.toFixed(2), status: input.initialDebt > 0 ? "overdue" : "active", autoRemindersEnabled: true, reminderChannel: input.reminderChannel, notes: input.notes ?? null })),
    updateDebt: landlord.input(z.object({ tenantId: z.number(), newBalance: z.number().min(0), notes: z.string().optional() })).mutation(({ ctx, input }) => updateTenant(ctx.supabase, input.tenantId, { currentBalance: input.newBalance.toFixed(2), status: input.newBalance === 0 ? "paid" : "overdue", ...(input.notes ? { notes: input.notes } : {}) }).then(() => ({ success: true as const }))),
    toggleAutoReminders: landlord.input(z.object({ tenantId: z.number(), enabled: z.boolean() })).mutation(({ ctx, input }) => updateTenant(ctx.supabase, input.tenantId, { autoRemindersEnabled: input.enabled }).then(() => ({ success: true as const }))),
  }),
  payments: router({ listRecent: landlord.input(z.object({ limit: z.number().optional().default(20) })).query(({ ctx, input }) => listPayments(ctx.supabase, input.limit)), record: landlord.input(z.object({ tenantId: z.number(), amount: z.number().positive(), paymentMethod: z.string().default("bank_transfer"), referenceNumber: z.string().optional() })).mutation(({ ctx, input }) => processTenantPayment(ctx.supabase, input)) }),
  reminders: router({ listLogs: landlord.input(z.object({ limit: z.number().optional().default(50) })).query(({ ctx, input }) => listReminderLogs(ctx.supabase, input.limit)), sendSingle: landlord.input(z.object({ tenantId: z.number(), triggerType: z.enum(["approaching", "due_today", "overdue", "manual"]).optional(), customMessage: z.string().optional(), channel: z.enum(["sms", "email"]).optional() })).mutation(({ ctx, input }) => sendManualReminder(ctx.supabase, input)), runBatchCheck: landlord.mutation(({ ctx }) => runAutomatedReminderCheck(ctx.supabase, "manual_dashboard_trigger")) }),
  settings: router({ get: landlord.query(({ ctx }) => ensureReminderSettings(ctx.supabase)), update: landlord.input(z.object({ daysBeforeDueNotice: z.number().int().min(1).max(14), sendOnDueDate: z.boolean(), overdueFrequencyDays: z.number().int().min(1).max(14), quietHoursStart: z.string(), quietHoursEnd: z.string(), autoDispatchEnabled: z.boolean(), smsTemplateApproaching: z.string().min(10), smsTemplateOverdue: z.string().min(10), smsTemplateReceipt: z.string().min(10) })).mutation(({ ctx, input }) => updateReminderSettings(ctx.supabase, input)) }),
});
export type AppRouter = typeof appRouter;
