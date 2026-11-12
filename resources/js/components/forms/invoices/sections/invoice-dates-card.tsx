// resources/js/components/invoices/sections/invoice-dates-card.tsx
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "../invoice-form-field";
import type { InvoiceFormData, SetDataFn } from "../invoice-form-types";

interface Props {
    data: InvoiceFormData;
    setData: SetDataFn;
    invoiceDateError?: string;
    dueDateError?: string;
}

export function InvoiceDatesCard({
    data,
    setData,
    invoiceDateError,
    dueDateError,
}: Props) {
    return (
        <div className="rounded-lg bg-muted/40 p-4 md:col-span-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Invoice Details
            </h3>
            <div className="space-y-2">
                <Field label="Invoice date" error={invoiceDateError}>
                    <Input
                        type="date"
                        value={data.invoice_date}
                        onChange={(e) =>
                            setData("invoice_date", e.target.value)
                        }
                        className="h-9 bg-white"
                    />
                </Field>
                <Field label="Due date" error={dueDateError}>
                    <Input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData("due_date", e.target.value)}
                        className="h-9 bg-white"
                    />
                </Field>
            </div>
        </div>
    );
}
