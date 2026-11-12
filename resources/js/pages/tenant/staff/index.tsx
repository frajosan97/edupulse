// resources/js/pages/tenant/staff/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    Eye,
    Loader2,
    Mail,
    Pencil,
    Phone,
    Plus,
    ShieldCheck,
    Trash2,
    UserCog,
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

import type { PaginatedData, Staff, StaffRole } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface StaffFiltersFull extends DataTableFilters {
    role: "" | StaffRole;
}

interface Props {
    staff: PaginatedData<Staff>;
    filters: StaffFiltersFull;
    roles: StaffRole[];
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function StaffAvatar({ name }: { name: string }) {
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

/* ------------------------------------------------------------------ */
/* Role badge                                                          */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    sales: "Sales",
    teacher: "Teacher",
    finance: "Finance",
};

const ROLE_STYLES: Record<string, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    sales: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    teacher:
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    finance:
        "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
};

function RoleBadge({ role }: { role?: string | null }) {
    if (!role) {
        return (
            <Badge variant="outline" className="font-medium">
                No role
            </Badge>
        );
    }

    // Normalize the role to lowercase so it matches our keys ("Teacher" -> "teacher")
    const normalizedRole = role.toLowerCase();

    const style =
        ROLE_STYLES[normalizedRole] ??
        "bg-muted text-muted-foreground border-border";

    return (
        <Badge variant="outline" className={cn("font-medium", style)}>
            {ROLE_LABELS[normalizedRole] ?? role}
        </Badge>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StaffIndex({ staff, filters }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("staff.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete staff member."),
            onFinish: () => setDeleting(false),
        });
    };

    const columns: Column<Staff>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Staff",
                sortable: true,
                icon: Users,
                headerClassName: "w-[42%]",
                cell: (s) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <StaffAvatar name={s.name} />
                        <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                                {s.name}
                            </div>
                            {s.email && (
                                <div className="flex max-w-xs items-center gap-1 truncate text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{s.email}</span>
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
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.phone ?? "—"}
                    </span>
                ),
            },
            {
                key: "role",
                label: "Role",
                sortable: false,
                icon: ShieldCheck,
                headerClassName: "w-[20%]",
                // ✅ Updated to use `primary_role` to match your TypeScript definition
                cell: (s) => <RoleBadge role={s.primary_role} />,
            },
            {
                key: "gender",
                label: "Gender",
                sortable: false,
                icon: UserCog,
                headerClassName: "hidden w-[18%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="text-sm text-muted-foreground">
                        {s.gender_label ?? "—"}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Staff" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Staff"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Users className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage the administrative and teaching staff for
                            your school.
                        </p>
                    }
                    actions={
                        <Button asChild>
                            <Link href={route("staff.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Staff
                            </Link>
                        </Button>
                    }
                />

                <DataTable<Staff, StaffFiltersFull>
                    paginator={staff}
                    filters={filters}
                    columns={columns}
                    routeName="staff.index"
                    rowKey={(s) => s.id}
                    searchPlaceholder="Search by name, email or phone…"
                    emptyTitle="No staff found"
                    emptyDescription={
                        filters.search || filters.role
                            ? "Try adjusting your filters."
                            : "Get started by adding your first staff member."
                    }
                    emptyAction={
                        <Button asChild size="sm">
                            <Link href={route("staff.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Staff
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
                                    href={route("staff.show", s.id)}
                                    aria-label={`View ${s.name}`}
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
                                    href={route("staff.edit", s.id)}
                                    aria-label={`Edit ${s.name}`}
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
                                aria-label={`Delete ${s.name}`}
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
                        <AlertDialogTitle>
                            Remove staff member?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.name}</strong> from your
                            staff. Their account and any linked records will be
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
        </>
    );
}

StaffIndex.layout = {
    breadcrumbs: [{ title: "Staff", href: "/staff" }],
};
