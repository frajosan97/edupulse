// resources/js/components/partials/student/tabs/fees-tab.tsx
import { Banknote, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TransactionRow } from "@/types";

interface FeesTabProps {
    transactions: TransactionRow[];
}

export function FeesTab({ transactions }: FeesTabProps) {
    if (transactions.length === 0) {
        return (
            <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Invoices and payments for this student will appear here."
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2.5 text-left font-semibold">
                                Date
                            </th>
                            <th className="px-3 py-2.5 text-left font-semibold">
                                Type
                            </th>
                            <th className="px-3 py-2.5 text-left font-semibold">
                                Reference
                            </th>
                            <th className="px-3 py-2.5 text-left font-semibold">
                                Description
                            </th>
                            <th className="px-3 py-2.5 text-right font-semibold">
                                Amount
                            </th>
                            <th className="px-3 py-2.5 text-right font-semibold">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.map((t) => {
                            const isPayment = t.type === "payment";
                            return (
                                <tr
                                    key={`${t.type}-${t.id}`}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                                        {formatDate(t.date)}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "gap-1 rounded-full border-none px-2 py-0.5 text-[11px] font-semibold",
                                                isPayment
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
                                            )}
                                        >
                                            {isPayment ? (
                                                <Banknote className="h-3 w-3" />
                                            ) : (
                                                <Receipt className="h-3 w-3" />
                                            )}
                                            {isPayment ? "Payment" : "Invoice"}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-muted-foreground">
                                        {t.reference ?? "—"}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="max-w-[280px] truncate">
                                            {t.description ?? "—"}
                                        </div>
                                    </td>
                                    <td
                                        className={cn(
                                            "whitespace-nowrap px-3 py-2.5 text-right font-semibold",
                                            isPayment
                                                ? "text-emerald-700 dark:text-emerald-400"
                                                : "text-foreground",
                                        )}
                                    >
                                        {isPayment ? "+" : ""}
                                        {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-full border-none px-2 py-0.5 text-[11px] font-semibold",
                                                t.status === "paid" ||
                                                    t.status === "completed"
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    : t.status === "partial"
                                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                                      : t.status === "pending"
                                                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
                                            )}
                                        >
                                            {t.status ?? "—"}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
