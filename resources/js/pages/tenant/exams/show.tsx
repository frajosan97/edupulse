// resources/js/pages/tenant/exams/show.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    Calendar,
    CalendarRange,
    ClipboardList,
    Layers,
    Loader2,
    Power,
    Printer,
    RotateCcw,
    Send,
    Star,
    Trash2,
    Undo2,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import type { Column, LaravelPaginator } from "@/components/data-table/types";
import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type {
    Exam,
    ExamClass,
    ExamClassFilters,
    ExamPermissions,
    ExamStatus,
    ExamStatusColor,
} from "@/types";
import { formatDateTime } from "@/lib/formatters";

const easeOut = [0.16, 1, 0.3, 1] as const;

// ─── Props ──────────────────────────────────────────────────────

interface Props {
    exam: Exam;
    examClasses: LaravelPaginator<ExamClass>;
    filters: ExamClassFilters;
    can: ExamPermissions;
}

// ─── Helpers ────────────────────────────────────────────────────

const STATUS_BADGE: Record<ExamStatusColor, string> = {
    green: "bg-[#16a34a] hover:bg-[#16a34a]/90",
    blue: "bg-sky-600 hover:bg-sky-600/90",
    gray: "bg-slate-500 hover:bg-slate-500/90",
    yellow: "bg-[#eab308] hover:bg-[#eab308]/90",
    red: "bg-destructive hover:bg-destructive/90",
};

/** Mirrors `Exam::statusColor()` so the badge still renders if the backend
 *  omits `status_color` (e.g. an older resource). */
const STATUS_COLOR_FALLBACK: Record<ExamStatus, ExamStatusColor> = {
    draft: "yellow",
    scheduled: "blue",
    in_progress: "yellow",
    published: "green",
    archived: "gray",
};

function formatDate(
    value: string | null,
    opts?: Intl.DateTimeFormatOptions,
): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...opts,
    });
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

// ─── Page ───────────────────────────────────────────────────────

