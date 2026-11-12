// resources/js/components/forms/student-form/constants.ts
import type { Gender } from "@/types/staff";
import type { StudentStatus } from "@/types/student";

export const STATUS_LABELS: Record<StudentStatus, string> = {
    pending: "Pending",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
};

export const GENDER_LABELS: Record<Gender, string> = {
    male: "Male",
    female: "Female",
    other: "Other",
};

export const DEFAULT_GENDERS: Gender[] = ["male", "female", "other"];

export const DEFAULT_STATUSES: StudentStatus[] = [
    "active",
    "pending",
    "inactive",
    "suspended",
];

export function humanize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}