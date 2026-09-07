import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Sliders, Sparkles } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: currentSettings, isLoading } = trpc.settings.get.useQuery(undefined, {
    enabled: isOpen,
  });

  const [daysBefore, setDaysBefore] = useState("3");
  const [sendOnDueDate, setSendOnDueDate] = useState(true);
  const [overdueFrequency, setOverdueFrequency] = useState("2");
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [templateApproaching, setTemplateApproaching] = useState("");
  const [templateOverdue, setTemplateOverdue] = useState("");
  const [templateReceipt, setTemplateReceipt] = useState("");

  useEffect(() => {
    if (currentSettings) {
      setDaysBefore(String(currentSettings.daysBeforeDueNotice));
      setSendOnDueDate(currentSettings.sendOnDueDate);
      setOverdueFrequency(String(currentSettings.overdueFrequencyDays));
      setAutoDispatch(currentSettings.autoDispatchEnabled);
      setTemplateApproaching(currentSettings.smsTemplateApproaching);
      setTemplateOverdue(currentSettings.smsTemplateOverdue);
      setTemplateReceipt(currentSettings.smsTemplateReceipt);
    }
  }, [currentSettings]);

  const utils = trpc.useUtils();

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Reminder configuration and templates saved");
      utils.settings.get.invalidate();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      daysBeforeDueNotice: parseInt(daysBefore, 10) || 3,
      sendOnDueDate,
      overdueFrequencyDays: parseInt(overdueFrequency, 10) || 2,
      quietHoursStart: "21:00",
      quietHoursEnd: "08:00",
      autoDispatchEnabled: autoDispatch,
      smsTemplateApproaching: templateApproaching,
      smsTemplateOverdue: templateOverdue,
      smsTemplateReceipt: templateReceipt,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Automated Reminder & Receipt Settings
          </DialogTitle>
          <DialogDescription>
            Configure timing rules and custom message templates for approaching rent, overdue notices, and payment receipts.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    Automatic Notification Engine
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Send automated approaching and overdue messages to eligible tenants
                  </span>
                </div>
                <Switch
                  checked={autoDispatch}
                  onCheckedChange={setAutoDispatch}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Notice Days Prior to Due</Label>
                  <Input
                    type="number"
                    min="1"
                    max="14"
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Overdue Cadence (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="14"
                    value={overdueFrequency}
                    onChange={(e) => setOverdueFrequency(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Template 1: Payment Receipt Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Post-Payment Receipt Template (Required by Prompt)
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sent automatically when a tenant makes a payment. Must clearly state current balance and remaining due date.
              </p>
              <Textarea
                rows={3}
                value={templateReceipt}
                onChange={(e) => setTemplateReceipt(e.target.value)}
                className="font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                Placeholders: &#123;&#123;tenant_name&#125;&#125;, &#123;&#123;payment_amount&#125;&#125;, &#123;&#123;balance_after&#125;&#125;, &#123;&#123;next_due_date&#125;&#125;
              </span>
            </div>

            {/* Template 2: Approaching Due Notice */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Upcoming Rent Notice Template
              </Label>
              <Textarea
                rows={2}
                value={templateApproaching}
                onChange={(e) => setTemplateApproaching(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>

            {/* Template 3: Overdue Notice */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Overdue Debt Notice Template
              </Label>
              <Textarea
                rows={2}
                value={templateOverdue}
                onChange={(e) => setTemplateOverdue(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
