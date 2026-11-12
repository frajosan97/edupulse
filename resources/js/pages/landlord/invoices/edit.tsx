// edit.tsx
import { InvoiceForm } from "@/components/forms/invoices";
import type { Invoice, Tenant } from "@/types";

interface Props {
    invoice: Invoice;
    tenants?: Tenant[];
}

export default function InvoiceEdit({ invoice, tenants = [] }: Props) {
    return <InvoiceForm mode="edit" invoice={invoice} tenants={tenants} />;
}

InvoiceEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Invoices", href: "/invoices" },
        {
            title: props.invoice?.invoice_number ?? "Invoice",
            href: "/invoices/edit",
        },
    ],
});
