// resources/js/types/payment.ts

export type PaymentStatus =
    | "pending"
    | "completed"
    | "paid"
    | "failed"
    | "refunded";

export interface PaymentMethodRef {
    id: number;
    code: string;
    name: string;
    icon?: string | null;
    is_active?: boolean;
    display_order?: number;
    settings?: Record<string, any> | null;
}

export interface InvoiceRef {
    id: number;
    invoice_number: string;
    total: number;
    amount_paid: number;
    amount_due: number;
    currency?: string;
    status: string;
}

export interface Payment {
    id: number;
    invoice_id: number;
    payment_method_id: number | null;

    provider: string | null;
    currency: string;
    amount: number;

    payment_date: string | null;
    formatted_payment_date: string | null;

    status: PaymentStatus;

    provider_transaction_id: string | null;
    reference: string | null;
    payer_name: string | null;
    notes: string | null;

    invoice_balance_before: number | null;
    invoice_balance_after: number | null;

    payment_method?: PaymentMethodRef | null;
    invoice?: InvoiceRef;

    confirmed_at: string | null;
    processed_at: string | null;

    created_at: string | null;
    updated_at: string | null;
}