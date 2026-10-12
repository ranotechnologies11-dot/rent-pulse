import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Badge,
  Bolt,
  Building2,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function Auth() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setPassword("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      toast.error("Supabase is not configured for this deployment.");
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone } },
        });
        if (error) throw error;
        if (!data.session) {
          const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signedIn.session) {
            toast.success("Account created. Welcome to RentPulse.");
            navigate("/");
          } else {
            toast.error(signInError?.message || "Your account was created, but email confirmation is still enabled in Supabase.");
          }
        } else {
          toast.success("Welcome to RentPulse.");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete authentication.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-stitch min-h-screen bg-[#faf8ff] font-sans text-[#131b2e] transition-colors duration-300 dark:bg-[#0b0f17] dark:text-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-[#faf8ff]/90 shadow-[0_1px_8px_rgba(0,0,0,.04)] backdrop-blur-xl transition-colors dark:border-[#1e2738]/80 dark:bg-[#0b0f17]/90 dark:shadow-[0_4px_20px_rgba(0,0,0,.4)]">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" aria-label="Go back" onClick={() => window.history.length > 1 ? window.history.back() : navigate("/")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-[#1e2738]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0c4a42] p-1 dark:bg-[#181f2c] dark:ring-1 dark:ring-[#00d2ff]/35">
              <img src="/icons/rentpulse.svg" alt="RentPulse logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">RentPulse <span className="font-normal text-slate-500 dark:text-slate-400">Auth</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Toggle light and dark mode" onClick={() => setTheme(isDark ? "light" : "dark")} className="flex h-9 items-center gap-1.5 rounded-full border border-slate-300/80 bg-slate-200 px-1.5 shadow-inner transition-colors dark:border-[#00d2ff]/30 dark:bg-[#181f2c]">
              <span className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${!isDark ? "bg-white text-amber-500 shadow-sm" : "text-slate-500"}`}><Sun className="h-3.5 w-3.5" /></span>
              <span className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${isDark ? "bg-[#102b36] text-[#00d2ff] shadow-sm" : "text-slate-400"}`}><Moon className="h-3.5 w-3.5" /></span>
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full border border-[#00a6c9]/35 bg-[#00a6c9]/10 text-[#008ba8] dark:bg-[#00d2ff]/15 dark:text-[#00d2ff]"><UserRound className="h-4 w-4" /></div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-10 pt-24 sm:px-6">
        <section className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-[#00d2ff]/25 dark:bg-[#181f2c] dark:shadow-[0_0_25px_rgba(0,210,255,.15)]">
              <img src="/icons/rentpulse.svg" alt="RentPulse modern logo mark" className="h-full w-full rounded-xl object-contain" />
            </div>
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-[#faf8ff] dark:ring-[#0b0f17]"><Check className="h-3.5 w-3.5" /></span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to RentPulse</h2>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-400">Manage properties, monitor rent collections, and reconcile M-PESA receipts.</p>
        </section>

        <div className="mb-6 flex items-center rounded-xl border border-slate-300/60 bg-slate-200/80 p-1 shadow-sm dark:border-[#1e2738] dark:bg-[#121824]">
          <button type="button" onClick={() => switchMode("signin")} className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-all ${mode === "signin" ? "bg-[#0c4a42] text-white shadow-md dark:bg-[#00d2ff] dark:text-[#002833] dark:shadow-[0_2px_10px_rgba(0,210,255,.35)]" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}><LockKeyhole className="h-3.5 w-3.5" />Sign In</button>
          <button type="button" onClick={() => switchMode("signup")} className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-all ${mode === "signup" ? "bg-[#0c4a42] text-white shadow-md dark:bg-[#00d2ff] dark:text-[#002833] dark:shadow-[0_2px_10px_rgba(0,210,255,.35)]" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}><Building2 className="h-3.5 w-3.5" />Create Account</button>
        </div>

        <form onSubmit={submit} className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-[#1e2738] dark:bg-[#181f2c] dark:shadow-[0_8px_30px_rgba(0,0,0,.5)] sm:p-6">
          {mode === "signup" && <AuthField label="Full Name or Agency Name" icon={<Badge className="h-4 w-4" />}>
            <Input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Kipchoge Property Ltd" className="h-11 rounded-xl border-slate-200 bg-slate-100 pl-10 text-sm dark:border-[#1e2738] dark:bg-[#101622]" />
          </AuthField>}
          {mode === "signup" && <AuthField label="Phone Number" icon={<span className="text-sm">🇰🇪</span>}>
            <Input required value={phone} onChange={event => setPhone(event.target.value)} placeholder="+254 700 000 000" className="h-11 rounded-xl border-slate-200 bg-slate-100 pl-10 text-sm dark:border-[#1e2738] dark:bg-[#101622]" />
          </AuthField>}
          <AuthField label="Email Address" icon={<span className="text-sm font-bold">@</span>} trailing={<span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-[#47d6ff]"><Bolt className="h-3 w-3" /> Secure session</span>}>
            <Input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="landlord@mail.ke" className="h-11 rounded-xl border-slate-200 bg-slate-100 pl-10 text-sm dark:border-[#1e2738] dark:bg-[#101622]" />
          </AuthField>
          <AuthField label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
            <div className="relative">
              <Input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 rounded-xl border-slate-200 bg-slate-100 pl-10 pr-11 text-sm dark:border-[#1e2738] dark:bg-[#101622]" />
              <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </AuthField>
          {mode === "signup" && <label className="flex items-start gap-2 pt-0.5 text-xs text-slate-600 dark:text-slate-400"><input required type="checkbox" className="mt-0.5 accent-[#0c4a42] dark:accent-[#00d2ff]" /><span>I agree to the RentPulse terms and landlord data-handling policy.</span></label>}
          <button disabled={pending} type="submit" className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0c4a42] text-sm font-bold text-white shadow-md transition-all hover:bg-[#08322b] active:scale-[.99] disabled:cursor-wait disabled:opacity-70 dark:bg-[#00d2ff] dark:text-[#002833] dark:shadow-[0_0_20px_rgba(0,210,255,.4)] dark:hover:bg-[#38dcff]">{pending ? "Working…" : mode === "signin" ? "Sign In to Workspace" : "Create Landlord Account"}<ArrowRight className="h-4 w-4" /></button>
          <div className="relative my-0.5 flex items-center justify-center"><div className="h-px w-full bg-slate-200 dark:bg-[#1e2738]" /><span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-[#181f2c] dark:text-slate-500">private landlord workspace</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-700 dark:border-[#1e2738] dark:bg-[#101622] dark:text-slate-300"><Fingerprint className="h-4 w-4 text-emerald-600 dark:text-[#00d2ff]" />Mobile ready</div>
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-700 dark:border-[#1e2738] dark:bg-[#101622] dark:text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#00d2ff]" />RLS protected</div>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-100/90 p-3.5 shadow-sm dark:border-[#1e2738] dark:bg-[#181f2c]/80">
          <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"><Building2 className="h-4 w-4" /></div><div><p className="text-xs font-semibold">{mode === "signin" ? "New landlord on RentPulse?" : "Already have an account?"}</p><p className="text-[11px] text-slate-500 dark:text-slate-400">{mode === "signin" ? "Start your private workspace" : "Return to your ledger"}</p></div></div>
          <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#00677f] shadow-sm hover:border-[#00d2ff] dark:border-[#1e2738] dark:bg-[#101622] dark:text-[#47d6ff]">{mode === "signin" ? "Sign Up" : "Sign In"}</button>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 text-center"><div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm dark:border-[#1e2738] dark:bg-[#181f2c] dark:text-slate-300"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Secure Supabase session<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="font-bold text-[#00677f] dark:text-[#47d6ff]">256-bit SSL</span></div><p className="text-[11px] leading-tight text-slate-500">Automated ledger tracking for landlord-entered cash and M-PESA records.</p><p className="text-[11px] leading-tight text-slate-500">Install on Android from Chrome’s menu with <span className="font-semibold text-slate-700 dark:text-slate-300">Add to Home screen</span>.</p></div>
      </div>
    </main>
  );
}

function AuthField({ label, icon, trailing, children }: { label: string; icon: React.ReactNode; trailing?: React.ReactNode; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"><span className="flex items-center gap-1.5">{icon}{label}<span className="text-rose-500 dark:text-rose-400">*</span></span>{trailing}</span><span className="relative block">{children}<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{icon}</span></span></label>;
}
