// resources/js/types/tenant.ts
import type { Invoice } from "./invoice";
import type { Module } from "./module";

export type TenantStatus = "active" | "inactive" | "pending" | "suspended";

export interface LocationRef {
    id: number;
    name: string;
}

export interface TenantDomain {
    id: number;
    domain: string;
    is_primary: boolean;
    status: "active" | "inactive" | "pending";
    created_at: string | null;
    updated_at: string | null;
}

export interface TenantModulePivot {
    student_count: number | null;
    status: "pending" | "active" | "inactive" | "suspended";
    billing_cycle: "monthly" | "quarterly" | "annual";
    activated_at: string | null;
    expires_at: string | null;
    billing_start_date: string | null;
    billing_end_date: string | null;
}

export interface TenantModule extends Pick<
    Module,
    | "id"
    | "name"
    | "code"
    | "base_price"
    | "included_students"
    | "per_student_price"
    | "min_bill_amount"
    | "max_bill_amount"
> {
    pivot: TenantModulePivot;
}

export interface BillingBreakdownRow {
    module_id: number;
    module_name: string;
    billing_cycle: "monthly" | "quarterly" | "annual";
    student_count: number;
    base_price: number;
    final_price: number;
}

export interface TenantBillingStatus {
    total: number;
    breakdown: BillingBreakdownRow[];
}

export interface Tenant {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    contact_name: string | null;

    county_id: number | null;
    constituency_id: number | null;
    ward_id: number | null;
    location_id: number | null;

    county?: LocationRef;
    constituency?: LocationRef;
    ward?: LocationRef;

    status: TenantStatus;
    is_active: boolean;
    student_count: number;

    tenancy_db_connection: string | null;
    tenancy_db_name: string | null;

    created_by: string | null;

    domains?: TenantDomain[];
    modules?: TenantModule[];
    invoices?: Invoice[];

    billing_status?: TenantBillingStatus;

    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}