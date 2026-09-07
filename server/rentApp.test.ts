import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-landlord",
      email: "landlord@example.com",
      name: "Marcus Landlord",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("RentPulse tRPC API", () => {
  it("fetches dashboard stats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.totalProperties).toBe("number");
    expect(typeof stats.totalTenants).toBe("number");
    expect(typeof stats.totalDebt).toBe("string");
  });

  it("lists tenants with balances", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const tenants = await caller.tenants.list();

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThan(0);
    const first = tenants[0];
    expect(first).toHaveProperty("unitNumber");
    expect(first).toHaveProperty("currentBalance");
    expect(first).toHaveProperty("fullName");
  });

  it("records payment and returns updated debt balance with specified wording", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.tenants.list();
    const tenantWithDebt = tenants.find((t) => parseFloat(t.currentBalance) > 0);
    expect(tenantWithDebt).toBeDefined();

    if (tenantWithDebt) {
      const prevBal = parseFloat(tenantWithDebt.currentBalance);
      const payAmount = 50.0;

      const paymentResult = await caller.payments.record({
        tenantId: tenantWithDebt.id,
        amount: payAmount,
        paymentMethod: "bank_transfer",
        referenceNumber: "TEST-ACH-001",
      });

      expect(paymentResult).toBeDefined();
      expect(parseFloat(paymentResult.paymentAmount)).toBe(payAmount);
      expect(parseFloat(paymentResult.newBalance)).toBe(prevBal - payAmount);

      // Verify the prompt's required notification phrasing
      expect(paymentResult.receiptMessage).toContain("This is your balance");
      expect(paymentResult.receiptMessage).toContain(
        "and this is what is left for you to pay. By"
      );
      expect(paymentResult.receiptMessage).toContain("you need to pay it.");
    }
  });

  it("fetches reminder settings", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const settings = await caller.settings.get();

    expect(settings).toBeDefined();
    expect(settings.daysBeforeDueNotice).toBeGreaterThanOrEqual(1);
    expect(settings.smsTemplateReceipt).toContain("{{balance_after}}");
  });
});
