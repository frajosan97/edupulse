// resources/js/pages/tenant/students/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Calendar,
    Eye,
    GraduationCap,
    Hash,
    Loader2,
    Mail,
    Pencil,
    Plus,
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

import type { PaginatedData, Student, StudentStatus, Option } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface StudentFiltersFull extends DataTableFilters {
    class_id: number | "";
    stream_id: number | "";
    curriculum: string;
    pathway_id: number | "";
    status: StudentStatus | "";
}

interface Props {
    students: PaginatedData<Student>;
    filters: StudentFiltersFull;
    classes: Option<number>[];
    streams: (Option<number> & { class_id: number })[];
    curricula: (Option<number> & { code: string })[];
    pathways: (Option<number> & { curriculum_id: number })[];
    statuses: StudentStatus[];
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function StudentAvatar({
    name,
    avatarUrl,
}: {
    name: string;
    avatarUrl?: string | null;
}) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
        );
    }

    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
            aria-hidden="true"
        >
            {initial}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    inactive: "Inactive",
    suspended: "Suspended",
};

const STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    pending:
        "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    inactive: "bg-muted text-muted-foreground border-border",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusBadge({ status }: { status?: string | null }) {
    if (!status) {
        return (
            <Badge variant="outline" className="font-medium">
                Unknown
            </Badge>
        );
    }

    const normalized = status.toLowerCase();
    const style =
        STATUS_STYLES[normalized] ??
        "bg-muted text-muted-foreground border-border";

    return (
        <Badge variant="outline" className={cn("font-medium", style)}>
            {STATUS_LABELS[normalized] ?? status}
        </Badge>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StudentIndex({ students, filters }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("students.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete student."),
            onFinish: () => setDeleting(false),
        });
    };

    const columns: Column<Student>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Student",
                sortable: true,
                icon: Users,
                headerClassName: "w-[38%]",
                cell: (s) => {
                    const name = s.user?.name ?? "—";
                    return (
                        <div className="flex min-w-0 items-center gap-3">
                            <StudentAvatar
                                name={name}
                                avatarUrl={s.user?.avatar_url}
                            />
                            <div className="min-w-0">
                                <div className="truncate font-medium text-foreground">
                                    {name}
                                </div>
                                {s.user?.email && (
                                    <div className="flex max-w-xs items-center gap-1 truncate text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                            {s.user.email}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "admission_number",
                label: "Admission",
                sortable: true,
                icon: Hash,
                headerClassName: "hidden w-[16%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (s) => (
                    <div className="flex flex-col text-sm">
                        <span className="font-mono font-medium text-foreground">
                            {s.admission_number}
                        </span>
                        {s.assessment_number && (
                            <span className="text-xs text-muted-foreground">
                                {s.assessment_number}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "class",
                label: "Class",
                sortable: false,
                icon: BookOpen,
                headerClassName: "w-[16%]",
                cell: (s) => {
                    const className = s.class?.name;
                    const streamName =
                        s.class_stream?.stream ?? s.class_stream?.name;

                    if (!className) {
                        return (
                            <span className="text-sm text-muted-foreground">
                                —
                            </span>
                        );
                    }

                    return (
                        <div className="flex flex-col text-sm">
                            <span className="font-medium text-foreground">
                                {className}
                            </span>
                            {streamName && (
                                <span className="text-xs text-muted-foreground">
                                    {streamName}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "curriculum",
                label: "Curriculum",
                sortable: false,
                icon: GraduationCap,
                headerClassName: "hidden w-[14%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => {
                    if (!s.curriculum) {
                        return (
                            <span className="text-sm text-muted-foreground">
                                —
                            </span>
                        );
                    }

                    return (
                        <div className="flex flex-col text-sm">
                            <span className="font-medium text-foreground">
                                {s.curriculum.code}
                            </span>
                            {s.pathway && (
                                <span className="text-xs text-muted-foreground">
                                    {s.pathway.code}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "status",
                label: "Status",
                sortable: false,
                icon: Calendar,
                headerClassName: "w-[16%]",
                cell: (s) => <StatusBadge status={s.user?.status} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Students" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Students"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage student records, admissions, and class
                            placements for your school.
                        </p>
                    }
                    actions={
                        <Button asChild>
                            <Link href={route("students.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Student
                            </Link>
                        </Button>
                    }
                />

                <DataTable<Student, StudentFiltersFull>
                    paginator={students}
                    filters={filters}
                    columns={columns}
                    routeName="students.index"
                    rowKey={(s) => s.id}
                    searchPlaceholder="Search by name, admission number or email…"
                    emptyTitle="No students found"
                    emptyDescription={
                        filters.search ||
                        filters.class_id ||
                        filters.curriculum ||
                        filters.status
                            ? "Try adjusting your filters."
                            : "Get started by adding your first student."
                    }
                    emptyAction={
                        <Button asChild size="sm">
                            <Link href={route("students.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Student
                            </Link>
                        </Button>
                    }
                    actions={(s) => (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Link
                                    href={route("students.show", s.id)}
                                    aria-label={`View ${s.user?.name ?? "student"}`}
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
                                    href={route("students.edit", s.id)}
                                    aria-label={`Edit ${s.user?.name ?? "student"}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(s)}
                                disabled={deleting}
                                aria-label={`Delete ${s.user?.name ?? "student"}`}
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
                        <AlertDialogTitle>Remove student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>
                                {deleteTarget?.user?.name ?? "this student"}
                            </strong>{" "}
                            from your school. Their account, guardian links, and
                            related records will be soft-deleted and can be
                            restored later.
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
        </>
    );
}

StudentIndex.layout = {
    breadcrumbs: [{ title: "Students", href: "/students" }],
};