export default function ExamShowPage({
    exam,
    examClasses,
    filters,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [restoreOpen, setRestoreOpen] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [forceOpen, setForceOpen] = useState(false);
    const [forcing, setForcing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Per-row publish/unpublish loading flags (keyed by ExamClass row id).
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [unpublishingId, setUnpublishingId] = useState<number | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const isTrashed = !!exam.deleted_at;

    // ─── Status badge derivation (matches analysis.tsx) ─────────
    const statusColor: ExamStatusColor =
        exam.status_color ??
        (exam.status ? STATUS_COLOR_FALLBACK[exam.status] : "gray");
    const statusLabel =
        exam.status_label ??
        (exam.status
            ? exam.status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Unknown");

    const confirmDelete = useCallback(() => {
        setDeleting(true);
        router.delete(route("exams.destroy", { exam: exam.id }), {
            onSuccess: () => toast.success(`"${exam.name}" removed.`),
            onError: () => toast.error("Failed to remove exam."),
            onFinish: () => setDeleting(false),
        });
    }, [exam.id, exam.name]);

    const confirmRestore = useCallback(() => {
        setRestoring(true);
        router.post(
            route("exams.restore", { id: exam.id }),
            {},
            {
                onSuccess: () => toast.success(`"${exam.name}" restored.`),
                onError: () => toast.error("Failed to restore exam."),
                onFinish: () => setRestoring(false),
            },
        );
    }, [exam.id, exam.name]);

    const confirmForceDelete = useCallback(() => {
        setForcing(true);
        router.delete(route("exams.force-delete", { id: exam.id }), {
            onSuccess: () => toast.success("Exam permanently deleted."),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    }, [exam.id]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    // ─── Row actions ────────────────────────────────────────────

    const handlePrint = (c: ExamClass) => {
        window.open(
            route("results.print", { exam: exam.id, class: c.class_id }),
            "_blank",
            "noopener,noreferrer",
        );
    };

    const handlePublish = (c: ExamClass) => {
        setPublishingId(c.id);
        router.post(
            route("exam-classes.publish", {
                exam: exam.id,
                examClass: c.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Published."),
                onError: () => toast.error("Failed to publish."),
                onFinish: () => setPublishingId(null),
            },
        );
    };

    const handleUnpublish = (c: ExamClass) => {
        setUnpublishingId(c.id);
        router.post(
            route("exam-classes.unpublish", {
                exam: exam.id,
                examClass: c.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Unpublished."),
                onError: () => toast.error("Failed to unpublish."),
                onFinish: () => setUnpublishingId(null),
            },
        );
    };

    const classCount = exam.exam_classes_count ?? examClasses.total;
    const resultsCount = exam.results_count ?? 0;

    // ─── Stat Cards ─────────────────────────────────────────────
    const statCards: StatCardData[] = [
        {
            id: "classes",
            label: "Classes",
            value: classCount.toLocaleString(),
            hint: "Assigned to this exam",
            icon: Layers,
            accent: true,
        },
        {
            id: "results",
            label: "Results",
            value: resultsCount.toLocaleString(),
            hint: "Student results recorded",
            icon: ClipboardList,
        },
        {
            id: "start",
            label: "Starts",
            value: (
                <span className="text-base">{formatDate(exam.start_date)}</span>
            ),
            hint: exam.start_date
                ? formatDateTime(exam.start_date)
                : "Not scheduled",
            icon: CalendarRange,
        },
        {
            id: "status",
            label: "Status",
            value: <span className="capitalize">{statusLabel}</span>,
            hint: exam.is_published ? "Visible to students" : "Draft / hidden",
            icon: Power,
        },
    ];

    // ─── Columns (DataTable) ────────────────────────────────────
    const columns: Column<ExamClass>[] = useMemo(
        () => [
            {
                key: "class_id",
                label: "Class",
                sortable: true,
                icon: Users,
                headerClassName: "w-[30%] whitespace-nowrap",
                className: "min-w-0",
                cell: (c) => (
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="truncate font-medium">
                            {c.class?.name ?? `Class #${c.class_id}`}
                        </span>
                        {c.deleted_at && (
                            <Badge
                                variant="outline"
                                className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                            >
                                Deleted
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                key: "class_stream_id",
                label: "Stream",
                sortable: true,
                icon: Layers,
                headerClassName: "hidden whitespace-nowrap md:table-cell",
                className: "hidden min-w-0 md:table-cell",
                cell: (c) => (
                    <span
                        className="block truncate text-sm text-muted-foreground"
                        title={c.stream?.name ?? undefined}
                    >
                        {c.stream?.name ?? "—"}
                    </span>
                ),
            },
            {
                key: "level",
                label: "Level",
                sortable: true,
                icon: BarChart3,
                headerClassName: "hidden whitespace-nowrap lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (c) => (
                    <span className="text-sm capitalize text-muted-foreground">
                        {c.level}
                    </span>
                ),
            },
            {
                key: "assigned_date",
                label: "Assigned",
                sortable: true,
                icon: Calendar,
                headerClassName: "hidden whitespace-nowrap xl:table-cell",
                className: "hidden xl:table-cell",
                cell: (c) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(c.assigned_date ?? null)}
                    </span>
                ),
            },
            {
                key: "end_date",
                label: "Ends",
                sortable: true,
                icon: CalendarRange,
                headerClassName: "hidden whitespace-nowrap xl:table-cell",
                className: "hidden xl:table-cell",
                cell: (c) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(c.end_date ?? null)}
                    </span>
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: true,
                icon: Power,
                headerClassName: "w-[10%] whitespace-nowrap",
                cell: (c) => <StatusBadge active={c.is_active} />,
            },
        ],
        [],
    );

    return (
        <TooltipProvider>
            <Head title={exam.name} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={exam.name}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <span>
                                Code:{" "}
                                <span className="font-mono font-medium text-foreground">
                                    {exam.code}
                                </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                                {exam.term?.name ?? "—"}
                                {exam.term?.academic_year?.name
                                    ? ` · ${exam.term.academic_year.name}`
                                    : ""}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{classCount} classes</span>
                        </>
                    }
                    statuses={
                        <>
                            {/* Primary status badge — driven by status_color / status_label */}
                            <Badge
                                className={cn(
                                    "rounded-full px-3 py-1 font-semibold text-white border-none",
                                    STATUS_BADGE[statusColor],
                                )}
                            >
                                <Power className="mr-1.5 h-3.5 w-3.5" />
                                {statusLabel}
                            </Badge>

                            {isTrashed && (
                                <Badge className="rounded-full bg-destructive hover:bg-destructive/90 px-3 py-1 font-semibold text-destructive-foreground border-none">
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Deleted
                                </Badge>
                            )}

                            <Badge
                                variant="outline"
                                className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm border-slate-200"
                            >
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Updated{" "}
                                {formatDate(exam.updated_at ?? exam.created_at)}
                            </Badge>

                            {exam.term?.academic_year?.name && (
                                <Badge
                                    variant="secondary"
                                    className="rounded-full gap-1 font-medium px-3 py-1"
                                >
                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                    {exam.term.academic_year.name}
                                </Badge>
                            )}
                        </>
                    }
                    backHref={route("exams.index")}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            {!isTrashed && can.delete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}

                            {isTrashed && can.restore && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                    onClick={() => setRestoreOpen(true)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            )}

                            {isTrashed && can.forceDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setForceOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    }
                />

                {/* Stats grid */}
                <StatsCards data={statCards} />

                {/* Classes DataTable */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                >
                    <DataTable<ExamClass, ExamClassFilters>
                        paginator={examClasses}
                        filters={filters}
                        columns={columns}
                        routeName="exams.show"
                        routeParams={{ exam: exam.id }}
                        rowKey={(c) => c.id}
                        searchPlaceholder="Search classes or streams…"
                        emptyTitle="No classes assigned"
                        emptyDescription={
                            filters.search ||
                            filters.status ||
                            filters.level ||
                            filters.trashed
                                ? "Try adjusting your filters."
                                : "This exam has no classes yet."
                        }
                        actions={(c) => {
                            const isPublishing = publishingId === c.id;
                            const isUnpublishing = unpublishingId === c.id;

                            return (
                                <>
                                    {/* Analyze */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        "results.analysis",
                                                        {
                                                            exam: exam.id,
                                                            class: c.class_id,
                                                        },
                                                    )}
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Analyze
                                                    </span>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Analyze Results
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Print */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                onClick={() => handlePrint(c)}
                                            >
                                                <Printer className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Print
                                                </span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Print Results
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Publish / Unpublish */}
                                    {c.is_active ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                                                    onClick={() =>
                                                        handleUnpublish(c)
                                                    }
                                                    disabled={isUnpublishing}
                                                >
                                                    {isUnpublishing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Undo2 className="h-4 w-4" />
                                                    )}
                                                    <span className="sr-only">
                                                        Unpublish
                                                    </span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Unpublish
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                    onClick={() =>
                                                        handlePublish(c)
                                                    }
                                                    disabled={isPublishing}
                                                >
                                                    {isPublishing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Send className="h-4 w-4" />
                                                    )}
                                                    <span className="sr-only">
                                                        Publish
                                                    </span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Publish
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </>
                            );
                        }}
                    />
                </motion.div>
            </div>

            {/* ─── Delete ─── */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{exam.name}</strong> will be soft-deleted
                            and can be restored later.
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
            <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{exam.name}</strong> will be restored and
                            visible again.
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
            <AlertDialog open={forceOpen} onOpenChange={setForceOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{exam.name}</strong> and all its related
                            records will be permanently deleted.
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
        </TooltipProvider>
    );
}

ExamShowPage.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Exams", href: "/exams" },
        { title: props.exam?.name ?? "Exam", href: `/exams/${props.exam?.id}` },
    ],
});
