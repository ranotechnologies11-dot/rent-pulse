import { Bell, FileText, LayoutDashboard, LogOut, Settings, UserCircle, WalletCards, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

const items = [
  { href: "/", label: "Overview", short: "Home", icon: LayoutDashboard },
  { href: "/progress", label: "Progress", short: "Progress", icon: WalletCards },
  { href: "/reports", label: "PDF reports", short: "Reports", icon: FileText },
  { href: "/profile", label: "Profile", short: "Profile", icon: UserCircle },
];

export function LandlordPageShell({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const name = user?.name || "Landlord";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "RP";

  return <div className="min-h-screen bg-[#f5f7f6] text-[#162a2a] lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-50 w-[264px] border-r border-[#dfe8e5] bg-[#fbfcfb] px-4 py-5 transition-transform duration-200 lg:sticky lg:block lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full min-h-[calc(100dvh-2.5rem)] flex-col">
        <div className="flex items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d625a] text-xs font-extrabold tracking-tight text-white shadow-[0_8px_16px_rgba(13,98,90,.18)]">RP</div>
            <div><div className="font-display text-[17px] font-bold tracking-[-.03em] text-[#193a38]">RentPulse</div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[#8ca19d]">Landlord OS</div></div>
          </Link>
          <button className="rounded-lg p-2 text-[#7d9290] hover:bg-[#eef4f2] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#9aaca8]">Workspace</div>
        <nav className="mt-3 space-y-1">
          {items.map(({ href, label, icon: Icon }) => { const active = location === href; return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold transition ${active ? "bg-[#e2f1ed] text-[#0d625a] shadow-[inset_3px_0_0_#0d625a]" : "text-[#718682] hover:bg-[#f0f5f3] hover:text-[#193a38]"}`}><Icon className={`h-[17px] w-[17px] ${active ? "stroke-[2.4]" : "stroke-[1.8]"}`} />{label}{label === "Progress" && <span className={`ml-auto text-[9px] font-semibold uppercase tracking-wider ${active ? "text-[#57938b]" : "text-[#a3b2af]"}`}>insights</span>}</Link>; })}
        </nav>
        <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#9aaca8]">Manage</div>
        <Link href="/profile" onClick={() => setMobileOpen(false)} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold text-[#718682] transition hover:bg-[#f0f5f3] hover:text-[#193a38]"><Settings className="h-[17px] w-[17px]" />Settings</Link>
        <div className="mt-auto rounded-2xl bg-[#164945] p-4 text-white shadow-[0_14px_28px_rgba(22,73,69,.14)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a7d1c9]"><Bell className="h-3.5 w-3.5" />PWA ready</div><p className="mt-2 text-xs leading-5 text-[#d6ebe7]">Install RentPulse on your phone for quick daily follow-up.</p><Link href="/profile" className="mt-3 inline-flex text-[11px] font-bold text-[#f4c86b] underline decoration-[#f4c86b]/40 underline-offset-4">View mobile setup</Link></div>
        <div className="mt-5 flex items-center gap-3 border-t border-[#e5ece9] px-2 pt-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4ead8] text-[11px] font-extrabold text-[#9a6b2d]">{initials}</div><div className="min-w-0"><div className="truncate text-xs font-bold text-[#29403e]">{name}</div><div className="truncate text-[10px] text-[#91a19e]">Property manager</div></div><button onClick={logout} className="ml-auto rounded-lg p-1.5 text-[#9aaca8] hover:bg-[#eef4f2] hover:text-[#b34f4e]" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
      </div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-[#102d2b]/25 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
    <main className="min-w-0 flex-1 pb-24 lg:pb-8">
      <header className="sticky top-0 z-30 border-b border-[#dfe8e5]/90 bg-[#f5f7f6]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10"><div className="mx-auto flex max-w-[1280px] items-center gap-4"><button className="rounded-xl border border-[#dfe8e5] bg-white p-2.5 text-[#58706c] shadow-sm lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><span className="block h-3.5 w-4 border-y-2 border-current relative after:absolute after:left-0 after:right-0 after:top-[5px] after:border-t-2 after:border-current" /></button><div className="min-w-0 flex-1"><div className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#0d7468]">{eyebrow}</div><h1 className="mt-1 truncate font-display text-[25px] font-bold tracking-[-.04em] text-[#183735] sm:text-[30px]">{title}</h1><p className="mt-1 hidden max-w-2xl text-sm leading-6 text-[#78908b] sm:block">{description}</p></div><div className="hidden items-center gap-3 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4ead8] text-[11px] font-extrabold text-[#9a6b2d]">{initials}</div><div className="hidden text-right xl:block"><div className="text-xs font-bold text-[#29403e]">{name}</div><div className="text-[10px] text-[#91a19e]">Landlord workspace</div></div></div></div></header>
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">{children}</div>
    </main>
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-[#dfe8e5] bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(26,64,60,.16)] backdrop-blur-xl lg:hidden">{items.map(({ href, short, icon: Icon }) => { const active = location === href; return <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${active ? "bg-[#e2f1ed] text-[#0d625a]" : "text-[#8ca09c]"}`}><Icon className="h-4 w-4" />{short}</Link>; })}</nav>
  </div>;
}

export function PageNav() { return null; }
