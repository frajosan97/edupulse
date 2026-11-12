// create.tsx
import { InvoiceForm } from "@/components/forms/invoices";
import type { Tenant } from "@/types";

interface Props {
    tenants?: Tenant[];
    defaultTenantId?: string;
}

export default function InvoiceCreate({
    tenants = [],
    defaultTenantId,
}: Props) {
    return (
        <InvoiceForm
            mode="create"
            tenants={tenants}
            defaultTenantId={defaultTenantId}
        />
    );
}

InvoiceCreate.layout = {
    breadcrumbs: [
        { title: "Invoices", href: "/invoices" },
        { title: "Create", href: "/invoices/create" },
    ],
};
