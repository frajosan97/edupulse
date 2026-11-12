// resources/js/types/class-stream.ts
export interface ClassStream {
    id: number;
    class_id: number;
    stream_id: number;
    is_active: boolean;
    deleted_at?: string | null;
    class?: { id: number; name: string };
    stream?: { id: number; name: string };
    students_count?: number;

    // Teacher assignments
    class_teacher?: { id: number; name: string } | null;
    assistant_teachers?: { id: number; name: string }[];

    created_at?: string;
    updated_at?: string;
}