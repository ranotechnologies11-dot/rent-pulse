import { BookOpen, DollarSign, FileText, HelpCircle, X, Zap } from "lucide-react";

export function HelpCenterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Help center">
    <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f7f2] text-[#0b645c]"><HelpCircle className="h-4 w-4" /></div><div><h2 className="font-display text-base font-bold text-slate-900">RentPulse landlord guide</h2><p className="text-xs text-slate-500">Quick answers for daily rent operations</p></div></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close help center"><X className="h-4 w-4" /></button></div>
      <div className="mt-5 space-y-4 text-xs text-slate-600">
        <Guide icon={<Zap className="h-4 w-4" />} title="Track balances and due dates" tone="mint">RentPulse calculates each tenant's current balance from the landlord's ledger and highlights paid, outstanding, and overdue accounts.</Guide>
        <Guide icon={<DollarSign className="h-4 w-4" />} title="Record M-PESA, bank, or cash payments" tone="plain">Use Add payment to enter the amount received and reference code. The tenant balance recalculates automatically and the payment becomes part of the report.</Guide>
        <Guide icon={<FileText className="h-4 w-4" />} title="Export financial reports" tone="plain">Financial reports can be prepared for the complete portfolio or one tenant, then printed as PDF or downloaded as Excel.</Guide>
        <Guide icon={<BookOpen className="h-4 w-4" />} title="Messaging status" tone="warning">The current release prepares exact-balance reminder content. SMS, email, and WhatsApp delivery will be connected separately; no message is marked delivered unless a provider is actually connected.</Guide>
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4"><button onClick={onClose} className="rounded-xl bg-[#0b645c] px-4 py-2 text-xs font-bold text-white hover:bg-[#09564f]">Got it</button></div>
    </div>
  </div>;
}

function Guide({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: "mint" | "plain" | "warning"; children: React.ReactNode }) {
  const classes = tone === "mint" ? "border-[#cdeae3] bg-[#f0faf7]" : tone === "warning" ? "border-[#f3e4bd] bg-[#fff7e4]" : "border-slate-200 bg-[#fbfcfb]";
  return <section className={`rounded-xl border p-3.5 ${classes}`}><div className="flex items-center gap-2 text-sm font-bold text-slate-900">{icon}<span>{title}</span></div><p className="mt-1.5 leading-relaxed">{children}</p></section>;
}
