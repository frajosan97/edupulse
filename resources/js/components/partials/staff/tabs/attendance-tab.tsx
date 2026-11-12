// resources/js/components/partials/staff/tabs/attendance-tab.tsx
import { CalendarCheck } from "lucide-react";

import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";

interface Props {
    count: number;
}

export function AttendanceTab({ count }: Props) {
    if (count === 0) {
        return (
            <EmptyState
                icon={CalendarCheck}
                title="No attendance records"
                description="This staff member does not have any attendance logs recorded yet."
            />
        );
    }

    return (
        <div className="space-y-4">
            <ProfileSection title="Attendance Summary">
                <DetailRow icon={CalendarCheck} label="Total days logged">
                    {formatNumber(count)}
                </DetailRow>
            </ProfileSection>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Detailed attendance records can be viewed in the main
                HR/Attendance module.
            </p>
        </div>
    );
}
