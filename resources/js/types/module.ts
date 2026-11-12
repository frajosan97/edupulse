// resources/js/types/module.ts

export interface Module {
    id: number;
    name: string;
    code: string;
    order_number: number | null;
    icon: string | null;
    description: string | null;
    base_price: number;
    included_students: number;
    per_student_price: number;
    min_bill_amount: number;
    max_bill_amount: number;
    period: string | null;
    featured: boolean;
    features: string[] | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface ModuleFormData {
    name: string;
    code: string;
    order_number: number | null;
    icon: string | null;
    description: string | null;
    base_price: number;
    included_students: number;
    per_student_price: number;
    min_bill_amount: number;
    max_bill_amount: number;
    period: string | null;
    featured: boolean;
    features: string[] | null;
    is_active: boolean;
}

export interface ModulePriceBreakdown {
    module_id: number;
    module_name: string;
    base_price: number;
    student_count: number;
    included_students: number;
    extra_students: number;
    per_student_price: number;
    extra_cost: number;
    total_price: number;
    formula: string;
}

export interface ModuleFilters {
    search: string;
    status: "" | "active" | "inactive";
    featured: boolean;
    sort: string;
    dir: "asc" | "desc";
}