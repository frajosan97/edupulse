// resources/js/components/invoices/invoice-form-types.ts
import type { InvoiceItem } from "@/types";

export interface LineItem {
    key: string;
    description: string;
    module_id: number | null;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_rate: number;
}

// Matches resources/js/types/invoice.d.ts exactly (note: includes "overdue")
export type InvoiceStatus =
    | "draft"
    | "issued"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "cancelled";

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "issued", label: "Issued" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
];

/** Coerce arbitrary backend values into a valid InvoiceStatus. */
export function normalizeStatus(
    value: string | null | undefined,
): InvoiceStatus {
    return (
        INVOICE_STATUSES.find((s) => s.value === value)?.value ?? "draft"
    );
}

export interface InvoiceFormData {
    tenant_id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    period_start: string | null;
    period_end: string | null;
    currency: string;
    description: string | null;
    status: InvoiceStatus;
    items: LineItem[];
}

export type SetDataFn = <K extends keyof InvoiceFormData>(
    key: K,
    value: InvoiceFormData[K],
) => void;

export const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const today = () => new Date().toISOString().slice(0, 10);

export const inDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
};

export const toDate = (v: string | null | undefined) =>
    v ? v.slice(0, 10) : null;

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyLine = (): LineItem => ({
    key: uid(),
    description: "",
    module_id: null,
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    tax_rate: 0,
});

export const lineFromModel = (item: InvoiceItem): LineItem => ({
    key: uid(),
    description: item.description,
    module_id: item.module_id,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    discount_amount: Number(item.discount_amount),
    tax_rate: Number(item.tax_rate),
});

/** Mirrors backend InvoiceService::computeTotals exactly. */
export function computeLine(item: LineItem) {
    const sub = Math.round(item.quantity * item.unit_price * 100) / 100;
    const disc = Math.round(item.discount_amount * 100) / 100;
    const taxable = Math.max(0, sub - disc);
    const tax = Math.round(taxable * (item.tax_rate / 100) * 100) / 100;
    return { sub, disc, tax, total: Math.round((taxable + tax) * 100) / 100 };
}

export function computeTotals(items: LineItem[]) {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;
    for (const item of items) {
        const t = computeLine(item);
        subtotal += t.sub;
        discount += t.disc;
        tax += t.tax;
    }
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round((subtotal - discount + tax) * 100) / 100,
    };
}