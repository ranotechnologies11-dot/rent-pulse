import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Supabase landlord isolation migration", () => {
  const sql = readFileSync(resolve(process.cwd(), "supabase-migration.sql"), "utf8");
  it("adds ownership to top-level landlord records", () => {
    expect(sql).toContain("properties add column if not exists owner_id uuid");
    expect(sql).toContain("reminder_settings add column if not exists owner_id uuid");
  });
  it("defines authenticated policies for every ledger table", () => {
    for (const table of ["properties", "tenants", "invoices", "payments", "reminder_logs", "reminder_settings"]) {
      expect(sql).toContain(`on public.${table} for all to authenticated`);
    }
    expect(sql).toContain("p.owner_id = auth.uid()");
    expect(sql).toContain("with check (owner_id = auth.uid())");
  });
});
