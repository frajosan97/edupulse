// resources/js/components/forms/student-form/tabs/admission-tab.tsx
import { Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "../shared/field-error";
import type { TabProps } from "../types";

export function AdmissionTab({ data, setData, errors }: TabProps) {
    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-500">
                <Hash className="h-4 w-4" />
                Admission Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="assessment_number">Assessment Number</Label>
                    <Input
                        id="assessment_number"
                        value={data.assessment_number}
                        onChange={(e) =>
                            setData("assessment_number", e.target.value)
                        }
                        placeholder="e.g. AS-12345"
                        className="mt-1.5"
                        aria-invalid={!!errors.assessment_number}
                    />
                    <FieldError message={errors.assessment_number} />
                </div>

                <div>
                    <Label htmlFor="admission_date">
                        Admission Date{" "}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="admission_date"
                        type="date"
                        value={data.admission_date}
                        onChange={(e) =>
                            setData("admission_date", e.target.value)
                        }
                        className="mt-1.5"
                        aria-invalid={!!errors.admission_date}
                        required
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        Defaults to today. Change only if back-dating.
                    </p>
                    <FieldError message={errors.admission_date} />
                </div>

                <div>
                    <Label htmlFor="kcpe_marks">KCPE Marks</Label>
                    <Input
                        id="kcpe_marks"
                        type="number"
                        min={0}
                        max={500}
                        value={data.kcpe_marks}
                        onChange={(e) => setData("kcpe_marks", e.target.value)}
                        placeholder="e.g. 380"
                        className="mt-1.5"
                        aria-invalid={!!errors.kcpe_marks}
                    />
                    <FieldError message={errors.kcpe_marks} />
                </div>

                <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                        id="points"
                        type="number"
                        step="0.01"
                        min={0}
                        value={data.points}
                        onChange={(e) => setData("points", e.target.value)}
                        placeholder="e.g. 72.50"
                        className="mt-1.5"
                        aria-invalid={!!errors.points}
                    />
                    <FieldError message={errors.points} />
                </div>
            </div>
        </div>
    );
}
