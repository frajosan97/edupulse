export interface Pathway {
    id: number;
    name: string;
    code: string;
    description: string | null;
    curriculum_id: number | null;
    curriculum?: { id: number; name: string; code: string } | null;
    is_active: boolean;
    subjects_count?: number;
    students_count?: number;
    created_at: string;
    deleted_at: string | null;
}