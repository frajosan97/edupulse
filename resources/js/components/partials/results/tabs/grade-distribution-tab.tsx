import { PieChart } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import type { ClassDistribution, GroupBucket } from "@/types/results";

interface Props {
    distribution: ClassDistribution;
}

export function AnalysisGradeDistributionTab({ distribution }: Props) {
    // Extract grade keys (A, A-, B+, etc.) from the backend payload
    const firstBucket = Object.values(distribution.overall)[0];
    const gradeKeys = firstBucket ? Object.keys(firstBucket.distribution) : [];

    // Get all subject names to set the first one as the default open accordion
    const subjectNames = Object.keys(distribution.subjects);
    const defaultOpenSubject =
        subjectNames.length > 0 ? subjectNames[0] : undefined;

    const renderRow = (
        label: string,
        bucket: GroupBucket,
        isSubRow = false,
    ) => (
        <TableRow
            className={cn(
                isSubRow
                    ? "bg-slate-50/50 hover:bg-slate-50"
                    : "bg-white hover:bg-slate-50",
            )}
        >
            <TableCell className="font-semibold text-slate-700">
                {label}
            </TableCell>
            {gradeKeys.map((g) => (
                <TableCell
                    key={g}
                    className="text-center text-sm text-slate-600"
                >
                    {bucket.distribution[g] || 0}
                </TableCell>
            ))}
            <TableCell className="text-center font-bold text-slate-800">
                {bucket.total_students}
            </TableCell>
            <TableCell className="text-center font-bold text-slate-800">
                {formatNumber(bucket.mean_marks)}
            </TableCell>
            <TableCell className="text-center font-bold text-slate-800">
                {bucket.mean_grade}
            </TableCell>
            <TableCell className="text-slate-500">
                {bucket.teacher_name || "N/A"}
            </TableCell>
        </TableRow>
    );

    return (
        <div className="space-y-8">
            {/* 1. OVERALL DISTRIBUTION */}
            <div>
                <div className="flex items-center gap-2 bg-slate-100 p-3 border border-b-0">
                    <PieChart className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wide">
                        Overall Performance Distribution
                    </h3>
                </div>
                <div className="border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white">
                                <TableHead className="font-bold text-slate-800 min-w-[150px]">
                                    Class/Stream
                                </TableHead>
                                {gradeKeys.map((g) => (
                                    <TableHead
                                        key={g}
                                        className="text-center font-bold text-slate-800"
                                    >
                                        {g}
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-bold text-slate-800">
                                    Total
                                </TableHead>
                                <TableHead className="text-center font-bold text-slate-800">
                                    Mean
                                </TableHead>
                                <TableHead className="text-center font-bold text-slate-800">
                                    Grade
                                </TableHead>
                                <TableHead className="font-bold text-slate-800">
                                    Teacher
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Main Class Row */}
                            {Object.entries(distribution.overall).map(
                                ([groupName, bucket]) =>
                                    renderRow(groupName, bucket),
                            )}

                            {/* Gender/Stream Rows */}
                            {Object.entries(distribution.gender).map(
                                ([gender, bucket]) =>
                                    renderRow(gender, bucket, true),
                            )}
                            {Object.entries(distribution.streams).map(
                                ([stream, bucket]) =>
                                    renderRow(stream, bucket, true),
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* 2. SUBJECT-WISE DISTRIBUTION */}
            <div>
                <div className="flex items-center gap-2 bg-slate-100 p-3 border border-b-0">
                    <PieChart className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800 uppercase tracking-wide">
                        Subject-Wise Distribution
                    </h3>
                </div>

                {/* Changed to type="single" so only one opens, and set defaultValue to the first subject */}
                <Accordion
                    type="single"
                    collapsible
                    defaultValue={defaultOpenSubject}
                    className="w-full"
                >
                    {Object.entries(distribution.subjects).map(
                        ([subjectName, bucket]) => (
                            <AccordionItem
                                key={subjectName}
                                value={subjectName}
                                className="border-b border-x border-t-0 rounded-none bg-white overflow-hidden shadow-none"
                            >
                                <AccordionTrigger className="rounded-none hover:no-underline px-4 py-3 bg-indigo-100/50 hover:bg-indigo-100/80 transition-colors data-[state=open]:border-b">
                                    <div className="flex items-center gap-3 w-full pr-4">
                                        <span className="font-bold text-indigo-900">
                                            {subjectName}
                                        </span>
                                        <span className="text-xs bg-slate-800 text-white font-medium px-2 py-1 rounded-md ml-auto">
                                            {bucket.total_students} group(s)
                                        </span>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pt-0 pb-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-white">
                                                    <TableHead className="font-bold text-slate-800 min-w-[150px]">
                                                        Group
                                                    </TableHead>
                                                    {gradeKeys.map((g) => (
                                                        <TableHead
                                                            key={g}
                                                            className="text-center font-bold text-slate-800"
                                                        >
                                                            {g}
                                                        </TableHead>
                                                    ))}
                                                    <TableHead className="text-center font-bold text-slate-800">
                                                        Total
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-800">
                                                        Mean
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-800">
                                                        Grade
                                                    </TableHead>
                                                    <TableHead className="font-bold text-slate-800">
                                                        Teacher
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {renderRow(subjectName, bucket)}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ),
                    )}
                </Accordion>
            </div>
        </div>
    );
}
