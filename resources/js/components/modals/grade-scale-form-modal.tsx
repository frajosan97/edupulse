// resources/js/components/modals/grade-scale-form-modal.tsx
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
import { Textarea } from "@/components/ui/textarea";

import type { GradeScale } from "@/types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gradingSystemId: number;
    gradeScale: GradeScale | null;
}

interface FormData {
    name: string;
    code: string;
    min_score: string;
    max_score: string;
    grade_point: string;
    description: string;
    remark: string;
    swahili_remark: string;
    display_order: string;
}

const emptyForm: FormData = {
    name: "",
    code: "",
    min_score: "0",
    max_score: "100",
    grade_point: "",
    description: "",
    remark: "",
    swahili_remark: "",
    display_order: "",
};

export default function GradeScaleFormModal({
    open,
    onOpenChange,
    gradingSystemId,
    gradeScale,
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
        if (gradeScale) {
            setData({
                name: gradeScale.name ?? "",
                code: gradeScale.code ?? "",
                min_score: String(gradeScale.min_score ?? 0),
                max_score: String(gradeScale.max_score ?? 100),
                grade_point:
                    gradeScale.grade_point !== null &&
                    gradeScale.grade_point !== undefined
                        ? String(gradeScale.grade_point)
                        : "",
                description: gradeScale.description ?? "",
                remark: gradeScale.remark ?? "",
                swahili_remark: gradeScale.swahili_remark ?? "",
                display_order: String(gradeScale.display_order ?? ""),
            });
        } else {
            setData({ ...emptyForm });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, gradeScale?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                onOpenChange(false);
                toast.success(
                    gradeScale
                        ? "Grade scale updated successfully."
                        : "Grade scale added successfully.",
                );
            },
            onError: () => toast.error("Please fix the highlighted errors."),
        };

        if (gradeScale) {
            put(
                route("grade-scales.update", [gradingSystemId, gradeScale.id]),
                options,
            );
        } else {
            post(route("grade-scales.store", gradingSystemId), options);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (processing) return;
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {gradeScale ? "Edit Grade Scale" : "Add Grade Scale"}
                    </DialogTitle>
                    <DialogDescription>
                        {gradeScale
                            ? "Update the grade scale details below."
                            : "Define a grade scale for this grading system."}
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
                                    setData("name", e.target.value)
                                }
                                placeholder="e.g. Excellent"
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
                                    setData(
                                        "code",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="e.g. A"
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

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="min_score">
                                Min <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="min_score"
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                value={data.min_score}
                                onChange={(e) =>
                                    setData("min_score", e.target.value)
                                }
                                aria-invalid={!!errors.min_score}
                            />
                            {errors.min_score && (
                                <p className="text-xs text-destructive">
                                    {errors.min_score}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="max_score">
                                Max <span className="text-destructive">*</span>
                            </Label>
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
                                aria-invalid={!!errors.max_score}
                            />
                            {errors.max_score && (
                                <p className="text-xs text-destructive">
                                    {errors.max_score}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="grade_point">Points</Label>
                            <Input
                                id="grade_point"
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.grade_point}
                                onChange={(e) =>
                                    setData("grade_point", e.target.value)
                                }
                                placeholder="Optional"
                                aria-invalid={!!errors.grade_point}
                            />
                            {errors.grade_point && (
                                <p className="text-xs text-destructive">
                                    {errors.grade_point}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="remark">Remark</Label>
                            <Input
                                id="remark"
                                value={data.remark}
                                onChange={(e) =>
                                    setData("remark", e.target.value)
                                }
                                placeholder="e.g. Excellent"
                                maxLength={255}
                                aria-invalid={!!errors.remark}
                            />
                            {errors.remark && (
                                <p className="text-xs text-destructive">
                                    {errors.remark}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="swahili_remark">
                                Swahili remark
                            </Label>
                            <Input
                                id="swahili_remark"
                                value={data.swahili_remark}
                                onChange={(e) =>
                                    setData("swahili_remark", e.target.value)
                                }
                                placeholder="e.g. Bora"
                                maxLength={255}
                                aria-invalid={!!errors.swahili_remark}
                            />
                            {errors.swahili_remark && (
                                <p className="text-xs text-destructive">
                                    {errors.swahili_remark}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="display_order">Display order</Label>
                        <Input
                            id="display_order"
                            type="number"
                            min={0}
                            value={data.display_order}
                            onChange={(e) =>
                                setData("display_order", e.target.value)
                            }
                            placeholder="Auto (next)"
                            aria-invalid={!!errors.display_order}
                        />
                        {errors.display_order && (
                            <p className="text-xs text-destructive">
                                {errors.display_order}
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
                            {gradeScale ? "Update" : "Add Scale"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
