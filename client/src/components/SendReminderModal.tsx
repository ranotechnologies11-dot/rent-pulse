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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BellRing, Send } from "lucide-react";

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number;
    fullName: string;
    unitNumber: string;
    phone: string;
    email: string;
    currentBalance: string;
    rentAmount: string;
    dueDayOfMonth: number;
  } | null;
  onSuccess?: () => void;
}

export function SendReminderModal({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: SendReminderModalProps) {
  const [triggerType, setTriggerType] = useState<
    "approaching" | "due_today" | "overdue" | "manual"
  >("approaching");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [customMessage, setCustomMessage] = useState("");

  const utils = trpc.useUtils();

  const sendReminder = trpc.reminders.sendSingle.useMutation({
    onSuccess: (data) => {
      toast.success(`Reminder sent to ${data.recipient} via ${data.channel.toUpperCase()}`);
      utils.reminders.listLogs.invalidate();
      utils.tenants.list.invalidate();
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to dispatch reminder");
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCustomMessage("");
      onClose();
    }
  };

  const handleSend = () => {
    if (!tenant) return;
    sendReminder.mutate({
      tenantId: tenant.id,
      triggerType,
      channel,
      customMessage: customMessage.trim() ? customMessage : undefined,
    });
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            Dispatch Tenant Rent Reminder
          </DialogTitle>
          <DialogDescription>
            Send an instant payment reminder to {tenant.fullName} (Unit {tenant.unitNumber}) with the exact amount they still owe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border text-xs">
            <div>
              <span className="text-muted-foreground block">Amount to remind</span>
              <span className="text-sm font-bold text-rose-600">${tenant.currentBalance}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone</span>
              <span className="text-sm font-mono text-foreground">{tenant.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Rent Day</span>
              <span className="text-sm font-bold text-foreground">Day {tenant.dueDayOfMonth}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reminder Type</Label>
              <Select
                value={triggerType}
                onValueChange={(val: "approaching" | "due_today" | "overdue" | "manual") =>
                  setTriggerType(val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approaching">Rent Approaching</SelectItem>
                  <SelectItem value="due_today">Due Today</SelectItem>
                  <SelectItem value="overdue">Overdue Notice</SelectItem>
                  <SelectItem value="manual">Custom Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Delivery Channel</Label>
              <Select
                value={channel}
                onValueChange={(val: "sms" | "email") => setChannel(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Message Override (Optional)
            </Label>
            <Textarea
              placeholder={`Leave blank to use the template with the exact ${tenant.currentBalance} balance...`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="h-24 text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendReminder.isPending}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {sendReminder.isPending ? "Sending..." : `Send $${tenant.currentBalance} Reminder`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
