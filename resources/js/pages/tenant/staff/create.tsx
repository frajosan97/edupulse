// resources/js/pages/tenant/staff/create.tsx

import { StaffForm } from "@/components/forms/staff-form";
import type { Gender, RoleOption, StaffStatus } from "@/types/staff";

interface Props {
    roles: RoleOption[];
    genders: Gender[];
    statuses: StaffStatus[];
}

export default function StaffCreate({ roles, genders, statuses }: Props) {
    return (
        <StaffForm
            mode="create"
            roles={roles}
            genders={genders}
            statuses={statuses}
        />
    );
}

StaffCreate.layout = {
    breadcrumbs: [
        { title: "Staff", href: "/staff" },
        { title: "Create", href: "/staff/create" },
    ],
};
