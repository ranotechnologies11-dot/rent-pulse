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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Array<{ id: number; name: string }>;
  onSuccess?: () => void;
}

export function AddTenantModal({
  isOpen,
  onClose,
  properties,
  onSuccess,
}: AddTenantModalProps) {
  const [propertyId, setPropertyId] = useState<string>(
    properties[0]?.id ? String(properties[0].id) : ""
  );
  const [unitNumber, setUnitNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [dueDayOfMonth, setDueDayOfMonth] = useState("1");
  const [initialDebt, setInitialDebt] = useState("0");
  const [reminderChannel, setReminderChannel] = useState<"sms" | "email" | "both">("both");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const createTenant = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success("Tenant added successfully");
      utils.tenants.list.invalidate();
      utils.dashboard.stats.invalidate();
      onSuccess?.();
      handleReset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add tenant");
    },
  });

  const handleReset = () => {
    setUnitNumber("");
    setFullName("");
    setEmail("");
    setPhone("");
    setRentAmount("");
    setDueDayOfMonth("1");
    setInitialDebt("0");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      toast.error("Please select a property");
      return;
    }
    const rent = parseFloat(rentAmount);
    if (Number.isNaN(rent) || rent <= 0) {
      toast.error("Please enter a valid monthly rent amount");
      return;
    }

    createTenant.mutate({
      propertyId: parseInt(propertyId, 10),
      unitNumber,
      fullName,
      email,
      phone,
      rentAmount: rent,
      dueDayOfMonth: parseInt(dueDayOfMonth, 10) || 1,
      gracePeriodDays: 5,
      initialDebt: parseFloat(initialDebt) || 0,
      reminderChannel,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Tenant & Lease
          </DialogTitle>
          <DialogDescription>
            Register tenant rent terms, contact numbers, and starting debt balances.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Property</Label>
              <Select
                value={propertyId}
                onValueChange={setPropertyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unit Number</Label>
              <Input
                placeholder="e.g. 302B"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tenant Full Name</Label>
            <Input
              placeholder="e.g. Rachel Adams"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Phone (for SMS alerts)</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="rachel@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Monthly Rent (KSh)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1800"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Due Day (1-31)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Initial Debt (KSh)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={initialDebt}
                onChange={(e) => setInitialDebt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Preferred Channel</Label>
            <Select
              value={reminderChannel}
              onValueChange={(val: "sms" | "email" | "both") => setReminderChannel(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both SMS & Email</SelectItem>
                <SelectItem value="sms">SMS Text Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Lease / Tenant Notes</Label>
            <Textarea
              placeholder="e.g. Lease ends Dec 2026. Security deposit logged."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-16 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending ? "Adding..." : "Save Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
