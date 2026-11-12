// resources/js/components/invoices/sections/invoice-company-header.tsx
import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    InvoiceFormData,
    InvoiceStatus,
    SetDataFn,
} from "../invoice-form-types";
import { INVOICE_STATUSES } from "../invoice-form-types";

interface Props {
    data: InvoiceFormData;
    setData: SetDataFn;
    invoiceNumberError?: string;
}

export function InvoiceCompanyHeader({
    data,
    setData,
    invoiceNumberError,
}: Props) {
    return (
        <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-start md:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        INVOICE
                    </h2>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                    <div>222-90200 Kitui, Kenya</div>
                    <div>Phone: +254 796 594 373</div>
                    <div>Email: info@frajosantech.co.ke</div>
                </div>
            </div>

            <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm md:min-w-[260px]">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Invoice #</span>
                    <Input
                        value={data.invoice_number}
                        onChange={(e) =>
                            setData("invoice_number", e.target.value)
                        }
                        placeholder="Auto-generated"
                        className="h-8 w-[140px] border-0 bg-transparent px-0 text-right font-mono font-semibold text-primary shadow-none focus-visible:ring-0"
                    />
                </div>
                {invoiceNumberError && (
                    <p className="mt-1 text-right text-xs text-destructive">
                        {invoiceNumberError}
                    </p>
                )}

                <div className="mt-1.5 flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Status</span>
                    <Select
                        value={data.status}
                        onValueChange={(v: InvoiceStatus) =>
                            setData("status", v)
                        }
                    >
                        <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1.5 text-xs font-medium shadow-none">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {INVOICE_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
