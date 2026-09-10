import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentModal } from "@/components/PaymentModal";
import { AddPaymentModal } from "@/components/AddPaymentModal";
import { SendReminderModal } from "@/components/SendReminderModal";
import { TenantDetailModal } from "@/components/TenantDetailModal";
import { AddTenantModal } from "@/components/AddTenantModal";
import { SettingsModal } from "@/components/SettingsModal";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertCircle, ArrowUpRight, Bell, Building2, Check, CheckCircle2, ChevronDown,
  CircleDollarSign, CreditCard, FileText, LayoutDashboard, LifeBuoy, LogOut, Menu, MessageCircle,
  MoreHorizontal, Percent, Plus, RefreshCw, Search, Settings, ShieldCheck, Sparkles, TrendingUp, UserCircle, Users,
  Wallet, WalletCards, X, Zap,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Progress", href: "/progress", icon: WalletCards },
  { label: "Financial reports", href: "/reports", icon: FileText },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [location] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paymentTenant, setPaymentTenant] = useState<any>(null);
  const [remindTenant, setRemindTenant] = useState<any>(null);
  const [detailTenantId, setDetailTenantId] = useState<number | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuth();
  const landlordName = user?.name ?? "Landlord";
  const landlordInitials = landlordName.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "RP";

  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: tenants = [], isLoading: tenantsLoading } = trpc.tenants.list.useQuery();
  const { data: properties = [] } = trpc.properties.list.useQuery();
  const { data: recentLogs = [], isLoading: logsLoading } = trpc.reminders.listLogs.useQuery({ limit: 12 });
  const { data: recentPayments = [] } = trpc.payments.listRecent.useQuery({ limit: 100 });

  const runBatchCheck = trpc.reminders.runBatchCheck.useMutation({
    onSuccess: (data) => {
      toast.success(`Scan complete — ${data.sent} reminder${data.sent === 1 ? "" : "s"} dispatched.`);
      utils.reminders.listLogs.invalidate();
      utils.tenants.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Could not run reminder scan"),
  });

  const filteredTenants = useMemo(() => tenants.filter((t) => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle || `${t.fullName} ${t.unitNumber} ${t.phone}`.toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "debt" && parseFloat(t.currentBalance) > 0) ||
      (statusFilter === "paid" && parseFloat(t.currentBalance) === 0) || t.status === statusFilter;
    const matchesProperty = propertyFilter === "all" || String(t.propertyId) === propertyFilter;
    return matchesSearch && matchesStatus && matchesProperty;
  }), [tenants, searchTerm, statusFilter, propertyFilter]);

  const totalDebt = stats?.totalDebt ?? "0.00";
  const overdueCount = stats?.overdueTenantsCount ?? 0;
  const collectedThisCycle = parseFloat(stats?.collectedThisMonth ?? "0");
  const outstandingDebt = parseFloat(totalDebt);
  const portfolioDue = collectedThisCycle + outstandingDebt;
  const collectionRate = portfolioDue > 0 ? Math.round((collectedThisCycle / portfolioDue) * 100) : 0;
  const averageDebt = tenants.length > 0 ? outstandingDebt / tenants.length : 0;
  const paymentTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      return { key: `${date.getFullYear()}-${date.getMonth()}`, month: format(date, "MMM"), collected: 0, payments: 0 };
    });
    recentPayments.forEach((payment) => {
      const date = new Date(payment.paidAt);
      const bucket = months.find((month) => month.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) {
        bucket.collected += parseFloat(payment.amount);
        bucket.payments += 1;
      }
    });
    return months;
  }, [recentPayments]);

  return (
    <div className="min-h-screen bg-[#f6f8f8] text-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className={`${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed lg:sticky top-0 z-40 h-screen w-[252px] shrink-0 border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-200`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-3">
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0b645c] p-1.5 shadow-[0_8px_20px_rgba(11,100,92,.18)]"><img src="/manus-storage/rentpulse-mark_ba941ccb.png" alt="RentPulse logo" className="h-full w-full object-contain" /></div>
            <div>
              <div className="font-display text-[17px] font-bold tracking-tight">RentPulse</div>
              <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Rent operations</div>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X className="h-4 w-4" /></button>
          </div>

          <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
          <nav className="mt-2 space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} onClick={() => setMobileNavOpen(false)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${location === href ? "bg-[#e6f3f0] text-[#0b645c]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                <Icon className="h-[17px] w-[17px]" />
                <span>{label}</span>
                {label === "Progress" && <span className="ml-auto text-[10px] text-slate-400">analytics</span>}
              </Link>
            ))}
          </nav>

          <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Manage</div>
          <nav className="mt-2 space-y-1">
            <button onClick={() => setIsSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><Settings className="h-[17px] w-[17px]" />Settings</button>
            <button onClick={() => toast.info("Help center is coming next")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><LifeBuoy className="h-[17px] w-[17px]" />Help center</button>
          </nav>

          <div className="mt-auto rounded-2xl bg-[#0f6c63] p-4 text-white shadow-[0_15px_30px_rgba(15,108,99,.16)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-100"><Sparkles className="h-3.5 w-3.5" />Automation is live</div>
            <p className="mt-2 text-xs leading-5 text-teal-50">Reminders check balances and due dates automatically every day.</p>
            <button onClick={() => setIsSettingsOpen(true)} className="mt-3 text-xs font-bold text-white underline underline-offset-4">Tune reminder rules</button>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#f4e8d4] text-xs font-bold text-[#9a6b2d]">{landlordInitials}</div>
            <div className="min-w-0"><div className="truncate text-xs font-bold">{landlordName}</div><div className="truncate text-[10px] text-slate-400">Property manager</div></div>
            <button onClick={() => toast.info("Profile menu coming next")} className="ml-auto"><MoreHorizontal className="h-4 w-4 text-slate-400" /></button>
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f6f8f8]/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-9">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
              <div><div className="text-[11px] font-semibold text-slate-400">{format(new Date(), "EEEE, MMMM d, yyyy")}</div><h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Good morning, {landlordName.split(" ")[0]} <span className="text-[#0b645c]">↗</span></h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" onClick={() => runBatchCheck.mutate()} disabled={runBatchCheck.isPending} className="hidden h-9 gap-2 border-slate-200 bg-white text-xs font-bold sm:flex"><RefreshCw className={`h-3.5 w-3.5 ${runBatchCheck.isPending ? "animate-spin" : ""}`} />Run auto-scan</Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden h-9 gap-1.5 border-slate-200 bg-white text-xs font-bold md:flex"><ArrowUpRight className="h-3.5 w-3.5" />Export PDF</Button>
              <Button variant="outline" size="sm" onClick={() => setIsAddPaymentOpen(true)} className="hidden h-9 gap-1.5 border-[#b9dcd6] bg-white text-xs font-bold text-[#0b645c] sm:flex"><CreditCard className="h-3.5 w-3.5" />Add payment</Button>
              <Button size="sm" onClick={() => setIsAddTenantOpen(true)} className="h-9 gap-1.5 bg-[#0b645c] text-xs font-bold shadow-[0_7px_15px_rgba(11,100,92,.18)] hover:bg-[#09564f]"><Plus className="h-3.5 w-3.5" />Add tenant</Button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          {/* overview header */}
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#0b645c]"><span className="h-2 w-2 rounded-full bg-[#f2bf56]" />Landlord payment tracker</div><h2 className="font-display text-[29px] font-bold tracking-tight">Know what is paid. Chase what is due.</h2><p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">See total tenant debt, which tenants have already paid, and the exact amount to include when you send a reminder.</p></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200"><span className="h-2 w-2 rounded-full bg-emerald-500" />All systems operational</span><button onClick={() => setIsSettingsOpen(true)} className="rounded-lg p-2 hover:bg-white"><Settings className="h-4 w-4" /></button></div>
          </section>

          {/* stat cards */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total tenant debt" value={`KSh ${totalDebt}`} helper={`${overdueCount} tenants have an amount due`} icon={<CircleDollarSign className="h-5 w-5" />} tone="warm" />
            <StatCard label="Paid this cycle" value={`KSh ${stats?.collectedThisMonth ?? "0.00"}`} helper="Payments recorded by landlord" icon={<CheckCircle2 className="h-5 w-5" />} tone="mint" />
            <StatCard label="Tenants tracked" value={String(stats?.totalTenants ?? 0)} helper={`${stats?.totalProperties ?? 0} properties in portfolio`} icon={<Users className="h-5 w-5" />} tone="cream" />
            <div className="relative overflow-hidden rounded-2xl bg-[#143e3a] p-5 text-white shadow-[0_12px_30px_rgba(20,62,58,.11)]"><div className="absolute -right-7 -top-7 h-28 w-28 rounded-full border-[18px] border-white/10" /><div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[.14em] text-teal-100"><span>Automation health</span><Zap className="h-4 w-4 text-[#f5c96a]" /></div><div className="mt-3 flex items-baseline gap-2"><span className="font-display text-[25px] font-bold">Active</span><span className="h-2 w-2 rounded-full bg-[#f5c96a] shadow-[0_0_0_5px_rgba(245,201,106,.15)]" /></div><p className="mt-1 text-xs leading-5 text-teal-100/75">Daily due-date and overdue checks are running.</p></div>
          </section>

          <section className="mt-8 grid items-start gap-7 xl:grid-cols-[1.55fr_.75fr]">
            {/* roster */}
            <div className="min-w-0">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="font-display text-xl font-bold tracking-tight">Tenant payment status</h3><p className="mt-1 text-xs text-slate-500">See who has paid, who has debt, and the exact number to include in a reminder.</p></div><div className="flex items-center gap-2"><Button size="sm" onClick={() => setIsAddPaymentOpen(true)} className="h-9 gap-1.5 bg-[#0b645c] text-xs font-bold hover:bg-[#09564f]"><CreditCard className="h-3.5 w-3.5" />Add payment</Button><div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tenants" className="h-9 w-40 border-slate-200 bg-white pl-8 text-xs sm:w-48" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-9 w-[104px] border-slate-200 bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="debt">Has not paid</SelectItem><SelectItem value="paid">Already paid</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select></div></div>
              <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5"><div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Users className="h-4 w-4 text-[#0b645c]" />{filteredTenants.length} tenants shown</div><Select value={propertyFilter} onValueChange={setPropertyFilter}><SelectTrigger className="h-8 w-[150px] border-slate-200 text-[11px]"><Building2 className="mr-1 h-3.5 w-3.5 text-slate-400" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All properties</SelectItem>{properties.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                {tenantsLoading ? <div className="py-16 text-center text-sm text-slate-400">Loading tenant payment status…</div> : filteredTenants.length === 0 ? <div className="py-16 text-center text-sm text-slate-400">No tenants match those filters.</div> : <div className="divide-y divide-slate-100">{filteredTenants.map(t => { const balance = parseFloat(t.currentBalance); const hasDebt = balance > 0; return <div key={t.id} className="group flex flex-col justify-between gap-4 px-4 py-4 transition hover:bg-[#fbfcfc] sm:flex-row sm:items-center sm:px-5"><div className="flex min-w-0 items-center gap-3"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${hasDebt ? "bg-[#fff0e5] text-[#c36b38]" : "bg-[#e7f4ee] text-[#238059]"}`}>{t.fullName.split(" ").map((n: string) => n[0]).join("").slice(0,2)}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><button onClick={() => setDetailTenantId(t.id)} className="truncate text-left text-sm font-bold text-slate-900 hover:text-[#0b645c]">{t.fullName}</button><span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">UNIT {t.unitNumber}</span><Badge className={hasDebt ? "bg-[#fff0e5] text-[#c36b38] hover:bg-[#fff0e5]" : "bg-[#e7f4ee] text-[#238059] hover:bg-[#e7f4ee]"}>{hasDebt ? "HAS DEBT" : "PAID"}</Badge></div><div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400"><span>{t.propertyName}</span><span>·</span><span>Rent ${t.rentAmount}</span><span>·</span><span>Due {t.dueDayOfMonth}th</span><span>·</span><span>{t.phone}</span></div></div></div><div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0"><div className="text-left sm:text-right"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{hasDebt ? "Amount to remind" : "Amount due"}</div><div className={`font-display text-base font-bold ${hasDebt ? "text-[#d45753]" : "text-[#238059]"}`}>${t.currentBalance}</div></div><div className="flex items-center gap-1.5">{hasDebt && <Button size="sm" variant="outline" onClick={() => setRemindTenant(t)} className="h-8 border-[#b9dcd6] bg-white px-2.5 text-xs font-bold text-[#0b645c]"><Bell className="mr-1 h-3.5 w-3.5" />Remind ${t.currentBalance}</Button>}<Button size="sm" variant="ghost" onClick={() => setPaymentTenant(t)} className="h-8 px-2.5 text-xs font-bold text-[#0b645c]">Add payment</Button><Button size="sm" variant="ghost" onClick={() => setDetailTenantId(t.id)} className="h-8 px-2.5 text-xs font-bold text-slate-500">View</Button></div></div></div>; })}</div>}
              </div>
            </div>

            {/* activity */}
            <div className="min-w-0"><div className="flex items-end justify-between"><div><h3 className="font-display text-xl font-bold tracking-tight">Latest activity</h3><p className="mt-1 text-xs text-slate-500">A quiet record of every touchpoint.</p></div><button onClick={() => utils.reminders.listLogs.invalidate()} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-800"><RefreshCw className="h-4 w-4" /></button></div><div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div className="space-y-4">{logsLoading ? <div className="py-12 text-center text-xs text-slate-400">Loading activity…</div> : recentLogs.length === 0 ? <div className="py-12 text-center text-xs text-slate-400">No notifications yet.</div> : recentLogs.slice(0, 6).map(log => { const receipt = log.triggerType === "payment_receipt"; return <div key={log.id} className="relative flex gap-3"><div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${receipt ? "bg-[#e7f4ee] text-[#238059]" : "bg-[#fff5e5] text-[#bd812e]"}`}>{receipt ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</div><div className="min-w-0 flex-1 border-b border-slate-100 pb-4"><div className="flex items-start justify-between gap-2"><div className="truncate text-xs font-bold text-slate-800">{receipt ? "Payment receipt sent" : "Rent reminder sent"}</div><div className="shrink-0 text-[10px] text-slate-400">{format(new Date(log.sentAt), "h:mm a")}</div></div><p className="mt-1 truncate text-[11px] text-slate-500">{log.tenantName} · Unit {log.unitNumber}</p><div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[10px] leading-4 text-slate-500">{log.messageBody}</div></div></div>; })}</div><button onClick={() => toast.info("Activity history is available in the reminder logs.")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-[#0b645c] hover:bg-[#edf7f4]">View all activity <ArrowUpRight className="h-3.5 w-3.5" /></button></div></div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-start justify-between"><div><h3 className="font-display text-lg font-bold tracking-tight">Monthly collection trend</h3><p className="mt-1 text-xs text-slate-500">Recorded landlord payments by month</p></div><div className="rounded-lg bg-[#e7f4ee] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#238059]">Recorded currency</div></div>
              <div className="mt-5 h-[210px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={paymentTrend} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf1f1" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(value) => `$${value}`} /><Tooltip cursor={{ fill: "#f7faf9" }} formatter={(value: number) => [`$${value.toFixed(2)}`, "Collected"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} /><Bar dataKey="collected" fill="#0b645c" radius={[6, 6, 0, 0]} maxBarSize={34} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div><h3 className="font-display text-lg font-bold tracking-tight">Payment history</h3><p className="mt-1 text-xs text-slate-500">Number of payments recorded each month</p></div><div className="mt-5 space-y-3">{paymentTrend.map((month) => <div key={month.key} className="flex items-center gap-3"><span className="w-8 text-xs font-bold text-slate-500">{month.month}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#f0bc54]" style={{ width: `${Math.min(month.payments * 20, 100)}%` }} /></div><span className="w-5 text-right text-xs font-bold text-slate-700">{month.payments}</span></div>)}</div><div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="font-bold text-slate-900">{recentPayments.length}</span> recent payment records available for reporting.</div></div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr_1fr]">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between"><div className="text-[11px] font-bold uppercase tracking-[.13em] text-slate-400">Collection rate</div><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f4ee] text-[#238059]"><Percent className="h-4 w-4" /></div></div>
              <div className="mt-3 flex items-end justify-between gap-3"><div className="font-display text-3xl font-bold">{collectionRate}%</div><div className="pb-1 text-right text-[11px] text-slate-500">${collectedThisCycle.toFixed(2)} collected<br />of ${portfolioDue.toFixed(2)} due</div></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0b645c] transition-all" style={{ width: `${collectionRate}%` }} /></div>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div className="flex items-center justify-between"><div className="text-[11px] font-bold uppercase tracking-[.13em] text-slate-400">Average debt / tenant</div><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4ec] text-[#d45753]"><Wallet className="h-4 w-4" /></div></div><div className="mt-3 font-display text-3xl font-bold">${averageDebt.toFixed(2)}</div><p className="mt-1 text-xs text-slate-500">Across {tenants.length} tracked tenants</p></div>
            <div className="rounded-2xl bg-[#fff7e4] p-5 ring-1 ring-[#f3e4bd]"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#9a6b2d]"><TrendingUp className="h-4 w-4" />Portfolio insight</div><p className="mt-3 text-sm font-semibold leading-5 text-[#60471e]">{collectionRate >= 80 ? "Collection is healthy. Focus reminders on the remaining overdue balances." : "Collection needs attention. Start with the largest balances and overdue tenants."}</p><p className="mt-2 text-[11px] leading-4 text-[#8b6d39]">This uses recorded payments and current tenant debt; it is an operational collection metric, not a bank balance.</p></div>
          </section>

          {/* focused callout */}
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <div className="relative overflow-hidden rounded-2xl bg-[#e5f1ee] p-5 sm:p-6"><div className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-[#cce5df] opacity-70" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#0b645c]"><ShieldCheck className="h-4 w-4" />Landlord workflow</div><h3 className="mt-3 max-w-xl font-display text-xl font-bold tracking-tight text-[#153d39]">See the debt. Send the amount. Stay in control.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#416c67]">RentPulse is a landlord tracking workspace. It does not take tenant payments. When someone has not paid, press Remind to generate a message with their exact outstanding amount.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-white/75 px-3 py-2 text-xs font-semibold text-[#245b55]">Track balances</span><span className="rounded-lg bg-white/75 px-3 py-2 text-xs font-semibold text-[#245b55]">See paid tenants</span><span className="rounded-lg bg-white/75 px-3 py-2 text-xs font-semibold text-[#245b55]">Send exact debt</span></div></div></div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Needs attention</div><div className="mt-2 font-display text-3xl font-bold text-slate-950">{overdueCount}<span className="ml-1 text-base font-semibold text-slate-400">overdue</span></div></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff2e7] text-[#d36b39]"><AlertCircle className="h-5 w-5" /></div></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><span className="text-slate-500">Send a gentle nudge now</span><button onClick={() => { const first = tenants.find(t => parseFloat(t.currentBalance) > 0); if (first) setRemindTenant(first); }} className="font-bold text-[#0b645c] hover:underline">Review debtors →</button></div></div>
          </section>


        </div>
      </main>

      <AddPaymentModal isOpen={isAddPaymentOpen} tenants={tenants} onClose={() => setIsAddPaymentOpen(false)} />
      <PaymentModal isOpen={!!paymentTenant} tenant={paymentTenant} onClose={() => setPaymentTenant(null)} />
      <SendReminderModal isOpen={!!remindTenant} tenant={remindTenant} onClose={() => setRemindTenant(null)} />
      <TenantDetailModal tenantId={detailTenantId} isOpen={!!detailTenantId} onClose={() => setDetailTenantId(null)} />
      <AddTenantModal isOpen={isAddTenantOpen} onClose={() => setIsAddTenantOpen(false)} properties={properties} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

function StatCard({ label, value, helper, icon, tone }: { label: string; value: string; helper: string; icon: React.ReactNode; tone: "warm" | "mint" | "cream" }) {
  const tones = { warm: "bg-[#fff4ec] text-[#d45753]", mint: "bg-[#e7f4ee] text-[#238059]", cream: "bg-[#fff7e4] text-[#b07a26]" };
  return <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div className="flex items-start justify-between"><div className="text-[11px] font-bold uppercase tracking-[.13em] text-slate-400">{label}</div><div className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div></div><div className="mt-4 font-display text-[26px] font-bold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-xs text-slate-500">{helper}</div></div>;
}
