// resources/js/components/partials/student/tabs/notifications-tab.tsx
import { Bell } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { DetailRow } from "@/components/ui/detail-row";
import { ProfileSection } from "@/components/ui/profile-section";
import { formatNumber } from "@/lib/formatters";

interface NotificationsTabProps {
    count: number;
}

export function NotificationsTab({ count }: NotificationsTabProps) {
    if (count === 0) {
        return (
            <EmptyState
                icon={Bell}
                title="No notifications"
                description="This student has not received any notifications yet."
            />
        );
    }

    return (
        <div className="space-y-4">
            <ProfileSection title="Notification Summary">
                <DetailRow icon={Bell} label="Total Notifications">
                    {formatNumber(count)}
                </DetailRow>
            </ProfileSection>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Detailed notification logs can be viewed in the Communication
                module.
            </p>
        </div>
    );
}
