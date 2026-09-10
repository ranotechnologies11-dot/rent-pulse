import { useState } from "react";
import { Bell, CheckCircle2, Contact, KeyRound, LogOut, Moon, Smartphone, Sun, UserCircle } from "lucide-react";
import { LandlordPageShell, PageNav } from "@/components/LandlordPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const email = user?.email ?? "";
  async function saveProfile() {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone } });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile updated.");
  }
  return <LandlordPageShell title="Profile" eyebrow="Landlord account" description="Manage your identity, secure session, and mobile app preferences."><PageNav /><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl bg-card p-6 ring-1 ring-border"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f4e8d4] text-lg font-bold text-[#9a6b2d]">{initials(name)}</div><div><h2 className="font-display text-xl font-bold">{name || "Landlord"}</h2><p className="text-sm text-muted-foreground">Property manager</p></div></div><div className="mt-7 space-y-4"><label className="block text-sm font-semibold">Full name<Input value={name} onChange={e => setName(e.target.value)} className="mt-2 h-10" /></label><label className="block text-sm font-semibold">Phone number<Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" className="mt-2 h-10" /></label><Info label="Email" value={email} /></div><div className="mt-6 flex gap-3"><Button onClick={saveProfile} disabled={saving} className="flex-1 bg-[#0b645c] hover:bg-[#09564f]">{saving ? "Saving…" : "Save profile"}</Button><Button variant="outline" onClick={() => logout()} className="gap-2"><LogOut className="h-4 w-4" />Sign out</Button></div></section><section className="space-y-4"><div className="rounded-2xl bg-[#e5f1ee] p-6 ring-1 ring-[#cce5df]"><div className="flex items-center gap-2 text-[#0b645c]"><Smartphone className="h-5 w-5" /><h2 className="font-display text-lg font-bold">Mobile readiness</h2></div><p className="mt-2 text-sm leading-6 text-[#416c67]">RentPulse is installable as a PWA. The future Android companion will need separate permission setup for payment notifications and SMS delivery.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Permission icon={<Bell className="h-4 w-4" />} label="Notifications" status="PWA supported" /><Permission icon={<Contact className="h-4 w-4" />} label="Contacts" status="Optional" /><Permission icon={<KeyRound className="h-4 w-4" />} label="Secure connection" status="Required" /><Permission icon={<Smartphone className="h-4 w-4" />} label="M-PESA messages" status="Android companion" /></div></div><div className="rounded-2xl bg-card p-6 ring-1 ring-border"><div className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-[#0b645c]" /><h2 className="font-display text-lg font-bold">Workspace preferences</h2></div><div className="mt-4 space-y-3"><Info label="Currency display" value="Use the currency configured on each property" /><Info label="Reminder channel" value="SMS and email ready for connection" /></div><div className="mt-6"><div className="mb-3 text-sm font-semibold">Theme</div><div className="flex flex-wrap gap-2">{(["light", "dark", "system"] as const).map(value => <Button key={value} variant={theme === value ? "default" : "outline"} onClick={() => setTheme(value)} className="gap-2 capitalize">{value === "light" ? <Sun className="h-4 w-4" /> : value === "dark" ? <Moon className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{value}</Button>)}</div></div></div></section></div></LandlordPageShell>;
}
function initials(value: string) { return value.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "RP"; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-semibold text-foreground">{value || "—"}</span></div>; }
function Permission({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) { return <div className="flex items-center gap-3 rounded-xl bg-white/75 p-3"><span className="text-[#0b645c]">{icon}</span><div className="min-w-0"><div className="text-xs font-bold text-[#245b55]">{label}</div><div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#5f8982]"><CheckCircle2 className="h-3 w-3" />{status}</div></div></div>; }
