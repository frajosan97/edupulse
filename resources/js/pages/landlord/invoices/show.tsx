// resources/js/pages/invoices/show.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    Copy,
    FileText,
    Info,
    Layers,
    Loader2,
    Mail,
    Pencil,
    Receipt,
    Trash2,
    TrendingUp,
    User,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { Invoice, InvoiceItem, InvoiceStatus, Payment } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
});

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    invoice: Invoice;
}

/* -------------------------------------------------------------------------- */
/*                                   Icons                                    */
/* -------------------------------------------------------------------------- */

const STATUS_MAP: Record<
    InvoiceStatus,
    {
        label: string;
        className: string;
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    draft: {
        label: "Draft",
        className: "bg-slate-500 text-white hover:bg-slate-500/90",
        icon: FileText,
    },
    issued: {
        label: "Issued",
        className: "bg-blue-600 text-white hover:bg-blue-600/90",
        icon: Clock,
    },
    partially_paid: {
        label: "Partially Paid",
        className: "bg-amber-500 text-white hover:bg-amber-500/90",
        icon: Wallet,
    },
    paid: {
        label: "Paid",
        className: "bg-emerald-600 text-white hover:bg-emerald-600/90",
        icon: CheckCircle2,
    },
    overdue: {
        label: "Overdue",
        className: "bg-red-600 text-white hover:bg-red-600/90",
        icon: AlertCircle,
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-slate-400 text-white line-through hover:bg-slate-400/90",
        icon: XCircle,
    },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
    const config = STATUS_MAP[status] ?? STATUS_MAP.draft;
    const Icon = config.icon;
    return (
        <Badge
            className={cn(
                "rounded-full px-3 py-1 font-semibold border-none",
                config.className,
            )}
        >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  DetailRow                                 */
/* -------------------------------------------------------------------------- */

function DetailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </div>
                <div className="mt-1 text-sm text-foreground">{children}</div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  CopyChip                                  */
/* -------------------------------------------------------------------------- */

function CopyChip({ value }: { value: string }) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
        } catch {
            toast.error("Failed to copy");
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={copy}
                        className="group inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[12px] text-foreground transition-colors hover:bg-muted/70"
                    >
                        {value}
                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Click to copy</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/* -------------------------------------------------------------------------- */
/*                                 Line items                                 */
/* -------------------------------------------------------------------------- */

function LineItemsTable({ items }: { items: InvoiceItem[] }) {
    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-10 text-center">
                <Layers className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    No line items on this invoice.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                        <th className="px-3 py-2 font-semibold">Description</th>
                        <th className="px-3 py-2 text-right font-semibold">
                            Qty
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                            Unit price
                        </th>
                        <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">
                            Discount
                        </th>
                        <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">
                            Tax
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {items.map((item) => (
                        <tr key={item.id} className="align-top">
                            <td className="px-3 py-2.5">
                                <div className="font-medium text-foreground">
                                    {item.description}
                                </div>
                                {item.module && (
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                        Module:{" "}
                                        <span className="font-mono">
                                            {item.module.code}
                                        </span>{" "}
                                        — {item.module.name}
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-2.5 text-right text-foreground">
                                {item.quantity}
                            </td>
                            <td className="px-3 py-2.5 text-right text-foreground">
                                {currency.format(item.unit_price)}
                            </td>
                            <td className="hidden px-3 py-2.5 text-right text-muted-foreground sm:table-cell">
                                {item.discount_amount > 0
                                    ? `- ${currency.format(item.discount_amount)}`
                                    : "—"}
                            </td>
                            <td className="hidden px-3 py-2.5 text-right text-muted-foreground sm:table-cell">
                                {item.tax_rate > 0 ? `${item.tax_rate}%` : "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-foreground">
                                {currency.format(item.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                Payments list                               */
/* -------------------------------------------------------------------------- */

function PaymentRow({ payment }: { payment: Payment }) {
    const paid = payment.status === "completed" || payment.status === "paid";
    return (
        <div className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2.5">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                        {currency.format(payment.amount)}
                    </span>
                    <Badge
                        variant={paid ? "default" : "secondary"}
                        className="rounded-full text-[10px]"
                    >
                        {payment.status}
                    </Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                    {payment.formatted_payment_date ??
                        payment.payment_date ??
                        "—"}
                    {payment.reference && (
                        <>
                            <span className="mx-1.5">•</span>
                            <span className="font-mono">
                                {payment.reference}
                            </span>
                        </>
                    )}
                </div>
            </div>
            {payment.payment_method && (
                <span className="shrink-0 text-xs text-muted-foreground">
                    {payment.payment_method.name}
                </span>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

type Tab = "overview" | "items" | "payments";

export default function InvoiceShow({ invoice }: Props) {
    const { flash } = usePage<{
        flash: { success?: string; error?: string };
    }>().props;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [tab, setTab] = useState<Tab>("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route("invoices.destroy", { invoice: invoice.id }), {
            onSuccess: () => toast.success(`Invoice deleted.`),
            onError: () => toast.error("Failed to delete invoice."),
            onFinish: () => setDeleting(false),
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    const items = invoice.items ?? [];
    const payments = invoice.payments ?? [];
    const itemCount = items.length;
    const paymentCount = payments.length;

    const { isOverdue } = useMemo(() => {
        const overdue =
            (invoice.status === "issued" ||
                invoice.status === "partially_paid") &&
            !!invoice.due_date &&
            new Date(invoice.due_date) < new Date();
        return { isOverdue: overdue };
    }, [invoice.status, invoice.due_date]);

    const tabs: {
        id: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "overview", label: "Overview", icon: Info },
        {
            id: "items",
            label: "Line Items",
            icon: Layers,
            badge: itemCount,
        },
        {
            id: "payments",
            label: "Payments",
            icon: CircleDollarSign,
            badge: paymentCount,
        },
    ];

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = [
        {
            id: "total",
            label: "Total",
            value: currency.format(invoice.total),
            icon: CircleDollarSign,
            accent: true,
        },
        {
            id: "paid",
            label: "Paid",
            value: currency.format(invoice.amount_paid),
            icon: Wallet,
            tone: "success",
        },
        {
            id: "outstanding",
            label: "Outstanding",
            value: currency.format(invoice.amount_due),
            icon: TrendingUp,
            tone: invoice.amount_due > 0 ? "warning" : "success",
        },
        {
            id: "balance",
            label: "Balance",
            value:
                invoice.amount_due > 0
                    ? currency.format(invoice.amount_due)
                    : "Settled",
            hint:
                invoice.amount_due > 0
                    ? "Remaining to collect"
                    : "No balance remaining",
            icon: invoice.amount_due > 0 ? Clock : CheckCircle2,
            tone: invoice.amount_due > 0 ? "warning" : "success",
        },
    ];

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={`Invoice ${invoice.invoice_number}`}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Receipt className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <span>
                                Tenant:{" "}
                                <span className="font-medium text-foreground">
                                    {invoice.tenant?.name ?? "—"}
                                </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>{itemCount} line items</span>
                            <span className="mx-2">•</span>
                            <span>{paymentCount} payments</span>
                        </>
                    }
                    statuses={
                        <>
                            <StatusBadge
                                status={isOverdue ? "overdue" : invoice.status}
                            />

                            {invoice.formatted_invoice_date && (
                                <Badge
                                    variant="outline"
                                    className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm border-slate-200"
                                >
                                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                    Issued {invoice.formatted_invoice_date}
                                </Badge>
                            )}

                            {invoice.formatted_due_date && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "rounded-full bg-white px-3 py-1 font-semibold shadow-sm border-slate-200",
                                        isOverdue
                                            ? "text-red-600"
                                            : "text-slate-700",
                                    )}
                                >
                                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                                    Due {invoice.formatted_due_date}
                                </Badge>
                            )}
                        </>
                    }
                    backHref={route("invoices.index")}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                            >
                                <Link
                                    href={route("invoices.edit", {
                                        invoice: invoice.id,
                                    })}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    }
                />

                {/* Stats */}
                <StatsCards data={statCards} />

                {/* Tabbed content */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
                    className="rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex items-center gap-1 border-b px-3">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors",
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {t.label}
                                    {t.badge !== undefined && t.badge > 0 && (
                                        <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                                            {t.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <motion.div
                                            layoutId="invoice-tab-underline"
                                            className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-5">
                        {tab === "overview" && (
                            <div className="divide-y divide-border">
                                <DetailRow icon={Receipt} label="Invoice #">
                                    <CopyChip value={invoice.invoice_number} />
                                </DetailRow>
                                <DetailRow icon={User} label="Tenant">
                                    {invoice.tenant ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {invoice.tenant.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow
                                    icon={CalendarDays}
                                    label="Billing period"
                                >
                                    {invoice.formatted_period ?? (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow icon={FileText} label="Description">
                                    {invoice.description || (
                                        <span className="text-muted-foreground">
                                            No description provided
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow icon={Calendar} label="Timeline">
                                    <div className="space-y-1.5 text-sm">
                                        {invoice.issued_at && (
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Issued:
                                                </span>{" "}
                                                {new Date(
                                                    invoice.issued_at,
                                                ).toLocaleString()}
                                            </div>
                                        )}
                                        {invoice.paid_at && (
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Paid:
                                                </span>{" "}
                                                {new Date(
                                                    invoice.paid_at,
                                                ).toLocaleString()}
                                            </div>
                                        )}
                                        {invoice.cancelled_at && (
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Cancelled:
                                                </span>{" "}
                                                {new Date(
                                                    invoice.cancelled_at,
                                                ).toLocaleString()}
                                            </div>
                                        )}
                                        {!invoice.issued_at &&
                                            !invoice.paid_at &&
                                            !invoice.cancelled_at && (
                                                <span className="text-muted-foreground">
                                                    No timeline events yet.
                                                </span>
                                            )}
                                    </div>
                                </DetailRow>
                            </div>
                        )}

                        {tab === "items" && (
                            <div className="space-y-4">
                                <LineItemsTable items={items} />

                                <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {currency.format(invoice.subtotal)}
                                        </span>
                                    </div>
                                    {invoice.discount_total > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Discounts
                                            </span>
                                            <span className="font-medium text-foreground">
                                                -{" "}
                                                {currency.format(
                                                    invoice.discount_total,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.tax_total > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Tax
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {currency.format(
                                                    invoice.tax_total,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-semibold">
                                            Total
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {currency.format(invoice.total)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Amount paid
                                        </span>
                                        <span className="text-emerald-600 font-medium">
                                            {currency.format(
                                                invoice.amount_paid,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-semibold">
                                            Amount due
                                        </span>
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                invoice.amount_due > 0
                                                    ? "text-amber-600"
                                                    : "text-emerald-600",
                                            )}
                                        >
                                            {currency.format(
                                                invoice.amount_due,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "payments" && (
                            <div>
                                {paymentCount === 0 ? (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <div className="rounded-2xl bg-muted p-4">
                                            <CircleDollarSign className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                No payments recorded
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Payments will appear here once
                                                received.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {payments.map((p) => (
                                            <PaymentRow
                                                key={p.id}
                                                payment={p}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{invoice.invoice_number}</strong> and its
                            line items. Recorded payments will remain in the
                            ledger.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

InvoiceShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Invoices", href: "/invoices" },
        {
            title: props.invoice?.invoice_number ?? "Invoice",
            href: "/invoices/edit",
        },
    ],
});
