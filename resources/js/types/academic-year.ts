// resources/js/types/academic-year.ts
export interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    status: string;
    status_label: string;
    status_color: "green" | "blue" | "gray" | "red" | string;
    terms_count?: number;
    created_at: string;
    deleted_at: string | null;
}