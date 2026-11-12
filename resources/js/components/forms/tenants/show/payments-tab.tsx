// resources/js/components/tenants/show/payments-tab.tsx
import { CreditCard, Banknote } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { formatMoney } from "./helpers";
import type { Payment } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    payments?: Payment[];
}

function statusVariant(
    status: Payment["status"],
): "default" | "outline" | "secondary" | "destructive" {
    switch (status) {
        case "completed":
        case "paid":
        case "succeeded":
            return "default";
        case "pending":
        case "processing":
            return "outline";
        case "failed":
        case "refunded":
        case "cancelled":
            return "destructive";
        default:
            return "secondary";
    }
}

function methodLabel(payment: Payment): string {
    return payment.payment_method?.name ?? payment.provider ?? "Manual";
}

export function PaymentsTab({ payments = [] }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
        >
            {payments.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background/50 p-10 text-center">
                    <CreditCard className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <p className="text-sm font-medium">No payments yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Payments will appear here once invoices are settled.
                    </p>
                </div>
            ) : (
                <ul className="overflow-hidden rounded-lg border bg-card">
                    {payments.map((payment, i) => (
                        <li
                            key={payment.id}
                            className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between ${
                                i !== 0 ? "border-t" : ""
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-500">
                                    <Banknote className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {formatMoney(payment.amount)}
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                                        via {methodLabel(payment)}
                                    </div>
                                    {(payment.provider_transaction_id ||
                                        payment.reference) && (
                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                            TXN:{" "}
                                            {payment.provider_transaction_id ??
                                                payment.reference}
                                        </div>
                                    )}
                                    {payment.payer_name && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Payer: {payment.payer_name}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {payment.formatted_payment_date ||
                                            "Date unknown"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
                                <Badge
                                    className="rounded-full capitalize"
                                    variant={statusVariant(payment.status)}
                                >
                                    {payment.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
