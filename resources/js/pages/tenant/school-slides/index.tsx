// resources/js/pages/tenant/school-slides/index.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    ImageIcon,
    Link as LinkIcon,
    Loader2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    SortAsc,
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

import type { SchoolSlide, PaginatedData } from "@/types";
import SchoolSlideFormModal from "@/components/modals/school-slide-form-modal";

interface SchoolSlideFiltersFull extends DataTableFilters {
    status: "" | "1" | "0";
    trashed: "" | "with" | "only";
}

interface Props {
    slides: PaginatedData<SchoolSlide>;
    filters: SchoolSlideFiltersFull;
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

export default function SchoolSlideIndex({ slides, filters, can }: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [deleteTarget, setDeleteTarget] = useState<SchoolSlide | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<SchoolSlide | null>(
        null,
    );
    const [restoring, setRestoring] = useState(false);
    const [forceTarget, setForceTarget] = useState<SchoolSlide | null>(null);
    const [forcing, setForcing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<SchoolSlide | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (s: SchoolSlide) => {
        setEditing(s);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(route("school-slides.destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => toast.error("Failed to remove slide."),
            onFinish: () => setDeleting(false),
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoring) return;
        const target = restoreTarget;
        setRestoring(true);
        router.post(
            route("school-slides.restore", target.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onError: () => toast.error("Failed to restore slide."),
                onFinish: () => setRestoring(false),
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceTarget || forcing) return;
        const target = forceTarget;
        setForcing(true);
        router.delete(route("school-slides.force-destroy", target.id), {
            preserveScroll: true,
            onSuccess: () => setForceTarget(null),
            onError: () => toast.error("Failed to permanently delete."),
            onFinish: () => setForcing(false),
        });
    };

    const columns: Column<SchoolSlide>[] = useMemo(
        () => [
            {
                key: "title",
                label: "Slide",
                sortable: true,
                icon: ImageIcon,
                headerClassName: "w-[46%]",
                cell: (s) => (
                    <div className="flex min-w-0 items-center gap-3">
                        {s.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={s.image_url}
                                alt={s.title}
                                className="h-12 w-16 shrink-0 rounded-md object-cover ring-1 ring-border"
                            />
                        ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 truncate font-medium text-foreground">
                                <span className="truncate">{s.title}</span>
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
                key: "link_url",
                label: "Link",
                sortable: false,
                icon: LinkIcon,
                headerClassName: "hidden w-[22%] md:table-cell",
                className: "hidden md:table-cell",
                cell: (s) =>
                    s.link_url ? (
                        <a
                            href={s.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm text-primary underline-offset-4 hover:underline"
                        >
                            {s.link_text || s.link_url}
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
            },
            {
                key: "display_order",
                label: "Order",
                sortable: true,
                icon: SortAsc,
                headerClassName: "hidden w-[10%] lg:table-cell",
                className: "hidden lg:table-cell",
                cell: (s) => (
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {s.display_order ?? 0}
                    </span>
                ),
            },
            {
                key: "is_active",
                label: "Status",
                sortable: false,
                icon: Power,
                headerClassName: "w-[12%]",
                cell: (s) => <StatusBadge active={s.is_active} />,
            },
        ],
        [],
    );

    return (
        <>
            <Head title="School Slides" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title="School Slides"
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Manage the promotional slides shown on the school
                            landing page.
                        </p>
                    }
                    actions={
                        can.create && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Slide
                            </Button>
                        )
                    }
                />

                <DataTable<SchoolSlide, SchoolSlideFiltersFull>
                    paginator={slides}
                    filters={filters}
                    columns={columns}
                    routeName="school-slides.index"
                    rowKey={(s) => s.id}
                    searchPlaceholder="Search by title…"
                    emptyTitle="No slides found"
                    emptyDescription={
                        filters.search || filters.status || filters.trashed
                            ? "Try adjusting your filters."
                            : "Get started by adding your first slide."
                    }
                    emptyAction={
                        can.create && (
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Slide
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
                                            aria-label={`Restore ${s.title}`}
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
                                            aria-label={`Permanently delete ${s.title}`}
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
                                        aria-label={`Edit ${s.title}`}
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
                                        aria-label={`Delete ${s.title}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </>
                        );
                    }}
                />
            </div>

            <SchoolSlideFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                slide={editing}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove slide?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>{deleteTarget?.title}</strong>. It will be
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
                        <AlertDialogTitle>Restore slide?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{restoreTarget?.title}</strong> will be
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
                            <strong>{forceTarget?.title}</strong> and its
                            uploaded image will be permanently deleted. This
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

SchoolSlideIndex.layout = {
    breadcrumbs: [{ title: "School Slides", href: "/school-slides" }],
};
