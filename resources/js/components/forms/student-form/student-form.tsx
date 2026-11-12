// resources/js/components/forms/student-form/student-form.tsx
import { Head, useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    AlertCircle,
    GraduationCap,
    Hash,
    Image as ImageIcon,
    Loader2,
    Pencil,
    PenTool,
    Save,
    Upload,
    User,
    UserPlus,
    Users,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAppData from "@/hooks/use-app-data";
import type { GuardianFormRow } from "@/types/student";

import { FieldError } from "./shared/field-error";
import { PersonalTab } from "./tabs/personal-tab";
import { AdmissionTab } from "./tabs/admission-tab";
import { PlacementTab } from "./tabs/placement-tab";
import { GuardiansTab } from "./tabs/guardians-tab";
import { submitStudentForm, todayISO } from "./submit";
import { DEFAULT_GENDERS, DEFAULT_STATUSES } from "./constants";
import { TAB_ORDER, tabForErrorKey } from "./types";
import type {
    GenderValue,
    StudentFormData,
    StudentFormProps,
    StudentTab,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function StudentForm({
    student,
    mode = student ? "edit" : "create",
    genders = DEFAULT_GENDERS,
    statuses = DEFAULT_STATUSES,
    classes,
    streams,
    curricula,
    pathways,
    guardianOptions = [],
}: StudentFormProps) {
    const isEdit = mode === "edit" && !!student;

    const { tenant, contacts } = useAppData();

    const primaryDomain = useMemo(() => {
        const fromTenant = (tenant as { domain?: string } | null)?.domain;
        if (fromTenant)
            return fromTenant.trim().toLowerCase().replace(/^@/, "");

        const fromEmail = contacts?.email?.split("@")[1];
        if (fromEmail) return fromEmail.trim().toLowerCase();

        return "school.ac.ke";
    }, [tenant, contacts]);

    const initialGuardians: GuardianFormRow[] =
        student?.parents?.map((p) => ({
            mode: "existing",
            user_id: String(p.id),
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            relationship_type: p.relationship_type ?? "guardian",
            is_primary: p.is_primary,
        })) ?? [];

    const {
        data,
        setData,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
        setDefaults,
    } = useForm<StudentFormData>({
        first_name: student?.user?.first_name ?? "",
        other_name: student?.user?.other_name ?? "",
        last_name: student?.user?.last_name ?? "",
        email: student?.user?.email ?? "",
        phone: student?.user?.phone ?? "",
        gender: (student?.user?.gender as GenderValue) ?? "",
        status: (student?.user?.status as any) ?? "active",
        avatar: null,
        signature: null,

        admission_number: student?.admission_number ?? "",
        assessment_number: student?.assessment_number ?? "",
        date_of_birth: student?.date_of_birth ?? "",

        // Auto-fill today on create; keep the stored value on edit.
        admission_date: student?.admission_date ?? todayISO(),

        curriculum_id: student?.curriculum_id
            ? String(student.curriculum_id)
            : "",
        pathway_id: student?.pathway_id ? String(student.pathway_id) : "",
        class_id: student?.class_id ? String(student.class_id) : "",
        class_stream_id: student?.class_stream_id
            ? String(student.class_stream_id)
            : "",
        kcpe_marks:
            student?.kcpe_marks !== null && student?.kcpe_marks !== undefined
                ? String(student.kcpe_marks)
                : "",
        points:
            student?.points !== null && student?.points !== undefined
                ? String(student.points)
                : "",
        guardians: initialGuardians,
    });

    /**
     * Re-seed today's date after a successful create so the reset form
     * comes back with a fresh "today" rather than an empty field (or a
     * stale date captured at mount time).
     */
    const setDefaultsWithToday = () => {
        setDefaults();
        setData("admission_date", todayISO());
    };

    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<StudentTab>("personal");
    const busy = processing || submitting;

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const generatedEmail = useMemo(() => {
        const local = (data.admission_number ?? "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "");
        if (!local) return "";
        return `${local}@${primaryDomain}`;
    }, [data.admission_number, primaryDomain]);

    useEffect(() => {
        if (data.email !== generatedEmail) {
            setData("email", generatedEmail);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedEmail]);

    const avatarPreview = useMemo(() => {
        if (data.avatar) return URL.createObjectURL(data.avatar);
        return student?.user?.avatar_url ?? null;
    }, [data.avatar, student?.user?.avatar_url]);

    const signaturePreview = useMemo(() => {
        if (data.signature) return URL.createObjectURL(data.signature);
        return student?.user?.signature_url ?? null;
    }, [data.signature, student?.user?.signature_url]);

    useEffect(() => {
        if (avatarPreview?.startsWith("blob:")) {
            return () => URL.revokeObjectURL(avatarPreview);
        }
    }, [avatarPreview]);

    useEffect(() => {
        if (signaturePreview?.startsWith("blob:")) {
            return () => URL.revokeObjectURL(signaturePreview);
        }
    }, [signaturePreview]);

    /* -------------------- Guardian handlers -------------------- */

    const addGuardian = () => {
        setData("guardians", [
            ...data.guardians,
            {
                mode: "existing",
                user_id: "",
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                relationship_type: "guardian",
                is_primary: data.guardians.length === 0,
            },
        ]);
    };

    const updateGuardian = (index: number, patch: Partial<GuardianFormRow>) => {
        const next = data.guardians.map((g, i) =>
            i === index ? { ...g, ...patch } : g,
        );

        if (patch.is_primary === true) {
            next.forEach((g, i) => {
                if (i !== index) g.is_primary = false;
            });
        }

        setData("guardians", next);
    };

    const removeGuardian = (index: number) => {
        const next = data.guardians.filter((_, i) => i !== index);

        if (!next.some((g) => g.is_primary) && next.length > 0) {
            next[0].is_primary = true;
        }

        setData("guardians", next);
    };

    /* -------------------- Submit -------------------- */

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        submitStudentForm({
            e,
            data,
            student,
            isEdit,
            busy,
            setSubmitting,
            reset,
            setDefaults: setDefaultsWithToday,
            onValidationError: (serverErrors) => {
                clearErrors();
                setError(serverErrors);

                const firstTabWithError = TAB_ORDER.find((tab) =>
                    Object.keys(serverErrors).some(
                        (key) => tabForErrorKey(key) === tab,
                    ),
                );

                if (firstTabWithError) {
                    setActiveTab(firstTabWithError);
                }
            },
        });
    };

    const handleReset = () => {
        reset();
        clearErrors();
        setActiveTab("personal");
        // Keep admission_date defaulted to today after a manual reset too.
        setData("admission_date", todayISO());
        toast.info("Form reset.");
    };

    /* -------------------- Tab-level errors map -------------------- */

    const flatErrors = errors as Record<string, string>;

    const tabProps = {
        data,
        setData,
        errors: flatErrors,
        busy,
        generatedEmail,
        primaryDomain,
    };

    /* -------------------- Render -------------------- */

    return (
        <>
            <Head
                title={
                    isEdit
                        ? `Edit ${student?.user?.name ?? "Student"}`
                        : "Add Student"
                }
            />

            <div className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title={isEdit ? "Edit Student" : "Add Student"}
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
                                ? `Updating ${
                                      student?.user?.name ?? "student"
                                  }. Changes take effect immediately.`
                                : "Add a new student to your school."}
                        </p>
                    }
                    backHref={route("students.index")}
                />

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                                        setData(
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
                                <FieldError message={flatErrors.avatar} />
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
                                        setData(
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
                                <FieldError message={flatErrors.signature} />
                            </div>
                        </aside>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <Tabs
                                value={activeTab}
                                onValueChange={(value) =>
                                    setActiveTab(value as StudentTab)
                                }
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger
                                        value="personal"
                                        className="gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        Personal
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="admission"
                                        className="gap-2"
                                    >
                                        <Hash className="h-4 w-4" />
                                        Admission
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="placement"
                                        className="gap-2"
                                    >
                                        <GraduationCap className="h-4 w-4" />
                                        Placement
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="guardians"
                                        className="gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        Guardians
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="mt-6">
                                    <PersonalTab
                                        {...tabProps}
                                        genders={genders}
                                        statuses={statuses}
                                    />
                                </TabsContent>

                                <TabsContent value="admission" className="mt-6">
                                    <AdmissionTab {...tabProps} />
                                </TabsContent>

                                <TabsContent value="placement" className="mt-6">
                                    <PlacementTab
                                        {...tabProps}
                                        classes={classes}
                                        streams={streams}
                                        curricula={curricula}
                                        pathways={pathways}
                                    />
                                </TabsContent>

                                <TabsContent value="guardians" className="mt-6">
                                    <GuardiansTab
                                        {...tabProps}
                                        guardianOptions={guardianOptions}
                                        onAdd={addGuardian}
                                        onChange={updateGuardian}
                                        onRemove={removeGuardian}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="mt-6 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-between">
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
                                                : "Create student"}
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
