// resources/js/pages/tenants/create.tsx
import { usePage } from "@inertiajs/react";
import type { Module } from "@/types";
import { TenantForm } from "@/components/forms/tenants/tenant-form";

interface Option {
    id: number;
    name: string;
    county_id?: number;
    constituency_id?: number;
}

interface Props {
    counties?: Option[];
    constituencies?: Option[];
    wards?: Option[];
    modules?: Module[];
}

export default function TenantCreate({
    counties = [],
    constituencies = [],
    wards = [],
    modules = [],
}: Props) {
    const { flash } = usePage().props as any;

    return (
        <TenantForm
            mode="create"
            counties={counties}
            constituencies={constituencies}
            wards={wards}
            modules={modules}
            flash={flash}
        />
    );
}

TenantCreate.layout = {
    breadcrumbs: [
        { title: "Tenants", href: "/tenants" },
        { title: "Create", href: "/tenants/create" },
    ],
};
