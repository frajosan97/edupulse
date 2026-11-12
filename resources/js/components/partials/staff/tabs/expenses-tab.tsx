// resources/js/components/partials/staff/tabs/expenses-tab.tsx
import { CreditCard } from "lucide-react";

import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/formatters";

interface Props {
    count: number;
}

export function ExpensesTab({ count }: Props) {
    if (count === 0) {
        return (
            <EmptyState
                icon={CreditCard}
                title="No expenses logged"
                description="This staff member has not logged any expenses yet."
            />
        );
    }

    return (
        <div className="space-y-4">
            <ProfileSection title="Expense Summary">
                <DetailRow icon={CreditCard} label="Total expenses logged">
                    {formatNumber(count)}
                </DetailRow>
            </ProfileSection>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Detailed expense records can be viewed in the main Finance
                module.
            </p>
        </div>
    );
}
