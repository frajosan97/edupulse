// resources/js/components/invoices/sections/invoice-payment-terms.tsx
import { CreditCard } from "lucide-react";

export function InvoicePaymentTerms() {
    return (
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
                <strong className="text-foreground">Payment Terms:</strong>{" "}
                Payment is due within 30 days of invoice date. Late payments may
                incur additional charges. Please include the invoice number with
                your payment.
            </div>
        </div>
    );
}
