// resources/js/pages/tenant/exams/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarRange,
    ClipboardList,
    Eye,
    Hash,
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
import type {
    Column,
    DataTableFilters,
    LaravelPaginator,
} from "@/components/data-table/types";
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

import type {
    Exam,
    ExamPermissions,
    ExamStatus,
    ExamStatusColor,
} from "@/types";
import ExamFormModal from "@/components/modals/exam-form-modal";

// ─── Types ──────────────────────────────────────────────────────

// Must match `IndexExamRequest::filters()` on the backend.
interface ExamFiltersFull extends DataTableFilters {
    status: "" | "active" | "inactive";
    published: "" | "1" | "0";
    trashed: "" | "with" | "only";
    term_id: string;
}

interface Option {
    value: number;
    label: string;
}

interface Props {
    exams: LaravelPaginator<Exam>;
    filters: ExamFiltersFull;
    terms: Option[];
    classes: Option[];
    can: ExamPermissions & { create: boolean; show: boolean };
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Outline-style classes for the index table. Keyed by `ExamStatusColor`
 * so a new color fails the build until it's styled.
 */
const STATUS_CLASSES: Record<ExamStatusColor, string> = {
    green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    blue: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
    gray: "bg-muted text-muted-foreground border-border",
    yellow: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    red: "bg-destructive/10 text-destructive border-destructive/20",
};

/** Mirrors `Exam::statusColor()` so the badge still renders if the
 *  backend omits `status_color`. */
const STATUS_COLOR_FALLBACK: Record<ExamStatus, ExamStatusColor> = {
    draft: "yellow",
    scheduled: "blue",
    in_progress: "yellow",
    published: "green",
    archived: "gray",
};

function StatusBadge({
    status,
    label,
    color,
}: {
    status: ExamStatus | undefined;
    label: string | undefined;
    color: ExamStatusColor | undefined;
}) {
    const resolvedColor: ExamStatusColor =
        color ?? (status ? STATUS_COLOR_FALLBACK[status] : "gray");
    const resolvedLabel =
        label ??
        (status
            ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Unknown");

    return (
        <Badge
            variant="outline"
            className={cn("font-medium", STATUS_CLASSES[resolvedColor])}
        >
            {resolvedLabel}
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

// ─── Page ───────────────────────────────────────────────────────

export default function ExamIndex({
    exams,
    filters,
    terms,
    classes,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<Exam | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<Exam | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Exam | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    // Stable callbacks — prevents `columns` memo from invalidating.
    const openCreate = useCallback(() => {
        setEditing(null);
        setModalOpen(true);
    }, []);

    const openEdit = useCallback((exam: Exam) => {
        setEditing(exam);
        setModalOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("exams.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove exam."),
            onFinish: () => setDeleting(false),
        });
    }, [deleteTarget, deleting]);

    const confirmRestore = useCallback(() => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("exams.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore exam."),
                onFinish: () => setRestoring(false),
            },
        );
    }, [restoreTarget, restoring]);

    const confirmForceDelete = useCallback(() => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("exams.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    }, [forceTarget, forcing]);

    const columns: Column<Exam>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Exam",
                sortable: true,
                icon: ClipboardList,
                headerClassName: "w-[32%]",
                cell: (e) => (
                    <button
                        type="button"
                        onClick={() => can.update && openEdit(e)}
                        disabled={!can.update}
                        className="flex min-w-0 w-full items-center gap-3 rounded-md -m-1 p-1 text-left transition-colors hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-transparent"
                        title={can.update ? `Edit ${e.name}` : e.name}
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{e.name}</span>
                                {e.deleted_at && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                                    >
                                        Deleted
                                    </Badge>
                                )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                                {e.term?.name ?? "—"}
                                {e.term?.academic_year?.name
                                    ? ` · ${e.term.academic_year.name}`
                                    : ""}
                            </div>
                        </div>
                    </button>
                ),
            },
            {
                key: "start_date",
                label: "Start",
                sortable: true,
                icon: CalendarRange,
                headerClassName: "hidden w-[12%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (e) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(e.start_date)}
                    </span>
                ),
            },
            {
                key: "end_date",
                label: "End",
                sortable: true,
                icon: CalendarRange,
                headerClassName: "hidden w-[12%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (e) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(e.end_date)}
                    </span>
                ),
            },
            {
                key: "exam_classes_count",
                label: "Classes",
                sortable: false,
                icon: Layers,
                headerClassName: "hidden w-[12%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (e) => (
                    <span className="text-sm text-muted-foreground">
                        {e.exam_classes_count ?? 0}
                    </span>
                ),
            },
            {
                key: "status",
                label: "Status",
                sortable: false,
                icon: Power,
                headerClassName: "w-[12%]",
                cell: (e) => (
                    <StatusBadge
                        status={e.status}
                        label={e.status_label}
                        color={e.status_color}
                    />
                ),
            },
        ],
        [can.update, openEdit],
    );

    return (
        <>
            <Head title="Exams" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Exams"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Schedule exams and assign the classes that will sit
                            for them.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Exam
                            </Button>
                        )
                    }
                />

                <DataTable<Exam, ExamFiltersFull>
                    paginator={exams}
                    filters={filters}
                    columns={columns}
                    routeName="exams.index"
                    rowKey={(e) => e.id}
                    searchPlaceholder="Search by name or code…"
                    emptyTitle="No exams found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first exam."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Exam
                            </Button>
                        )
                    }
                    actions={(e) => {
                        const isTrashed = !!e.deleted_at;
                        if (isTrashed) {
                            return (
                                <>
                                    {can.show && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                router.visit(
                                                    route("exams.show", e.id),
                                                )
                                            }
                                            aria-label={`View ${e.name}`}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(e)}
                                            aria-label={`Restore ${e.name}`}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(e)}
                                            aria-label={`Permanently delete ${e.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            );
                        }
                        return (
                            <>
                                {can.show && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            router.visit(
                                                route("exams.show", e.id),
                                            )
                                        }
                                        aria-label={`View ${e.name}`}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.update && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEdit(e)}
                                        aria-label={`Edit ${e.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(e)}
                                        aria-label={`Delete ${e.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <ExamFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                exam={editing}
                terms={terms}
                classes={classes}
            />

            {/* ─── Remove ─── */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove exam?</AlertDialogTitle>
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
                            onClick={(ev) => {
                                ev.preventDefault();
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

            {/* ─── Restore ─── */}
            <AlertDialog
                open={!!restoreTarget}
                onOpenChange={(open) => {
                    if (!open && !restoring) setRestoreTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore exam?</AlertDialogTitle>
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
                            onClick={(ev) => {
                                ev.preventDefault();
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

            {/* ─── Force-delete ─── */}
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
                            related records will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={forcing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(ev) => {
                                ev.preventDefault();
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

ExamIndex.layout = {
    breadcrumbs: [{ title: "Exams", href: "/exams" }],
};
