// resources/js/types/staff.ts

export type StaffRole = "admin" | "sales" | "teacher" | "finance";
export type Gender = "male" | "female" | "other";
export type StaffStatus = "pending" | "active" | "inactive" | "suspended";

export type StaffShowTab =
    | "profile"
    | "classes"
    | "subjects"
    | "invoices"
    | "payments"
    | "expenses"
    | "attendance"
    | "notifications";

export interface RoleOption {
    value: string;
    label: string;
}

// --- Teaching (nested under staff.teaching) ---

export interface StaffTeachingClass {
    id: number;
    name: string;
    grade_level: string | null;
}

export interface StaffTeachingSubject {
    id: number;
    name: string;
    code: string | null;
}

export interface StaffTeachingCounts {
    classes: number;
    subjects: number;
    students: number;
    assignments: number;
    streams: number;
}

export interface StaffTeaching {
    classes: StaffTeachingClass[];
    subjects: StaffTeachingSubject[];
    counts: StaffTeachingCounts;
}

// --- Teacher profile (top-level `teacher` prop) ---

export interface StaffTeacherProfile {
    id: number;
    employee_id: string | null;
    joining_date: string | null;
    department: string | null;
    qualifications: unknown;
    specialization: string | null;
}

// --- Assignments ---

export interface StaffClassAssignment {
    id: number;
    class_id: number;
    class_stream_id: number | null;
    class_name: string | null;
    stream: string | null;
    level: "class" | "stream";
    role: "primary" | "assistant" | "substitute";
    term: string | null;
    year: string | null;
}

export interface StaffSubjectAssignment {
    id: number;
    subject_id: number;
    class_id: number;
    class_stream_id: number | null;
    subject: string | null;
    class_name: string | null;
    stream: string | null;
    role: "primary" | "assistant";
    can_grade: boolean;
    can_finalize_grades: boolean;
    term: string | null;
    year: string | null;
}

export interface AssignmentOptions {
    academic_years: { value: number; label: string }[];
    terms: { value: number; label: string }[];
    classes: { value: number; label: string }[];
    streams_by_class: Record<number, { value: number; label: string }[]>;
    subjects: { value: number; label: string }[];
}

export interface AssignmentContext {
    academic_year_id: number | null;
    term_id: number | null;
}

// --- Staff (user-shaped resource) ---

export interface Staff {
    // Identity
    id: number;
    name: string;
    first_name: string;
    other_name: string | null;
    last_name: string;

    // Contact
    email: string;
    phone: string | null;
    email_verified_at: string | null;

    // Demographics
    gender: Gender | null;
    gender_label: string | null;

    // Account
    status: StaffStatus;
    status_label: string | null;
    can_login: boolean;

    // Media
    avatar_url: string | null;
    signature_url: string | null;
    password_changed: boolean;

    // Roles
    primary_role: string | null;
    primary_role_slug: string | null;
    primary_role_label: string | null;
    role_slugs: string[];
    roles_options: RoleOption[];

    // Counters
    invoices_count?: number;
    payments_count?: number;
    expenses_count?: number;
    attendance_logs_count?: number;
    notifications_count?: number;

    // Timestamps
    created_at: string | null;
    updated_at: string | null;

    // Injected via ->additional(['teaching' => ...])
    teaching?: StaffTeaching;
}