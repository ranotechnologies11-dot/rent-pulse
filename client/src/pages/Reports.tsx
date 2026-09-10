import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { LandlordPageShell } from "@/components/LandlordPageShell";

const CURRENCY = "KSh";

type ReportScope = "all" | string;

type TenantRow = {
  id: number;
  fullName: string;
  unitNumber: string;
  phone: string;
  rentAmount: string;
  currentBalance: string;
  status: string;
};

type PaymentRow = {
  tenantId: number;
  amount: string;
  paidAt: string;
  balanceAfterPayment: string;
};

export default function Reports() {
  const [scope, setScope] = useState<ReportScope>("all");
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: tenants = [] } = trpc.tenants.list.useQuery();
  const { data: payments = [] } = trpc.payments.listRecent.useQuery({ limit: 100 });

  const typedTenants = tenants as TenantRow[];
  const typedPayments = payments as PaymentRow[];
  const selectedTenants = useMemo(
    () => scope === "all" ? typedTenants : typedTenants.filter((tenant) => String(tenant.id) === scope),
    [scope, typedTenants],
  );
  const totalDebt = selectedTenants.reduce((sum, tenant) => sum + parseFloat(tenant.currentBalance || "0"), 0);
  const collected = scope === "all"
    ? parseFloat(stats?.collectedThisMonth ?? "0")
    : typedPayments.filter((payment) => String(payment.tenantId) === scope).reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0);
  const totalDue = totalDebt + collected;
  const rate = totalDue ? Math.round((collected / totalDue) * 100) : 0;

  const latestPaymentFor = (tenantId: number) => typedPayments
    .filter((payment) => payment.tenantId === tenantId)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];

  const exportExcel = () => {
    const generated = new Date().toLocaleString();
    const scopeLabel = scope === "all" ? "All tenants" : selectedTenants[0]?.fullName ?? "Individual tenant";
    const rows = selectedTenants.map((tenant) => {
      const latest = latestPaymentFor(tenant.id);
      return {
        Tenant: tenant.fullName,
        Unit: tenant.unitNumber,
        Phone: tenant.phone,
        Status: parseFloat(tenant.currentBalance) > 0 ? "Has debt" : "Paid",
        "Monthly Rent (KSh)": Number(tenant.rentAmount || 0),
        "Last Payment (KSh)": latest ? Number(latest.amount || 0) : 0,
        "Last Payment Date": latest ? new Date(latest.paidAt).toLocaleDateString() : "No payment recorded",
        "Total Debt (KSh)": Number(tenant.currentBalance || 0),
      };
    });
    const workbook = XLSX.utils.book_new();
    const summary = [
      ["RentPulse financial report"],
      ["Report scope", scopeLabel],
      ["Generated", generated],
      ["Total tenant debt (KSh)", totalDebt],
      ["Collected in report (KSh)", collected],
      ["Collection rate", `${rate}%`],
      [],
      ["This workbook is prepared from landlord-entered RentPulse ledger records."],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summary);
    summarySheet["!cols"] = [{ wch:  thirtyFive }, { wch:  thirtyFive }];
    const ledgerSheet = XLSX.utils.json_to_sheet(rows);
    ledgerSheet["!cols"] = [
      { wch: 24 }, { wch: 10 }, { wch: 18 }, { wch: 14 },
      { wch: 18 }, { wch: 19 }, { wch: 22 }, { wch: 18 },
    ];
    ledgerSheet["!autofilter"] = { ref: `A1:H${Math.max(rows.length + 1, 2)}` };
    ledgerSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Overview");
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, "Tenant Ledger");
    const fileScope = scope === "all" ? "all-tenants" : (selectedTenants[0]?.fullName ?? "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    XLSX.writeFile(workbook, `rentpulse-${fileScope}-financial-report.xlsx`);
  };

  return <LandlordPageShell title="Financial reports" eyebrow="Landlord reporting" description="Export total portfolio or individual tenant financial reports as a printable PDF or Excel workbook.">
    <div className="mb-5 rounded-2xl border border-[#dfe8e5] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 className="font-display text-lg font-bold">Choose your report</h2><p className="mt-1 text-xs leading-5 text-slate-500">Select all tenants for a portfolio report, or one tenant for an individual statement.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="text-xs font-bold text-slate-500">Report scope<Select value={scope} onValueChange={setScope}><SelectTrigger className="mt-1 h-10 w-full bg-white text-sm sm:w-[220px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All tenants — total report</SelectItem>{typedTenants.map((tenant) => <SelectItem key={tenant.id} value={String(tenant.id)}>{tenant.fullName} — Unit {tenant.unitNumber}</SelectItem>)}</SelectContent></Select></label>
          <div className="flex gap-2"><Button onClick={() => window.print()} className="h-10 gap-2 bg-[#0b645c] hover:bg-[#09564f]"><Printer className="h-4 w-4" />PDF</Button><Button onClick={exportExcel} variant="outline" className="h-10 gap-2 border-[#b9dcd6] text-[#0b645c]"><FileSpreadsheet className="h-4 w-4" />Excel</Button></div>
        </div>
      </div>
    </div>
    <article className="report-sheet rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[#0b645c]"><FileText className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.18em]">RentPulse financial report</span></div><h3 className="mt-3 font-display text-2xl font-bold">{scope === "all" ? "Total portfolio summary" : `${selectedTenants[0]?.fullName ?? "Individual tenant"} statement`}</h3><p className="mt-1 text-sm text-slate-500">Generated {new Date().toLocaleDateString()} · {selectedTenants.length} tenant{selectedTenants.length === 1 ? "" : "s"}</p></div><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Download className="h-4 w-4" />PDF or Excel ready</div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><ReportMetric label="Total tenant debt" value={`${CURRENCY} ${totalDebt.toFixed(2)}`} /><ReportMetric label="Collected in report" value={`${CURRENCY} ${collected.toFixed(2)}`} /><ReportMetric label="Collection rate" value={`${rate}%`} /></div>
      <div className="mt-8"><h4 className="font-display text-lg font-bold">Tenant financial details</h4><p className="mt-1 text-xs text-slate-500">Names, latest payouts, and total debts are included for printing and reconciliation.</p><div className="mt-3 overflow-x-auto rounded-xl border border-slate-200"><div className="min-w-[760px] grid grid-cols-[1.3fr_.6fr_.9fr_.8fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>Tenant</span><span>Unit</span><span>Status</span><span>Last payout</span><span>Last payout date</span><span>Total debt</span><span>Phone</span></div>{selectedTenants.map((tenant) => { const latest = latestPaymentFor(tenant.id); return <div key={tenant.id} className="min-w-[760px] grid grid-cols-[1.3fr_.6fr_.9fr_.8fr_1fr_1fr_1fr] border-t border-slate-100 px-4 py-3 text-sm"><span className="font-semibold">{tenant.fullName}</span><span>{tenant.unitNumber}</span><span className={parseFloat(tenant.currentBalance) > 0 ? "font-semibold text-[#d45753]" : "font-semibold text-[#238059]"}>{parseFloat(tenant.currentBalance) > 0 ? "Has debt" : "Paid"}</span><span>{CURRENCY} {latest ? Number(latest.amount).toFixed(2) : "0.00"}</span><span>{latest ? new Date(latest.paidAt).toLocaleDateString() : "—"}</span><span className="font-bold">{CURRENCY} {Number(tenant.currentBalance).toFixed(2)}</span><span className="text-slate-500">{tenant.phone}</span></div>; })}</div></div>
      <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2"><div><h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment records</h4><p className="mt-2 text-2xl font-bold">{typedPayments.filter((payment) => scope === "all" || String(payment.tenantId) === scope).length}</p><p className="text-xs text-slate-500">Records included in this report</p></div><div><h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reporting note</h4><p className="mt-2 text-xs leading-5 text-slate-500">This report is based on landlord-entered ledger records. Confirm figures against bank or M-PESA statements before filing official accounts.</p></div></div>
    </article>
  </LandlordPageShell>;
}

function ReportMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f6f8f8] p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 font-display text-2xl font-bold">{value}</div></div>; }

const thirtyFive = 35;
