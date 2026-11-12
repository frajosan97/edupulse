// resources/js/components/tenants/show/invoices-tab.tsx
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { formatMoney } from "./helpers";
import type { Invoice } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    invoices: Invoice[];
}

/**
 * Maps the Invoice model's status column (see Invoice::scopeOutstanding)
 * to a Badge variant. "pending" is NOT a status — issued / partially_paid
 * are the outstanding ones.
 */
function statusVariant(
    status: Invoice["status"],
): "default" | "outline" | "secondary" | "destructive" {
    switch (status) {
        case "paid":
            return "default";
        case "issued":
        case "partially_paid":
            return "outline";
        case "cancelled":
            return "destructive";
        case "draft":
        default:
            return "secondary";
    }
}

function statusLabel(status: Invoice["status"]): string {
    return status.replace("_", " ");
}

export function InvoicesTab({ invoices = [] }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
        >
            {invoices.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background/50 p-10 text-center">
                    <FileText className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <p className="text-sm font-medium">No invoices yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Invoices will appear here once generated.
                    </p>
                </div>
            ) : (
                <ul className="overflow-hidden rounded-lg border bg-card">
                    {invoices.map((invoice, i) => (
                        <li
                            key={invoice.id}
                            className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between ${
                                i !== 0 ? "border-t" : ""
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {invoice.invoice_number}
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                        Issued:{" "}
                                        {invoice.formatted_invoice_date ?? "—"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Due: {invoice.formatted_due_date ?? "—"}
                                    </div>
                                    {invoice.amount_due > 0 && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Outstanding:{" "}
                                            {formatMoney(invoice.amount_due)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                                <div className="font-semibold text-foreground">
                                    {formatMoney(invoice.total)}
                                </div>
                                <Badge
                                    className="rounded-full capitalize"
                                    variant={statusVariant(invoice.status)}
                                >
                                    {statusLabel(invoice.status)}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
