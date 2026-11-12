// resources/js/pages/tenant/subjects/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Building2,
    Hash,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
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
import { cn } from "@/lib/utils";

import type { Subject, PaginatedData } from "@/types";
import SubjectFormModal from "@/components/modals/subject-form-modal";

interface SubjectFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
    curriculum_id: string;
    pathway_id: string;
    department_id: string;
    type: string;
    curriculum_type: string;
}

interface Option {
    value: number;
    label: string;
}

interface Props {
    subjects: PaginatedData<Subject>;
    filters: SubjectFiltersFull;
    curricula: Option[];
    pathways: Option[];
    departments: Option[];
    gradingSystems: Option[];
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

function TypeBadge({ type, label }: { type: string; label: string }) {
    const cls =
        type === "core"
            ? "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400"
            : type === "elective"
              ? "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400"
              : "bg-muted text-muted-foreground border-border";
    return (
        <Badge variant="outline" className={cn("font-medium", cls)}>
            {label}
        </Badge>
    );
}

export default function SubjectIndex({
    subjects,
    filters,
    curricula,
    pathways,
    departments,
    gradingSystems,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<Subject | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<Subject | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Subject | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (s: Subject) => {
        setEditing(s);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("subjects.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove subject."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("subjects.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore subject."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("subjects.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<Subject>[] = useMemo(
        () => [
            {
                key: "code",
                label: "Code",
                sortable: true,
                icon: Hash,
                headerClassName: "w-[10%]",
                cell: (s) => (
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {s.code}
                    </span>
                ),
            },
            {
                key: "name",
                label: "Subject",
                sortable: true,
                icon: BookOpen,
                headerClassName: "w-[34%]",
                cell: (s) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{s.name}</span>
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
                    </div>
                ),
            },
            {
                key: "type",
                label: "Type",
                sortable: false,
                icon: Layers,
                headerClassName: "hidden w-[12%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (s) => <TypeBadge type={s.type} label={s.type_label} />,
            },
            {
                key: "department",
                label: "Department",
                sortable: false,
                icon: Building2,
                headerClassName: "hidden w-[18%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.department?.name ?? "—"}
                    </span>
                ),
            },
            {
                key: "teachers_count",
                label: "Staff",
                sortable: false,
                icon: Users,
                headerClassName: "hidden w-[8%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.teachers_count ?? 0}
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
            <Head title="Subjects" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Subjects"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <BookOpen className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage subjects, assign departments, and configure
                            theory and practical weighting.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subject
                            </Button>
                        )
                    }
                />

                <DataTable<Subject, SubjectFiltersFull>
                    paginator={subjects}
                    filters={filters}
                    columns={columns}
                    routeName="subjects.index"
                    rowKey={(s) => s.id}
                    searchPlaceholder="Search by name, code, or short name…"
                    emptyTitle="No subjects found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first subject."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subject
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

            <SubjectFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                subject={editing}
                curricula={curricula}
                pathways={pathways}
                departments={departments}
                gradingSystems={gradingSystems}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove subject?</AlertDialogTitle>
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
                        <AlertDialogTitle>Restore subject?</AlertDialogTitle>
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

SubjectIndex.layout = {
    breadcrumbs: [{ title: "Subjects", href: "/subjects" }],
};
