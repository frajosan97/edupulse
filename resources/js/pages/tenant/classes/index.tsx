// resources/js/pages/tenant/classes/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    GraduationCap,
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

import type { Classes, PaginatedData } from "@/types";
import ClassesFormModal from "@/components/modals/classes-form-modal";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ClassesFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    cbc: "" | "1" | "0";
    trashed: "" | "with" | "only";
}

interface Props {
    classes: PaginatedData<Classes>;
    filters: ClassesFiltersFull;
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        restore: boolean;
        forceDelete: boolean;
        viewStreams?: boolean;
        viewClassStreams?: boolean;
    };
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function ClassAvatar({ name }: { name: string }) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
            aria-hidden="true"
        >
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

function CbcBadge({ isCbc }: { isCbc: boolean }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium",
                isCbc
                    ? "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400"
                    : "bg-muted text-muted-foreground border-border",
            )}
        >
            {isCbc ? "CBC" : "8-4-4"}
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
                    <span className="flex items-center gap-1.5 text-sm text-foreground w-full min-w-0">
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

export default function ClassesIndex({ classes, filters, can }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Classes | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [restoreTarget, setRestoreTarget] = useState<Classes | null>(null);
    const [restoring, setRestoring] = useState(false);

    const [forceTarget, setForceTarget] = useState<Classes | null>(null);
    const [forcing, setForcing] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Classes | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (cls: Classes) => {
        setEditing(cls);
        setModalOpen(true);
    };

    const goToStreams = () => {
        router.visit(route("streams.index"));
    };

    const goToClassStreams = (cls: Classes) => {
        router.visit(route("class-streams.index", { class_id: cls.id }));
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("classes.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove class."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);

        router.post(
            route("classes.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore class."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);

        router.delete(route("classes.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<Classes>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Class",
                sortable: true,
                icon: GraduationCap,
                // Give Class more room dynamically.
                // Table-fixed will respect this width, everything else shares the rest.
                headerClassName: "w-[28%] whitespace-nowrap",
                className: "min-w-0",
                cell: (c) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <ClassAvatar name={c.name} />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{c.name}</span>
                                {c.deleted_at && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/20 bg-destructive/10 text-[10px] uppercase text-destructive"
                                    >
                                        Deleted
                                    </Badge>
                                )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                                {c.class_streams_count ?? 0} stream
                                {(c.class_streams_count ?? 0) === 1 ? "" : "s"}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                key: "is_cbc",
                label: "Curriculum",
                sortable: true,
                icon: BookOpen,
                // No fixed width — it will dynamically take what it needs.
                headerClassName: "hidden whitespace-nowrap md:table-cell",
                className: "hidden md:table-cell",
                cell: (c) => <CbcBadge isCbc={c.is_cbc} />,
            },
            {
                key: "students_count",
                label: "Students",
                sortable: false,
                icon: Users,
                headerClassName: "hidden whitespace-nowrap xl:table-cell",
                className: "hidden xl:table-cell",
                cell: (c) => (
                    <span className="text-sm text-muted-foreground">
                        {c.students_count ?? 0}
                    </span>
                ),
            },
            {
                key: "class_teacher",
                label: "Manager",
                sortable: false,
                icon: ShieldCheck,
                headerClassName: "hidden whitespace-nowrap lg:table-cell",
                className: "hidden min-w-0 lg:table-cell",
                cell: (c) => <ManagerCell name={c.class_teacher?.name} />,
            },
            {
                key: "assistant_teachers",
                label: "Assistants",
                sortable: false,
                icon: Users,
                headerClassName: "hidden whitespace-nowrap xl:table-cell",
                className: "hidden min-w-0 xl:table-cell",
                cell: (c) => (
                    <AssistantsCell assistants={c.assistant_teachers} />
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: true,
                icon: Power,
                // Also give Status a small fixed width so it doesn't get squished.
                headerClassName: "w-[10%] whitespace-nowrap",
                cell: (c) => <StatusBadge active={c.is_active} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Classes" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Classes"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage the classes in your school — assign them to
                            streams, track students, and choose their
                            curriculum.
                        </p>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            {can.viewStreams !== false && (
                                <Button
                                    variant="outline"
                                    onClick={goToStreams}
                                    aria-label="Manage streams"
                                >
                                    <Layers className="mr-2 h-4 w-4" />
                                    Streams
                                </Button>
                            )}
                            {can.create && (
                                <Button onClick={openCreate}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Class
                                </Button>
                            )}
                        </div>
                    }
                />

                <DataTable<Classes, ClassesFiltersFull>
                    paginator={classes}
                    filters={filters}
                    columns={columns}
                    routeName="classes.index"
                    rowKey={(c) => c.id}
                    searchPlaceholder="Search by class name…"
                    emptyTitle="No classes found"
                    emptyDescription={
                        filters.search ||
                        filters.status ||
                        filters.cbc ||
                        filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first class."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Class
                            </Button>
                        )
                    }
                    actions={(c) => {
                        const isTrashed = !!c.deleted_at;

                        if (isTrashed) {
                            return (
                                <>
                                    {can.restore && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                            onClick={() => setRestoreTarget(c)}
                                            aria-label={`Restore ${c.name}`}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {can.forceDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setForceTarget(c)}
                                            aria-label={`Permanently delete ${c.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            );
                        }

                        return (
                            <>
                                {can.viewClassStreams !== false && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => goToClassStreams(c)}
                                        aria-label={`Manage streams for ${c.name}`}
                                        title="Manage streams for this class"
                                    >
                                        <Layers className="h-4 w-4" />
                                    </Button>
                                )}

                                {can.update && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEdit(c)}
                                        aria-label={`Edit ${c.name}`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {can.delete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setDeleteTarget(c)}
                                        aria-label={`Delete ${c.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <ClassesFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                classes={editing}
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
                        <AlertDialogTitle>Remove class?</AlertDialogTitle>
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

            {/* Restore */}
            <AlertDialog
                open={!!restoreTarget}
                onOpenChange={(open) => {
                    if (!open && !restoring) setRestoreTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore class?</AlertDialogTitle>
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

ClassesIndex.layout = {
    breadcrumbs: [{ title: "Classes", href: "/classes" }],
};
