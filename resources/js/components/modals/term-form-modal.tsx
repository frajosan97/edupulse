// resources/js/components/modals/term-form-modal.tsx
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
import {
    FormSelect,
    findOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";

import type { Term } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    term: Term | null;
    academicYears: { value: number; label: string }[];
}

interface FormData {
    name: string;
    academic_year_id: string;
    start_date: string;
    end_date: string;
}

const emptyForm: FormData = {
    name: "",
    academic_year_id: "",
    start_date: "",
    end_date: "",
};

function toDateInput(value: string | null): string {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

export default function TermFormModal({
    open,
    onOpenChange,
    term,
    academicYears,
}: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<FormData>({ ...emptyForm });

    const yearOptions = toOptions(
        academicYears,
        (y) => String(y.value),
        (y) => y.label,
    );

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            return;
        }
        clearErrors();
        if (term) {
            setData({
                name: term.name ?? "",
                academic_year_id: term.academic_year_id
                    ? String(term.academic_year_id)
                    : "",
                start_date: toDateInput(term.start_date),
                end_date: toDateInput(term.end_date),
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, term?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    term
                        ? "Term updated successfully."
                        : "Term created successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (term) put(route("terms.update", term.id), options);
        else post(route("terms.store"), options);
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
                        {term ? "Edit Term" : "Create Term"}
                    </DialogTitle>
                    <DialogDescription>
                        {term
                            ? "Update the term details below."
                            : "Add a new term and assign it to an academic year."}
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
                            placeholder="e.g. Term 1"
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
                        <Label htmlFor="academic_year_id">
                            Academic year{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <FormSelect
                            id="academic_year_id"
                            options={yearOptions}
                            value={findOption(
                                data.academic_year_id,
                                yearOptions,
                            )}
                            onChange={(o) =>
                                setData(
                                    "academic_year_id",
                                    selectValue(o) ?? "",
                                )
                            }
                            placeholder="— Select an academic year —"
                            isSearchable
                            error={errors.academic_year_id}
                        />
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
                            {term ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
