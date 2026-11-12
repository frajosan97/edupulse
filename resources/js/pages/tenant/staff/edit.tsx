// resources/js/pages/tenant/staff/edit.tsx

import { StaffForm } from "@/components/forms/staff-form";
import type { Gender, RoleOption, Staff, StaffStatus } from "@/types/staff";

interface Props {
    staff: Staff;
    roles: RoleOption[];
    genders: Gender[];
    statuses: StaffStatus[];
}

export default function StaffEdit({ staff, roles, genders, statuses }: Props) {
    return (
        <StaffForm
            mode="edit"
            staff={staff}
            roles={roles}
            genders={genders}
            statuses={statuses}
        />
    );
}

StaffEdit.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Staff", href: "/staff" },
        { title: props.staff?.name ?? "Staff", href: "/staff/edit" },
    ],
});
