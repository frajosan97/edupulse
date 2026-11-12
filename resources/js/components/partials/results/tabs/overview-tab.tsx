import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import type {
    ClassSummary,
    ClassImprovement,
    ClassDistribution,
    SubjectStat,
} from "@/types/results";

interface Props {
    summary: ClassSummary;
    subjects: SubjectStat[];
    distribution: ClassDistribution;
    improvement: ClassImprovement;
}

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6"];

export function AnalysisOverviewTab({ subjects, distribution }: Props) {
    // 1. Prepare Subject Data for Bar Chart
    const subjectData = useMemo(() => {
        return [...subjects]
            .sort((a, b) => b.mean_marks - a.mean_marks)
            .map((s) => ({
                name: s.subject_code || s.subject_name,
                Mean: s.mean_marks,
                PassRate: s.pass_rate,
            }));
    }, [subjects]);

    // 2. Prepare Overall Grade Data for Pie Chart
    const gradeData = useMemo(() => {
        const overall = Object.values(distribution.overall)[0];
        if (!overall) return [];
        return Object.entries(overall.distribution)
            .filter(([_, count]) => count > 0)
            .map(([grade, count]) => ({ name: grade, value: count }));
    }, [distribution.overall]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" /> Subject
                            Performance
                        </CardTitle>
                        <CardDescription>
                            Mean score per subject
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={subjectData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{ borderRadius: "8px" }}
                                />
                                <Bar
                                    dataKey="Mean"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5" /> Grade Distribution
                        </CardTitle>
                        <CardDescription>
                            Overall spread of grades
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gradeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                >
                                    {gradeData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: "8px" }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
