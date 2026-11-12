// resources/js/components/modals/manage-teacher-subjects-dialog.tsx
import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { BookOpen, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    FormSelect,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";
import { cn } from "@/lib/utils";
import type {
    AssignmentContext,
    AssignmentOptions,
    StaffSubjectAssignment,
} from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
    staffId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignments: StaffSubjectAssignment[];
    context: AssignmentContext;
    options: AssignmentOptions;
}

interface DraftRow {
    key: string;
    subjectId: number;
    subjectName: string;
    classId: number;
    className: string;
    classStreamId: number | null;
    streamLabel?: string;
    role: "primary" | "assistant";
    canGrade: boolean;
    canFinalize: boolean;
}

interface FormState {
    class_id: string;
    subject_id: string;
}

const emptyForm: FormState = { class_id: "", subject_id: "" };

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeKey(
    subjectId: number | string,
    classId: number | string,
    classStreamId: number | string | null,
): string {
    return `${subjectId}|${classId}|${classStreamId ?? ""}`;
}

function fromAssignment(a: StaffSubjectAssignment): DraftRow {
    return {
        key: makeKey(a.subject_id, a.class_id, a.class_stream_id),
        subjectId: a.subject_id,
        subjectName: a.subject ?? "—",
        classId: a.class_id,
        className: a.class_name ?? "—",
        classStreamId: a.class_stream_id,
        streamLabel: a.stream ?? undefined,
        role: (a.role ?? "primary") as "primary" | "assistant",
        canGrade: a.can_grade ?? true,
        canFinalize: a.can_finalize_grades ?? false,
    };
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function ManageTeacherSubjectsDialog({
    staffId,
    open,
    onOpenChange,
    assignments,
    context,
    options,
}: Props) {
    const baseline = useMemo<DraftRow[]>(
        () => assignments.map(fromAssignment),
        [assignments],
    );

    const [draft, setDraft] = useState<DraftRow[]>(baseline);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [query, setQuery] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* Reset on open */
    useEffect(() => {
        if (open) {
            setDraft(baseline);
            setForm(emptyForm);
            setQuery("");
            setErrors({});
        }
    }, [open, baseline]);

    /* Options — values are ALWAYS strings at this boundary */
    const classOptions = useMemo(
        () =>
            toOptions(
                options.classes ?? [],
                (c) => String(c.value),
                (c) => c.label,
            ),
        [options.classes],
    );

    const subjectChoices = useMemo(() => {
        if (!form.class_id) return [];

        const selectedClassId = Number(form.class_id);
        const taken = new Set(
            draft
                .filter((r) => r.classId === selectedClassId)
                .map((r) => r.subjectId),
        );

        return toOptions(
            (options.subjects ?? []).filter((s) => !taken.has(Number(s.value))),
            (s) => String(s.value),
            (s) => s.label,
        );
    }, [options.subjects, draft, form.class_id]);

    /* Clear subject if it disappears from the current choices */
    useEffect(() => {
        if (
            form.subject_id &&
            !subjectChoices.some((s) => s.value === form.subject_id)
        ) {
            setForm((f) => ({ ...f, subject_id: "" }));
        }
    }, [subjectChoices, form.subject_id]);

    const classTargets = useMemo(() => {
        if (!form.class_id) return [];
        const classIdNum = Number(form.class_id);
        const streams = options.streams_by_class?.[classIdNum] ?? [];
        return [
            { id: null as number | null, label: "Class-level" },
            ...streams.map((s) => ({
                id: Number(s.value),
                label: s.label,
            })),
        ];
    }, [options.streams_by_class, form.class_id]);

    const addRow = () => {
        if (!form.class_id || !form.subject_id) return;

        const classIdNum = Number(form.class_id);
        const subjectIdNum = Number(form.subject_id);

        const subject = (options.subjects ?? []).find(
            (s) => Number(s.value) === subjectIdNum,
        );
        const klass = (options.classes ?? []).find(
            (c) => Number(c.value) === classIdNum,
        );
        if (!subject || !klass) return;

        const existing = new Set(draft.map((r) => r.key));
        const additions: DraftRow[] = [];

        for (const target of classTargets) {
            const key = makeKey(subjectIdNum, classIdNum, target.id);
            if (existing.has(key)) continue;

            const streamLabel =
                target.id === null
                    ? undefined
                    : options.streams_by_class[classIdNum]?.find(
                          (s) => Number(s.value) === target.id,
                      )?.label;

            additions.push({
                key,
                subjectId: subjectIdNum,
                subjectName: subject.label,
                classId: classIdNum,
                className: klass.label,
                classStreamId: target.id,
                streamLabel,
                role: "primary",
                canGrade: true,
                canFinalize: false,
            });
        }

        if (additions.length > 0) {
            setDraft((prev) => [...prev, ...additions]);
        }
        setForm((f) => ({ ...f, subject_id: "" }));
    };

    const removeRow = (key: string) =>
        setDraft((prev) => prev.filter((r) => r.key !== key));

    const updateRow = (key: string, patch: Partial<DraftRow>) =>
        setDraft((prev) =>
            prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
        );

    const changes = useMemo(() => {
        if (draft.length !== baseline.length) return true;
        const byKey = new Map(baseline.map((r) => [r.key, r]));
        for (const d of draft) {
            const b = byKey.get(d.key);
            if (!b) return true;
            if (
                b.role !== d.role ||
                b.canGrade !== d.canGrade ||
                b.canFinalize !== d.canFinalize
            )
                return true;
        }
        return false;
    }, [draft, baseline]);

    const handleSave = () => {
        if (!context?.academic_year_id || !context?.term_id) {
            const missing = !context?.academic_year_id
                ? "academic year"
                : "term";
            toast.error(
                `Cannot save: no active ${missing} is configured for the school.`,
            );
            return;
        }

        setProcessing(true);
        setErrors({});

        const rows = draft.map((r) => ({
            subject_id: r.subjectId,
            class_id: r.classId,
            class_stream_id: r.classStreamId,
            role: r.role,
            can_grade: r.canGrade,
            can_finalize_grades: r.canFinalize,
        }));

        const payload = {
            academic_year_id: context.academic_year_id,
            term_id: context.term_id,
            rows,
        };

        router.post(route("staff.subjects.sync", { staff: staffId }), payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Subject assignments updated.");
                onOpenChange(false);
            },
            onError: (errs) => {
                console.error("Subject sync failed", { payload, errs });
                setErrors(errs as Record<string, string>);
                const first = Object.values(errs as Record<string, string>)[0];
                toast.error(
                    first
                        ? `Could not save: ${first}`
                        : "Could not save subject assignments.",
                );
            },
            onFinish: () => setProcessing(false),
        });
    };

    const grouped = useMemo(() => {
        const q = query.trim().toLowerCase();
        const rows = q
            ? draft.filter(
                  (r) =>
                      r.subjectName.toLowerCase().includes(q) ||
                      r.className.toLowerCase().includes(q) ||
                      (r.streamLabel ?? "").toLowerCase().includes(q),
              )
            : draft;

        const groups = new Map<
            number,
            { className: string; rows: DraftRow[] }
        >();
        for (const r of rows) {
            if (!groups.has(r.classId))
                groups.set(r.classId, { className: r.className, rows: [] });
            groups.get(r.classId)!.rows.push(r);
        }
        return Array.from(groups.entries()).sort((a, b) =>
            a[1].className.localeCompare(b[1].className),
        );
    }, [draft, query]);

    const topError =
        errors["rows"] || errors["term_id"] || errors["academic_year_id"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Manage Subjects
                    </DialogTitle>
                    <DialogDescription>
                        Pick a class, then a subject. Each subject becomes a row
                        per target under that class (class-level + each stream).
                    </DialogDescription>
                </DialogHeader>

                {topError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        {topError}
                    </div>
                )}

                <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <div className="space-y-1.5">
                            <Label htmlFor="class_id">
                                Class{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <FormSelect
                                id="class_id"
                                options={classOptions}
                                value={findOption(form.class_id, classOptions)}
                                onChange={(option) =>
                                    setForm((f) => ({
                                        class_id: selectValue(option) ?? "",
                                        subject_id: "",
                                    }))
                                }
                                placeholder="Select class..."
                                isSearchable
                                isClearable
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="subject_id">
                                Subject{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <FormSelect
                                id="subject_id"
                                options={subjectChoices}
                                value={findOption(
                                    form.subject_id,
                                    subjectChoices,
                                )}
                                onChange={(option) =>
                                    setForm((f) => ({
                                        ...f,
                                        subject_id: selectValue(option) ?? "",
                                    }))
                                }
                                placeholder={
                                    form.class_id
                                        ? "Select subject..."
                                        : "Pick a class first"
                                }
                                isSearchable
                                isClearable
                                isDisabled={!form.class_id}
                                required
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                type="button"
                                onClick={addRow}
                                disabled={!form.class_id || !form.subject_id}
                                className="h-9"
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {form.class_id && classTargets.length > 1 && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                            Adding a subject creates{" "}
                            <strong>{classTargets.length}</strong> rows for{" "}
                            <strong>
                                {
                                    options.classes.find(
                                        (c) =>
                                            Number(c.value) ===
                                            Number(form.class_id),
                                    )?.label
                                }
                            </strong>{" "}
                            — one class-level plus one per stream.
                        </p>
                    )}
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filter assignments…"
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        {draft.length} assignment
                        {draft.length === 1 ? "" : "s"}
                    </span>
                    {draft.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setDraft([])}
                        >
                            <X className="mr-1 h-3 w-3" /> Clear all
                        </Button>
                    )}
                </div>

                <div className="max-h-[24rem] space-y-3 overflow-y-auto rounded-lg border p-2">
                    {grouped.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            {draft.length === 0
                                ? "No subjects assigned yet. Use the picker above."
                                : "No assignments match your search."}
                        </div>
                    ) : (
                        grouped.map(([clsId, group]) => (
                            <div key={clsId} className="space-y-1">
                                <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <span>{group.className}</span>
                                    <Badge
                                        variant="secondary"
                                        className="h-4 rounded-full px-1.5 text-[10px]"
                                    >
                                        {group.rows.length}
                                    </Badge>
                                </div>
                                {group.rows.map((r) => (
                                    <div
                                        key={r.key}
                                        className="rounded-md border bg-background px-2.5 py-2 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-medium text-foreground">
                                                    {r.subjectName}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {r.streamLabel
                                                        ? `Stream · ${r.streamLabel}`
                                                        : "Class-level"}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeRow(r.key)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="mt-1.5 ml-1 flex flex-wrap items-center gap-3 text-xs">
                                            <select
                                                value={r.role}
                                                onChange={(e) =>
                                                    updateRow(r.key, {
                                                        role: e.target.value as
                                                            | "primary"
                                                            | "assistant",
                                                    })
                                                }
                                                className="h-7 rounded-md border bg-background px-1.5"
                                            >
                                                <option value="primary">
                                                    Primary
                                                </option>
                                                <option value="assistant">
                                                    Assistant
                                                </option>
                                            </select>

                                            <label className="flex items-center gap-1">
                                                <Checkbox
                                                    checked={r.canGrade}
                                                    onCheckedChange={(v) =>
                                                        updateRow(r.key, {
                                                            canGrade:
                                                                v === true,
                                                        })
                                                    }
                                                />
                                                Can grade
                                            </label>

                                            <label className="flex items-center gap-1">
                                                <Checkbox
                                                    checked={r.canFinalize}
                                                    onCheckedChange={(v) =>
                                                        updateRow(r.key, {
                                                            canFinalize:
                                                                v === true,
                                                        })
                                                    }
                                                />
                                                Can finalize
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                        {draft.length} selected
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
