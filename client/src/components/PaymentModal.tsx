import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, MessageSquareText, ShieldAlert } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number;
    fullName: string;
    unitNumber: string;
    propertyName?: string;
    currentBalance: string;
    rentAmount: string;
    phone: string;
    email: string;
  } | null;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, tenant, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [receiptResult, setReceiptResult] = useState<{
    previousBalance: string;
    newBalance: string;
    receiptMessage: string;
    paymentAmount: string;
  } | null>(null);

  const utils = trpc.useUtils();

  const recordPayment = trpc.payments.record.useMutation({
    onSuccess: (data) => {
      setReceiptResult({
        previousBalance: data.previousBalance,
        newBalance: data.newBalance,
        receiptMessage: data.receiptMessage,
        paymentAmount: data.paymentAmount,
      });
      utils.dashboard.stats.invalidate();
      utils.tenants.list.invalidate();
      utils.tenants.getById.invalidate();
      utils.reminders.listLogs.invalidate();
      utils.payments.listRecent.invalidate();
      toast.success("Payment recorded and balance confirmation logged");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to record payment");
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReceiptResult(null);
      setAmount("");
      setReferenceNumber("");
      onClose();
    }
  };

  const handlePayFull = () => {
    if (tenant) {
      setAmount(tenant.currentBalance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    recordPayment.mutate({
      tenantId: tenant.id,
      amount: parsedAmount,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
    });
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/80 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
            Record Payment Received
          </DialogTitle>
          <DialogDescription>
            Record a payment received from <span className="font-semibold text-foreground">{tenant.fullName}</span> (Unit {tenant.unitNumber}). This landlord-only action updates the debt ledger and logs the confirmation.
          </DialogDescription>
        </DialogHeader>

        {receiptResult ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Payment of ${receiptResult.paymentAmount} processed successfully!
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated outstanding debt: <span className="font-bold text-foreground">${receiptResult.newBalance}</span> (Previously: ${receiptResult.previousBalance})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MessageSquareText className="w-3.5 h-3.5" />
                Balance Confirmation Logged:
              </div>
              <div className="p-4 rounded-xl bg-muted/60 border border-border text-sm font-mono leading-relaxed whitespace-pre-wrap">
                "{receiptResult.receiptMessage}"
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery target: {tenant.phone} and {tenant.email}
              </p>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">Monthly Rent</span>
                <p className="text-base font-bold text-foreground">${tenant.rentAmount}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Current Tenant Debt</span>
                <p className={`text-base font-bold ${parseFloat(tenant.currentBalance) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                  ${tenant.currentBalance}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-amount" className="text-xs font-semibold">
                  Amount Received ($)
                </Label>
                {parseFloat(tenant.currentBalance) > 0 && (
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Record full debt (${tenant.currentBalance})
                  </button>
                )}
              </div>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="text-lg font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="method" className="text-xs font-semibold">
                  Payment Channel
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer (ACH)</SelectItem>
                    <SelectItem value="card">Debit / Credit Card</SelectItem>
                    <SelectItem value="check">Check / Money Order</SelectItem>
                    <SelectItem value="cash">Cash Receipt</SelectItem>
                    <SelectItem value="zelle">Zelle / Wire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ref" className="text-xs font-semibold">
                  Reference # (Optional)
                </Label>
                <Input
                  id="ref"
                  placeholder="e.g. ACH-98214"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-accent/40 border border-accent/60 p-3 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              <span>
                Submitting records money received, recalculates the tenant's remaining debt, and logs the balance confirmation for your records.
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording..." : "Record Payment Received"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
