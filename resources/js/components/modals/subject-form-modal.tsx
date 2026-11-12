// resources/js/components/modals/subject-form-modal.tsx
import { useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Subject } from "@/types";

interface Option {
    value: number;
    label: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject | null;
    curricula: Option[];
    pathways: Option[];
    departments: Option[];
    gradingSystems: Option[];
}

interface FormData {
    name: string;
    code: string;
    short_name: string;
    description: string;
    curriculum_id: string;
    pathway_id: string;
    department_id: string;
    grading_system_id: string;
    type: string;
    curriculum_type: string;
    has_theory: boolean;
    has_practical: boolean;
    theory_hours: string;
    practical_hours: string;
    passing_score: string;
    max_score: string;
    theory_weightage: string;
    practical_weightage: string;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    code: "",
    short_name: "",
    description: "",
    curriculum_id: "",
    pathway_id: "",
    department_id: "",
    grading_system_id: "",
    type: "core",
    curriculum_type: "both",
    has_theory: true,
    has_practical: false,
    theory_hours: "0",
    practical_hours: "0",
    passing_score: "40",
    max_score: "100",
    theory_weightage: "100",
    practical_weightage: "0",
    is_active: true,
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

export default function SubjectFormModal({
    open,
    onOpenChange,
    subject,
    curricula,
    pathways,
    departments,
    gradingSystems,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    const codeTouched = useRef(false);
    const [tab, setTab] = useState("basic");

    const curriculumOptions = toOptions(
        curricula,
        (c) => String(c.value),
        (c) => c.label,
    );
    const pathwayOptions = toOptions(
        pathways,
        (p) => String(p.value),
        (p) => p.label,
    );
    const departmentOptions = toOptions(
        departments,
        (d) => String(d.value),
        (d) => d.label,
    );
    const gradingOptions = toOptions(
        gradingSystems,
        (g) => String(g.value),
        (g) => g.label,
    );

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            codeTouched.current = false;
            setTab("basic");
            return;
        }
        clearErrors();
        codeTouched.current = !!subject;
        if (subject) {
            setData({
                name: subject.name ?? "",
                code: subject.code ?? "",
                short_name: subject.short_name ?? "",
                description: subject.description ?? "",
                curriculum_id: subject.curriculum_id
                    ? String(subject.curriculum_id)
                    : "",
                pathway_id: subject.pathway_id
                    ? String(subject.pathway_id)
                    : "",
                department_id: subject.department_id
                    ? String(subject.department_id)
                    : "",
                grading_system_id: subject.grading_system_id
                    ? String(subject.grading_system_id)
                    : "",
                type: subject.type ?? "core",
                curriculum_type: subject.curriculum_type ?? "both",
                has_theory: subject.has_theory ?? true,
                has_practical: subject.has_practical ?? false,
                theory_hours: String(subject.theory_hours ?? 0),
                practical_hours: String(subject.practical_hours ?? 0),
                passing_score: String(subject.passing_score ?? 40),
                max_score: String(subject.max_score ?? 100),
                theory_weightage: String(subject.theory_weightage ?? 100),
                practical_weightage: String(subject.practical_weightage ?? 0),
                is_active: subject.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, subject?.id]);

    const handleNameChange = (value: string) => {
        const shouldAutoFill = !subject && !codeTouched.current;
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
                    subject
                        ? "Subject updated successfully."
                        : "Subject created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (subject) {
            put(route("subjects.update", subject.id), options);
        } else {
            post(route("subjects.store"), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {subject ? "Edit Subject" : "Create Subject"}
                    </DialogTitle>
                    <DialogDescription>
                        {subject
                            ? "Update the subject details below."
                            : "Add a new subject. The code is auto-generated from the name but can be edited."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="classification">
                                Classification
                            </TabsTrigger>
                            <TabsTrigger value="scoring">Scoring</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">
                                    Name{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    placeholder="e.g. Mathematics"
                                    autoFocus
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="code">
                                        Code{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
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
                                <div className="space-y-1.5">
                                    <Label htmlFor="short_name">
                                        Short name
                                    </Label>
                                    <Input
                                        id="short_name"
                                        value={data.short_name}
                                        onChange={(e) =>
                                            setData(
                                                "short_name",
                                                e.target.value,
                                            )
                                        }
                                        maxLength={100}
                                        placeholder="e.g. Maths"
                                        aria-invalid={!!errors.short_name}
                                    />
                                    {errors.short_name && (
                                        <p className="text-xs text-destructive">
                                            {errors.short_name}
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
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Optional description..."
                                    aria-invalid={!!errors.description}
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="classification"
                            className="space-y-4 pt-2"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="type">
                                        Type{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) =>
                                            setData("type", v)
                                        }
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="core">
                                                Core
                                            </SelectItem>
                                            <SelectItem value="elective">
                                                Elective
                                            </SelectItem>
                                            <SelectItem value="optional">
                                                Optional
                                            </SelectItem>
                                            <SelectItem value="extracurricular">
                                                Extracurricular
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-xs text-destructive">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="curriculum_type">
                                        Curriculum type{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.curriculum_type}
                                        onValueChange={(v) =>
                                            setData("curriculum_type", v)
                                        }
                                    >
                                        <SelectTrigger id="curriculum_type">
                                            <SelectValue placeholder="Select curriculum type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cbe">
                                                CBC
                                            </SelectItem>
                                            <SelectItem value="844">
                                                8-4-4
                                            </SelectItem>
                                            <SelectItem value="both">
                                                Both
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.curriculum_type && (
                                        <p className="text-xs text-destructive">
                                            {errors.curriculum_type}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="curriculum_id">
                                    Curriculum
                                </Label>
                                <FormSelect
                                    id="curriculum_id"
                                    options={curriculumOptions}
                                    value={findOption(
                                        data.curriculum_id,
                                        curriculumOptions,
                                    )}
                                    onChange={(o) =>
                                        setData(
                                            "curriculum_id",
                                            selectValue(o) ?? "",
                                        )
                                    }
                                    placeholder="— None —"
                                    isSearchable
                                    isClearable
                                    error={errors.curriculum_id}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="pathway_id">Pathway</Label>
                                <FormSelect
                                    id="pathway_id"
                                    options={pathwayOptions}
                                    value={findOption(
                                        data.pathway_id,
                                        pathwayOptions,
                                    )}
                                    onChange={(o) =>
                                        setData(
                                            "pathway_id",
                                            selectValue(o) ?? "",
                                        )
                                    }
                                    placeholder="— None —"
                                    isSearchable
                                    isClearable
                                    error={errors.pathway_id}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="department_id">
                                    Department
                                </Label>
                                <FormSelect
                                    id="department_id"
                                    options={departmentOptions}
                                    value={findOption(
                                        data.department_id,
                                        departmentOptions,
                                    )}
                                    onChange={(o) =>
                                        setData(
                                            "department_id",
                                            selectValue(o) ?? "",
                                        )
                                    }
                                    placeholder="— None —"
                                    isSearchable
                                    isClearable
                                    error={errors.department_id}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="scoring" className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label
                                            htmlFor="has_theory"
                                            className="cursor-pointer"
                                        >
                                            Theory
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Has a theory component
                                        </p>
                                    </div>
                                    <Switch
                                        id="has_theory"
                                        checked={data.has_theory}
                                        onCheckedChange={(v) =>
                                            setData("has_theory", v)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label
                                            htmlFor="has_practical"
                                            className="cursor-pointer"
                                        >
                                            Practical
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Has a practical component
                                        </p>
                                    </div>
                                    <Switch
                                        id="has_practical"
                                        checked={data.has_practical}
                                        onCheckedChange={(v) =>
                                            setData("has_practical", v)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="theory_hours">
                                        Theory hours
                                    </Label>
                                    <Input
                                        id="theory_hours"
                                        type="number"
                                        min={0}
                                        value={data.theory_hours}
                                        onChange={(e) =>
                                            setData(
                                                "theory_hours",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!data.has_theory}
                                    />
                                    {errors.theory_hours && (
                                        <p className="text-xs text-destructive">
                                            {errors.theory_hours}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="practical_hours">
                                        Practical hours
                                    </Label>
                                    <Input
                                        id="practical_hours"
                                        type="number"
                                        min={0}
                                        value={data.practical_hours}
                                        onChange={(e) =>
                                            setData(
                                                "practical_hours",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!data.has_practical}
                                    />
                                    {errors.practical_hours && (
                                        <p className="text-xs text-destructive">
                                            {errors.practical_hours}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="passing_score">
                                        Passing score
                                    </Label>
                                    <Input
                                        id="passing_score"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.passing_score}
                                        onChange={(e) =>
                                            setData(
                                                "passing_score",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.passing_score && (
                                        <p className="text-xs text-destructive">
                                            {errors.passing_score}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="max_score">Max score</Label>
                                    <Input
                                        id="max_score"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.max_score}
                                        onChange={(e) =>
                                            setData("max_score", e.target.value)
                                        }
                                    />
                                    {errors.max_score && (
                                        <p className="text-xs text-destructive">
                                            {errors.max_score}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="theory_weightage">
                                        Theory weight (%)
                                    </Label>
                                    <Input
                                        id="theory_weightage"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.theory_weightage}
                                        onChange={(e) =>
                                            setData(
                                                "theory_weightage",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!data.has_theory}
                                    />
                                    {errors.theory_weightage && (
                                        <p className="text-xs text-destructive">
                                            {errors.theory_weightage}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="practical_weightage">
                                        Practical weight (%)
                                    </Label>
                                    <Input
                                        id="practical_weightage"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.practical_weightage}
                                        onChange={(e) =>
                                            setData(
                                                "practical_weightage",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!data.has_practical}
                                    />
                                    {errors.practical_weightage && (
                                        <p className="text-xs text-destructive">
                                            {errors.practical_weightage}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="grading_system_id">
                                    Grading system
                                </Label>
                                <FormSelect
                                    id="grading_system_id"
                                    options={gradingOptions}
                                    value={findOption(
                                        data.grading_system_id,
                                        gradingOptions,
                                    )}
                                    onChange={(o) =>
                                        setData(
                                            "grading_system_id",
                                            selectValue(o) ?? "",
                                        )
                                    }
                                    placeholder="— Default —"
                                    isSearchable
                                    isClearable
                                    error={errors.grading_system_id}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive subjects are hidden from selection.
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData("is_active", v)}
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
                            {subject ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
