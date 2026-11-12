// resources/js/types/classes.ts
export interface TeacherRef {
    id: number;
    name: string;
}

export interface Classes {
    id: number;
    name: string;
    is_cbc: boolean;
    is_active: boolean;
    deleted_at?: string | null;
    class_streams_count?: number;
    students_count?: number;
    subjects_count?: number;
    teachers_count?: number;

    // Teacher assignments
    class_teacher?: TeacherRef | null;
    assistant_teachers?: TeacherRef[];
    teachers?: TeacherRef[];

    created_at?: string;
    updated_at?: string;
}