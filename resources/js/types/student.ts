// resources/js/types/student.ts
import type { Option } from "@/types";

/* ---------- Status / general ---------- */

export type StudentStatus = "pending" | "active" | "inactive" | "suspended";

export interface StudentUser {
    id: number;
    first_name: string;
    other_name: string | null;
    last_name: string;
    name: string;
    email: string;
    phone: string | null;
    gender: "male" | "female" | "other" | null;
    gender_label: string;
    status: StudentStatus;
    status_label: string;
    avatar_url: string | null;
    signature_url?: string | null;
}

export interface StudentCurriculum {
    id: number;
    name: string;
    code: string;
}

export interface StudentPathway {
    id: number;
    name: string;
    code: string;
}

export interface StudentClass {
    id: number;
    name: string;
}

export interface StudentClassStream {
    id: number;
    name: string | null;
    stream: string | null;
}

export interface StudentParent {
    id: number;
    name: string;
    relationship_type: string | null;
    is_primary: boolean;
}

export interface Student {
    id: number;
    user_id: number;
    admission_number: string;
    assessment_number: string | null;
    date_of_birth: string | null;
    admission_date: string | null;
    kcpe_marks: number | null;
    points: string | number | null;

    curriculum_id: number | null;
    pathway_id: number | null;
    class_id: number | null;
    class_stream_id: number | null;

    user?: StudentUser;
    curriculum?: StudentCurriculum | null;
    pathway?: StudentPathway | null;
    class?: StudentClass | null;
    class_stream?: StudentClassStream | null;
    parents?: StudentParent[];

    created_at: string | null;
    updated_at: string | null;
}

/* ---------- Show page: extended relations ---------- */
/* All optional — populated once StudentResource is extended.     */

export interface StudentSubject {
    id: number;
    name: string;
    code?: string | null;
}

/**
 * A single money movement (invoice or payment).
 * Named `TransactionRow` (not `StudentTransaction`) so the same
 * shape can be reused by staff payroll and parent payments tabs.
 */
export interface TransactionRow {
    id: number;
    type: "invoice" | "payment";
    date: string | null;
    reference?: string | null;
    description?: string | null;
    amount: number;
    status?: string | null;
}

/** @deprecated Use `TransactionRow`. Kept for backward-compat. */
export type StudentTransaction = TransactionRow;

export interface StudentNotification {
    id: number;
    title: string;
    channel?: string | null; // "sms" | "email" | "push" | ...
    status?: string | null; // "sent" | "failed" | "pending" | ...
    sent_at: string | null;
}

export interface StudentWithRelations extends Student {
    subjects_count?: number;
    subjects?: StudentSubject[];

    assessments_count?: number;
    assessments_average_points?: number | null;
    assessments_average_grade?: string | null;

    fees_billed?: number | null;
    fees_paid?: number | null;
    fees_balance?: number | null;

    attendance_present?: number | null;
    attendance_absent?: number | null;
    attendance_total?: number | null;

    notifications_count?: number;
    notifications?: StudentNotification[];

    transactions?: TransactionRow[];

    available_subjects?: StudentSubject[];
    enrolled_subject_ids?: number[];
}

/* ---------- Show page: tab ids ---------- */

export type StudentShowTab =
    | "profile"
    | "subjects"
    | "assessments"
    | "fees"
    | "attendance"
    | "notifications";

/* ---------- Guardian form row (frontend-only) ---------- */

export type GuardianMode = "existing" | "new";

export interface GuardianFormRow {
    mode: GuardianMode;

    // when mode === "existing"
    user_id: string;

    // when mode === "new"
    first_name: string;
    last_name: string;
    email: string;
    phone: string;

    // common
    relationship_type: string;
    is_primary: boolean;
}

/* ---------- Guardian option (parent user picker) ---------- */

export type GuardianOption = Option<number>;

/* ---------- Relationship types ---------- */

export const RELATIONSHIP_TYPES = [
    "father",
    "mother",
    "guardian",
    "grandparent",
    "sibling",
    "other",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];