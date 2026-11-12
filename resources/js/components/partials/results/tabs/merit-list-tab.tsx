import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import type { MeritRow, AnalysisFilters } from "@/types/results";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

interface Props {
    merit: MeritRow[];
    filters: AnalysisFilters;
    applyFilters: (
        overrides: Partial<AnalysisFilters> & Record<string, unknown>,
    ) => void;
}

export function AnalysisMeritListTab({ merit, filters, applyFilters }: Props) {
    const subjects = useMemo(() => {
        const map = new Map<number, { name: string; code: string }>();
        merit.forEach((student) => {
            student.result_subjects?.forEach((rs) => {
                if (!map.has(rs.subject_id)) {
                    map.set(rs.subject_id, {
                        name: rs.subject_name,
                        code: rs.subject_code,
                    });
                }
            });
        });
        return Array.from(map.entries()).sort((a, b) =>
            a[1].name.localeCompare(b[1].name),
        );
    }, [merit]);

    const getGradeColor = (grade: string | null) => {
        if (!grade) return "text-muted-foreground";
        if (grade.startsWith("E") || grade.startsWith("D"))
            return "text-rose-500";
        if (grade.startsWith("C")) return "text-amber-500";
        return "text-emerald-600";
    };

    const toggleSort = (column: string) => {
        if (filters.sort === column) {
            applyFilters({ dir: filters.dir === "asc" ? "desc" : "asc" });
        } else {
            applyFilters({ sort: column, dir: "asc" });
        }
    };

    const SortButton = ({
        label,
        column,
    }: {
        label: string;
        column: string;
    }) => {
        const isSorted = filters.sort === column;
        return (
            <button
                type="button"
                onClick={() => toggleSort(column)}
                className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
                {label}
                <span
                    className={cn(
                        "inline-flex transition-opacity",
                        isSorted
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-50",
                    )}
                >
                    {!isSorted && <ArrowUpDown className="h-3 w-3" />}
                    {isSorted && filters.dir === "asc" && (
                        <ArrowUp className="h-3 w-3 text-primary" />
                    )}
                    {isSorted && filters.dir === "desc" && (
                        <ArrowDown className="h-3 w-3 text-primary" />
                    )}
                </span>
            </button>
        );
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[60px] text-center sticky left-0 bg-muted/50 z-20">
                            <SortButton label="Pos" column="class_rank" />
                        </TableHead>
                        <TableHead className="min-w-[200px] sticky left-[60px] bg-muted/50 z-20 border-r">
                            <SortButton label="Name" column="student_name" />
                        </TableHead>

                        {subjects.map((sub) => (
                            <TableHead
                                key={sub[0]}
                                className="text-center"
                                title={sub[1].name}
                            >
                                {sub[1].code || sub[1].name.substring(0, 4)}
                            </TableHead>
                        ))}

                        <TableHead className="text-center border-l bg-muted/30">
                            <SortButton label="Marks" column="total_marks" />
                        </TableHead>
                        <TableHead className="text-center bg-muted/30">
                            <SortButton label="Mean" column="mean_marks" />
                        </TableHead>
                        <TableHead className="text-center bg-muted/30">
                            <SortButton label="Points" column="total_points" />
                        </TableHead>
                        <TableHead className="text-center bg-muted/30">
                            <SortButton label="Grade" column="mean_grade" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {merit.map((student, idx) => (
                        <TableRow
                            key={student.id}
                            className={cn(
                                idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                                "hover:bg-muted/50 transition-colors group h-16",
                            )}
                        >
                            <TableCell
                                className={cn(
                                    "text-center font-bold text-muted-foreground sticky left-0 z-10",
                                    idx % 2 === 0
                                        ? "bg-background group-hover:bg-muted/50"
                                        : "bg-muted/20 group-hover:bg-muted/50",
                                )}
                            >
                                {student.class_rank ?? idx + 1}
                            </TableCell>

                            <TableCell
                                className={cn(
                                    "sticky left-[60px] z-10 border-r",
                                    idx % 2 === 0
                                        ? "bg-background group-hover:bg-muted/50"
                                        : "bg-muted/20 group-hover:bg-muted/50",
                                )}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">
                                        {student.student_name}
                                    </span>
                                    <span className="text-xs text-pink-600/70 dark:text-pink-400">
                                        {student.admission_number || "—"}
                                    </span>
                                </div>
                            </TableCell>

                            {subjects.map((sub) => {
                                const result = student.result_subjects?.find(
                                    (rs) => rs.subject_id === sub[0],
                                );
                                if (!result || result.score === null) {
                                    return (
                                        <TableCell
                                            key={sub[0]}
                                            className="text-center text-muted-foreground"
                                        >
                                            --
                                        </TableCell>
                                    );
                                }
                                return (
                                    <TableCell
                                        key={sub[0]}
                                        className="text-center p-2"
                                    >
                                        <span className="text-sm">
                                            {result.score}
                                        </span>{" "}
                                        <span
                                            className={cn(
                                                "text-xs font-bold ml-1",
                                                getGradeColor(result.grade),
                                            )}
                                        >
                                            {result.grade}
                                        </span>
                                    </TableCell>
                                );
                            })}

                            <TableCell className="text-center font-bold bg-muted/10 group-hover:bg-muted/50 border-l">
                                {formatNumber(Number(student.total_marks))}
                            </TableCell>
                            <TableCell className="text-center font-semibold bg-muted/10 group-hover:bg-muted/50">
                                {formatNumber(Number(student.mean_marks))}
                            </TableCell>
                            <TableCell className="text-center font-semibold bg-muted/10 group-hover:bg-muted/50">
                                {formatNumber(Number(student.total_points))}
                            </TableCell>
                            <TableCell className="text-center bg-muted/10 group-hover:bg-muted/50">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "font-bold",
                                        student.mean_grade?.startsWith("A")
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : student.mean_grade?.startsWith(
                                                    "B",
                                                )
                                              ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                                              : student.mean_grade?.startsWith(
                                                      "C",
                                                  )
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20",
                                    )}
                                >
                                    {student.mean_grade}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {merit.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={subjects.length + 7}
                                className="h-[14rem] text-center"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="rounded-2xl bg-muted p-4">
                                        <Search className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground">
                                            No results found
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Try adjusting your search or grade
                                            filter.
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
