// resources/js/pages/payments/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    AlertCircle,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    CreditCard,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Receipt,
    Trash2,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import type { Column, DataTableFilters } from "@/components/data-table/types";
import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

import { PaymentForm } from "@/components/forms/payments";
import type {
    PaginatedData,
    InvoiceRef,
    Payment,
    PaymentMethodRef,
    PaymentStatus,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface PaymentFiltersFull extends DataTableFilters {
    status: "" | PaymentStatus;
    invoice_id: number | string | null;
    date_from: string | null;
    date_to: string | null;
}

interface Stats {
    total_collected?: number;
    total_pending?: number;
    completed_count?: number;
    failed_count?: number;
}

interface Props {
    payments: PaginatedData<Payment>;
    filters: PaymentFiltersFull;
    stats?: Stats;
    invoices?: InvoiceRef[];
    paymentMethods?: PaymentMethodRef[];
    hasShowRoute?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   Status                                   */
/* -------------------------------------------------------------------------- */

interface StatusConfig {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
}

const STATUS_MAP: Record<PaymentStatus, StatusConfig> = {
    pending: {
        label: "Pending",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        icon: Clock,
    },
    completed: {
        label: "Completed",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    paid: {
        label: "Paid",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    failed: {
        label: "Failed",
        className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        icon: XCircle,
    },
    refunded: {
        label: "Refunded",
        className:
            "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        icon: AlertCircle,
    },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
    const config = STATUS_MAP[status] ?? STATUS_MAP.pending;
    const Icon = config.icon;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function PaymentIndex({
    payments,
    filters,
    stats = {},
    invoices = [],
    paymentMethods = [],
    hasShowRoute = false,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Payment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const invoicesForEdit = useMemo<InvoiceRef[]>(() => {
        const inv = editTarget?.invoice;
        if (!inv) return invoices;

        const exists = invoices.some((i) => i.id === inv.id);
        if (exists) return invoices;

        return [
            {
                id: inv.id,
                invoice_number: inv.invoice_number,
                total: inv.total,
                amount_paid: inv.amount_paid,
                amount_due: inv.amount_due,
                status: inv.status,
            },
            ...invoices,
        ];
    }, [invoices, editTarget]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("payments.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete payment."),
            onFinish: () => setDeleting(false),
        });
    };

    const reloadAll = () =>
        router.reload({
            only: ["payments", "stats", "invoices", "paymentMethods"],
        });

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = useMemo(
        () => [
            {
                id: "collected",
                label: "Collected",
                value: currency.format(Number(stats.total_collected ?? 0)),
                icon: CheckCircle2,
                tone: "success",
                accent: true,
            },
            {
                id: "pending",
                label: "Pending",
                value: currency.format(Number(stats.total_pending ?? 0)),
                icon: Clock,
                tone: "warning",
            },
            {
                id: "completed",
                label: "Completed",
                value: String(stats.completed_count ?? 0),
                icon: Receipt,
            },
            {
                id: "failed",
                label: "Failed",
                value: String(stats.failed_count ?? 0),
                icon: XCircle,
                tone: "danger",
            },
        ],
        [
            stats.total_collected,
            stats.total_pending,
            stats.completed_count,
            stats.failed_count,
        ],
    );

    const columns: Column<Payment>[] = useMemo(
        () => [
            {
                key: "reference",
                label: "Payment",
                sortable: true,
                icon: CreditCard,
                headerClassName: "w-[22%]",
                cell: (p) => (
                    <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                            {p.reference ??
                                p.provider_transaction_id ??
                                `#${p.id}`}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            {p.payer_name ?? "—"}
                            {p.provider ? ` · ${p.provider}` : ""}
                        </div>
                    </div>
                ),
            },
            {
                key: "invoice",
                label: "Invoice",
                icon: Receipt,
                headerClassName: "hidden w-[18%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (p) => (
                    <div className="min-w-0">
                        <div className="truncate font-mono text-xs text-foreground">
                            {p.invoice?.invoice_number ?? "—"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            {p.invoice
                                ? `${currency.format(p.invoice.amount_due)} due`
                                : ""}
                        </div>
                    </div>
                ),
            },
            {
                key: "payment_date",
                label: "Date",
                sortable: true,
                icon: Clock,
                headerClassName: "hidden w-[14%] sm:table-cell",
                className: "hidden sm:table-cell",
                cell: (p) => (
                    <div className="text-sm text-foreground">
                        {p.formatted_payment_date ?? "—"}
                    </div>
                ),
            },
            {
                key: "amount",
                label: "Amount",
                sortable: true,
                icon: CircleDollarSign,
                headerClassName: "w-[16%]",
                cell: (p) => (
                    <div>
                        <div className="font-medium text-foreground">
                            {currency.format(p.amount)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            {p.payment_method?.name ?? "—"}
                        </div>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                icon: CheckCircle2,
                headerClassName: "w-[14%]",
                cell: (p) => <StatusBadge status={p.status} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Payments" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Payments"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Wallet className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Record and reconcile invoice payments across
                            tenants.
                        </p>
                    }
                    actions={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    }
                />

                <StatsCards data={statCards} />

                <DataTable<Payment, PaymentFiltersFull>
                    paginator={payments}
                    filters={filters}
                    columns={columns}
                    routeName="payments.index"
                    rowKey={(p) => p.id}
                    searchPlaceholder="Search by reference, payer, or invoice…"
                    emptyTitle="No payments found"
                    emptyDescription={
                        filters.search || filters.status
                            ? "Try adjusting your filters."
                            : "Record your first payment to get started."
                    }
                    emptyAction={
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    }
                    actions={(p) => (
                        <>
                            {hasShowRoute && (
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <Link
                                        href={route("payments.show", p.id)}
                                        aria-label={`View payment ${p.id}`}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditTarget(p)}
                                disabled={deleting}
                                aria-label={`Edit payment ${p.id}`}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(p)}
                                disabled={deleting}
                                aria-label={`Delete payment ${p.id}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                />
            </div>

            {/* ---------- Create modal ---------- */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="h-[96vh] w-[98vw] max-w-[1600px] overflow-hidden p-0 flex flex-col">
                    <DialogHeader className="border-b px-6 py-4 shrink-0 bg-background">
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-muted/10">
                        <PaymentForm
                            mode="create"
                            invoices={invoices}
                            paymentMethods={paymentMethods}
                            onSuccess={() => {
                                setCreateOpen(false);
                                reloadAll();
                            }}
                            onCancel={() => setCreateOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* ---------- Edit modal ---------- */}
            <Dialog
                open={!!editTarget}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
            >
                <DialogContent className="h-[96vh] w-[98vw] max-w-[1600px] overflow-hidden p-0 flex flex-col">
                    <DialogHeader className="border-b px-6 py-4 shrink-0 bg-background">
                        <DialogTitle>Edit Payment</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-muted/10">
                        {editTarget && (
                            <PaymentForm
                                mode="edit"
                                payment={editTarget}
                                invoices={invoicesForEdit}
                                paymentMethods={paymentMethods}
                                onSuccess={() => {
                                    setEditTarget(null);
                                    reloadAll();
                                }}
                                onCancel={() => setEditTarget(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ---------- Delete confirmation ---------- */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the payment record and restore the
                            invoice balance.{" "}
                            {deleteTarget?.reference && (
                                <>
                                    Reference:{" "}
                                    <strong>{deleteTarget.reference}</strong>.
                                </>
                            )}
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

PaymentIndex.layout = {
    breadcrumbs: [{ title: "Payments", href: "/payments" }],
};
