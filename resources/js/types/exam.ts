// resources/js/types/exam.ts
import type { DataTableFilters } from "@/components/data-table/types";

// ─── Term ───────────────────────────────────────────────────────

export interface ExamTerm {
    id: number;
    name: string;
    academic_year_id: number;
    academic_year?: { id: number; name: string } | null;
}

// ─── Exam class (row shape from ExamClassResource) ──────────────

export interface ExamClass {
    id: number;
    exam_id: number;
    class_id: number;
    class_stream_id: number | null;
    level: "class" | "stream";
    is_active: boolean;
    assigned_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
    deleted_at?: string | null;
    class?: { id: number; name: string } | null;
    stream?: { id: number; name: string } | null;
    assigned_by?: { id: number; name: string } | null;
}

// ─── Exam ───────────────────────────────────────────────────────

/**
 * Union must match `Exam::status()` accessor on the backend:
 *   archived → published → scheduled → in_progress → draft
 *
 * Note: `in_progress` is emitted when `end_date` is in the future and
 * `start_date` is in the past (and the exam isn't published/trashed).
 * Forgetting this key causes `Record<ExamStatus, …>` maps to fail
 * type-checking in the UI.
 */
export type ExamStatus =
    | "draft"
    | "scheduled"
    | "in_progress"
    | "published"
    | "archived";

/** Must match `Exam::statusColor()` on the backend. */
export type ExamStatusColor = "green" | "blue" | "gray" | "red" | "yellow";

export interface Exam {
    id: number;
    term_id: number;
    term: ExamTerm | null;
    name: string;
    code: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_published: boolean;
    is_active: boolean;
    status: ExamStatus;
    status_label: string;
    status_color: ExamStatusColor;
    exam_classes_count?: number;
    results_count?: number;
    class_ids?: number[];
    classes?: ExamClass[];
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

// ─── Filters ────────────────────────────────────────────────────

/** Filters accepted by `IndexExamClassRequest::filters()`. */
export interface ExamClassFilters extends DataTableFilters {
    status: "" | "0" | "1";
    level: string;
    trashed: "" | "with" | "only";
}

// ─── Permissions ────────────────────────────────────────────────

/** Permissions bag for a single exam. */
export interface ExamPermissions {
    update: boolean;
    delete: boolean;
    restore: boolean;
    forceDelete: boolean;
}