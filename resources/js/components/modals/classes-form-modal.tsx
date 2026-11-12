// resources/js/components/modals/classes-form-modal.tsx
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";

import type { Classes } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: Classes | null;
}

interface FormData {
    name: string;
    is_cbc: boolean;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    is_cbc: false,
    is_active: true,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ClassesFormModal({
    open,
    onOpenChange,
    classes,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            return;
        }

        clearErrors();

        if (classes) {
            setData({
                name: classes.name ?? "",
                is_cbc: classes.is_cbc ?? false,
                is_active: classes.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, classes?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    classes
                        ? "Class updated successfully."
                        : "Class created successfully.",
                );
            },
            onError: () => {
                toast.error("Please fix the highlighted errors.");
            },
        };

        if (classes) {
            put(route("classes.update", classes.id), options);
        } else {
            post(route("classes.store"), options);
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
                        {classes ? "Edit Class" : "Create Class"}
                    </DialogTitle>
                    <DialogDescription>
                        {classes
                            ? "Update the class details below."
                            : "Add a new class to your school. Streams can be attached afterwards."}
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
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Form 1"
                            autoFocus
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Curriculum toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_cbc" className="cursor-pointer">
                                CBC Curriculum
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Turn on if this class follows the CBC
                                curriculum; leave off for 8-4-4.
                            </p>
                        </div>
                        <Switch
                            id="is_cbc"
                            checked={data.is_cbc}
                            onCheckedChange={(v) => setData("is_cbc", v)}
                        />
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
                                Inactive classes are hidden from selection.
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
                            {classes ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
