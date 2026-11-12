// resources/js/pages/modules/index.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Eye,
    GraduationCap,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Sparkles,
    Star,
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

import type { PaginatedData, Module } from "@/types";

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ModuleFiltersFull extends DataTableFilters {
    status: "" | "active" | "inactive";
    featured: boolean;
}

interface Props {
    modules: PaginatedData<Module>;
    filters: ModuleFiltersFull;
}

/* ------------------------------------------------------------------ */
/* Module icon                                                         */
/* ------------------------------------------------------------------ */

/**
 * Renders the module's Bootstrap icon from the `icon` column.
 * Falls back to a generic Layers icon if the value is empty.
 * The row's accessible name comes from the adjacent name cell,
 * so the icon is always aria-hidden.
 */
function ModuleIcon({ icon }: { icon: string | null }) {
    if (!icon) {
        return (
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                aria-hidden="true"
            >
                <Layers className="h-4 w-4" />
            </div>
        );
    }

    // Accept either "bi-alarm" or "alarm" and normalise to the bi-* class.
    const biClass = icon.startsWith("bi-") ? icon : `bi-${icon}`;

    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
            aria-hidden="true"
        >
            <i className={`bi ${biClass} text-base leading-none`} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ModuleIndex({ modules, filters }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<Module | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        const target = deleteTarget;
        setDeleting(true);

        router.delete(route("modules.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to delete module."),
            onFinish: () => setDeleting(false),
        });
    };

    const toggleFeatured = () => {
        // Explicit param builder: avoids `as any`, omits empty filters,
        // preserves sort/search/status if present.
        const params: Record<string, string | boolean> = {
            featured: !filters.featured,
        };
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.sort) params.sort = filters.sort;
        if (filters.dir) params.dir = filters.dir;

        router.get(route("modules.index"), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: Column<Module>[] = useMemo(
        () => [
            {
                key: "name",
                label: "Module",
                sortable: true,
                icon: Layers,
                headerClassName: "w-[30%]",
                cell: (m) => (
                    <div className="flex min-w-0 items-center gap-3">
                        <ModuleIcon icon={m.icon} />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="truncate font-medium text-foreground">
                                    {m.name}
                                </span>
                                {m.featured && (
                                    <Star
                                        className="h-3 w-3 shrink-0 fill-primary text-primary"
                                        aria-label="Featured"
                                    />
                                )}
                            </div>
                            {m.description && (
                                <div className="max-w-xs truncate text-xs text-muted-foreground">
                                    {m.description}
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
                icon: BookOpen,
                headerClassName: "hidden w-[13%] sm:table-cell",
                className: "hidden sm:table-cell",
                cell: (m) => (
                    <code className="inline-block max-w-full truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] font-medium text-foreground">
                        {m.code}
                    </code>
                ),
            },
            {
                key: "base_price",
                label: "Price",
                sortable: true,
                icon: Sparkles,
                headerClassName: "w-[16%]",
                cell: (m) => (
                    <div>
                        <div className="font-medium text-foreground">
                            {currency.format(m.base_price)}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            +{currency.format(m.per_student_price)}/student
                        </div>
                    </div>
                ),
            },
            {
                key: "included_students",
                label: "Students",
                sortable: true,
                icon: Users,
                headerClassName: "hidden w-[12%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (m) => (
                    <span className="font-medium text-foreground">
                        {m.included_students.toLocaleString()}
                    </span>
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: true,
                icon: GraduationCap,
                headerClassName: "w-[14%]",
                cell: (m) => (
                    <Badge
                        variant={m.is_active ? "default" : "secondary"}
                        className="gap-1.5 font-medium"
                    >
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                m.is_active
                                    ? "bg-primary-foreground"
                                    : "bg-muted-foreground",
                            )}
                        />
                        {m.is_active ? "Active" : "Inactive"}
                    </Badge>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Modules" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="Modules"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Layers className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage the modules available to your tenants.
                        </p>
                    }
                    actions={
                        <Button asChild>
                            <Link href={route("modules.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Module
                            </Link>
                        </Button>
                    }
                />

                <DataTable<Module, ModuleFiltersFull>
                    paginator={modules}
                    filters={filters}
                    columns={columns}
                    routeName="modules.index"
                    rowKey={(m) => m.id}
                    searchPlaceholder="Search by name or code…"
                    emptyTitle="No modules found"
                    emptyDescription={
                        filters.search || filters.status || filters.featured
                            ? "Try adjusting your filters."
                            : "Get started by creating your first module."
                    }
                    emptyAction={
                        <Button asChild size="sm">
                            <Link href={route("modules.create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Module
                            </Link>
                        </Button>
                    }
                    toolbar={
                        <Button
                            variant={filters.featured ? "default" : "outline"}
                            size="sm"
                            onClick={toggleFeatured}
                            className="h-9"
                        >
                            <Star
                                className={cn(
                                    "mr-1.5 h-3.5 w-3.5",
                                    filters.featured && "fill-current",
                                )}
                            />
                            Featured
                        </Button>
                    }
                    actions={(m) => (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Link
                                    href={route("modules.show", m.id)}
                                    aria-label={`View ${m.name}`}
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
                                    href={route("modules.edit", m.id)}
                                    aria-label={`Edit ${m.name}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(m)}
                                disabled={deleting}
                                aria-label={`Delete ${m.name}`}
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
                        <AlertDialogTitle>Delete module?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.name}</strong> from the
                            platform. Existing tenant subscriptions are
                            unaffected, but the module will no longer be
                            assignable.
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
                                    Deleting…
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

ModuleIndex.layout = {
    breadcrumbs: [{ title: "Modules", href: "/modules" }],
};
