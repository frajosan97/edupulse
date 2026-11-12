// resources/js/pages/tenant/class-streams/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    ShieldCheck,
    Trash2,
    Users,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ClassStream, PaginatedData } from "@/types";
import ClassStreamFormModal from "@/components/modals/class-stream-form-modal";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ClassStreamFiltersFull extends DataTableFilters {
    class_id?: number | null;
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
}

interface Props {
    classStreams: PaginatedData<ClassStream>;
    filters: ClassStreamFiltersFull;
    classes: { id: number; name: string }[];
    streams: { id: number; name: string }[];
    scopedClass?: { id: number; name: string } | null;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        forceDelete: boolean;
    };
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

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

/** Displays a single manager name, or an em-dash when none is assigned. */
function ManagerCell({ name }: { name?: string | null }) {
    if (!name) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }
    return (
        <span
            className="block truncate text-sm font-medium text-foreground"
            title={name}
        >
            {name}
        </span>
    );
}

/** Displays a list of assistant names, collapsed into a tooltip. */
function AssistantsCell({
    assistants,
}: {
    assistants?: { id: number; name: string }[] | null;
}) {
    const list = assistants ?? [];

    if (list.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    const first = list[0].name;
    const extra = list.length - 1;

    if (extra === 0) {
        return (
            <span
                className="block truncate text-sm text-foreground"
                title={first}
            >
                {first}
            </span>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="flex w-full min-w-0 items-center gap-1.5 text-sm text-foreground">
                        <span className="truncate">{first}</span>
                        <Badge
                            variant="outline"
                            className="shrink-0 border-border bg-muted text-[10px] text-muted-foreground"
                        >
                            +{extra}
                        </Badge>
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <ul className="space-y-0.5">
                        {list.map((t) => (
                            <li key={t.id}>{t.name}</li>
                        ))}
                    </ul>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ClassStreamsIndex({
    classStreams,
    filters,
    classes,
    streams,
    scopedClass,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<ClassStream | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [restoreTarget, setRestoreTarget] = useState<ClassStream | null>(
        null,
    );
    const [restoring, setRestoring] = useState(false);

    const [forceTarget, setForceTarget] = useState<ClassStream | null>(null);
    const [forcing, setForcing] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ClassStream | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (cs: ClassStream) => {
        setEditing(cs);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("class-streams.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove class stream."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);

        router.post(
            route("class-streams.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore class stream."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);

        router.delete(route("class-streams.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<ClassStream>[] = useMemo(
        () => [
            {
                key: "class_stream",
                label: "Class + Stream",
                sortable: false,
                icon: Layers,
                // Give the core identifier more room dynamically.
                headerClassName: "w-[30%] whitespace-nowrap",
                className: "min-w-0",
                cell: (cs) => (
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium">
                            {cs.class?.name ?? `Class #${cs.class_id}`}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                            {cs.stream?.name ?? `Stream #${cs.stream_id}`}
                        </span>
                        {cs.deleted_at && (
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
                key: "students_count",
                label: "Students",
                sortable: false,
                icon: Users,
                // Reveal on md, no fixed width (fluid)
                headerClassName: "hidden whitespace-nowrap md:table-cell",
                className: "hidden md:table-cell",
                cell: (cs) => (
                    <span className="text-sm text-muted-foreground">
                        {cs.students_count ?? 0}
                    </span>
                ),
            },
            {
                key: "manager",
                label: "Manager",
                sortable: false,
                icon: ShieldCheck,
                // Reveal on lg, no fixed width (fluid)
                headerClassName: "hidden whitespace-nowrap lg:table-cell",
                className: "hidden min-w-0 lg:table-cell",
                cell: (cs) => (
                    // Assuming ClassStream extends Classes or has these appended
                    <ManagerCell name={cs.class_teacher?.name} />
                ),
            },
            {
                key: "assistants",
                label: "Assistants",
                sortable: false,
                icon: Users,
                // Reveal on xl, no fixed width (fluid)
                headerClassName: "hidden whitespace-nowrap xl:table-cell",
                className: "hidden min-w-0 xl:table-cell",
                cell: (cs) => (
                    <AssistantsCell assistants={cs.assistant_teachers} />
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: true,
                icon: Power,
                // Keep status fixed so it doesn't stretch
                headerClassName: "w-[10%] whitespace-nowrap",
                cell: (cs) => <StatusBadge active={cs.is_active} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Class Streams" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Class Streams"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Layers className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            {scopedClass
                                ? `Manage the streams paired with ${scopedClass.name}.`
                                : "Pair classes with streams — e.g. Form 1 North, Form 1 South. Each pair holds its own student roster."}
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                {scopedClass
                                    ? "Add Stream to Class"
                                    : "Add Class Stream"}
                            </Button>
                        )
                    }
                />

                <DataTable<ClassStream, ClassStreamFiltersFull>
                    paginator={classStreams}
                    filters={filters}
                    columns={columns}
                    routeName="class-streams.index"
                    rowKey={(cs) => cs.id}
                    searchPlaceholder="Search…"
                    showFilters={!scopedClass}
                    emptyTitle={
                        scopedClass
                            ? `No streams for ${scopedClass.name} yet`
                            : "No class streams yet"
                    }
                    emptyDescription={
                        filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : scopedClass
                              ? `Add a stream to ${scopedClass.name} to get started.`
                              : "Pair a class with a stream to get started."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                {scopedClass
                                    ? "Add Stream to Class"
                                    : "Add Class Stream"}
                            </Button>
                        )
                    }
                    actions={(cs) => {
                        const isTrashed = !!cs.deleted_at;

                        if (isTrashed) {
                            return (
                                <>
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(cs)}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(cs)}
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
                                        onClick={() => openEdit(cs)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(cs)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <ClassStreamFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                classStream={editing}
                classes={classes}
                streams={streams}
                lockedClassId={scopedClass?.id ?? null}
                lockedClassName={scopedClass?.name ?? null}
            />

            {/* Soft delete */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove class stream?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This pairing will be soft-deleted and can be
                            restored.
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

            {/* Restore */}
            <AlertDialog
                open={!!restoreTarget}
                onOpenChange={(open) => {
                    if (!open && !restoring) setRestoreTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Restore class stream?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This pairing will be restored and visible again.
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

            {/* Force delete */}
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
                            This pairing will be permanently deleted. This
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

ClassStreamsIndex.layout = {
    breadcrumbs: [{ title: "Class Streams", href: "/class-streams" }],
};
