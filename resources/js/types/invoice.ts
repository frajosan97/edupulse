// resources/js/types/invoice.d.ts
import type { Payment } from "./payment";

export type InvoiceStatus =
    | "draft"
    | "issued"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "cancelled";

export interface InvoiceItem {
    id: number;
    description: string;
    module_id: number | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    module?: { id: number; name: string; code: string } | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    status: InvoiceStatus;
    description: string | null;
    currency: string;

    invoice_date: string | null;
    due_date: string | null;
    period_start: string | null;
    period_end: string | null;

    formatted_invoice_date: string | null;
    formatted_due_date: string | null;
    formatted_period: string | null;

    subtotal: number;
    discount_total: number;
    tax_total: number;
    total: number;
    amount_paid: number;
    amount_due: number;

    issued_at: string | null;
    paid_at: string | null;
    cancelled_at: string | null;

    tenant?: { id: string; name: string } | null;
    items?: InvoiceItem[];
    payments?: Payment[];

    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}