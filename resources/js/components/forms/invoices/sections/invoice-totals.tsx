// resources/js/components/invoices/sections/invoice-totals.tsx
import { Separator } from "@/components/ui/separator";
import { computeTotals, currency, type LineItem } from "../invoice-form-types";

interface Props {
    items: LineItem[];
}

export function InvoiceTotals({ items }: Props) {
    const totals = computeTotals(items);
    return (
        <div className="flex justify-end">
            <div className="w-full max-w-sm rounded-lg bg-muted/40 p-4">
                <Row
                    label="Subtotal"
                    value={currency.format(totals.subtotal)}
                />
                {totals.discount > 0 && (
                    <Row
                        label="Discounts"
                        value={`- ${currency.format(totals.discount)}`}
                    />
                )}
                <Row label="Tax" value={currency.format(totals.tax)} />
                <Separator className="my-2" />
                <div className="flex items-baseline justify-between py-1">
                    <span className="font-semibold text-foreground">
                        Total Amount
                    </span>
                    <span className="text-lg font-bold text-primary">
                        {currency.format(totals.total)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground">{value}</span>
        </div>
    );
}
