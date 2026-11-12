// resources/js/components/invoices/sections/invoice-billing-notes.tsx
import { Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "../invoice-form-field";
import type { InvoiceFormData, SetDataFn } from "../invoice-form-types";

interface Props {
    data: InvoiceFormData;
    setData: SetDataFn;
    periodStartError?: string;
    periodEndError?: string;
    descriptionError?: string;
}

export function InvoiceBillingNotes({
    data,
    setData,
    periodStartError,
    periodEndError,
    descriptionError,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-muted/40 p-4">
                <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Billing Period
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Start" error={periodStartError}>
                        <Input
                            type="date"
                            value={data.period_start ?? ""}
                            onChange={(e) =>
                                setData("period_start", e.target.value || null)
                            }
                            className="h-9 bg-white"
                        />
                    </Field>
                    <Field label="End" error={periodEndError}>
                        <Input
                            type="date"
                            value={data.period_end ?? ""}
                            onChange={(e) =>
                                setData("period_end", e.target.value || null)
                            }
                            className="h-9 bg-white"
                        />
                    </Field>
                </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4">
                <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Notes
                </h3>
                <Textarea
                    value={data.description ?? ""}
                    onChange={(e) =>
                        setData("description", e.target.value || null)
                    }
                    rows={3}
                    placeholder="Additional notes or payment instructions…"
                    className="resize-none bg-white text-sm"
                />
                {descriptionError && (
                    <p className="mt-1 text-xs text-destructive">
                        {descriptionError}
                    </p>
                )}
            </div>
        </div>
    );
}
