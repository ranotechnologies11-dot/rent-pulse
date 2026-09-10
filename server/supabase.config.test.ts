import { describe, expect, it } from "vitest";

describe("Supabase browser configuration", () => {
  it("accepts the configured public URL and publishable key", async () => {
    const configuredUrl = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    if (!configuredUrl && !key) return;
    expect(configuredUrl).toBeTruthy();
    expect(key).toBeTruthy();
    const url = configuredUrl?.startsWith("http") ? configuredUrl : `https://${configuredUrl}.supabase.co`;
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    if (url.includes("redacted") || key?.includes("redacted")) return;
    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
    });
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});
