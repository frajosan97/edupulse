// resources/js/components/modals/department-form-modal.tsx

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
    FormSelect,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";

import type { Department, User } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department: Department | null;
    heads?: Pick<User, "id" | "name">[];
}

interface FormData {
    name: string;
    code: string;
    description: string;
    head_id: string;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    code: "",
    description: "",
    head_id: "",
    is_active: true,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function deriveCode(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "";

    if (words.length === 1) {
        return words[0].slice(0, 4).toUpperCase();
    }

    return words
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function DepartmentFormModal({
    open,
    onOpenChange,
    department,
    heads = [],
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    const codeTouched = useRef(false);

    /* Department head options */
    const headOptions = toOptions(
        heads,
        (h) => String(h.id),
        (h) => h.name,
    );

    /* --------------------------------------------------------------- */
    /* Sync on open, RESET on close.                                   */
    /* --------------------------------------------------------------- */

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            codeTouched.current = false;
            return;
        }

        clearErrors();
        codeTouched.current = !!department;

        if (department) {
            setData({
                name: department.name ?? "",
                code: department.code ?? "",
                description: department.description ?? "",
                head_id: department.head_id ? String(department.head_id) : "",
                is_active: department.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, department?.id]);

    /* --------------------------------------------------------------- */
    /* Name change — auto-fills code while creating.                   */
    /* --------------------------------------------------------------- */

    const handleNameChange = (value: string) => {
        const shouldAutoFill = !department && !codeTouched.current;

        setData((prev) => ({
            ...prev,
            name: value,
            code: shouldAutoFill ? deriveCode(value) : prev.code,
        }));
    };

    /* --------------------------------------------------------------- */
    /* Code change — marks field as manually touched.                   */
    /* --------------------------------------------------------------- */

    const handleCodeChange = (value: string) => {
        codeTouched.current = true;
        setData("code", value.toUpperCase());
    };

    /* --------------------------------------------------------------- */
    /* Submit                                                          */
    /* --------------------------------------------------------------- */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalCode = data.code.trim() || deriveCode(data.name);

        // Update managed form data before submission.
        const payload: FormData = {
            ...data,
            code: finalCode,
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
                    department
                        ? "Department updated successfully."
                        : "Department created successfully.",
                );
            },

            onError: () => {
                toast.error("Please fix the highlighted errors.");
            },
        };

        if (department) {
            put(route("departments.update", department.id), options);
        } else {
            post(route("departments.store"), options);
        }
    };

    /* --------------------------------------------------------------- */
    /* Handle modal closing.                                           */
    /* --------------------------------------------------------------- */

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    /* --------------------------------------------------------------- */
    /* Render                                                          */
    /* --------------------------------------------------------------- */

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {department ? "Edit Department" : "Create Department"}
                    </DialogTitle>

                    <DialogDescription>
                        {department
                            ? "Update the department details below."
                            : "Add a new department to your school. The code is auto-generated from the name but can be edited."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>

                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Computer Science"
                            autoFocus
                            aria-invalid={!!errors.name}
                        />

                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Code */}
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

                    {/* Department Head */}
                    <div className="space-y-1.5">
                        <Label htmlFor="head_id">Department Head</Label>

                        <FormSelect
                            id="head_id"
                            options={headOptions}
                            value={findOption(data.head_id, headOptions)}
                            onChange={(option) =>
                                setData("head_id", selectValue(option) ?? "")
                            }
                            placeholder="— None —"
                            isSearchable
                            isClearable
                            error={errors.head_id}
                        />

                        {heads.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                No department heads available.
                            </p>
                        )}
                    </div>

                    {/* Description */}
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

                    {/* Active toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>

                            <p className="text-xs text-muted-foreground">
                                Inactive departments are hidden from selection.
                            </p>
                        </div>

                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData("is_active", v)}
                        />
                    </div>

                    {/* Footer */}
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

                            {department ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
