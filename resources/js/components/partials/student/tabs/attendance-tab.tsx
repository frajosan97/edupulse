// resources/js/components/partials/student/tabs/attendance-tab.tsx
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";

interface AttendanceTabProps {
    present: number;
    absent: number;
    total: number;
    rate: number | null;
}

export function AttendanceTab({
    present,
    absent,
    total,
    rate,
}: AttendanceTabProps) {
    if (total === 0) {
        return (
            <EmptyState
                icon={CalendarCheck}
                title="No attendance records"
                description="Attendance will appear here once the student has been marked present or absent."
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/60 px-3 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Present
                    </div>
                    <div className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatNumber(present)}
                    </div>
                </div>
                <div className="rounded-lg border border-rose-200/60 bg-rose-50/60 px-3 py-3 dark:border-rose-900/40 dark:bg-rose-950/30">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        Absent
                    </div>
                    <div className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-400">
                        {formatNumber(absent)}
                    </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        Rate
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                        {rate == null ? "—" : `${rate}%`}
                    </div>
                </div>
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
                Detailed daily attendance is available in the Attendance module.
            </p>
        </div>
    );
}
