// resources/js/types/grade-scale.ts
export interface GradeScale {
    id: number;
    grading_system_id: number;
    name: string;
    code: string;
    min_score: string | number;
    max_score: string | number;
    grade_point: string | number | null;
    description: string | null;
    remark: string | null;
    swahili_remark: string | null;
    display_order: number;
}