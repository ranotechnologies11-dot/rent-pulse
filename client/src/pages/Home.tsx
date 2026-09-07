import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentModal } from "@/components/PaymentModal";
import { SendReminderModal } from "@/components/SendReminderModal";
import { TenantDetailModal } from "@/components/TenantDetailModal";
import { AddTenantModal } from "@/components/AddTenantModal";
import { SettingsModal } from "@/components/SettingsModal";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  MessageSquare,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  // Modals state
  const [paymentTenant, setPaymentTenant] = useState<any>(null);
  const [remindTenant, setRemindTenant] = useState<any>(null);
  const [detailTenantId, setDetailTenantId] = useState<number | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: tenants = [], isLoading: tenantsLoading } = trpc.tenants.list.useQuery();
  const { data: properties = [] } = trpc.properties.list.useQuery();
  const { data: recentLogs = [], isLoading: logsLoading } = trpc.reminders.listLogs.useQuery({
    limit: 15,
  });

  const runBatchCheck = trpc.reminders.runBatchCheck.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Automated scan completed! Processed ${data.processed} tenants; dispatched ${data.sent} notices.`
      );
      utils.reminders.listLogs.invalidate();
      utils.tenants.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to trigger reminder check");
    },
  });

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "debt" && parseFloat(t.currentBalance) > 0) ||
      (statusFilter === "paid" && parseFloat(t.currentBalance) === 0) ||
      t.status === statusFilter;

    const matchesProperty =
      selectedProperty === "all" || String(t.propertyId) === selectedProperty;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-sm">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight">RentPulse</span>
                <Badge variant="outline" className="text-[11px] font-medium py-0 px-2 text-primary border-primary/30">
                  Automated Rent Recovery
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Smart rent reminders, instant debt updates & auto-generated balance receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runBatchCheck.mutate()}
              disabled={runBatchCheck.isPending}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runBatchCheck.isPending ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Run Auto-Reminder Scan</span>
              <span className="md:hidden">Auto Scan</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddTenantOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tenant</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container flex-1 py-6 space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Outstanding Debt</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-display font-bold text-rose-600 dark:text-rose-400">
              {statsLoading ? "..." : `$${stats?.totalDebt ?? "0.00"}`}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Across <span className="font-semibold text-foreground">{stats?.overdueTenantsCount ?? 0}</span> tenant(s) with pending balance
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Collected Rent</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-display font-bold text-foreground">
              {statsLoading ? "..." : `$${stats?.collectedThisMonth ?? "0.00"}`}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Receipt notifications automatically delivered
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Tenants</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-display font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalTenants ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Covering <span className="font-semibold text-foreground">{stats?.totalProperties ?? 0}</span> managed properties
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Automated Engine</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-display font-bold text-primary flex items-center gap-1.5">
              <span>Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Heartbeat webhook enabled for 24/7 triggers
            </p>
          </div>
        </div>

        {/* Action Prompt Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary text-primary-foreground uppercase">
                System Workflow
              </span>
              <h2 className="text-base font-bold text-foreground">
                Automated Rent Notice & Balance Settlement Flow
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              When tenants approach due date or incur debt, RentPulse dispatches alerts. Whenever a payment is logged, the tenant receives back:
              <span className="font-semibold text-foreground italic"> "This is your balance, and this is what is left for you to pay. By this time, you need to pay it."</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const overdueOne = tenants.find((t) => parseFloat(t.currentBalance) > 0);
                if (overdueOne) setPaymentTenant(overdueOne);
                else toast.info("All tenants are currently settled!");
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              Test Payment Flow
            </Button>
          </div>
        </div>

        {/* Main Grid: Tenants Table + Live Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Tenant Directory & Balance Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-display">Tenant Rent & Debt Roster</h3>
                <p className="text-xs text-muted-foreground">
                  Track individual debt balances, due dates, and dispatch immediate notices
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-44 sm:w-52">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tenant or unit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs w-28">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    <SelectItem value="debt">Has Debt</SelectItem>
                    <SelectItem value="paid">Settled ($0)</SelectItem>
                    <SelectItem value="overdue">Overdue Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tenant Cards Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {tenantsLoading ? (
                <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
                  Loading tenant rent roster...
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <UserCheck className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No tenants found</p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search criteria or add a new tenant lease.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTenants.map((t) => {
                    const balance = parseFloat(t.currentBalance);
                    const hasDebt = balance > 0;
                    return (
                      <div
                        key={t.id}
                        className="p-4 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Tenant info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailTenantId(t.id)}
                              className="font-bold text-sm text-foreground hover:text-primary hover:underline text-left"
                            >
                              {t.fullName}
                            </button>
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                              Unit {t.unitNumber}
                            </Badge>
                            {hasDebt ? (
                              <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
                                {t.status}
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] uppercase font-semibold">
                                Settled
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{t.propertyName}</span>
                            <span>•</span>
                            <span>Rent: <strong className="text-foreground">${t.rentAmount}</strong></span>
                            <span>•</span>
                            <span>Due Day: <strong className="text-foreground">{t.dueDayOfMonth}th</strong></span>
                            <span>•</span>
                            <span className="font-mono">{t.phone}</span>
                          </div>
                        </div>

                        {/* Balance + Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                          <div className="text-left sm:text-right">
                            <span className="text-[11px] text-muted-foreground block">
                              Outstanding Debt
                            </span>
                            <span
                              className={`text-base font-display font-bold block ${
                                hasDebt ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"
                              }`}
                            >
                              ${t.currentBalance}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRemindTenant(t)}
                              className="h-8 px-2.5 text-xs gap-1"
                              title="Send reminder notice"
                            >
                              <Bell className="w-3 h-3 text-primary" />
                              <span className="hidden md:inline">Remind</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => setPaymentTenant(t)}
                              className="h-8 px-2.5 text-xs gap-1 font-semibold"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Record Pay</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Reminder & Payment Receipt Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Live Notification Log
                </h3>
                <p className="text-xs text-muted-foreground">
                  Automated notices and balance receipts dispatched
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => utils.reminders.listLogs.invalidate()}
                className="h-7 w-7 p-0"
                title="Refresh log"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-3 shadow-xs">
              {logsLoading ? (
                <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                  Streaming reminder log...
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No notifications recorded yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => {
                    const isReceipt = log.triggerType === "payment_receipt";
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                          isReceipt
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-muted/40 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-foreground truncate flex items-center gap-1.5">
                            {isReceipt ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                            {log.tenantName} ({log.unitNumber})
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(new Date(log.sentAt), "h:mm a")}
                          </span>
                        </div>

                        <p className="font-semibold text-foreground text-[11px]">
                          {log.messageTitle}
                        </p>

                        <div className="p-2 rounded bg-background/80 border border-border/80 font-mono text-[11px] leading-relaxed text-muted-foreground">
                          "{log.messageBody}"
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                          <span>
                            via <strong className="uppercase">{log.channel}</strong> → {log.recipient}
                          </span>
                          <span className="text-emerald-600 font-medium">✓ Delivered</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="border-t border-border/60 py-4 mt-8 bg-muted/20">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            RentPulse © 2026 • Automated Rent Reminder & Ledger Management System
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Scheduled Endpoint: <code className="font-mono text-[11px]">/api/scheduled/rentReminders</code>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <PaymentModal
        isOpen={!!paymentTenant}
        tenant={paymentTenant}
        onClose={() => setPaymentTenant(null)}
        onSuccess={() => {}}
      />

      <SendReminderModal
        isOpen={!!remindTenant}
        tenant={remindTenant}
        onClose={() => setRemindTenant(null)}
        onSuccess={() => {}}
      />

      <TenantDetailModal
        tenantId={detailTenantId}
        isOpen={!!detailTenantId}
        onClose={() => setDetailTenantId(null)}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        properties={properties}
        onSuccess={() => {}}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
