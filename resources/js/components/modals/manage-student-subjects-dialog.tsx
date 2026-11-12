// resources/js/components/modals/manage-subjects-dialog.tsx
import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { BookOpen, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { StudentSubject } from "@/types/student";

interface ManageSubjectsDialogProps {
    studentId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableSubjects: StudentSubject[];
    enrolledSubjectIds: number[];
}

export function ManageSubjectsDialog({
    studentId,
    open,
    onOpenChange,
    availableSubjects,
    enrolledSubjectIds,
}: ManageSubjectsDialogProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Set<number>>(
        () => new Set(enrolledSubjectIds),
    );
    const [processing, setProcessing] = useState(false);

    // Re-seed on every open so cancelled changes don't leak
    const handleOpenChange = (next: boolean) => {
        if (next) {
            setSelected(new Set(enrolledSubjectIds));
            setQuery("");
        }
        onOpenChange(next);
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const matches = q
            ? availableSubjects.filter(
                  (s) =>
                      s.name.toLowerCase().includes(q) ||
                      (s.code ?? "").toLowerCase().includes(q),
              )
            : availableSubjects;

        // Order by code (missing codes last), then by name as a tiebreaker
        return [...matches].sort((a, b) => {
            const aCode = (a.code ?? "").trim();
            const bCode = (b.code ?? "").trim();

            if (aCode && !bCode) return -1;
            if (!aCode && bCode) return 1;

            const byCode = aCode.localeCompare(bCode, undefined, {
                numeric: true,
                sensitivity: "base",
            });
            if (byCode !== 0) return byCode;

            return a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
            });
        });
    }, [availableSubjects, query]);

    // Whether every *visible* subject is selected
    const allFilteredSelected =
        filtered.length > 0 && filtered.every((s) => selected.has(s.id));
    // Whether *some* (but not all) visible subjects are selected
    const someFilteredSelected =
        filtered.some((s) => selected.has(s.id)) && !allFilteredSelected;

    const toggle = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Toggle all *currently filtered* subjects (respects the search query)
    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                filtered.forEach((s) => next.delete(s.id));
            } else {
                filtered.forEach((s) => next.add(s.id));
            }
            return next;
        });
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(
            route("students.subjects.sync", studentId),
            { subject_ids: Array.from(selected) },
            {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onError: () => toast.error("Failed to update subjects."),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const changes =
        selected.size !== enrolledSubjectIds.length ||
        enrolledSubjectIds.some((id) => !selected.has(id));

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Manage Subjects
                    </DialogTitle>
                    <DialogDescription>
                        Select the subjects this student is enrolled in. Changes
                        apply when you save.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search subjects…"
                        className="pl-8"
                    />
                </div>

                {filtered.length > 0 && (
                    <label
                        className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-md border bg-muted/40 px-2.5 py-2 text-sm font-medium transition-colors",
                            allFilteredSelected && "bg-primary/5",
                        )}
                    >
                        <Checkbox
                            checked={
                                allFilteredSelected
                                    ? true
                                    : someFilteredSelected
                                      ? "indeterminate"
                                      : false
                            }
                            onCheckedChange={toggleAll}
                        />
                        <span>
                            Select all
                            {query.trim() && " (matching)"}
                        </span>
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                            {filtered.length} subject
                            {filtered.length === 1 ? "" : "s"}
                        </span>
                    </label>
                )}

                <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-1">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No subjects match your search.
                        </div>
                    ) : (
                        filtered.map((s) => {
                            const checked = selected.has(s.id);
                            return (
                                <label
                                    key={s.id}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                                        checked
                                            ? "bg-primary/5"
                                            : "hover:bg-muted/60",
                                    )}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => toggle(s.id)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-foreground">
                                            {s.name}
                                        </div>
                                        {s.code && (
                                            <div className="font-mono text-xs text-muted-foreground">
                                                {s.code}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                        {selected.size} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
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
