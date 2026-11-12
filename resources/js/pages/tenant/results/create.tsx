// resources/js/pages/tenant/results/create.tsx
import { Head, router } from "@inertiajs/react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    AlertCircle,
    ClipboardList,
    FileSpreadsheet,
    Loader2,
    Save,
    Search,
    Settings2,
    SlidersHorizontal,
    Users,
    X,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FormSelect,
    findOption,
    selectValue,
    type RSOption,
} from "@/components/ui/form-select";
import {
    ConfigDialog,
    ASSESSMENTS,
    defaultConfig,
    type AssessmentConfig,
    type AssessmentKey,
} from "@/components/modals/config-dialog";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Exam = {
    id: number;
    name: string;
    code: string;
    term_id: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    status_label: string;
};

type ExamClassOption = {
    id: number;
    exam_id: number;
    exam_name: string | null;
    class_id: number;
    class_name: string | null;
    class_stream_id: number | null;
    stream_name: string | null;
    level: string;
    is_stream_level: boolean;
};

type Subject = { id: number; name: string; code: string };

type MarksRow = {
    score: string | number | null;
    score_outof: string | number | null;
    cat_1: string | number | null;
    cat_1_outof: string | number | null;
    cat_2: string | number | null;
    cat_2_outof: string | number | null;
    pp_1: string | number | null;
    pp_1_outof: string | number | null;
    pp_2: string | number | null;
    pp_2_outof: string | number | null;
    pp_3: string | number | null;
    pp_3_outof: string | number | null;
};

type RequestedStudent = {
    id: number;
    name: string;
    admission_number: string;
    result_subject_id: number | null;
    existing: MarksRow | null;
};

type RequestedData = {
    exam_class_id: number;
    subject: Subject;
    students: RequestedStudent[];
};

