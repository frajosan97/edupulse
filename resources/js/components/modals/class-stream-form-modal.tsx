// resources/js/components/modals/class-stream-form-modal.tsx

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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

import {
    FormSelect,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";

import type { ClassStream } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classStream: ClassStream | null;
    classes: { id: number; name: string }[];
    streams: { id: number; name: string }[];

    /**
     * When provided, the class is locked to this id.
     * The Class select is hidden and class_id is auto-populated.
     */
    lockedClassId?: number | null;

    /** Optional display name when class is locked. */
    lockedClassName?: string | null;
}

interface FormData {
    class_id: string;
    stream_id: string;
    is_active: boolean;
}

const emptyForm: FormData = {
    class_id: "",
    stream_id: "",
    is_active: true,
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function ClassStreamFormModal({
    open,
    onOpenChange,
    classStream,
    classes,
    streams,
    lockedClassId = null,
    lockedClassName = null,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    /* Resolve class name when locked */
    const resolvedLockedName =
        lockedClassName ??
        classes.find((c) => c.id === lockedClassId)?.name ??
        (lockedClassId ? `Class #${lockedClassId}` : null);

    /* Convert data into React Select options */
    const classOptions = toOptions(
        classes,
        (c) => String(c.id),
        (c) => c.name,
    );

    const streamOptions = toOptions(
        streams,
        (s) => String(s.id),
        (s) => s.name,
    );

    /* Initialize form */
    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            return;
        }

        clearErrors();

        if (classStream) {
            // Editing an existing class-stream pairing
            setData({
                class_id: String(classStream.class_id),
                stream_id: String(classStream.stream_id),
                is_active: classStream.is_active ?? true,
            });
        } else {
            // Creating a new pairing
            setData({
                ...emptyForm,
                class_id: lockedClassId ? String(lockedClassId) : "",
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, classStream?.id, lockedClassId]);

    /* Determine whether class is locked */
    const isClassLocked = lockedClassId !== null && lockedClassId !== undefined;

    /* Submit */
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);

                toast.success(
                    classStream
                        ? "Class stream updated successfully."
                        : "Class stream created successfully.",
                );
            },

            onError: () => {
                toast.error("Please fix the highlighted errors.");
            },
        };

        if (classStream) {
            put(route("class-streams.update", classStream.id), options);
        } else {
            post(route("class-streams.store"), options);
        }
    };

    /* Prevent closing while processing */
    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    /* ---------------------------------------------------------------- */
    /* Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {classStream
                            ? "Edit Class Stream"
                            : "Create Class Stream"}
                    </DialogTitle>

                    <DialogDescription>
                        {isClassLocked
                            ? `Create a new stream pairing for ${resolvedLockedName}.`
                            : 'Pair a class with a stream to create a new roster (e.g. Form 1 → North → "Form 1 North").'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Class */}
                    <div className="space-y-1.5">
                        <Label>
                            Class <span className="text-destructive">*</span>
                        </Label>

                        {isClassLocked ? (
                            <>
                                <Input
                                    value={resolvedLockedName ?? ""}
                                    readOnly
                                    disabled
                                    className="bg-muted"
                                />

                                {/* Preserve class_id */}
                                <input
                                    type="hidden"
                                    value={data.class_id}
                                    name="class_id"
                                />

                                {errors.class_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.class_id}
                                    </p>
                                )}
                            </>
                        ) : (
                            <FormSelect
                                id="class_id"
                                options={classOptions}
                                value={findOption(data.class_id, classOptions)}
                                onChange={(option) =>
                                    setData(
                                        "class_id",
                                        selectValue(option) ?? "",
                                    )
                                }
                                placeholder="Select class..."
                                isSearchable
                                isClearable
                                error={errors.class_id}
                                required
                            />
                        )}
                    </div>

                    {/* Stream */}
                    <div className="space-y-1.5">
                        <Label>
                            Stream <span className="text-destructive">*</span>
                        </Label>

                        <FormSelect
                            id="stream_id"
                            options={streamOptions}
                            value={findOption(data.stream_id, streamOptions)}
                            onChange={(option) =>
                                setData("stream_id", selectValue(option) ?? "")
                            }
                            placeholder="Select stream..."
                            isSearchable
                            isClearable
                            error={errors.stream_id}
                            required
                        />

                        {streams.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                All active streams are already paired with this
                                class.
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
                                Inactive pairings are hidden from selection.
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

                            {classStream ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
