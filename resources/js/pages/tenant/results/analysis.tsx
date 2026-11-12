// resources/js/pages/tenant/results/analysis.tsx
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Award,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    LayoutDashboard,
    Layers,
    Power,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";

import { AnalysisOverviewTab } from "@/components/partials/results/tabs/overview-tab";
import { AnalysisMeritListTab } from "@/components/partials/results/tabs/merit-list-tab";
import { AnalysisGradeDistributionTab } from "@/components/partials/results/tabs/grade-distribution-tab";

import type {
    MeritRow,
    SubjectStat,
    ClassDistribution,
    ClassSummary,
    ClassImprovement,
    AnalysisFilters,
} from "@/types";
import type {
    Exam,
    ExamClass,
    ExamStatus,
    ExamStatusColor,
} from "@/types/exam";
import type { LaravelPaginator } from "@/components/data-table/types";

const easeOut = [0.16, 1, 0.3, 1] as const;
const pageSizeOptions = [10, 25, 50, 100];

type Tab = "overview" | "merit" | "distribution";

/** Fields the analysis page needs from the shared `Exam` type. */
type ExamSummary = Pick<
    Exam,
    | "id"
    | "name"
    | "code"
    | "term_id"
    | "status"
    | "status_label"
    | "status_color"
    | "is_published"
>;

/** Fields the analysis page needs from the shared `ExamClass` type. */
type ClassSummaryRef = Pick<ExamClass, "id"> & { name: string };

interface Props {
    exam: ExamSummary;
    class: ClassSummaryRef;
    merit: LaravelPaginator<MeritRow>;
    subjects: SubjectStat[];
    distribution: ClassDistribution;
    improvement: ClassImprovement;
    top: MeritRow[];
    summary: ClassSummary;
    filters: AnalysisFilters;
}

const STATUS_BADGE: Record<ExamStatusColor, string> = {
    green: "bg-[#16a34a] hover:bg-[#16a34a]/90",
    blue: "bg-sky-600 hover:bg-sky-600/90",
    gray: "bg-slate-500 hover:bg-slate-500/90",
    yellow: "bg-[#eab308] hover:bg-[#eab308]/90",
    red: "bg-destructive hover:bg-destructive/90",
};

/**
 * Total map from status → colour. Mirrors `Exam::statusColor()` on the
 * backend so a missing `status_color` still renders the correct badge.
 * `Record<ExamStatus, ...>` guarantees the compiler fails if a new status
 * is ever added without assigning it a colour here.
 */
const STATUS_COLOR_FALLBACK: Record<ExamStatus, ExamStatusColor> = {
    draft: "yellow",
    scheduled: "blue",
    in_progress: "yellow",
    published: "green",
    archived: "gray",
};

