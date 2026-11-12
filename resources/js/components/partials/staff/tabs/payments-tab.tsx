// resources/js/components/partials/staff/tabs/payments-tab.tsx
import { Wallet } from "lucide-react";

import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";

interface Props {
    count: number;
}

export function PaymentsTab({ count }: Props) {
    if (count === 0) {
        return (
            <EmptyState
                icon={Wallet}
                title="No payments recorded"
                description="This staff member has not recorded any payments yet."
            />
        );
    }

    return (
        <div className="space-y-4">
            <ProfileSection title="Payment Summary">
                <DetailRow icon={Wallet} label="Total payments recorded">
                    {formatNumber(count)}
                </DetailRow>
            </ProfileSection>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Detailed payment records can be viewed in the main Billing
                module.
            </p>
        </div>
    );
}
