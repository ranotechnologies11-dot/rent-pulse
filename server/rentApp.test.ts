import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext = (): TrpcContext => ({ user: null, supabase: null, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("RentPulse landlord authorization", () => {
  it("rejects dashboard access without a Supabase landlord session", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.dashboard.stats()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not expose the legacy public data routes", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.properties.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.tenants.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.payments.listRecent({ limit: 5 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
