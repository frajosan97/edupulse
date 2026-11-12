// resources/js/components/modals/curriculum-form-modal.tsx
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

import type { Curriculum } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    curriculum: Curriculum | null;
}

interface FormData {
    name: string;
    code: string;
    description: string;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    code: "",
    description: "",
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

export default function CurriculumFormModal({
    open,
    onOpenChange,
    curriculum,
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
        codeTouched.current = !!curriculum;
        if (curriculum) {
            setData({
                name: curriculum.name ?? "",
                code: curriculum.code ?? "",
                description: curriculum.description ?? "",
                is_active: curriculum.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, curriculum?.id]);

    const handleNameChange = (value: string) => {
        const shouldAutoFill = !curriculum && !codeTouched.current;
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
                    curriculum
                        ? "Curriculum updated successfully."
                        : "Curriculum created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (curriculum) {
            put(route("curricula.update", curriculum.id), options);
        } else {
            post(route("curricula.store"), options);
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
                        {curriculum ? "Edit Curriculum" : "Create Curriculum"}
                    </DialogTitle>
                    <DialogDescription>
                        {curriculum
                            ? "Update the curriculum details below."
                            : "Add a new curriculum. The code is auto-generated from the name but can be edited."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Competency Based Curriculum"
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
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="Auto-generated"
                            maxLength={50}
                            className="font-mono uppercase"
                            aria-invalid={!!errors.code}
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-generated from the name. Edit to override.
                        </p>
                        {errors.code && (
                            <p className="text-xs text-destructive">
                                {errors.code}
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

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive curricula are hidden from selection.
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
                            {curriculum ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
