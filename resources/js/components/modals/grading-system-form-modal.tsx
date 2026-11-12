// resources/js/components/modals/grading-system-form-modal.tsx
import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import type { GradingSystem } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gradingSystem: GradingSystem | null;
}

interface FormData {
    name: string;
    code: string;
    description: string;
    type: string;
    is_default: boolean;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    code: "",
    description: "",
    type: "",
    is_default: false,
    is_active: true,
};

const TYPE_OPTIONS = [
    { value: "844", label: "8-4-4" },
    { value: "cbc", label: "CBC" },
] as const;

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

export default function GradingSystemFormModal({
    open,
    onOpenChange,
    gradingSystem,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    const codeTouched = useRef(false);

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            codeTouched.current = false;
            return;
        }
        clearErrors();
        codeTouched.current = !!gradingSystem;
        if (gradingSystem) {
            setData({
                name: gradingSystem.name ?? "",
                code: gradingSystem.code ?? "",
                description: gradingSystem.description ?? "",
                type: gradingSystem.type ?? "",
                is_default: gradingSystem.is_default ?? false,
                is_active: gradingSystem.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, gradingSystem?.id]);

    const handleNameChange = (value: string) => {
        const shouldAutoFill = !gradingSystem && !codeTouched.current;
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
                    gradingSystem
                        ? "Grading system updated successfully."
                        : "Grading system created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (gradingSystem) {
            put(route("grading-systems.update", gradingSystem.id), options);
        } else {
            post(route("grading-systems.store"), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {gradingSystem
                            ? "Edit Grading System"
                            : "Create Grading System"}
                    </DialogTitle>
                    <DialogDescription>
                        {gradingSystem
                            ? "Update the grading system details below."
                            : "Add a grading system first. You'll add grade scales on its detail page."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
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
                                placeholder="e.g. KCSE Grading"
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

                    <div className="space-y-1.5">
                        <Label htmlFor="type">
                            Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.type}
                            onValueChange={(v) => setData("type", v)}
                        >
                            <SelectTrigger
                                id="type"
                                aria-invalid={!!errors.type}
                            >
                                <SelectValue placeholder="Select a curriculum type" />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPE_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <p className="text-xs text-destructive">
                                {errors.type}
                            </p>
                        )}
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
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label
                                    htmlFor="is_default"
                                    className="cursor-pointer"
                                >
                                    Default
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Used when no system is specified.
                                </p>
                            </div>
                            <Switch
                                id="is_default"
                                checked={data.is_default}
                                onCheckedChange={(v) =>
                                    setData("is_default", v)
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label
                                    htmlFor="is_active"
                                    className="cursor-pointer"
                                >
                                    Active
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Hidden from selection when inactive.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData("is_active", v)}
                            />
                        </div>
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
                            {gradingSystem ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
