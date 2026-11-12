// resources/js/components/forms/student-form/submit.tsx

import { router } from "@inertiajs/react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import type { Student } from "@/types/student";
import type { GuardianPayload, JsonPayload, StudentFormData } from "./types";

interface SubmitArgs {
    e: FormEvent<HTMLFormElement>;
    data: StudentFormData;
    student?: Student;
    isEdit: boolean;
    busy: boolean;
    setSubmitting: (value: boolean) => void;
    reset: () => void;
    setDefaults: () => void;
    onValidationError?: (errors: Record<string, string>) => void;
}

type NullableString = string | null;

type NormalizedStudentPayload = {
    first_name: string;
    other_name: NullableString;
    last_name: string;
    email: string;
    phone: string;
    gender: string | null;
    status: string | null;
    admission_number: string;
    assessment_number: NullableString;
    date_of_birth: NullableString;
    admission_date: string; // guaranteed non-null (DB column is NOT NULL)
    curriculum_id: number | null;
    pathway_id: number | null;
    class_id: number | null;
    class_stream_id: number | null;
    kcpe_marks: number | null;
    points: number | null;
};

/**
 * Today's date as `YYYY-MM-DD` in the user's local timezone.
 * Avoids the UTC day-shift bug of `new Date().toISOString().slice(0, 10)`.
 */
export function todayISO(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

const toNullable = (value: string | null | undefined): NullableString => {
    const trimmed = value?.trim();
    return trimmed || null;
};

const toNullableNumber = (
    value: string | number | null | undefined,
): number | null => {
    if (value === null || value === undefined || String(value).trim() === "") {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toNullableInteger = (
    value: string | number | null | undefined,
): number | null => {
    const parsed = toNullableNumber(value);
    return parsed !== null && Number.isInteger(parsed) ? parsed : null;
};

function buildGuardiansPayload(
    guardians: StudentFormData["guardians"],
): GuardianPayload[] {
    return guardians
        .filter((guardian) => {
            const hasIdentity =
                guardian.mode === "new"
                    ? [
                          guardian.first_name,
                          guardian.last_name,
                          guardian.email,
                          guardian.phone,
                      ].some((value) => value.trim() !== "")
                    : guardian.user_id.trim() !== "";

            return (
                hasIdentity ||
                guardian.is_primary ||
                guardian.relationship_type !== "guardian"
            );
        })
        .map((guardian): GuardianPayload => {
            if (guardian.mode === "new") {
                return {
                    mode: "new",
                    relationship_type: guardian.relationship_type,
                    is_primary: Boolean(guardian.is_primary),
                    first_name: guardian.first_name.trim(),
                    last_name: guardian.last_name.trim(),
                    email: guardian.email.trim(),
                    phone: guardian.phone.trim(),
                };
            }

            const userId = Number(guardian.user_id);

            return {
                mode: "existing",
                relationship_type: guardian.relationship_type,
                is_primary: Boolean(guardian.is_primary),
                user_id: Number.isInteger(userId) && userId > 0 ? userId : 0,
            };
        });
}

function buildNormalizedPayload(
    data: StudentFormData,
): NormalizedStudentPayload {
    return {
        first_name: data.first_name.trim(),
        other_name: toNullable(data.other_name),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        gender: data.gender || null,
        status: data.status || null,

        admission_number: data.admission_number.trim(),
        assessment_number: toNullable(data.assessment_number),
        date_of_birth: toNullable(data.date_of_birth),

        // DB column is NOT NULL → fall back to today if the user cleared it.
        admission_date: toNullable(data.admission_date) ?? todayISO(),

        curriculum_id: toNullableInteger(data.curriculum_id),
        pathway_id: toNullableInteger(data.pathway_id),
        class_id: toNullableInteger(data.class_id),
        class_stream_id: toNullableInteger(data.class_stream_id),

        kcpe_marks: toNullableInteger(data.kcpe_marks),
        points: toNullableNumber(data.points),
    };
}

function appendFormData(
    formData: FormData,
    payload: NormalizedStudentPayload,
): void {
    Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value === null ? "" : String(value));
    });
}

function appendGuardians(
    formData: FormData,
    guardians: GuardianPayload[],
): void {
    guardians.forEach((guardian, index) => {
        const prefix = `guardians[${index}]`;

        formData.append(`${prefix}[mode]`, guardian.mode);
        formData.append(
            `${prefix}[relationship_type]`,
            guardian.relationship_type,
        );
        formData.append(
            `${prefix}[is_primary]`,
            guardian.is_primary ? "1" : "0",
        );

        if (guardian.mode === "new") {
            formData.append(`${prefix}[first_name]`, guardian.first_name);
            formData.append(`${prefix}[last_name]`, guardian.last_name);
            formData.append(`${prefix}[email]`, guardian.email);
            formData.append(`${prefix}[phone]`, guardian.phone);
        } else {
            formData.append(`${prefix}[user_id]`, String(guardian.user_id));
        }
    });
}

export function submitStudentForm({
    e,
    data,
    student,
    isEdit,
    busy,
    setSubmitting,
    reset,
    setDefaults,
    onValidationError,
}: SubmitArgs): void {
    e.preventDefault();

    if (busy) {
        return;
    }

    if (isEdit && !student) {
        toast.error("Unable to update student. Student record not found.");
        return;
    }

    const editing = isEdit && Boolean(student);

    const url = editing
        ? route("students.update", student!.id)
        : route("students.store");

    const normalized = buildNormalizedPayload(data);
    const guardians = buildGuardiansPayload(data.guardians);

    const hasFiles = Boolean(data.avatar || data.signature);

    const options = {
        preserveScroll: true,

        onSuccess: () => {
            toast.success(
                editing
                    ? "Student updated successfully."
                    : "Student created successfully.",
            );

            if (!editing) {
                reset();
                setDefaults();
            }
        },

        onError: (errors: Record<string, string>) => {
            toast.error("Please fix the errors highlighted.");
            onValidationError?.(errors);
        },

        onFinish: () => {
            setSubmitting(false);
        },
    };

    setSubmitting(true);

    if (!hasFiles) {
        const payload: JsonPayload = {
            ...normalized,
            guardians,
            ...(editing ? { _method: "PUT" } : {}),
        };

        router.post(url, payload, {
            ...options,
            forceFormData: false,
        });

        return;
    }

    const formData = new FormData();

    if (editing) {
        formData.append("_method", "PUT");
    }

    appendFormData(formData, normalized);
    appendGuardians(formData, guardians);

    if (data.avatar) {
        formData.append("avatar", data.avatar);
    }
    if (data.signature) {
        formData.append("signature", data.signature);
    }

    router.post(url, formData, {
        ...options,
        forceFormData: true,
    });
}
