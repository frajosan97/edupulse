// resources/js/components/payments/payment-form-types.ts
import type { PaymentMethodRef } from "@/types";

export type PaymentStatus = "pending" | "completed" | "paid" | "failed" | "refunded";

export type PaymentFormData = {
    invoice_id: number | null;
    payment_method_id: number | null;

    provider: string | null;
    provider_transaction_id: string | null;
    reference: string | null;
    payer_name: string | null;
    payer_phone: string | null;

    currency: string;
    amount: number;
    payment_date: string;
    status: PaymentStatus;

    notes: string | null;

    // The dynamic object that will hold the method-specific settings
    settings: Record<string, any>;
};

export const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function toDate(value?: string | null): string | null {
    if (!value) return null;
    return value.slice(0, 10);
}

export function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export function findInvoice(invoices: any[], id: number | null) {
    if (!id) return null;
    return invoices.find((i) => i.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/*              Field metadata for the dynamic `settings` keys                */
/* -------------------------------------------------------------------------- */

type FieldMeta = {
    label: string;
    type?: "text" | "number" | "date" | "tel" | "email";
    placeholder?: string;
    required?: boolean;
    mono?: boolean;
};

export const SETTING_FIELDS: Record<string, FieldMeta> = {
    // M-Pesa
    paybill_number: { label: "Paybill number", placeholder: "e.g. 247247" },
    mpesa_code: { label: "M-Pesa code", placeholder: "e.g. QJX4G7F2JZ", required: true, mono: true },
    mpesa_phone: { label: "M-Pesa phone", placeholder: "+254 7XX XXX XXX", type: "tel" },
    mpesa_amount: { label: "M-Pesa amount", type: "number" },
    mpesa_account: { label: "M-Pesa account", placeholder: "Account reference", mono: true },

    // Bank Transfer
    bank_name: { label: "Bank name", placeholder: "e.g. Equity Bank" },
    account_name: { label: "Account name", placeholder: "Name on account" },
    account_number: { label: "Account number", placeholder: "Account / IBAN", mono: true },
    branch: { label: "Branch", placeholder: "Branch name" },
    swift_code: { label: "SWIFT code", placeholder: "e.g. EQBLKENA", mono: true },
    bank_reference: { label: "Bank reference", placeholder: "Transaction reference", mono: true },
    transaction_date: { label: "Transaction date", type: "date" },
    amount_sent: { label: "Amount sent", type: "number" },

    // Cheque
    cheque_number: { label: "Cheque number", placeholder: "Cheque #", required: true, mono: true },
    cheque_bank: { label: "Cheque bank", placeholder: "Issuing bank" },
    cheque_date: { label: "Cheque date", type: "date" },
    cheque_amount: { label: "Cheque amount", type: "number" },
    payable_to: { label: "Payable to", placeholder: "Payee name" },
    cheque_status: { label: "Cheque status", placeholder: "e.g. pending" },
    clearance_date: { label: "Clearance date", type: "date" },

    // Cash
    cash_receipt_no: { label: "Receipt no.", placeholder: "Receipt #", mono: true },
    received_by: { label: "Received by", placeholder: "Cashier name" },
    amount_tendered: { label: "Amount tendered", type: "number" },
    change_given: { label: "Change given", type: "number" },
    cashier_name: { label: "Cashier", placeholder: "Cashier name" },
    location: { label: "Location", placeholder: "Branch / desk" },
};