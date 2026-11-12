// resources/js/types/term.ts
export interface Term {
    id: number;
    name: string;
    academic_year_id: number;
    academic_year?: { id: number; name: string } | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    status: string;
    status_label: string;
    status_color: "green" | "blue" | "gray" | "red" | string;
    exams_count?: number;
    created_at: string;
    deleted_at: string | null;
}