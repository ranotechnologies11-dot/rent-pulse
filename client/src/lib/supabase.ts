import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isValidBrowserConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  /^https:\/\/[^/]+\.supabase\.co$/.test(supabaseUrl) &&
  !supabaseUrl.includes("redacted") &&
  !supabaseAnonKey.includes("redacted")
);

export const supabase = isValidBrowserConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
