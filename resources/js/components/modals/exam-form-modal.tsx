// resources/js/components/modals/exam-form-modal.tsx
import { useForm } from "@inertiajs/react";
import { useEffect, useRef, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    FormSelect,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { Exam } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
    terms: { value: number; label: string }[];
    classes: { value: number; label: string }[];
}

interface FormData {
    term_id: string;
    name: string;
    code: string;
    description: string;
    start_date: string;
    end_date: string;
    is_published: boolean;
    class_ids: number[];
}

const emptyForm: FormData = {
    term_id: "",
    name: "",
    code: "",
    description: "",
    start_date: "",
    end_date: "",
    is_published: false,
    class_ids: [],
};

function deriveCode(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
    return words
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 10);
}

function toDateInput(value: string | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

export default function ExamFormModal({
    open,
    onOpenChange,
    exam,
    terms,
    classes,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    const codeTouched = useRef(false);
    const [classSearch, setClassSearch] = useSearchState("");

    const termOptions = toOptions(
        terms,
        (t) => String(t.value),
        (t) => t.label,
    );

    const filteredClasses = useMemo(() => {
        const q = classSearch.trim().toLowerCase();
        if (!q) return classes;
        return classes.filter((c) => c.label.toLowerCase().includes(q));
    }, [classes, classSearch]);

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            codeTouched.current = false;
            setClassSearch("");
            return;
        }
        clearErrors();
        codeTouched.current = !!exam;
        if (exam) {
            setData({
                term_id: exam.term_id ? String(exam.term_id) : "",
                name: exam.name ?? "",
                code: exam.code ?? "",
                description: exam.description ?? "",
                start_date: toDateInput(exam.start_date),
                end_date: toDateInput(exam.end_date),
                is_published: exam.is_published ?? false,
                class_ids: exam.class_ids ?? [],
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, exam?.id]);

    const handleNameChange = (value: string) => {
        const shouldAutoFill = !exam && !codeTouched.current;
        setData((prev) => ({
            ...prev,
            name: value,
            code: shouldAutoFill ? deriveCode(value) : prev.code,
        }));
    };

    const handleCodeChange = (value: string) => {
        codeTouched.current = true;
        setData("code", value.toUpperCase());
    };

    const toggleClass = (classId: number, checked: boolean) => {
        setData(
            "class_ids",
            checked
                ? [...data.class_ids, classId]
                : data.class_ids.filter((id) => id !== classId),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: FormData = {
            ...data,
            code: data.code.trim() || deriveCode(data.name),
        };
        setData(payload);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                codeTouched.current = false;
                onOpenChange(false);
                toast.success(
                    exam
                        ? "Exam updated successfully."
                        : "Exam created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (exam) {
            put(route("exams.update", exam.id), options);
        } else {
            post(route("exams.store"), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {exam ? "Edit Exam" : "Create Exam"}
                    </DialogTitle>
                    <DialogDescription>
                        {exam
                            ? "Update the exam details and class assignments."
                            : "Define the exam and select the classes that will sit for it."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="term_id">
                            Term <span className="text-destructive">*</span>
                        </Label>
                        <FormSelect
                            id="term_id"
                            options={termOptions}
                            value={findOption(data.term_id, termOptions)}
                            onChange={(o) =>
                                setData("term_id", selectValue(o) ?? "")
                            }
                            placeholder="— Select a term —"
                            isSearchable
                            error={errors.term_id}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="e.g. End of Term 1"
                                autoFocus
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="code">
                                Code <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    handleCodeChange(e.target.value)
                                }
                                placeholder="Auto-generated"
                                maxLength={50}
                                className="font-mono uppercase"
                                aria-invalid={!!errors.code}
                            />
                            {errors.code && (
                                <p className="text-xs text-destructive">
                                    {errors.code}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="start_date">
                                Start{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                aria-invalid={!!errors.start_date}
                            />
                            {errors.start_date && (
                                <p className="text-xs text-destructive">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="end_date">
                                End <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                aria-invalid={!!errors.end_date}
                            />
                            {errors.end_date && (
                                <p className="text-xs text-destructive">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={2}
                            maxLength={1000}
                            placeholder="Optional description..."
                        />
                    </div>

                    {/* Classes multi-select */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>
                                Classes
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    {data.class_ids.length} selected
                                </span>
                            </Label>
                            {data.class_ids.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setData("class_ids", [])}
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                placeholder="Search classes…"
                                className="pl-9"
                            />
                        </div>

                        <div className="max-h-56 overflow-y-auto rounded-lg border">
                            {filteredClasses.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">
                                    No classes match your search.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {filteredClasses.map((c) => {
                                        const checked = data.class_ids.includes(
                                            c.value,
                                        );
                                        return (
                                            <li key={c.value}>
                                                <label
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                                        checked
                                                            ? "bg-primary/5"
                                                            : "hover:bg-muted/50",
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(v) =>
                                                            toggleClass(
                                                                c.value,
                                                                v === true,
                                                            )
                                                        }
                                                    />
                                                    <span className="flex-1 truncate">
                                                        {c.label}
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {errors["class_ids"] && (
                            <p className="text-xs text-destructive">
                                {errors["class_ids"]}
                            </p>
                        )}
                        {errors["class_ids.0"] && (
                            <p className="text-xs text-destructive">
                                {errors["class_ids.0"]}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="is_published"
                                className="cursor-pointer"
                            >
                                Published
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Published exams are visible to teachers and
                                students.
                            </p>
                        </div>
                        <Switch
                            id="is_published"
                            checked={data.is_published}
                            onCheckedChange={(v) => setData("is_published", v)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {exam ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* Tiny helper — keeps search state inside the modal */
import { useState } from "react";
function useSearchState(initial: string) {
    return useState(initial);
}
