// resources/js/types/results.ts

import type { DataTableFilters } from "@/components/data-table/types";

export type Numeric = number | string;

/* ─────────────────────────────────────────────────────────
 * Single result (index / edit pages)
 * ───────────────────────────────────────────────────────── */

export interface ResultSummary {
    percentage: Numeric;
    is_published: boolean;
    subjects_count: number;
    locked_count: number;
}

export interface ResultSubjectRow {
    id: number;
    subject_id: number;
    subject?: { name: string; code: string };
    score: Numeric;
    grade: string;
    points: number;
    is_locked: boolean;
}

export interface ResultStudentRef {
    id: number;
    admission_number: string | null;
    pathway_id: number | null;
    user?: {
        name: string;
        first_name: string | null;
        last_name: string | null;
        gender: "male" | "female" | "other" | null;
        email?: string | null;
    };
}

export interface Result {
    id: number;
    student_id: number;
    student_name: string;

    exam_id: number;
    exam?: { id: number; name: string; code: string; term_id: number; is_active?: boolean };

    exam_class_id?: number | null;
    class_id?: number | null;
    class?: { id: number; name: string; is_cbc?: boolean };

    class_stream_id?: number | null;
    class_stream?: { id: number; name: string } | null;

    total_marks: Numeric;
    mean_marks: Numeric;
    total_points: Numeric;
    mean_points: Numeric;
    mean_grade: string | null;

    class_rank: number | null;
    stream_rank: number | null;

    is_published: boolean;

    student?: ResultStudentRef;

    /** Only present on `loadForShow()` / `loadForEdit()`. */
    result_subjects?: ResultSubjectRow[];

    created_at?: string;
    updated_at?: string;
}

/* ─────────────────────────────────────────────────────────
 * Student detail (show page)
 * ───────────────────────────────────────────────────────── */

export interface StudentSubjectRow {
    subject_id: number;
    subject_name: string | null;
    subject_code: string | null;
    cat_1: Numeric | null;
    cat_2: Numeric | null;
    pp_1: Numeric | null;
    pp_2: Numeric | null;
    pp_3: Numeric | null;
    score: Numeric | null;
    score_outof: Numeric | null;
    grade: string | null;
    points: Numeric | null;
    comment: string | null;
    is_locked: boolean;
}

export interface StudentSummary {
    id: number | null;
    name: string;
    admission_number: string | null;
    gender: "male" | "female" | "other" | null;
    pathway_id?: number | null;
}

export interface StudentImprovement {
    has_previous: boolean;
    previous_exam: { id: number; name: string | null } | null;
    previous_mean_marks: number | null;
    current_mean_marks: number;
    delta_marks: number | null;
    delta_points: number | null;
    delta_grade: "up" | "down" | "same" | null;
}

export interface StudentResultDetail {
    result: Result;
    student: StudentSummary;
    subjects: StudentSubjectRow[];
    improvement: StudentImprovement;
    summary: ResultSummary;
}

/* ─────────────────────────────────────────────────────────
 * Class results / analysis
 * ───────────────────────────────────────────────────────── */

export interface GroupBucket {
    distribution: Record<string, number>;
    ungraded: number;
    total_students: number;
    mean_marks: number;
    mean_points: number;
    mean_grade: string;
    class_comment: string;
    median_marks: number;
    min_marks: number;
    max_marks: number;
    std_dev_marks: number;
    pass_count: number;
    pass_rate: number;
    /** Included to support the new Distribution table layout */
    teacher_name?: string;
}

export interface SubjectStat {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    total_students: number;
    mean_marks: number;
    total_points: number;
    mean_points: number;
    mean_grade: string;
    class_comment: string;
    pass_count: number;
    pass_rate: number;
}

export interface ClassSummary {
    exam_id: number;
    exam_class_id: number;
    class_id: number;
    class_stream_id: number | null;
    total_students: number;
    total_published: number;
    total_unpublished: number;
    total_marks: number;
    mean_marks: number;
    total_points: number;
    mean_points: number;
    mean_grade: string;
    class_comment: string;
    pass_count: number;
    pass_rate: number;
    is_exam_published?: boolean;
}

export interface ClassImprovement {
    has_previous: boolean;
    current: ClassSummary;
    previous: ClassSummary | null;
    improvement_index: number | null;
    deviation: number | null;
}

export interface ClassDistribution {
    overall: Record<string, GroupBucket>;
    subjects: Record<string, GroupBucket>;
    gender: Record<string, GroupBucket>;
    streams: Record<string, GroupBucket>;
    pathways: Record<string, GroupBucket>;
}

export interface MeritSubjectRow {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    score: Numeric | null;
    grade: string | null;
    points: Numeric | null;
}

export interface MeritRow {
    id: number;
    student_id: number;
    student_name: string;
    admission_number: string | null; // Added to support the custom merit grid

    total_marks: Numeric;
    mean_marks: Numeric;
    total_points: Numeric;
    mean_points: Numeric;
    mean_grade: string | null;

    class_rank: number | null;
    stream_rank: number | null;
    is_published: boolean;

    student?: ResultStudentRef;
    class_stream?: { id: number; name: string } | null;

    /** Added to support dynamic subject columns in the Merit List */
    result_subjects?: MeritSubjectRow[];
}

/* ─────────────────────────────────────────────────────────
 * Filters — MUST extend DataTableFilters to satisfy DataTable<T, F>
 * ───────────────────────────────────────────────────────── */

export interface AnalysisFilters extends DataTableFilters {
    grade: string;
}