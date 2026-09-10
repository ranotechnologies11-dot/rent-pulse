import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

export type ServerSupabaseClient = SupabaseClient;

export function createRequestSupabase(accessToken?: string) {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) return null;
  return createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

export function createServiceSupabase() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) return null;
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AuthenticatedUser = User & {
  id: string;
  name: string;
  role: "landlord" | "manager";
};
