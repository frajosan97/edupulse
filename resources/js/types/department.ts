export interface Department {
    id: number;
    name: string;
    code: string;
    description: string | null;
    head_id: number | null;
    is_active: boolean;
    subjects_count?: number;
    teachers_count?: number;
    head?: { id: number; name: string; email: string } | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

export interface Filters {
    search?: string;
    status?: string;
}