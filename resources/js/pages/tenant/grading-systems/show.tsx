// resources/js/pages/tenant/grading-systems/show.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    ClipboardCheck,
    Layers,
    Loader2,
    Pencil,
    Plus,
    Star,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

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

import type { GradeScale, GradingSystem } from "@/types";
import GradeScaleFormModal from "@/components/modals/grade-scale-form-modal";

interface Props {
    gradingSystem: GradingSystem & { subjects_count?: number };
    gradeScales: GradeScale[];
    can: {
        update: boolean;
        createScale: boolean;
        updateScale: boolean;
        deleteScale: boolean;
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

export default function GradingSystemShow({
    gradingSystem,
    gradeScales,
    can,
}: Props) {
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<GradeScale | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<GradeScale | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const openEdit = (scale: GradeScale) => {
        setEditing(scale);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;
        const target = deleteTarget;
        setDeleting(true);
        router.delete(
            route("grading-systems.grade-scales.destroy", [
                gradingSystem.id,
                target.id,
            ]),
            {
                preserveScroll: true,
                onSuccess: () => setDeleteTarget(null),
                onError: () => toast.error("Failed to remove grade scale."),
                onFinish: () => setDeleting(false),
            },
        );
    };

    return (
        <>
            <Head title={`${gradingSystem.name} — Grade Scales`} />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route("grading-systems.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to grading systems
                        </Link>
                    </Button>
                </div>

                <PageHeader
                    title={gradingSystem.name}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <ClipboardCheck className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                                {gradingSystem.code}
                            </span>
                            <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                                {gradingSystem.type}
                            </span>
                            {gradingSystem.is_default && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-500/20 bg-amber-500/10 text-[10px] uppercase text-amber-600 dark:text-amber-400"
                                >
                                    Default
                                </Badge>
                            )}
                            <StatusBadge active={gradingSystem.is_active} />
                            {gradingSystem.description && (
                                <span className="text-muted-foreground">
                                    · {gradingSystem.description}
                                </span>
                            )}
                        </div>
                    }
                    actions={
                        can.createScale && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Grade Scale
                            </Button>
                        )
                    }
                />

                {/* Scales list */}
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-medium">
                                Grade Scales
                            </h2>
                            <Badge variant="secondary" className="ml-1">
                                {gradeScales.length}
                            </Badge>
                        </div>
                    </div>

                    {gradeScales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    No grade scales yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Add your first grade scale to start defining
                                    scores and remarks.
                                </p>
                            </div>
                            {can.createScale && (
                                <Button size="sm" onClick={openCreate}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Grade Scale
                                </Button>
                            )}
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {gradeScales.map((scale) => (
                                <li
                                    key={scale.id}
                                    className="flex items-center gap-3 p-4"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                                        {scale.code}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">
                                                {scale.name}
                                            </span>
                                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                {Number(scale.min_score)}–
                                                {Number(scale.max_score)}
                                            </span>
                                            {scale.grade_point !== null &&
                                                scale.grade_point !==
                                                    undefined && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Star className="h-3 w-3" />
                                                        {Number(
                                                            scale.grade_point,
                                                        )}
                                                    </span>
                                                )}
                                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                order {scale.display_order}
                                            </span>
                                        </div>
                                        {(scale.remark ||
                                            scale.swahili_remark) && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {scale.remark && (
                                                    <span>{scale.remark}</span>
                                                )}
                                                {scale.remark &&
                                                    scale.swahili_remark && (
                                                        <span> · </span>
                                                    )}
                                                {scale.swahili_remark && (
                                                    <span className="italic">
                                                        {scale.swahili_remark}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {can.updateScale && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEdit(scale)}
                                                aria-label={`Edit ${scale.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {can.deleteScale && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteTarget(scale)
                                                }
                                                aria-label={`Delete ${scale.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <GradeScaleFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                gradingSystemId={gradingSystem.id}
                gradeScale={editing}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleting) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove grade scale?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{deleteTarget?.name}</strong> will be
                            removed from this grading system.
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

GradingSystemShow.layout = {
    breadcrumbs: [
        { title: "Grading Systems", href: "/grading-systems" },
        { title: "Detail", href: "#" },
    ],
};