function humaniseStatus(status: ExamStatus | undefined): string {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

export default function ResultsAnalysis({
    exam,
    class: classData,
    merit,
    subjects,
    distribution,
    improvement,
    top,
    summary,
    filters,
}: Props) {
    const [tab, setTab] = useState<Tab>("overview");
    const [search, setSearch] = useState<string>(filters.search || "");
    const [processing, setProcessing] = useState(false);

    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    // ─── Status badge derivation ────────────────────────────────
    const statusLabel = exam.status_label ?? humaniseStatus(exam.status);

    const statusColor: ExamStatusColor =
        exam.status_color ??
        (exam.status ? STATUS_COLOR_FALLBACK[exam.status] : "gray");

    // Backend-driven grade options
    const gradeOptions = useMemo(() => {
        const first = Object.values(distribution.overall)[0];
        return first ? Object.keys(first.distribution) : [];
    }, [distribution.overall]);

    // Core filter application logic (copied from DataTable pattern)
    const applyFilters = useCallback(
        (
            overrides: Partial<AnalysisFilters> & Record<string, unknown> = {},
        ) => {
            const payload: Record<string, unknown> = {
                ...filters,
                ...overrides,
                search, // always use the local state search
            };

            router.get(
                route("results.analysis", {
                    exam: exam.id,
                    class: classData.id,
                }),
                payload as any,
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onStart: () => setProcessing(true),
                    onFinish: () => setProcessing(false),
                },
            );
        },
        [filters, search, exam.id, classData.id],
    );

    // Debounced search (copied from DataTable pattern)
    useEffect(() => {
        if (search === filters.search) return;
        const t = setTimeout(() => applyFilters({ search }), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const hasFilters = useMemo(
        () =>
            filters.search !== "" ||
            filters.grade !== "" ||
            filters.sort !== "class_rank" ||
            filters.dir !== "asc",
        [filters],
    );

    /* Stat Cards */
    const statCards: StatCardData[] = [
        {
            id: "students",
            label: "Total Students",
            value: summary.total_students.toString(),
            hint: `${summary.total_published} published · ${summary.total_unpublished} pending`,
            icon: GraduationCap,
            accent: true,
        },
        {
            id: "mean_marks",
            label: "Mean Marks",
            value: formatNumber(summary.mean_marks),
            hint: `Mean points: ${formatNumber(summary.mean_points)}`,
            icon: Award,
        },
        {
            id: "mean_grade",
            label: "Mean Grade",
            value: summary.mean_grade || "N/A",
            hint: summary.class_comment,
            icon: BookOpen,
        },
        {
            id: "pass_rate",
            label: "Pass Rate",
            value: `${formatNumber(summary.pass_rate)}%`,
            hint: `${summary.pass_count} of ${summary.total_students} passed`,
            icon: CheckCircle2,
        },
    ];

    const tabs: { id: Tab; label: string; icon: typeof Award }[] = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "merit", label: "Merit List", icon: Award },
        { id: "distribution", label: "Grade Distribution", icon: Layers },
    ];

    return (
        <>
            <Head title={`Analysis - ${exam.name}`} />
            <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 md:p-6">
                <PageHeader
                    title={`${classData.name} - ${exam.name}`}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <BookOpen className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <Badge className="rounded-md bg-sky-500 px-2 py-0.5 text-xs font-semibold text-white">
                                {exam.code || "TERM"}
                            </Badge>
                            <Badge
                                className={cn(
                                    "ml-2 rounded-full px-3 py-1 font-semibold text-white border-none",
                                    STATUS_BADGE[statusColor],
                                )}
                            >
                                <Power className="mr-1.5 h-3.5 w-3.5" />
                                {statusLabel}
                            </Badge>
                        </>
                    }
                    backHref={route("exams.show", { exam: exam.id })}
                />

                <StatsCards data={[...statCards]} cols={4} />

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
                    className="rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex items-center justify-between border-b px-3">
                        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden">
                            {tabs.map((t) => {
                                const Icon = t.icon;
                                const active = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTab(t.id)}
                                        className={cn(
                                            "relative flex items-center gap-2 whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors",
                                            active
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {t.label}
                                        {active && (
                                            <motion.div
                                                layoutId="analysis-tab-underline"
                                                className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="min-h-[500px] bg-muted/10 p-4 md:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15, ease: easeOut }}
                            >
                                {tab === "overview" && (
                                    <AnalysisOverviewTab
                                        summary={summary}
                                        subjects={subjects}
                                        distribution={distribution}
                                        improvement={improvement}
                                    />
                                )}

                                {tab === "merit" && (
                                    <div className="space-y-5">
                                        {/* Toolbar copied exactly from DataTable */}
                                        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm md:flex-row md:items-center">
                                            <div className="relative w-full md:max-w-sm">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search by name or adm no…"
                                                    value={search}
                                                    onChange={(e) =>
                                                        setSearch(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 border-border bg-muted/50 pl-9 focus-visible:bg-background"
                                                />
                                                {search && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSearch("")
                                                        }
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                                                {/* Grade Filter added as a Toolbar item */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        Grade
                                                    </span>
                                                    <Select
                                                        value={
                                                            filters.grade ||
                                                            "all"
                                                        }
                                                        onValueChange={(v) =>
                                                            applyFilters({
                                                                grade:
                                                                    v === "all"
                                                                        ? ""
                                                                        : v,
                                                                page: 1,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9 w-[100px] border-border bg-background text-xs">
                                                            <SelectValue placeholder="All" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value="all"
                                                                className="text-xs"
                                                            >
                                                                All
                                                            </SelectItem>
                                                            {gradeOptions.map(
                                                                (g) => (
                                                                    <SelectItem
                                                                        key={g}
                                                                        value={
                                                                            g
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {g}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Clear Button matching DataTable */}
                                                <AnimatePresence>
                                                    {hasFilters && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.9,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                scale: 0.9,
                                                            }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSearch(
                                                                        "",
                                                                    );
                                                                    router.get(
                                                                        route(
                                                                            "results.analysis",
                                                                            {
                                                                                exam: exam.id,
                                                                                class: classData.id,
                                                                            },
                                                                        ),
                                                                        {
                                                                            page: 1,
                                                                        } as any,
                                                                        {
                                                                            preserveScroll: true,
                                                                            replace: true,
                                                                        },
                                                                    );
                                                                }}
                                                                className="h-9 text-muted-foreground"
                                                            >
                                                                <X className="mr-1.5 h-3.5 w-3.5" />
                                                                Clear
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Custom Table Container matching DataTable's table wrapper */}
                                        <div className="relative w-full min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                                            {processing && (
                                                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
                                                    <motion.div
                                                        className="h-full w-1/3 bg-primary"
                                                        animate={{
                                                            x: [
                                                                "-100%",
                                                                "300%",
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            repeat: Infinity,
                                                            ease: "linear",
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <AnalysisMeritListTab
                                                merit={merit.data}
                                                filters={filters}
                                                applyFilters={applyFilters}
                                            />

                                            {/* Footer copied exactly from DataTable */}
                                            <div className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">
                                                            Rows per page
                                                        </span>
                                                        <Select
                                                            value={String(
                                                                filters.per_page ??
                                                                    50,
                                                            )}
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                applyFilters({
                                                                    per_page:
                                                                        Number(
                                                                            v,
                                                                        ),
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 w-[72px] border-border bg-background text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {pageSizeOptions.map(
                                                                    (n) => (
                                                                        <SelectItem
                                                                            key={
                                                                                n
                                                                            }
                                                                            value={String(
                                                                                n,
                                                                            )}
                                                                            className="text-xs"
                                                                        >
                                                                            {n}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <span className="hidden text-xs text-muted-foreground sm:inline">
                                                        •
                                                    </span>
                                                    <span className="text-xs">
                                                        Showing{" "}
                                                        <span className="font-semibold text-foreground">
                                                            {merit.from ?? 0}
                                                        </span>{" "}
                                                        to{" "}
                                                        <span className="font-semibold text-foreground">
                                                            {merit.to ?? 0}
                                                        </span>{" "}
                                                        of{" "}
                                                        <span className="font-semibold text-foreground">
                                                            {merit.total}
                                                        </span>{" "}
                                                        results
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={
                                                            merit.current_page ===
                                                            1
                                                        }
                                                        onClick={() =>
                                                            router.get(
                                                                merit.links[0]
                                                                    .url || "",
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <ChevronsLeft className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={
                                                            merit.current_page ===
                                                            1
                                                        }
                                                        onClick={() =>
                                                            router.get(
                                                                merit.links.find(
                                                                    (l) =>
                                                                        decodeLabel(
                                                                            l.label,
                                                                        )
                                                                            .toLowerCase()
                                                                            .includes(
                                                                                "previous",
                                                                            ),
                                                                )?.url || "",
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    </Button>

                                                    <div className="flex items-center gap-1">
                                                        {merit.current_page >
                                                            2 && (
                                                            <span className="text-xs px-2 text-muted-foreground">
                                                                ...
                                                            </span>
                                                        )}
                                                        {merit.current_page >
                                                            1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 min-w-8 text-xs"
                                                                onClick={() =>
                                                                    router.get(
                                                                        merit
                                                                            .links[
                                                                            merit.current_page -
                                                                                1
                                                                        ]
                                                                            ?.url ||
                                                                            "",
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {merit.current_page -
                                                                    1}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 min-w-8 text-xs bg-primary text-primary-foreground"
                                                        >
                                                            {merit.current_page}
                                                        </Button>
                                                        {merit.current_page <
                                                            merit.last_page && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 min-w-8 text-xs"
                                                                onClick={() =>
                                                                    router.get(
                                                                        merit
                                                                            .links[
                                                                            merit.current_page +
                                                                                1
                                                                        ]
                                                                            ?.url ||
                                                                            "",
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {merit.current_page +
                                                                    1}
                                                            </Button>
                                                        )}
                                                        {merit.current_page <
                                                            merit.last_page -
                                                                1 && (
                                                            <span className="text-xs px-2 text-muted-foreground">
                                                                ...
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={
                                                            merit.current_page ===
                                                            merit.last_page
                                                        }
                                                        onClick={() =>
                                                            router.get(
                                                                merit.links.find(
                                                                    (l) =>
                                                                        decodeLabel(
                                                                            l.label,
                                                                        )
                                                                            .toLowerCase()
                                                                            .includes(
                                                                                "next",
                                                                            ),
                                                                )?.url || "",
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={
                                                            merit.current_page ===
                                                            merit.last_page
                                                        }
                                                        onClick={() =>
                                                            router.get(
                                                                merit.links[
                                                                    merit.links
                                                                        .length -
                                                                        1
                                                                ].url || "",
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <ChevronsRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {tab === "distribution" && (
                                    <AnalysisGradeDistributionTab
                                        distribution={distribution}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

ResultsAnalysis.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Exams", href: "/exams" },
        { title: props.exam?.name ?? "Exam", href: `/exams/${props.exam?.id}` },
        { title: "Analysis", href: "#" },
    ],
});
