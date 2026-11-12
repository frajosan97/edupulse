// resources/js/types/grading-system.ts
import type { GradeScale } from "./grade-scale";

export interface GradingSystem {
    id: number;
    name: string;
    code: string;
    description: string | null;
    type: string;
    is_default: boolean;
    is_active: boolean;
    grade_scales?: GradeScale[];
    grade_scales_count?: number;
    subjects_count?: number;
    created_at: string;
    deleted_at: string | null;
}