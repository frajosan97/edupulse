// resources/js/components/modals/manage-teacher-classes-dialog.tsx
import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { Check, GraduationCap, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
    AssignmentContext,
    AssignmentOptions,
    StaffClassAssignment,
} from "@/types";

interface Props {
    staffId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignments: StaffClassAssignment[];
    context: AssignmentContext;
    options: AssignmentOptions;
}

function toSelectedSet(assignments: StaffClassAssignment[]): Set<string> {
    return new Set(
        assignments.map((a) => `${a.class_id}:${a.class_stream_id ?? ""}`),
    );
}

export function ManageClassesDialog({
    staffId,
    open,
    onOpenChange,
    assignments,
    context,
    options,
}: Props) {
    const baselineKeys = useMemo(
        () => toSelectedSet(assignments),
        [assignments],
    );

    const [selected, setSelected] = useState<Set<string>>(baselineKeys);
    const [query, setQuery] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setSelected(new Set(baselineKeys));
            setQuery("");
            setErrors({});
        }
    }, [open, baselineKeys]);

    const classes = useMemo(() => {
        const list = options.classes ?? [];
        const q = query.trim().toLowerCase();
        const filtered = q
            ? list.filter((c) => c.label.toLowerCase().includes(q))
            : list;
        return filtered;
    }, [options.classes, query]);

    const toggleClassLevel = (classId: number) => {
        const key = `${classId}:`;
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const toggleStream = (classId: number, streamId: number) => {
        const key = `${classId}:${streamId}`;
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const clearAll = () => setSelected(new Set());

    const handleSave = () => {
        // Guard: sync requires a period context.
        if (!context?.academic_year_id || !context?.term_id) {
            toast.error(
                "No academic year/term context — cannot save assignments.",
            );
            return;
        }

        setProcessing(true);
        setErrors({});

        const desired: Array<{
            class_id: number;
            class_stream_id: number | null;
            level: "class" | "stream";
            role: "primary";
        }> = [];

        for (const key of selected) {
            const [cls, str] = key.split(":");
            const classId = Number(cls);
            if (!Number.isFinite(classId)) continue;

            const streamId = str === "" ? null : Number(str);
            desired.push({
                class_id: classId,
                class_stream_id: streamId,
                level: streamId === null ? "class" : "stream",
                role: "primary",
            });
        }

        const payload = {
            academic_year_id: context.academic_year_id,
            term_id: context.term_id,
            rows: desired,
        };

        router.post(route("staff.classes.sync", { staff: staffId }), payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Class assignments updated.");
                onOpenChange(false);
            },
            onError: (errs) => {
                console.error("Class sync failed", { payload, errs });
                setErrors(errs as Record<string, string>);
                const first = Object.values(errs as Record<string, string>)[0];
                toast.error(
                    first
                        ? `Could not save: ${first}`
                        : "Could not save class assignments.",
                );
            },
            onFinish: () => setProcessing(false),
        });
    };

    const changes = useMemo(() => {
        if (selected.size !== baselineKeys.size) return true;
        for (const k of baselineKeys) if (!selected.has(k)) return true;
        return false;
    }, [selected, baselineKeys]);

    const topError =
        errors["rows"] || errors["term_id"] || errors["academic_year_id"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Manage Classes
                    </DialogTitle>
                    <DialogDescription>
                        Pick classes and streams for the current term. Each
                        class has a class-level toggle plus one toggle per
                        stream.
                    </DialogDescription>
                </DialogHeader>

                {topError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        {topError}
                    </div>
                )}

                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filter classes…"
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {selected.size} selected · {classes.length} class
                        {classes.length === 1 ? "" : "es"}
                    </span>
                    {selected.size > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={clearAll}
                        >
                            <X className="mr-1 h-3 w-3" /> Clear all
                        </Button>
                    )}
                </div>

                <div className="max-h-[28rem] overflow-y-auto rounded-lg border">
                    {classes.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No classes match your search.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {classes.map((c) => {
                                const classId = Number(c.value);
                                const streams =
                                    options.streams_by_class?.[classId] ?? [];
                                const classKey = `${classId}:`;
                                const classChecked = selected.has(classKey);
                                const selectedStreamCount = streams.filter(
                                    (s) =>
                                        selected.has(`${classId}:${s.value}`),
                                ).length;

                                return (
                                    <div key={c.value} className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleClassLevel(classId)
                                                }
                                                className={cn(
                                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                                                    classChecked
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-input bg-background hover:bg-muted",
                                                )}
                                                aria-label={
                                                    classChecked
                                                        ? "Unassign class-level"
                                                        : "Assign class-level"
                                                }
                                            >
                                                {classChecked && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium">
                                                    {c.label}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    Class-level ·{" "}
                                                    {classChecked
                                                        ? "assigned"
                                                        : "not assigned"}
                                                </div>
                                            </div>
                                            {streams.length > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-5 rounded-full px-2 text-[10px]"
                                                >
                                                    {selectedStreamCount}/
                                                    {streams.length} streams
                                                </Badge>
                                            )}
                                        </div>

                                        {streams.length > 0 && (
                                            <div className="mt-2 ml-7 flex flex-wrap gap-1.5">
                                                {streams.map((s) => {
                                                    const streamKey = `${classId}:${s.value}`;
                                                    const isOn =
                                                        selected.has(streamKey);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={s.value}
                                                            onClick={() =>
                                                                toggleStream(
                                                                    classId,
                                                                    Number(
                                                                        s.value,
                                                                    ),
                                                                )
                                                            }
                                                            className={cn(
                                                                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                                                                isOn
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : "border-input bg-background hover:bg-muted",
                                                            )}
                                                        >
                                                            {isOn && (
                                                                <Check className="mr-1 inline h-3 w-3" />
                                                            )}
                                                            {s.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                        {selected.size} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={processing || !changes}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
