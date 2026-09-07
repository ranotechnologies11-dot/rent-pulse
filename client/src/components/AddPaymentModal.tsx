import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentModal } from "@/components/PaymentModal";
import { CreditCard, UserRound } from "lucide-react";

export type PaymentTenant = {
  id: number;
  fullName: string;
  unitNumber: string;
  propertyName?: string;
  currentBalance: string;
  rentAmount: string;
  phone: string;
  email: string;
};

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: PaymentTenant[];
}

export function AddPaymentModal({ isOpen, onClose, tenants }: AddPaymentModalProps) {
  const [selectedId, setSelectedId] = useState("");
  const selectedTenant = tenants.find((tenant) => String(tenant.id) === selectedId) ?? null;

  const handleClose = () => {
    setSelectedId("");
    onClose();
  };

  if (selectedTenant) {
    return (
      <PaymentModal
        isOpen={isOpen}
        tenant={selectedTenant}
        onClose={handleClose}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <CreditCard className="h-5 w-5 text-[#0b645c]" />
            Add payment received
          </DialogTitle>
          <DialogDescription>
            Choose the tenant first, then enter the amount the landlord received. Partial payments automatically leave the remaining balance outstanding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Which tenant paid?
          </Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select a tenant to update" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={String(tenant.id)}>
                  <span className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 text-slate-400" />
                    {tenant.fullName} · Unit {tenant.unitNumber} · ${tenant.currentBalance} due
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] leading-5 text-slate-500">
            Use this for cash, a confirmed M-PESA message, bank transfer, check, or any partial amount.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="button" disabled={!selectedId} onClick={() => undefined} className="bg-[#0b645c] hover:bg-[#09564f]">
            Continue to amount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
