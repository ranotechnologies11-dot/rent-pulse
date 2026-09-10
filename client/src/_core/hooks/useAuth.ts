import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

 type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/auth" } = options ?? {};
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!supabase) {
      setLoading(false);
      return;
    }
    const syncProfile = async (nextSession: Session | null) => {
      if (!nextSession?.user || !supabase) return;
      await supabase.from("profiles").upsert({
        id: nextSession.user.id,
        full_name: String(nextSession.user.user_metadata?.full_name ?? nextSession.user.email?.split("@")[0] ?? "Landlord"),
        phone: String(nextSession.user.user_metadata?.phone ?? ""),
      });
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      void syncProfile(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      void syncProfile(nextSession);
      setLoading(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || session || typeof window === "undefined") return;
    if (window.location.pathname !== redirectPath) window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, loading, session, redirectPath]);

  const user = session?.user
    ? {
        ...session.user,
        name: String(session.user.user_metadata?.full_name ?? session.user.email?.split("@")[0] ?? "Landlord"),
        phone: String(session.user.user_metadata?.phone ?? ""),
      }
    : null;
  return {
    user,
    session,
    loading,
    error: null,
    isAuthenticated: Boolean(user),
    refresh: async () => {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      }
    },
    logout,
  };
}
