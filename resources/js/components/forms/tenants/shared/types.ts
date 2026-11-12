// resources/js/components/tenants/shared/types.ts

export type BillingCycle = "monthly" | "quarterly" | "annual";

export interface ModuleSelection {
    module_id: number;
    student_count: number | null;
    billing_cycle: BillingCycle;
    status: "active" | "inactive";
}

export interface DomainRow {
    id?: number | string;
    domain: string;
    is_primary: boolean;
    status: "active" | "inactive";
    auto_generated?: boolean;
    dismissed?: boolean;
}

export interface TenantFormPayload {
    name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    county_id: number | null;
    constituency_id: number | null;
    ward_id: number | null;
    location_id: number | null;
    status: "active" | "inactive";
    domains: DomainRow[];
    modules: ModuleSelection[];
}

export interface LocationOption {
    id: number;
    name: string;
    county_id?: number;
    constituency_id?: number;
}

export type TabKey = "basic" | "domains" | "location" | "modules";