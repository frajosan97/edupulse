// resources/js/pages/tenant/academic-years/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CalendarRange,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
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

import type { AcademicYear, PaginatedData } from "@/types";
import AcademicYearFormModal from "@/components/modals/academic-year-form-modal";

interface AcademicYearFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
}

interface Props {
    academicYears: PaginatedData<AcademicYear>;
    filters: AcademicYearFiltersFull;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        forceDelete: boolean;
    };
}

function StatusBadge({ label, color }: { label: string; color: string }) {
    const map: Record<string, string> = {
        green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        blue: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
        gray: "bg-muted text-muted-foreground border-border",
        red: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
        <Badge
            variant="outline"
            className={cn("font-medium", map[color] ?? map.gray)}
        >
            {label}
        </Badge>
    );
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function AcademicYearIndex({
    academicYears,
    filters,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<AcademicYear | null>(
        null,
    );
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<AcademicYear | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<AcademicYear | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (y: AcademicYear) => {
        setEditing(y);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("academic-years.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove academic year."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("academic-years.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore academic year."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("academic-years.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<AcademicYear>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Academic Year",
                sortable: true,
                icon: CalendarDays,
                headerClassName: "w-[36%]",
                cell: (y) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{y.name}</span>
                                {y.deleted_at && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                                    >
                                        Deleted
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                key: "start_date",
                label: "Start",
                sortable: true,
                icon: CalendarRange,
                headerClassName: "hidden w-[16%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (y) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(y.start_date)}
                    </span>
                ),
            },
            {
                key: "end_date",
                label: "End",
                sortable: true,
                icon: CalendarRange,
                headerClassName: "hidden w-[16%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (y) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(y.end_date)}
                    </span>
                ),
            },
            {
                key: "terms_count",
                label: "Terms",
                sortable: false,
                icon: Layers,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (y) => (
                    <span className="text-sm text-muted-foreground">
                        {y.terms_count ?? 0}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                sortable: false,
                icon: Power,
                headerClassName: "w-[14%]",
                cell: (y) => (
                    <StatusBadge
                        label={y.status_label}
                        color={y.status_color}
                    />
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Academic Years" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Academic Years"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage academic years and the terms contained within
                            them.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Academic Year
                            </Button>
                        )
                    }
                />

                <DataTable<AcademicYear, AcademicYearFiltersFull>
                    paginator={academicYears}
                    filters={filters}
                    columns={columns}
                    routeName="academic-years.index"
                    rowKey={(y) => y.id}
                    searchPlaceholder="Search by name…"
                    emptyTitle="No academic years found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first academic year."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Academic Year
                            </Button>
                        )
                    }
                    actions={(y) => {
                        const isTrashed = !!y.deleted_at;
                        if (isTrashed) {
                            return (
                                <>
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(y)}
                                            aria-label={`Restore ${y.name}`}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(y)}
                                            aria-label={`Permanently delete ${y.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            );
                        }
                        return (
                            <>
                                {can.update && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEdit(y)}
                                        aria-label={`Edit ${y.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(y)}
                                        aria-label={`Delete ${y.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <AcademicYearFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                academicYear={editing}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove academic year?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.name}</strong>. It will be
                            soft-deleted and can be restored later.
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
                                    Removing…
                                </>
                            ) : (
                                "Remove"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={!!restoreTarget}
                onOpenChange={(open) => {
                    if (!open && !restoring) setRestoreTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Restore academic year?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{restoreTarget?.name}</strong> will be
                            restored and visible again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={restoring}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmRestore();
                            }}
                            disabled={restoring}
                        >
                            {restoring ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restoring…
                                </>
                            ) : (
                                "Restore"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={!!forceTarget}
                onOpenChange={(open) => {
                    if (!open && !forcing) setForceTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{forceTarget?.name}</strong> and all its
                            related records will be permanently deleted. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={forcing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmForceDelete();
                            }}
                            disabled={forcing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {forcing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete Forever"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

AcademicYearIndex.layout = {
    breadcrumbs: [{ title: "Academic Years", href: "/academic-years" }],
};
