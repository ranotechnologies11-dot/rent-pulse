import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createProperty,
  createTenant,
  ensureReminderSettings,
  getDashboardOverview,
  getReminderSettings,
  getTenantById,
  listInvoicesByTenant,
  listPayments,
  listPaymentsByTenant,
  listProperties,
  listReminderLogs,
  listReminderLogsByTenant,
  listTenantsWithProperty,
  updateReminderSettings,
  updateTenant,
} from "./db";
import {
  processTenantPayment,
  runAutomatedReminderCheck,
  sendManualReminder,
} from "./rentEngine";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  dashboard: router({
    stats: publicProcedure.query(async () => {
      return getDashboardOverview();
    }),
  }),

  properties: router({
    list: publicProcedure.query(async () => {
      return listProperties();
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          address: z.string().min(3),
          city: z.string().default("Metropolis"),
          managerName: z.string().min(2),
          managerPhone: z.string().min(5),
          managerEmail: z.string().email(),
          currency: z.string().default("USD"),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createProperty(input);
        return { success: true, id };
      }),
  }),

  tenants: router({
    list: publicProcedure.query(async () => {
      return listTenantsWithProperty();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const record = await getTenantById(input.id);
        if (!record) return null;
        const [invoices, payments, logs] = await Promise.all([
          listInvoicesByTenant(input.id),
          listPaymentsByTenant(input.id),
          listReminderLogsByTenant(input.id),
        ]);
        return {
          ...record,
          invoices,
          payments,
          logs,
        };
      }),
    create: publicProcedure
      .input(
        z.object({
          propertyId: z.number(),
          unitNumber: z.string().min(1),
          fullName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(5),
          rentAmount: z.number().positive(),
          dueDayOfMonth: z.number().int().min(1).max(31).default(1),
          gracePeriodDays: z.number().int().min(0).max(15).default(5),
          initialDebt: z.number().min(0).default(0),
          reminderChannel: z.enum(["sms", "email", "both"]).default("both"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createTenant({
          propertyId: input.propertyId,
          unitNumber: input.unitNumber,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          rentAmount: input.rentAmount.toFixed(2),
          dueDayOfMonth: input.dueDayOfMonth,
          gracePeriodDays: input.gracePeriodDays,
          currentBalance: input.initialDebt.toFixed(2),
          status: input.initialDebt > 0 ? "overdue" : "active",
          autoRemindersEnabled: true,
          reminderChannel: input.reminderChannel,
          notes: input.notes ?? null,
        });
        return { success: true, id };
      }),
    updateDebt: publicProcedure
      .input(
        z.object({
          tenantId: z.number(),
          newBalance: z.number().min(0),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateTenant(input.tenantId, {
          currentBalance: input.newBalance.toFixed(2),
          status: input.newBalance === 0 ? "paid" : "overdue",
          ...(input.notes ? { notes: input.notes } : {}),
        });
        return { success: true };
      }),
    toggleAutoReminders: publicProcedure
      .input(
        z.object({
          tenantId: z.number(),
          enabled: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await updateTenant(input.tenantId, {
          autoRemindersEnabled: input.enabled,
        });
        return { success: true };
      }),
  }),

  payments: router({
    listRecent: publicProcedure
      .input(z.object({ limit: z.number().optional().default(20) }))
      .query(async ({ input }) => {
        return listPayments(input.limit);
      }),
    record: publicProcedure
      .input(
        z.object({
          tenantId: z.number(),
          amount: z.number().positive(),
          paymentMethod: z.string().default("bank_transfer"),
          referenceNumber: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return processTenantPayment(input);
      }),
  }),

  reminders: router({
    listLogs: publicProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        return listReminderLogs(input.limit);
      }),
    sendSingle: publicProcedure
      .input(
        z.object({
          tenantId: z.number(),
          triggerType: z
            .enum(["approaching", "due_today", "overdue", "manual"])
            .optional(),
          customMessage: z.string().optional(),
          channel: z.enum(["sms", "email"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return sendManualReminder(input);
      }),
    runBatchCheck: publicProcedure.mutation(async () => {
      return runAutomatedReminderCheck("manual_dashboard_trigger");
    }),
  }),

  settings: router({
    get: publicProcedure.query(async () => {
      return ensureReminderSettings();
    }),
    update: publicProcedure
      .input(
        z.object({
          daysBeforeDueNotice: z.number().int().min(1).max(14),
          sendOnDueDate: z.boolean(),
          overdueFrequencyDays: z.number().int().min(1).max(14),
          quietHoursStart: z.string(),
          quietHoursEnd: z.string(),
          autoDispatchEnabled: z.boolean(),
          smsTemplateApproaching: z.string().min(10),
          smsTemplateOverdue: z.string().min(10),
          smsTemplateReceipt: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        return updateReminderSettings(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
