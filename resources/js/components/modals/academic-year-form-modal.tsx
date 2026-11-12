// resources/js/components/modals/academic-year-form-modal.tsx
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

import type { AcademicYear } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    academicYear: AcademicYear | null;
}

interface FormData {
    name: string;
    start_date: string;
    end_date: string;
}

const emptyForm: FormData = { name: "", start_date: "", end_date: "" };

function toDateInput(value: string | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

export default function AcademicYearFormModal({
    open,
    onOpenChange,
    academicYear,
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
        if (academicYear) {
            setData({
                name: academicYear.name ?? "",
                start_date: toDateInput(academicYear.start_date),
                end_date: toDateInput(academicYear.end_date),
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, academicYear?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    academicYear
                        ? "Academic year updated successfully."
                        : "Academic year created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (academicYear) {
            put(route("academic-years.update", academicYear.id), options);
        } else {
            post(route("academic-years.store"), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {academicYear
                            ? "Edit Academic Year"
                            : "Create Academic Year"}
                    </DialogTitle>
                    <DialogDescription>
                        {academicYear
                            ? "Update the academic year details below."
                            : "Add a new academic year. The active status is derived automatically from the dates."}
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
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. 2025"
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
                            {academicYear ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
