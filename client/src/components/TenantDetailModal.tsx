import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  CreditCard,
  History,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

interface TenantDetailModalProps {
  tenantId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onPayClick?: () => void;
  onRemindClick?: () => void;
}

export function TenantDetailModal({
  tenantId,
  isOpen,
  onClose,
  onPayClick,
  onRemindClick,
}: TenantDetailModalProps) {
  const { data, isLoading } = trpc.tenants.getById.useQuery(
    { id: tenantId! },
    { enabled: !!tenantId && isOpen }
  );

  if (!tenantId) return null;

  const tenant = data?.tenant;
  const property = data?.property;
  const invoices = data?.invoices ?? [];
  const payments = data?.payments ?? [];
  const logs = data?.logs ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {tenant?.fullName ?? "Tenant Details"}
            </DialogTitle>
            {tenant && (
              <Badge
                variant={
                  parseFloat(tenant.currentBalance) > 0 ? "destructive" : "outline"
                }
                className="text-xs px-2.5 py-0.5"
              >
                {parseFloat(tenant.currentBalance) > 0
                  ? `Debt: $${tenant.currentBalance}`
                  : "All Rent Settled"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Loading tenant profile and transaction history...
          </div>
        ) : tenant ? (
          <div className="space-y-6 pt-2">
            {/* Quick summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Property & Unit</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Unit {tenant.unitNumber}
                </span>
                <span className="text-xs text-muted-foreground block truncate">
                  {property?.name}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Monthly Rent</span>
                <span className="text-sm font-semibold text-foreground block mt-0.5">
                  ${tenant.rentAmount} / mo
                </span>
                <span className="text-xs text-muted-foreground block">
                  Due on Day {tenant.dueDayOfMonth}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Total Balance Due</span>
                <span
                  className={`text-sm font-bold block mt-0.5 ${
                    parseFloat(tenant.currentBalance) > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600"
                  }`}
                >
                  ${tenant.currentBalance}
                </span>
                <span className="text-xs text-muted-foreground block capitalize">
                  Status: {tenant.status}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Contact</span>
                <div className="text-xs text-foreground mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  {tenant.phone}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  {tenant.email}
                </div>
              </div>
            </div>

            {/* Tabs for Invoices, Payments, Sent Messages */}
            <Tabs defaultValue="receipts" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="receipts" className="text-xs">
                  Receipts & Messages ({logs.length})
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">
                  Payments ({payments.length})
                </TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs">
                  Rent Invoices ({invoices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="receipts" className="space-y-3 pt-3">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No reminder logs or receipts dispatched yet.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            {log.messageTitle}
                          </span>
                          <span className="text-muted-foreground">
                            {format(new Date(log.sentAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-muted-foreground font-mono bg-muted/50 p-2.5 rounded border border-border/60 whitespace-pre-wrap leading-relaxed">
                          {log.messageBody}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                          <span>
                            Channel: <span className="uppercase font-semibold">{log.channel}</span> → {log.recipient}
                          </span>
                          <span className="capitalize text-emerald-600 font-medium">
                            ✓ {log.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-3 pt-3">
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No payments on record.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-lg border border-border bg-card flex items-start justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold text-foreground">
                              +${p.amount}
                            </span>
                            <span className="text-muted-foreground capitalize">
                              ({p.paymentMethod.replace("_", " ")})
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[11px]">
                            Remaining balance after payment: ${p.balanceAfterPayment}
                          </p>
                        </div>
                        <div className="text-right text-muted-foreground">
                          <span>{format(new Date(p.paidAt), "MMM d, yyyy")}</span>
                          {p.referenceNumber && (
                            <span className="block font-mono text-[10px]">
                              {p.referenceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invoices" className="space-y-3 pt-3">
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No invoice statements created.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {inv.periodLabel}
                          </p>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {inv.invoiceNumber} • Due: {format(new Date(inv.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground block">
                            ${inv.amountDue}
                          </span>
                          <Badge
                            variant={inv.status === "paid" ? "outline" : "destructive"}
                            className="text-[10px] uppercase mt-0.5"
                          >
                            {inv.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
