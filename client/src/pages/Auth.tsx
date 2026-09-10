import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Auth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

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
            toast.error(signInError?.message || "Your account was created, but Supabase email confirmation is enabled. Disable Confirm email in Supabase Auth settings to allow immediate sign-in.");
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
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#103f3a] bg-cover bg-center p-10 text-white lg:flex lg:flex-col lg:justify-between" style={{ backgroundImage: "linear-gradient(90deg, rgba(8,43,40,.88), rgba(8,43,40,.48)), url('/manus-storage/rentpulse-signin-wallpaper_ca07f42d.jpg')" }}>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[42px] border-white/10" />
        <div className="relative flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/95 p-1.5"><img src="/manus-storage/rentpulse-mark_ba941ccb.png" alt="RentPulse logo" className="h-full w-full object-contain" /></div><div><div className="font-display text-xl font-bold">RentPulse</div><div className="text-[10px] uppercase tracking-[.2em] text-teal-100/70">Landlord operations</div></div></div>
        <div className="relative max-w-lg"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f5c96a]">Know what is paid</p><h1 className="mt-4 font-display text-5xl font-bold leading-[1.05]">Chase what is due, with confidence.</h1><p className="mt-6 max-w-md text-sm leading-7 text-teal-50/80">A private landlord workspace for balances, manual payments, reminders, and clean financial records.</p></div>
        <div className="relative flex items-center gap-2 text-xs text-teal-100/70"><ShieldCheck className="h-4 w-4 text-[#f5c96a]" /> Secure Supabase session · Installable PWA</div>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><div className="font-display text-2xl font-bold text-foreground">RentPulse</div><p className="mt-1 text-xs uppercase tracking-[.18em] text-muted-foreground">Landlord operations</p></div><div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-9"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{mode === "signin" ? "Welcome back" : "Get started"}</p><h2 className="mt-2 font-display text-3xl font-bold text-card-foreground">{mode === "signin" ? "Sign in to RentPulse" : "Create your workspace"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "signin" ? "Use your landlord account to open the payment tracker." : "Set up a secure account for your property portfolio."}</p></div><form onSubmit={submit} className="space-y-4">{mode === "signup" && <><label className="block text-sm font-semibold text-card-foreground">Full name<Input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-2 h-11" /></label><label className="block text-sm font-semibold text-card-foreground">Phone number<Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" className="mt-2 h-11" /></label></>}<label className="block text-sm font-semibold text-card-foreground">Email<Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 h-11" /></label><label className="block text-sm font-semibold text-card-foreground">Password<div className="relative mt-2"><Input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-11 pr-11" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><Button disabled={pending} className="h-11 w-full gap-2 bg-[#0b645c] font-bold hover:bg-[#09564f]">{pending ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight className="h-4 w-4" /></Button></form><button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 w-full text-center text-sm font-semibold text-primary hover:underline">{mode === "signin" ? "Create a new landlord account" : "Already have an account? Sign in"}</button></div><p className="mt-5 text-center text-xs text-muted-foreground">Your account controls access to your landlord ledger. Tenant payment records remain landlord-managed.</p><p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">To install on Android, open Chrome’s menu and choose <span className="font-semibold text-foreground">Add to Home screen</span>.</p></div></section>
    </main>
  );
}
