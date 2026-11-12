// resources/js/components/forms/staff-form.tsx
import { Head, router, useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    AlertCircle,
    Image as ImageIcon,
    Loader2,
    Pencil,
    PenTool,
    Save,
    Upload,
    UserPlus,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FormSelect,
    findOption,
    selectValue,
    type RSOption,
} from "@/components/ui/form-select";

import type {
    Staff,
    StaffRole,
    Gender,
    StaffStatus,
    RoleOption,
} from "@/types/staff";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type GenderValue = "male" | "female" | "other" | "";

interface StaffFormData {
    first_name: string;
    other_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: GenderValue;
    status: StaffStatus;
    role: string;
    avatar: File | null;
    signature: File | null;
}

interface Props {
    staff?: Staff;
    mode?: "create" | "edit";
    roles: RoleOption[];
    genders?: Gender[];
    statuses?: StaffStatus[];
}

/** Flat, Inertia-safe payload type (accepted by router.post as JSON). */
type JsonPayload = Record<string, string | number | boolean | null>;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<StaffStatus, string> = {
    pending: "Pending",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
};

const DEFAULT_GENDERS: Gender[] = ["male", "female", "other"];
const DEFAULT_STATUSES: StaffStatus[] = [
    "active",
    "pending",
    "inactive",
    "suspended",
];

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
            {message}
        </p>
    );
}

