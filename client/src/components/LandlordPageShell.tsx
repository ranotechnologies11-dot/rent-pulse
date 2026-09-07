import { Link, useLocation } from "wouter";
import { Bell, FileText, LayoutDashboard, LogOut, Settings, UserCircle, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/progress", label: "Progress", icon: WalletCards },
  { href: "/reports", label: "PDF reports", icon: FileText },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function LandlordPageShell({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) {
  const [location] = useLocation();
  return <div className="min-h-screen bg-[#f6f8f8] text-slate-950 lg:flex">
    <aside className="hidden w-[252px] shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block"><div className="flex h-full min-h-screen flex-col"><Link href="/" className="flex items-center gap-3 px-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0b645c] text-sm font-extrabold text-white">RP</div><div><div className="font-display text-[17px] font-bold tracking-tight">RentPulse</div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Rent operations</div></div></Link><div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Landlord workspace</div><nav className="mt-2 space-y-1">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${location === href ? "bg-[#e6f3f0] text-[#0b645c]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="h-[17px] w-[17px]" />{label}{label === "Progress" && <span className="ml-auto text-[10px] text-slate-400">analytics</span>}</Link>)}</nav><div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Manage</div><Link href="/profile" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-50"><Settings className="h-[17px] w-[17px]" />Settings</Link><div className="mt-auto rounded-2xl bg-[#0f6c63] p-4 text-white"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-100"><Bell className="h-3.5 w-3.5" />PWA ready</div><p className="mt-2 text-xs leading-5 text-teal-50">Install RentPulse on the landlord’s phone for quick access.</p></div><div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#f4e8d4] text-xs font-bold text-[#9a6b2d]">MV</div><div><div className="text-xs font-bold">Marcus Vance</div><div className="text-[10px] text-slate-400">Property manager</div></div><LogOut className="ml-auto h-4 w-4 text-slate-400" /></div></div></aside>
    <main className="min-w-0 flex-1"><header className="border-b border-slate-200/80 bg-white/80 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-9"><div className="mx-auto max-w-[1280px]"><div className="text-[11px] font-bold uppercase tracking-[.18em] text-[#0b645c]">{eyebrow}</div><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div></header><div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">{children}</div></main>
  </div>;
}

export function PageNav() { return <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200"><Icon className="h-3.5 w-3.5" />{label}</Link>)}</div>; }
