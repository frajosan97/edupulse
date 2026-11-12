// resources/js/types/stream.ts
export interface Stream {
    id: number;
    name: string;
    is_active: boolean;
    deleted_at?: string | null;
    classes_count?: number;
    class_streams_count?: number;
    students_count?: number;
    created_at?: string;
    updated_at?: string;
}