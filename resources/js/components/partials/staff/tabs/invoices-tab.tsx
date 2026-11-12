// resources/js/components/partials/staff/tabs/invoices-tab.tsx
import { Receipt } from "lucide-react";

import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";

interface Props {
    count: number;
}

export function InvoicesTab({ count }: Props) {
    if (count === 0) {
        return (
            <EmptyState
                icon={Receipt}
                title="No invoices handled"
                description="This staff member has not processed any invoices yet."
            />
        );
    }

    return (
        <div className="space-y-4">
            <ProfileSection title="Invoice Summary">
                <DetailRow icon={Receipt} label="Total invoices handled">
                    {formatNumber(count)}
                </DetailRow>
            </ProfileSection>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Detailed invoice records can be viewed in the main Billing
                module.
            </p>
        </div>
    );
}
