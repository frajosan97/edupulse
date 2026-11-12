// resources/js/pages/tenant/pathways/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookMarked,
    CalendarCheck,
    Hash,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Trash2,
    Users,
    Waypoints,
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

import type { Pathway, PaginatedData } from "@/types";
import PathwayFormModal from "@/components/modals/pathway-form-modal";

interface PathwayFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
    curriculum_id: string;
}

interface Option {
    value: number;
    label: string;
}

interface Props {
    pathways: PaginatedData<Pathway>;
    filters: PathwayFiltersFull;
    curricula: Option[];
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        forceDelete: boolean;
    };
}

function PathwayAvatar({ code }: { code: string }) {
    const initial = code.trim().charAt(0).toUpperCase() || "?";
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {initial}
        </div>
    );
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

export default function PathwayIndex({
    pathways,
    filters,
    curricula,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Pathway | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<Pathway | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<Pathway | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Pathway | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (p: Pathway) => {
        setEditing(p);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("pathways.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove pathway."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("pathways.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore pathway."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("pathways.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<Pathway>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Pathway",
                sortable: true,
                icon: BookMarked,
                headerClassName: "w-[36%]",
                cell: (p) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <PathwayAvatar code={p.code} />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{p.name}</span>
                                {p.deleted_at && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                                    >
                                        Deleted
                                    </Badge>
                                )}
                            </div>
                            {p.description && (
                                <div className="truncate text-xs text-muted-foreground">
                                    {p.description}
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: "code",
                label: "Code",
                sortable: true,
                icon: Hash,
                headerClassName: "hidden w-[12%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (p) => (
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {p.code}
                    </span>
                ),
            },
            {
                key: "curriculum",
                label: "Curriculum",
                sortable: false,
                icon: Waypoints,
                headerClassName: "hidden w-[18%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (p) => (
                    <span
                        className="rounded bg-muted px-2 py-1 font-mono text-xs"
                        title={p.curriculum?.name}
                    >
                        {p.curriculum?.code ?? "—"}
                    </span>
                ),
            },
            {
                key: "subjects_count",
                label: "Subjects",
                sortable: false,
                icon: CalendarCheck,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (p) => (
                    <span className="text-sm text-muted-foreground">
                        {p.subjects_count ?? 0}
                    </span>
                ),
            },
            {
                key: "students_count",
                label: "Students",
                sortable: false,
                icon: Users,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (p) => (
                    <span className="text-sm text-muted-foreground">
                        {p.students_count ?? 0}
                    </span>
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: false,
                icon: Power,
                headerClassName: "w-[10%]",
                cell: (p) => <StatusBadge active={p.is_active} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Pathways" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Pathways"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Waypoints className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Group subjects and students into specialised
                            pathways within a curriculum.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Pathway
                            </Button>
                        )
                    }
                />

                <DataTable<Pathway, PathwayFiltersFull>
                    paginator={pathways}
                    filters={filters}
                    columns={columns}
                    routeName="pathways.index"
                    rowKey={(p) => p.id}
                    searchPlaceholder="Search by name or code…"
                    emptyTitle="No pathways found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first pathway."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Pathway
                            </Button>
                        )
                    }
                    actions={(p) => {
                        const isTrashed = !!p.deleted_at;
                        if (isTrashed) {
                            return (
                                <>
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(p)}
                                            aria-label={`Restore ${p.name}`}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(p)}
                                            aria-label={`Permanently delete ${p.name}`}
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
                                        onClick={() => openEdit(p)}
                                        aria-label={`Edit ${p.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(p)}
                                        aria-label={`Delete ${p.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <PathwayFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pathway={editing}
                curricula={curricula}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove pathway?</AlertDialogTitle>
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
                        <AlertDialogTitle>Restore pathway?</AlertDialogTitle>
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

PathwayIndex.layout = {
    breadcrumbs: [{ title: "Pathways", href: "/pathways" }],
};
