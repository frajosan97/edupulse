// resources/js/components/partials/student/tabs/assessments-tab.tsx
import { ClipboardList, Percent, Star } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";

interface AssessmentsTabProps {
    count: number;
    avgPoints: number | null;
    avgGrade: string | null;
}

export function AssessmentsTab({
    count,
    avgPoints,
    avgGrade,
}: AssessmentsTabProps) {
    if (count === 0) {
        return (
            <EmptyState
                icon={ClipboardList}
                title="No assessments recorded"
                description="Assessment results will appear here once they are entered in the Academics module."
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 px-3 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ClipboardList className="h-3.5 w-3.5" />
                        Assessments
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                        {formatNumber(count)}
                    </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Percent className="h-3.5 w-3.5" />
                        Average Points
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                        {formatNumber(avgPoints, 1)}
                    </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Star className="h-3.5 w-3.5" />
                        Average Grade
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                        {avgGrade ?? "—"}
                    </div>
                </div>
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
                Full per-assessment breakdown is available in the Academics
                module.
            </p>
        </div>
    );
}
