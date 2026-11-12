// resources/js/components/modals/stream-form-modal.tsx
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

import type { Stream } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stream: Stream | null;
}

interface FormData {
    name: string;
    is_active: boolean;
}

const emptyForm: FormData = {
    name: "",
    is_active: true,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function StreamFormModal({ open, onOpenChange, stream }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            return;
        }

        clearErrors();

        if (stream) {
            setData({
                name: stream.name ?? "",
                is_active: stream.is_active ?? true,
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, stream?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    stream
                        ? "Stream updated successfully."
                        : "Stream created successfully.",
                );
            },
            onError: () => {
                toast.error("Please fix the highlighted errors.");
            },
        };

        if (stream) {
            put(route("streams.update", stream.id), options);
        } else {
            post(route("streams.store"), options);
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
                        {stream ? "Edit Stream" : "Create Stream"}
                    </DialogTitle>
                    <DialogDescription>
                        {stream
                            ? "Update the stream details below."
                            : "Add a new stream (e.g. North, South, Blue). Streams are paired with classes to form class-streams."}
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
                            placeholder="e.g. North"
                            autoFocus
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
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
                                Inactive streams are hidden from selection.
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
                            {stream ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