function revokeIfBlobUrl(url: string | null) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function StaffForm({
    staff,
    mode = staff ? "edit" : "create",
    roles,
    genders = DEFAULT_GENDERS,
    statuses = DEFAULT_STATUSES,
}: Props) {
    const isEdit = mode === "edit" && !!staff;

    // ✅ Use primary_role from the Staff type, fallback to empty if null
    const initialRole =
        (staff?.primary_role as string | null | undefined) ?? "";

    const {
        data,
        setData,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
        setDefaults,
    } = useForm<StaffFormData>({
        first_name: staff?.first_name ?? "",
        other_name: staff?.other_name ?? "",
        last_name: staff?.last_name ?? "",
        email: staff?.email ?? "",
        phone: staff?.phone ?? "",
        gender: (staff?.gender as GenderValue) ?? "",
        status: (staff?.status as StaffStatus) ?? "active",
        role: initialRole,
        avatar: null,
        signature: null,
    });

    // Update a field and immediately clear its previous validation error.
    const updateField = (
        field: keyof StaffFormData,
        value: StaffFormData[keyof StaffFormData],
    ) => {
        // Use Inertia's functional setData overload to support nullable File fields.
        setData(
            (current) =>
                ({
                    ...current,
                    [field]: value,
                }) as StaffFormData,
        );

        clearErrors(field);
    };

    const [submitting, setSubmitting] = useState(false);
    const busy = processing || submitting;

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    /* ---------------------------- option lists ---------------------------- */

    const genderOptions = useMemo<RSOption<GenderValue>[]>(
        () =>
            genders.map((g) => ({
                value: g as GenderValue,
                label: g.charAt(0).toUpperCase() + g.slice(1),
            })),
        [genders],
    );

    const statusOptions = useMemo<RSOption<StaffStatus>[]>(
        () =>
            statuses.map((s) => ({
                value: s,
                label: STATUS_LABELS[s] ?? s,
            })),
        [statuses],
    );

    const roleOptions = useMemo<RSOption<string>[]>(
        () =>
            roles.map((r) => ({
                value: r.value,
                label: r.label,
            })),
        [roles],
    );

    /* ------------------------------ previews ------------------------------ */

    const avatarPreview = useMemo(() => {
        if (data.avatar) return URL.createObjectURL(data.avatar);
        return staff?.avatar_url ?? null;
    }, [data.avatar, staff?.avatar_url]);

    const signaturePreview = useMemo(() => {
        if (data.signature) return URL.createObjectURL(data.signature);
        return staff?.signature_url ?? null;
    }, [data.signature, staff?.signature_url]);

    useEffect(() => () => revokeIfBlobUrl(avatarPreview), [avatarPreview]);
    useEffect(
        () => () => revokeIfBlobUrl(signaturePreview),
        [signaturePreview],
    );

    /* -------------------------------------------------------------------- */
    /*                            Submit handler                            */
    /* -------------------------------------------------------------------- */
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;

        const url =
            isEdit && staff
                ? route("staff.update", staff.id)
                : route("staff.store");

        const hasFile = !!data.avatar || !!data.signature;

        /* -------------------- No files → JSON -------------------------- */
        if (!hasFile) {
            const payload: JsonPayload = {
                first_name: data.first_name,
                other_name: data.other_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                gender: data.gender || null,
                status: data.status,
                role: data.role,
            };

            setSubmitting(true);
            router.post(
                url,
                isEdit ? { ...payload, _method: "PUT" } : payload,
                {
                    preserveScroll: true,
                    forceFormData: false,
                    onSuccess: () => {
                        toast.success(
                            isEdit
                                ? "Staff member updated."
                                : "Staff member created.",
                        );
                        if (!isEdit) {
                            reset();
                            setDefaults();
                        }
                    },
                    onError: (serverErrors) => {
                        clearErrors();
                        setError(serverErrors);
                        toast.error("Please fix the highlighted fields.");
                    },
                    onFinish: () => setSubmitting(false),
                },
            );
            return;
        }

        /* -------------------- Files → FormData ------------------------- */
        const fd = new FormData();

        if (isEdit) fd.append("_method", "PUT");

        fd.append("first_name", data.first_name);
        fd.append("other_name", data.other_name);
        fd.append("last_name", data.last_name);
        fd.append("email", data.email);
        fd.append("phone", data.phone);
        if (data.gender) fd.append("gender", data.gender);
        fd.append("status", data.status);
        fd.append("role", data.role);

        if (data.avatar) fd.append("avatar", data.avatar);
        if (data.signature) fd.append("signature", data.signature);

        setSubmitting(true);
        router.post(url, fd, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    isEdit ? "Staff member updated." : "Staff member created.",
                );
                if (!isEdit) {
                    reset();
                    setDefaults();
                }
            },
            onError: (serverErrors) => {
                clearErrors();
                setError(serverErrors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleReset = () => {
        reset();
        clearErrors();
        toast.info("Form reset.");
    };

    return (
        <>
            <Head title={isEdit ? `Edit ${staff!.name}` : "Add Staff Member"} />

            <div className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title={isEdit ? "Edit Staff Member" : "Add Staff Member"}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            {isEdit ? (
                                <Pencil className="h-6 w-6" />
                            ) : (
                                <UserPlus className="h-6 w-6" />
                            )}
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            {isEdit
                                ? `Updating ${staff!.name}. Changes take effect immediately.`
                                : "Add a new staff member to your school."}
                        </p>
                    }
                    backHref={route("staff.index")}
                />

                <form onSubmit={submit} className="space-y-4" noValidate>
                    {/* Error banner */}
                    {Object.keys(errors).length > 0 && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                                <strong className="block">
                                    Please fix {Object.keys(errors).length}{" "}
                                    field
                                    {Object.keys(errors).length === 1
                                        ? ""
                                        : "s"}
                                    :
                                </strong>
                                <ul className="mt-1 list-disc pl-5">
                                    {Object.entries(errors).map(
                                        ([field, msg]) => (
                                            <li key={field}>
                                                <span className="font-mono text-xs">
                                                    {field}
                                                </span>
                                                : {msg as string}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                        {/* LEFT SIDEBAR */}
                        <aside className="flex h-fit flex-col gap-5 rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-muted bg-muted shadow-sm">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={(e) =>
                                        updateField(
                                            "avatar",
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        avatarInputRef.current?.click()
                                    }
                                    className="mt-4 w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                >
                                    <Upload className="mr-2 h-3.5 w-3.5" />
                                    Change Photo
                                </Button>
                                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                                    JPG, PNG, GIF or WEBP. Max 2MB.
                                </p>
                                <FieldError message={errors.avatar} />
                            </div>

                            <div className="h-px w-full bg-border" />

                            <div className="flex flex-col items-center">
                                <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/50">
                                    {signaturePreview ? (
                                        <img
                                            src={signaturePreview}
                                            alt="Signature preview"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <PenTool className="h-5 w-5 text-muted-foreground/50" />
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={signatureInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                        updateField(
                                            "signature",
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        signatureInputRef.current?.click()
                                    }
                                    className="mt-3 w-full"
                                >
                                    <PenTool className="mr-2 h-3.5 w-3.5" />
                                    Upload Signature
                                </Button>
                                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                                    Max 1MB.
                                </p>
                                <FieldError message={errors.signature} />
                            </div>
                        </aside>

                        {/* RIGHT AREA */}
                        <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
                            {/* Personal Information */}
                            <section className="space-y-4">
                                <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-500">
                                    Personal Information
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="last_name">
                                            Surname{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                updateField(
                                                    "last_name",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Kitalinga"
                                            className="mt-1.5"
                                            autoComplete="family-name"
                                            aria-invalid={!!errors.last_name}
                                        />
                                        <FieldError
                                            message={errors.last_name}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="first_name">
                                            First Name{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                updateField(
                                                    "first_name",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Brian"
                                            className="mt-1.5"
                                            autoComplete="given-name"
                                            aria-invalid={!!errors.first_name}
                                        />
                                        <FieldError
                                            message={errors.first_name}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="other_name">
                                            Other Name
                                        </Label>
                                        <Input
                                            id="other_name"
                                            value={data.other_name}
                                            onChange={(e) =>
                                                updateField(
                                                    "other_name",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter other name"
                                            className="mt-1.5"
                                            autoComplete="additional-name"
                                            aria-invalid={!!errors.other_name}
                                        />
                                        <FieldError
                                            message={errors.other_name}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="email">
                                            Email Address{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                updateField(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="brian@example.com"
                                            className="mt-1.5"
                                            autoComplete="email"
                                            aria-invalid={!!errors.email}
                                        />
                                        <FieldError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">
                                            Phone Number{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) =>
                                                updateField(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="254726361574"
                                            className="mt-1.5"
                                            autoComplete="tel"
                                            inputMode="tel"
                                            aria-invalid={!!errors.phone}
                                        />
                                        <FieldError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* ✅ Gender → FormSelect */}
                                    <FormSelect<RSOption<GenderValue>, false>
                                        id="gender"
                                        label="Gender"
                                        usePortal
                                        options={genderOptions}
                                        isClearable
                                        placeholder="Select gender"
                                        isDisabled={busy}
                                        value={findOption(
                                            data.gender || null,
                                            genderOptions,
                                        )}
                                        onChange={(opt) =>
                                            updateField(
                                                "gender",
                                                (selectValue(opt) ??
                                                    "") as GenderValue,
                                            )
                                        }
                                        error={errors.gender}
                                    />
                                </div>
                            </section>

                            <div className="h-px w-full bg-border" />

                            {/* Role & Access */}
                            <section className="space-y-4">
                                <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-500">
                                    Role &amp; Access
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* ✅ Role → FormSelect */}
                                    <FormSelect<RSOption<string>, false>
                                        id="role"
                                        label="Role"
                                        required
                                        usePortal
                                        options={roleOptions}
                                        placeholder={
                                            roleOptions.length === 0
                                                ? "No assignable roles found."
                                                : "Select role"
                                        }
                                        noOptionsMessage={() =>
                                            "No assignable roles found."
                                        }
                                        isDisabled={
                                            busy || roleOptions.length === 0
                                        }
                                        value={findOption(
                                            data.role || null,
                                            roleOptions,
                                        )}
                                        onChange={(opt) =>
                                            updateField(
                                                "role",
                                                (selectValue(opt) ??
                                                    "") as string,
                                            )
                                        }
                                        error={errors.role}
                                    />

                                    {/* ✅ Status → FormSelect */}
                                    <FormSelect<RSOption<StaffStatus>, false>
                                        id="status"
                                        label="Status"
                                        required
                                        usePortal
                                        options={statusOptions}
                                        placeholder="Select status"
                                        isDisabled={busy}
                                        value={findOption(
                                            data.status,
                                            statusOptions,
                                        )}
                                        onChange={(opt) =>
                                            updateField(
                                                "status",
                                                (selectValue(opt) ??
                                                    "active") as StaffStatus,
                                            )
                                        }
                                        error={errors.status}
                                    />
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={busy}
                                >
                                    Reset form
                                </Button>
                                <Button type="submit" disabled={busy}>
                                    {busy ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-1.5 h-4 w-4" />
                                            {isEdit
                                                ? "Save changes"
                                                : "Create staff member"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
