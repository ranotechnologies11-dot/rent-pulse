import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createRequestSupabase, type AuthenticatedUser, type ServerSupabaseClient } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AuthenticatedUser | null;
  supabase: ServerSupabaseClient | null;
};

function getBearerToken(req: CreateExpressContextOptions["req"]) {
  const value = req.headers.authorization;
  return value?.startsWith("Bearer ") ? value.slice(7) : undefined;
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const token = getBearerToken(opts.req);
  const supabase = createRequestSupabase(token);
  let user: AuthenticatedUser | null = null;
  if (supabase) {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      const metadata = data.user.user_metadata ?? {};
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      user = {
        ...data.user,
        name: String(metadata.full_name ?? data.user.email?.split("@")[0] ?? "Landlord"),
        role: profile?.role === "manager" ? "manager" : "landlord",
      };
    }
  }
  return { req: opts.req, res: opts.res, user, supabase };
}
