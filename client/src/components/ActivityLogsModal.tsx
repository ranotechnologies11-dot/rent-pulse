import { CheckCircle2, Clock3, Send, X } from "lucide-react";

type ActivityLog = {
  id: number | string;
  tenantName: string;
  unitNumber: string;
  channel?: string | null;
  triggerType?: string | null;
  messageBody?: string | null;
  sentAt: string | Date;
};

export function ActivityLogsModal({ isOpen, onClose, logs }: { isOpen: boolean; onClose: () => void; logs: ActivityLog[] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Activity history">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#0b645c]"><Clock3 className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[.18em]">Ledger activity</span></div>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900">Activity history</h2>
            <p className="mt-1 text-xs text-slate-500">A record of payment receipts and reminder preparations.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close activity history"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {logs.length === 0 ? <div className="py-12 text-center text-sm text-slate-400">No activity recorded yet.</div> : logs.map((log) => {
            const receipt = log.triggerType === "payment_receipt" || log.triggerType === "receipt";
            return <div key={log.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0">
              <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${receipt ? "bg-[#e7f4ee] text-[#238059]" : "bg-[#fff5e5] text-[#bd812e]"}`}>{receipt ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-3.5 w-3.5" />}</div>
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><strong className="text-xs text-slate-900">{receipt ? "Payment receipt recorded" : "Rent reminder prepared"}</strong><span className="shrink-0 text-[10px] text-slate-400">{new Date(log.sentAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div><p className="mt-1 text-[11px] text-slate-500">{log.tenantName} · Unit {log.unitNumber} · {log.channel || "ledger"}</p><p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 font-mono text-[10px] leading-relaxed text-slate-600">{log.messageBody || "No message content recorded."}</p></div>
            </div>;
          })}
        </div>
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3"><button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">Close</button></div>
      </div>
    </div>
  );
}
