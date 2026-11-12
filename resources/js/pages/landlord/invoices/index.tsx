// resources/js/pages/invoices/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Loader2,
    Pencil,
    Plus,
    Receipt,
    Trash2,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import type { Column, DataTableFilters } from "@/components/data-table/types";
import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
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

import type { Invoice, InvoiceStatus } from "@/types";
import type { PaginatedData } from "@/types/pagination";

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface InvoiceFiltersFull extends DataTableFilters {
    status: "" | InvoiceStatus;
    tenant_id: number | string | null;
    date_from: string | null;
    date_to: string | null;
    overdue: boolean;
}

interface InvoiceStats {
    total_outstanding: number;
    total_paid: number;
    overdue_count: number;
    draft_count: number;
}

interface Props {
    invoices: PaginatedData<Invoice>;
    filters: InvoiceFiltersFull;
    stats: InvoiceStats;
}

/* ------------------------------------------------------------------ */
/* Status config                                                       */
/* ------------------------------------------------------------------ */

interface StatusConfig {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
}

const STATUS_STYLES: Record<InvoiceStatus, StatusConfig> = {
    draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground",
        icon: FileText,
    },
    issued: {
        label: "Issued",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        icon: Clock,
    },
    partially_paid: {
        label: "Partially Paid",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        icon: Wallet,
    },
    paid: {
        label: "Paid",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    overdue: {
        label: "Overdue",
        className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        icon: AlertCircle,
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-muted text-muted-foreground line-through",
        icon: AlertCircle,
    },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
    const config = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function InvoiceIndex({ invoices, filters, stats }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("invoices.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete invoice."),
            onFinish: () => setDeleting(false),
        });
    };

    const toggleOverdue = () => {
        // Build query params explicitly so no `as any` is needed.
        const params: Record<string, string | number | boolean> = {
            overdue: !filters.overdue,
        };
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.tenant_id != null) params.tenant_id = filters.tenant_id;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;
        if (filters.sort) params.sort = filters.sort;
        if (filters.dir) params.dir = filters.dir;

        router.get(route("invoices.index"), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = useMemo(
        () => [
            {
                id: "outstanding",
                label: "Outstanding",
                value: currency.format(stats.total_outstanding),
                icon: Clock,
                tone: "warning",
                accent: true,
            },
            {
                id: "collected",
                label: "Collected",
                value: currency.format(stats.total_paid),
                icon: CheckCircle2,
                tone: "success",
            },
            {
                id: "overdue",
                label: "Overdue",
                value: String(stats.overdue_count),
                icon: AlertCircle,
                tone: "danger",
            },
            {
                id: "drafts",
                label: "Drafts",
                value: String(stats.draft_count),
                icon: FileText,
            },
        ],
        [
            stats.total_outstanding,
            stats.total_paid,
            stats.overdue_count,
            stats.draft_count,
        ],
    );

    const columns: Column<Invoice>[] = useMemo(
        () => [
            {
                key: "invoice_number",
                label: "Invoice",
                sortable: true,
                icon: Receipt,
                headerClassName: "w-[22%]",
                cell: (inv) => (
                    <div className="min-w-0">
                        <Link
                            href={route("invoices.show", inv.id)}
                            className="truncate font-medium text-foreground hover:underline"
                        >
                            {inv.invoice_number}
                        </Link>
                        {inv.description && (
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                                {inv.description}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: "tenant",
                label: "Tenant",
                icon: FileText,
                headerClassName: "hidden w-[18%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (inv) => (
                    <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">
                            {inv.tenant?.name ?? "—"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            Due {inv.formatted_due_date ?? "—"}
                        </div>
                    </div>
                ),
            },
            {
                key: "invoice_date",
                label: "Invoice Date",
                sortable: true,
                icon: CalendarDays,
                headerClassName: "hidden w-[14%] sm:table-cell",
                className: "hidden sm:table-cell",
                cell: (inv) => (
                    <div>
                        <div className="text-sm text-foreground">
                            {inv.formatted_invoice_date ?? "—"}
                        </div>
                        {inv.formatted_period && (
                            <div className="text-xs text-muted-foreground">
                                {inv.formatted_period}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: "total",
                label: "Amount",
                sortable: true,
                icon: Wallet,
                headerClassName: "w-[16%]",
                cell: (inv) => (
                    <div>
                        <div className="font-medium text-foreground">
                            {currency.format(inv.total)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            Paid {currency.format(inv.amount_paid)} · Due{" "}
                            {currency.format(inv.amount_due)}
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
                cell: (inv) => <StatusBadge status={inv.status} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Invoices" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Invoices"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Receipt className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Track billing, payments, and outstanding balances
                            across tenants.
                        </p>
                    }
                    actions={
                        <Button asChild>
                            <Link href={route("invoices.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Link>
                        </Button>
                    }
                />

                <StatsCards data={statCards} />

                <DataTable<Invoice, InvoiceFiltersFull>
                    paginator={invoices}
                    filters={filters}
                    columns={columns}
                    routeName="invoices.index"
                    rowKey={(inv) => inv.id}
                    searchPlaceholder="Search by invoice number, tenant, or description…"
                    emptyTitle="No invoices found"
                    emptyDescription={
                        filters.search || filters.status || filters.overdue
                            ? "Try adjusting your filters."
                            : "Get started by creating your first invoice."
                    }
                    emptyAction={
                        <Button asChild size="sm">
                            <Link href={route("invoices.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Link>
                        </Button>
                    }
                    toolbar={
                        <Button
                            variant={filters.overdue ? "default" : "outline"}
                            size="sm"
                            onClick={toggleOverdue}
                            className="h-9"
                        >
                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                            Overdue
                        </Button>
                    }
                    actions={(inv) => (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Link
                                    href={route("invoices.show", inv.id)}
                                    aria-label={`View ${inv.invoice_number}`}
                                >
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Link
                                    href={route("invoices.edit", inv.id)}
                                    aria-label={`Edit ${inv.invoice_number}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(inv)}
                                disabled={deleting}
                                aria-label={`Delete ${inv.invoice_number}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                />
            </div>

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.invoice_number}</strong> and
                            its line items. Payments already recorded against
                            this invoice will remain in the ledger.
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

InvoiceIndex.layout = {
    breadcrumbs: [{ title: "Invoices", href: "/invoices" }],
};
