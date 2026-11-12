// resources/js/pages/tenants/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    Eye,
    GraduationCap,
    Loader2,
    Mail,
    Pencil,
    Phone,
    Plus,
    Sparkles,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import type { Column, DataTableFilters } from "@/components/data-table/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import type { PaginatedData, Tenant, TenantBillingStatus } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface TenantFiltersFull extends DataTableFilters {
    // Deliberately narrower than TenantStatus — only statuses a tenant
    // can legitimately be filtered by in the UI today.
    status: "" | "active" | "inactive";
}

interface Props {
    tenants: PaginatedData<Tenant>;
    filters: TenantFiltersFull;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});

function formatMoney(v: number): string {
    return currency.format(v);
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function TenantAvatar({ name }: { name: string }) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";

    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-foreground"
            aria-hidden="true"
        >
            {initial}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Billing badge                                                       */
/* ------------------------------------------------------------------ */

function BillingBadge({ status }: { status?: TenantBillingStatus }) {
    if (!status) {
        return (
            <Badge variant="outline" className="gap-1.5 font-medium">
                Not loaded
            </Badge>
        );
    }

    if (status.breakdown.length === 0) {
        return (
            <Badge variant="secondary" className="gap-1.5 font-medium">
                No modules
            </Badge>
        );
    }

    if (status.total <= 0) {
        return (
            <Badge variant="destructive" className="gap-1.5 font-medium">
                Unpriced
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="gap-1.5 font-medium">
            <Sparkles className="h-3 w-3" />
            {formatMoney(status.total)}
        </Badge>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function TenantIndex({ tenants, filters }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("tenants.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete tenant."),
            onFinish: () => setDeleting(false),
        });
    };

    const columns: Column<Tenant>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Tenant",
                sortable: true,
                icon: Building2,
                headerClassName: "w-[40%]",
                cell: (t) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <TenantAvatar name={t.name} />
                        <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                                {t.name}
                            </div>
                            {t.email && (
                                <div className="flex max-w-xs items-center gap-1 truncate text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{t.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: "phone",
                label: "Contact",
                sortable: false,
                icon: Phone,
                headerClassName: "hidden w-[20%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (t) => (
                    <span className="text-sm text-muted-foreground">
                        {t.phone ?? "—"}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                icon: GraduationCap,
                headerClassName: "w-[20%]",
                cell: (t) => (
                    <Badge
                        variant={t.is_active ? "default" : "secondary"}
                        className="gap-1.5 font-medium"
                    >
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                t.is_active
                                    ? "bg-primary-foreground"
                                    : "bg-muted-foreground",
                            )}
                        />
                        {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                ),
            },
            {
                key: "billing_status",
                label: "Billing",
                sortable: false,
                icon: Sparkles,
                headerClassName: "hidden w-[20%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (t) => <BillingBadge status={t.billing_status} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Tenants" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Tenants"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage the schools and organisations on the
                            platform.
                        </p>
                    }
                    actions={
                        <Button asChild>
                            <Link href={route("tenants.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Tenant
                            </Link>
                        </Button>
                    }
                />

                <DataTable<Tenant, TenantFiltersFull>
                    paginator={tenants}
                    filters={filters}
                    columns={columns}
                    routeName="tenants.index"
                    rowKey={(t) => t.id}
                    searchPlaceholder="Search by name, email or phone…"
                    emptyTitle="No tenants found"
                    emptyDescription={
                        filters.search || filters.status
                            ? "Try adjusting your filters."
                            : "Get started by creating your first tenant."
                    }
                    emptyAction={
                        <Button asChild size="sm">
                            <Link href={route("tenants.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Tenant
                            </Link>
                        </Button>
                    }
                    actions={(t) => (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Link
                                    href={route("tenants.show", t.id)}
                                    aria-label={`View ${t.name}`}
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
                                    href={route("tenants.edit", t.id)}
                                    aria-label={`Edit ${t.name}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(t)}
                                disabled={deleting}
                                aria-label={`Delete ${t.name}`}
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
                        <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.name}</strong> from the
                            platform. Its database and all associated data will
                            be soft-deleted and can be restored later.
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

TenantIndex.layout = {
    breadcrumbs: [{ title: "Tenants", href: "/tenants" }],
};
