export interface Curriculum {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    pathways_count?: number;
    subjects_count?: number;
    students_count?: number;
    created_at: string;
    deleted_at: string | null;
}