interface Props {
    exams: Exam[];
    examClasses: ExamClassOption[];
    subjects: Subject[];
    filters: { exam_id?: number | null };
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const emptyRow = (): MarksRow => ({
    score: "",
    score_outof: "100",
    cat_1: "",
    cat_1_outof: "100",
    cat_2: "",
    cat_2_outof: "100",
    pp_1: "",
    pp_1_outof: "100",
    pp_2: "",
    pp_2_outof: "100",
    pp_3: "",
    pp_3_outof: "100",
});

const num = (v: string | number | null | undefined) =>
    v === "" || v === null || v === undefined ? null : Number(v);

const isBlank = (v: unknown) => v === "" || v === null || v === undefined;

function computeRaw(row: MarksRow, config: AssessmentConfig) {
    let score = 0;
    let outOf = 0;
    for (const a of ASSESSMENTS) {
        if (!config.components[a.key].enabled) continue;
        const sv = num(row[a.key]);
        const ov = num(row[a.outOfKey]);
        if (sv !== null && ov !== null && ov > 0) {
            score += sv;
            outOf += ov;
        }
    }
    return { score, outOf };
}

/**
 * The displayed score:
 *  - No components → raw row.score, denominator = config.scoreOutOf (bulk).
 *  - Components on → raw sum scaled to config.scoreOutOf.
 * In both modes, the denominator comes from the config dialog.
 */
function computeDisplayScore(row: MarksRow, config: AssessmentConfig) {
    const hasComponents = ASSESSMENTS.some(
        (a) => config.components[a.key].enabled,
    );
    const target = num(config.scoreOutOf) ?? 100;

    if (!hasComponents) {
        return { score: num(row.score), outOf: target };
    }

    const raw = computeRaw(row, config);
    if (raw.outOf <= 0) {
        return { score: 0, outOf: target };
    }
    const scaled = Math.round((raw.score / raw.outOf) * target * 100) / 100;
    return { score: scaled, outOf: target };
}

function detectConfig(students: RequestedStudent[]): AssessmentConfig {
    const config = defaultConfig();
    if (students.length === 0) return config;

    const firstExisting = students.find((s) => s.existing)?.existing;
    if (firstExisting) {
        for (const a of ASSESSMENTS) {
            const ov = firstExisting[a.outOfKey];
            if (!isBlank(ov)) config.components[a.key].outOf = String(ov);
        }
        if (!isBlank(firstExisting.score_outof)) {
            config.scoreOutOf = String(firstExisting.score_outof);
        }
    }

    for (const a of ASSESSMENTS) {
        config.components[a.key].enabled = students.some((s) => {
            const r = s.existing;
            if (!r) return false;
            return !isBlank(r[a.key]) || !isBlank(r[a.outOfKey]);
        });
    }

    return config;
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default function MarksEntry({
    exams = [],
    examClasses = [],
    subjects = [],
}: Props) {
    /* ---------------------------- Filters ------------------------------- */
    const [examId, setExamId] = useState<number | null>(null);
    const [examClassId, setExamClassId] = useState<number | null>(null);
    const [classStreamId, setClassStreamId] = useState<number | null>(null);
    const [subjectId, setSubjectId] = useState<number | null>(null);

    /* ---------------------------- Loading ------------------------------- */
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [requested, setRequested] = useState<RequestedData | null>(null);
    const [requestOpen, setRequestOpen] = useState(true);

    /* ---------------------------- Marks --------------------------------- */
    const [rows, setRows] = useState<Record<number, MarksRow>>({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    /* ---------------------------- Config -------------------------------- */
    const [config, setConfig] = useState<AssessmentConfig>(defaultConfig);
    const [configOpen, setConfigOpen] = useState(false);
    const [configLocked, setConfigLocked] = useState(false);

    /* --------------------------- Options -------------------------------- */
    const examOptions: RSOption<number>[] = useMemo(
        () =>
            exams.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.code}) · ${e.status_label}`,
            })),
        [exams],
    );

    const examClassesForExam = useMemo(
        () => examClasses.filter((ec) => ec.exam_id === examId),
        [examClasses, examId],
    );

    const classOptions: RSOption<number>[] = useMemo(() => {
        const seen = new Map<number, string>();
        examClassesForExam.forEach((ec) => {
            if (ec.class_name) seen.set(ec.class_id, ec.class_name);
        });
        return Array.from(seen, ([id, name]) => ({ value: id, label: name }));
    }, [examClassesForExam]);

    const streamOptions: RSOption<number>[] = useMemo(() => {
        const seen = new Map<number, string>();
        examClassesForExam
            .filter((ec) => ec.class_id === examClassId && ec.class_stream_id)
            .forEach((ec) => {
                if (ec.class_stream_id && ec.stream_name) {
                    seen.set(ec.class_stream_id, ec.stream_name);
                }
            });
        return Array.from(seen, ([id, name]) => ({ value: id, label: name }));
    }, [examClassesForExam, examClassId]);

    const subjectOptions: RSOption<number>[] = useMemo(
        () =>
            subjects.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
            })),
        [subjects],
    );

    const matchedExamClass = useMemo(() => {
        return (
            examClassesForExam.find((ec) => {
                if (ec.class_id !== examClassId) return false;
                if (
                    classStreamId !== null &&
                    ec.class_stream_id !== classStreamId
                )
                    return false;
                if (classStreamId === null && ec.class_stream_id !== null)
                    return false;
                return true;
            }) ?? null
        );
    }, [examClassesForExam, examClassId, classStreamId]);

    /* ---------------------------- Derived ------------------------------- */
    const filteredStudents = useMemo(() => {
        if (!requested) return [];
        const q = search.trim().toLowerCase();
        if (!q) return requested.students;
        return requested.students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.admission_number.toLowerCase().includes(q),
        );
    }, [requested, search]);

    const hasAnyEnabled = useMemo(
        () => ASSESSMENTS.some((a) => config.components[a.key].enabled),
        [config],
    );

    const enabledAssessments = useMemo(
        () => ASSESSMENTS.filter((a) => config.components[a.key].enabled),
        [config],
    );

    const canSubmitRequest =
        !!matchedExamClass && subjectId !== null && !loadingStudents;

    const canReset =
        !!requested ||
        !!examId ||
        !!examClassId ||
        !!classStreamId ||
        !!subjectId ||
        hasAnyEnabled;

    /* -------------------------- Filter handlers ------------------------- */
    function changeExam(v: number | null) {
        setExamId(v);
        setExamClassId(null);
        setClassStreamId(null);
        setSubjectId(null);
        setRequested(null);
        setRequestError(null);
    }
    function changeClass(v: number | null) {
        setExamClassId(v);
        setClassStreamId(null);
        setRequested(null);
    }
    function changeStream(v: number | null) {
        setClassStreamId(v);
        setRequested(null);
    }
    function changeSubject(v: number | null) {
        setSubjectId(v);
        setRequested(null);
    }

    /* -------------------------- Request handler ------------------------- */
    async function requestStudents() {
        if (!matchedExamClass || subjectId === null) {
            toast.error("Please select an exam, class, and subject first.");
            return;
        }

        setLoadingStudents(true);
        setRequestError(null);
        setRequested(null);

        try {
            const res = await fetch(route("results.request-students"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? "",
                },
                body: JSON.stringify({
                    exam_class_id: matchedExamClass.id,
                    subject_id: subjectId,
                }),
            });

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(
                    payload?.message ??
                        "Failed to load students. Please try again.",
                );
            }

            if (!payload?.students || payload.students.length === 0) {
                setRequestError(
                    payload?.message ??
                        "No students were found for this class/subject combination.",
                );
                return;
            }

            const students = payload.students as RequestedStudent[];

            const seeded: Record<number, MarksRow> = {};
            students.forEach((s) => {
                seeded[s.id] = s.existing
                    ? { ...emptyRow(), ...s.existing }
                    : emptyRow();
            });
            const detected = detectConfig(students);

            setRows(seeded);
            setConfig(detected);
            setConfigLocked(false);
            setRequested(payload as RequestedData);
            setRequestOpen(false);

            const labels = ASSESSMENTS.filter(
                (a) => detected.components[a.key].enabled,
            ).map((a) => a.label);

            if (labels.length > 0) {
                toast.info(
                    `Loaded ${students.length} student(s) with: ${labels.join(", ")}.`,
                );
            } else {
                toast.success(
                    `Loaded ${students.length} student(s). Enter scores directly.`,
                );
            }
        } catch (err: any) {
            const msg = err?.message ?? "Failed to load students.";
            setRequestError(msg);
            toast.error(msg);
        } finally {
            setLoadingStudents(false);
        }
    }

    /* ----------------------------- Row handlers ------------------------- */
    function updateRow(studentId: number, patch: Partial<MarksRow>) {
        setRows((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...patch },
        }));
    }

    function resetAll() {
        setExamId(null);
        setExamClassId(null);
        setClassStreamId(null);
        setSubjectId(null);
        setRequested(null);
        setRows({});
        setRequestError(null);
        setSearch("");
        setRequestOpen(true);
        setConfig(defaultConfig());
        setConfigLocked(false);
    }

    /* ---------------------------- Config handlers ----------------------- */
    function applyConfig() {
        for (const a of ASSESSMENTS) {
            if (!config.components[a.key].enabled) continue;
            const v = num(config.components[a.key].outOf);
            if (v === null || v <= 0) {
                toast.error(`Out-of for ${a.label} must be greater than 0.`);
                return;
            }
        }

        const target = num(config.scoreOutOf);
        if (target === null || target <= 0) {
            toast.error("Final Score Out Of must be greater than 0.");
            return;
        }

        setRows((prev) => {
            const next: Record<number, MarksRow> = {};
            for (const [sid, row] of Object.entries(prev)) {
                const patched: MarksRow = { ...row };
                for (const a of ASSESSMENTS) {
                    if (config.components[a.key].enabled) {
                        patched[a.outOfKey] = config.components[a.key].outOf;
                    } else {
                        patched[a.key] = "";
                        patched[a.outOfKey] = "100";
                    }
                }
                patched.score_outof = config.scoreOutOf;
                next[Number(sid)] = patched;
            }
            return next;
        });

        setConfigLocked(true);
        setConfigOpen(false);
        toast.success("Assessment configuration applied.");
    }

    /* -------------------------- Submit handler -------------------------- */
    function submitMarks(e: React.FormEvent) {
        e.preventDefault();
        if (!requested || submitting) return;

        const payload = {
            exam_class_id: requested.exam_class_id,
            subject_id: requested.subject.id,
            assessments: enabledAssessments.map((a) => ({
                key: a.key,
                out_of: num(config.components[a.key].outOf),
            })),
            marks: requested.students.map((s) => {
                const r = rows[s.id] ?? emptyRow();
                const { score, outOf } = computeDisplayScore(r, config);

                const mark: Record<string, number | null> = {
                    student_id: s.id,
                    score,
                    score_outof: outOf,
                };
                for (const a of ASSESSMENTS) {
                    mark[a.key] = config.components[a.key].enabled
                        ? num(r[a.key])
                        : null;
                    mark[a.outOfKey] = config.components[a.key].enabled
                        ? num(r[a.outOfKey])
                        : null;
                }
                return mark;
            }),
        };

        setSubmitting(true);
        router.post(route("results.store"), payload, {
            preserveScroll: true,
            onSuccess: () => toast.success("Marks saved successfully."),
            onError: () => toast.error("Please fix the highlighted fields."),
            onFinish: () => setSubmitting(false),
        });
    }

    /* --------------------------- Hero content --------------------------- */
    const heroTitle = "Enter Subject Marks";
    const heroDescription = requestOpen
        ? "Select the exam, class, and subject, request the students, then enter their marks."
        : "Enter marks for each student, or reconfigure the assessment components.";

    /* ------------------------------- Render ----------------------------- */
    return (
        <>
            <Head title={heroTitle} />

            <div className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title={heroTitle}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            {heroDescription}
                        </p>
                    }
                    backHref={route("results.index")}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={requestOpen ? "outline" : "default"}
                                onClick={() => setRequestOpen((o) => !o)}
                            >
                                {requestOpen ? (
                                    <>
                                        <X className="mr-1.5 h-4 w-4" />
                                        Request Form
                                    </>
                                ) : (
                                    <>
                                        <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                                        Request List
                                    </>
                                )}
                            </Button>
                        </div>
                    }
                />

                {/* ─── Request form ─── */}
                {requestOpen && (
                    <section className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                                <FormSelect<RSOption<number>, false>
                                    id="exam_id"
                                    label="Exam"
                                    required
                                    usePortal
                                    options={examOptions}
                                    placeholder="Select exam"
                                    noOptionsMessage={() =>
                                        "No exams available"
                                    }
                                    isDisabled={loadingStudents}
                                    value={findOption(examId, examOptions)}
                                    onChange={(opt) =>
                                        changeExam(
                                            selectValue(opt) as number | null,
                                        )
                                    }
                                />
                                <FormSelect<RSOption<number>, false>
                                    id="exam_class_id"
                                    label="Class"
                                    required
                                    usePortal
                                    options={classOptions}
                                    placeholder={
                                        classOptions.length === 0
                                            ? "Select exam first"
                                            : "Select class"
                                    }
                                    isDisabled={!examId || loadingStudents}
                                    value={findOption(
                                        examClassId,
                                        classOptions,
                                    )}
                                    onChange={(opt) =>
                                        changeClass(
                                            selectValue(opt) as number | null,
                                        )
                                    }
                                />
                                <FormSelect<RSOption<number>, false>
                                    id="class_stream_id"
                                    label="Stream"
                                    usePortal
                                    isClearable
                                    options={streamOptions}
                                    placeholder={
                                        streamOptions.length === 0
                                            ? "Not applicable"
                                            : "Optional"
                                    }
                                    isDisabled={!examClassId || loadingStudents}
                                    value={findOption(
                                        classStreamId,
                                        streamOptions,
                                    )}
                                    onChange={(opt) =>
                                        changeStream(
                                            selectValue(opt) as number | null,
                                        )
                                    }
                                />
                                <FormSelect<RSOption<number>, false>
                                    id="subject_id"
                                    label="Subject"
                                    required
                                    usePortal
                                    options={subjectOptions}
                                    placeholder="Select subject"
                                    isDisabled={!examClassId || loadingStudents}
                                    value={findOption(
                                        subjectId,
                                        subjectOptions,
                                    )}
                                    onChange={(opt) =>
                                        changeSubject(
                                            selectValue(opt) as number | null,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    onClick={requestStudents}
                                    disabled={!canSubmitRequest}
                                >
                                    {loadingStudents ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-1.5 h-4 w-4" />
                                            Request Students
                                        </>
                                    )}
                                </Button>
                            </div>

                            {requestError && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{requestError}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ─── Marks table ─── */}
                {requested && requested.students.length > 0 && (
                    <section className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Marks Entry
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {requested.subject.name} (
                                        {requested.subject.code}) ·{" "}
                                        {requested.students.length} student
                                        {requested.students.length === 1
                                            ? ""
                                            : "s"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or admission number…"
                                    className="w-full sm:w-72"
                                />
                            </div>
                        </div>

                        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-dashed bg-muted/20 px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                                {hasAnyEnabled
                                    ? configLocked
                                        ? `Configuration applied — enter component scores. Total is scaled to ${config.scoreOutOf}.`
                                        : "Components detected from saved data. Review or adjust the configuration."
                                    : configLocked
                                      ? `Out-of set to ${config.scoreOutOf} — enter each student's score.`
                                      : "No assessments configured — enter each student's score (out-of is set in Configure)."}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setConfigOpen(true)}
                                disabled={submitting}
                            >
                                <Settings2 className="mr-1.5 h-4 w-4" />
                                Configure Assessments
                            </Button>
                        </div>

                        <form onSubmit={submitMarks} className="space-y-4">
                            <div className="overflow-hidden rounded-lg border">
                                <table className="min-w-full table-fixed divide-y divide-border text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">
                                                Student
                                            </th>
                                            {enabledAssessments.map((a) => (
                                                <th
                                                    key={a.key}
                                                    className="w-[110px] px-2 py-2 text-center font-semibold"
                                                >
                                                    {a.label}
                                                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                        /
                                                        {
                                                            config.components[
                                                                a.key
                                                            ].outOf
                                                        }
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="w-[110px] px-2 py-2 text-center font-semibold">
                                                Score
                                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                    /{config.scoreOutOf}
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredStudents.map((student) => {
                                            const row =
                                                rows[student.id] ?? emptyRow();
                                            const { score: displayScore } =
                                                computeDisplayScore(
                                                    row,
                                                    config,
                                                );

                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                student.admission_number
                                                            }
                                                        </div>
                                                    </td>

                                                    {enabledAssessments.map(
                                                        (a) => (
                                                            <td
                                                                key={a.key}
                                                                className="p-0 align-middle"
                                                            >
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={
                                                                        row[
                                                                            a
                                                                                .key
                                                                        ] as
                                                                            | string
                                                                            | number
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateRow(
                                                                            student.id,
                                                                            {
                                                                                [a.key]:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            } as Partial<MarksRow>,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full rounded-none border bg-background px-3 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                                />
                                                            </td>
                                                        ),
                                                    )}

                                                    {/* Score cell:
                                                        - Components on: read-only input showing the computed score
                                                        - Score-first:  editable input
                                                        Denominators live in the header only. */}
                                                    <td className="p-0 align-middle">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            value={
                                                                hasAnyEnabled
                                                                    ? (displayScore ??
                                                                      "")
                                                                    : (row.score as
                                                                          | string
                                                                          | number)
                                                            }
                                                            onChange={(e) =>
                                                                updateRow(
                                                                    student.id,
                                                                    {
                                                                        score: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            readOnly={
                                                                hasAnyEnabled
                                                            }
                                                            tabIndex={
                                                                hasAnyEnabled
                                                                    ? -1
                                                                    : 0
                                                            }
                                                            className={`h-10 w-full rounded-none border px-3 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                                                hasAnyEnabled
                                                                    ? "cursor-not-allowed bg-muted/40 text-muted-foreground"
                                                                    : "bg-background"
                                                            }`}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetAll}
                                    disabled={submitting}
                                >
                                    Clear
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-1.5 h-4 w-4" />
                                            Save Marks
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}
            </div>

            <ConfigDialog
                open={configOpen}
                config={config}
                onOpenChange={setConfigOpen}
                onConfigChange={setConfig}
                onApply={applyConfig}
            />
        </>
    );
}

MarksEntry.layout = {
    breadcrumbs: [
        { title: "Exams", href: "/exams" },
        { title: "Marks Entry", href: "#" },
    ],
};
