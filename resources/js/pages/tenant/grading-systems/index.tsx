// resources/js/pages/tenant/grading-systems/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    ClipboardCheck,
    Eye,
    Hash,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Star,
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

import type { GradingSystem, PaginatedData } from "@/types";
import GradingSystemFormModal from "@/components/modals/grading-system-form-modal";

interface GradingSystemFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
    type: string;
}

interface Props {
    gradingSystems: PaginatedData<GradingSystem>;
    filters: GradingSystemFiltersFull;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        forceDelete: boolean;
    };
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium",
                active
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground border-border",
            )}
        >
            {active ? "Active" : "Inactive"}
        </Badge>
    );
}

export default function GradingSystemIndex({
    gradingSystems,
    filters,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<GradingSystem | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<GradingSystem | null>(
        null,
    );
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<GradingSystem | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<GradingSystem | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (s: GradingSystem) => {
        setEditing(s);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("grading-systems.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove grading system."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("grading-systems.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore grading system."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("grading-systems.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<GradingSystem>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Grading System",
                sortable: true,
                icon: ClipboardCheck,
                headerClassName: "w-[34%]",
                cell: (s) => (
                    <Link
                        href={route("grading-systems.show", s.id)}
                        className="flex min-w-0 items-center gap-3 rounded-md -m-1 p-1 transition-colors hover:bg-muted/50"
                        title={`View ${s.name}`}
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            <ClipboardCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{s.name}</span>
                                {s.is_default && (
                                    <Badge
                                        variant="outline"
                                        className="border-amber-500/20 bg-amber-500/10 text-[10px] uppercase text-amber-600 dark:text-amber-400"
                                    >
                                        Default
                                    </Badge>
                                )}
                                {s.deleted_at && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                                    >
                                        Deleted
                                    </Badge>
                                )}
                            </div>
                            {s.description && (
                                <div className="truncate text-xs text-muted-foreground">
                                    {s.description}
                                </div>
                            )}
                        </div>
                    </Link>
                ),
            },
            {
                key: "code",
                label: "Code",
                sortable: true,
                icon: Hash,
                headerClassName: "hidden w-[12%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (s) => (
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {s.code}
                    </span>
                ),
            },
            {
                key: "type",
                label: "Type",
                sortable: false,
                icon: Star,
                headerClassName: "hidden w-[14%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (s) => (
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {s.type}
                    </span>
                ),
            },
            {
                key: "grade_scales_count",
                label: "Scales",
                sortable: false,
                icon: Layers,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.grade_scales_count ?? 0}
                    </span>
                ),
            },
            {
                key: "subjects_count",
                label: "Subjects",
                sortable: false,
                icon: BookOpen,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.subjects_count ?? 0}
                    </span>
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: false,
                icon: Power,
                headerClassName: "w-[10%]",
                cell: (s) => <StatusBadge active={s.is_active} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Grading Systems" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Grading Systems"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <ClipboardCheck className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Define grading systems and manage their grade scales
                            from each system's detail page.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Grading System
                            </Button>
                        )
                    }
                />

                <DataTable<GradingSystem, GradingSystemFiltersFull>
                    paginator={gradingSystems}
                    filters={filters}
                    columns={columns}
                    routeName="grading-systems.index"
                    rowKey={(s) => s.id}
                    searchPlaceholder="Search by name or code…"
                    emptyTitle="No grading systems found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first grading system."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Grading System
                            </Button>
                        )
                    }
                    actions={(s) => {
                        const isTrashed = !!s.deleted_at;
                        if (isTrashed) {
                            return (
                                <>
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(s)}
                                            aria-label={`Restore ${s.name}`}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(s)}
                                            aria-label={`Permanently delete ${s.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            );
                        }
                        return (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    asChild
                                    aria-label={`View ${s.name}`}
                                >
                                    <Link
                                        href={route(
                                            "grading-systems.show",
                                            s.id,
                                        )}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                                {can.update && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEdit(s)}
                                        aria-label={`Edit ${s.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(s)}
                                        aria-label={`Delete ${s.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <GradingSystemFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                gradingSystem={editing}
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
                            Remove grading system?
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
                            Restore grading system?
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
                            <strong>{forceTarget?.name}</strong> and its grade
                            scales will be permanently deleted. This action
                            cannot be undone.
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

GradingSystemIndex.layout = {
    breadcrumbs: [{ title: "Grading Systems", href: "/grading-systems" }],
};
