// resources/js/pages/tenants/edit.tsx
import { usePage } from "@inertiajs/react";
import type { Module, Tenant } from "@/types";
import { TenantForm } from "@/components/forms/tenants/tenant-form";

interface Option {
    id: number;
    name: string;
    county_id?: number;
    constituency_id?: number;
}

interface Props {
    tenant: Tenant;
    counties?: Option[];
    constituencies?: Option[];
    wards?: Option[];
    modules?: Module[];
}

export default function TenantEdit({
    tenant,
    counties = [],
    constituencies = [],
    wards = [],
    modules = [],
}: Props) {
    const { flash } = usePage().props as any;

    return (
        <TenantForm
            mode="edit"
            tenant={tenant}
            counties={counties}
            constituencies={constituencies}
            wards={wards}
            modules={modules}
            flash={flash}
        />
    );
}

TenantEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Tenants", href: "/tenants" },
        { title: props.tenant?.name ?? "Module", href: "/tenants/edit" },
    ],
});
