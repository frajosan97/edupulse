// resources/js/components/forms/student-form/types.ts
import type { FormDataConvertible } from "@inertiajs/core";
import type { InertiaFormProps } from "@inertiajs/react";
import type { Option } from "@/types";
import type { Gender } from "@/types";
import type {
    GuardianFormRow,
    GuardianOption,
    Student,
    StudentStatus,
} from "@/types";

/* -------------------------------------------------------------------------- */
/*                              Original exports                              */
/* -------------------------------------------------------------------------- */

export type GenderValue = "male" | "female" | "other" | "";

export interface StudentFormData {
    first_name: string;
    other_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: GenderValue;
    status: StudentStatus;
    avatar: File | null;
    signature: File | null;

    admission_number: string;
    assessment_number: string;
    date_of_birth: string;
    admission_date: string;
    curriculum_id: string;
    pathway_id: string;
    class_id: string;
    class_stream_id: string;
    kcpe_marks: string;
    points: string;

    guardians: GuardianFormRow[];
}

export interface StudentFormProps {
    student?: Student;
    mode?: "create" | "edit";
    genders?: Gender[];
    statuses?: StudentStatus[];
    classes: Option<number>[];
    streams: (Option<number> & { class_id: number })[];
    curricula: (Option<number> & { code: string })[];
    pathways: (Option<number> & { curriculum_id: number })[];
    guardianOptions?: GuardianOption[];
}

/** Shared shape every tab receives. */
export interface TabProps {
    data: StudentFormData;
    setData: InertiaFormProps<StudentFormData>["setData"];
    errors: Record<string, string>;
    busy: boolean;
    generatedEmail: string;
    primaryDomain: string;
}

/** Discriminated union for the guardian payload. */
export interface NewGuardianPayload {
    [key: string]: FormDataConvertible;
    mode: "new";
    relationship_type: string;
    is_primary: boolean;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface ExistingGuardianPayload {
    [key: string]: FormDataConvertible;
    mode: "existing";
    relationship_type: string;
    is_primary: boolean;
    user_id: number;
}

export type GuardianPayload = NewGuardianPayload | ExistingGuardianPayload;

export type JsonPayload = Record<string, FormDataConvertible>;

/* -------------------------------------------------------------------------- */
/*                        Error → Tab mapping (new)                           */
/* -------------------------------------------------------------------------- */

export type StudentTab = "personal" | "admission" | "placement" | "guardians";

/** Tabs in display order — used to pick the *first* tab with an error. */
export const TAB_ORDER: readonly StudentTab[] = [
    "personal",
    "admission",
    "placement",
    "guardians",
] as const;

/**
 * Maps a Laravel dotted error key (e.g. "guardians.0.email") to the tab
 * that owns the field. Matching is done on the ROOT segment only.
 */
export const FIELD_TO_TAB: Readonly<Record<string, StudentTab>> = {
    // personal
    first_name: "personal",
    other_name: "personal",
    last_name: "personal",
    email: "personal",
    phone: "personal",
    gender: "personal",
    status: "personal",
    avatar: "personal",
    signature: "personal",
    // admission
    admission_number: "admission",
    assessment_number: "admission",
    date_of_birth: "admission",
    admission_date: "admission",
    kcpe_marks: "admission",
    points: "admission",
    // placement
    curriculum_id: "placement",
    pathway_id: "placement",
    class_id: "placement",
    class_stream_id: "placement",
    // guardians
    guardians: "guardians",
} as const;

export function tabForErrorKey(key: string): StudentTab | null {
    const root = key.split(".")[0];
    return FIELD_TO_TAB[root] ?? null;
}

/**
 * Turns "guardians.0.email" into "Guardian #1 Email".
 */
export function humanizeErrorKey(key: string): string {
    const parts = key.split(".");
    const out: string[] = [];
    for (const part of parts) {
        if (/^\d+$/.test(part)) {
            out.push(`#${Number(part) + 1}`);
        } else {
            out.push(
                part
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
            );
        }
    }
    return out.join(" ");
}