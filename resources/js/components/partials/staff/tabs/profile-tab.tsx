// resources/js/components/partials/staff/tabs/profile-tab.tsx
import {
    BookOpen,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    Clock,
    Contact,
    CreditCard,
    GraduationCap,
    Mail,
    Phone,
    Receipt,
    School,
    ShieldCheck,
    Star,
    User as UserIcon,
    Users,
    Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, initialsOf } from "@/lib/formatters";
import type { Staff, StaffTeacherProfile } from "@/types/staff";

interface Props {
    staff: Staff;
    teacher: StaffTeacherProfile | null;
    isActive: boolean;
    statusLabel: string;
    showTeaching: boolean;
    showFinance: boolean;
}

export function ProfileTab({
    staff,
    teacher,
    isActive,
    statusLabel,
    showTeaching,
    showFinance,
}: Props) {
    const counts = staff.teaching?.counts;

    const qualificationsLabel = (() => {
        const q = teacher?.qualifications;
        if (q == null) return null;
        if (Array.isArray(q)) return q.length > 0 ? q.join(", ") : null;
        if (typeof q === "string") return q.trim() || null;
        return String(q);
    })();

    return (
        <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5">
                <ProfileSection title="Personal Information">
                    <DetailRow icon={UserIcon} label="Full Name">
                        <span className="font-medium">{staff.name}</span>
                    </DetailRow>
                    <DetailRow icon={Mail} label="Email">
                        <a
                            href={`mailto:${staff.email}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            {staff.email}
                        </a>
                    </DetailRow>
                    <DetailRow icon={Phone} label="Phone">
                        {staff.phone ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {staff.phone}
                            </span>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={CircleDot} label="Gender">
                        {staff.gender_label ?? "N/A"}
                    </DetailRow>
                    <DetailRow icon={Contact} label="Initials">
                        {initialsOf(staff.name)}
                    </DetailRow>
                    <DetailRow icon={Building2} label="Department">
                        {teacher?.department ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Employment Information">
                    <DetailRow icon={Briefcase} label="Employee ID">
                        {teacher?.employee_id ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={ShieldCheck} label="Roles">
                        {staff.roles_options.length > 0 ? (
                            staff.roles_options.map((r) => r.label).join(", ")
                        ) : (
                            <span className="italic text-muted-foreground">
                                None
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={CheckCircle2} label="Status">
                        <Badge
                            className={cn(
                                "rounded-full border-none px-2 py-0.5 text-xs font-semibold",
                                isActive
                                    ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                                    : "bg-amber-500 text-white hover:bg-amber-500/90",
                            )}
                        >
                            {statusLabel}
                        </Badge>
                    </DetailRow>
                    <DetailRow icon={CalendarDays} label="Joining Date">
                        {formatDate(teacher?.joining_date ?? staff.created_at)}
                    </DetailRow>
                </ProfileSection>
            </div>

            <div className="space-y-5">
                {showTeaching && (
                    <ProfileSection title="Teaching Information">
                        <DetailRow icon={BookOpen} label="Total Subjects">
                            {formatNumber(counts?.subjects ?? 0)}
                        </DetailRow>
                        <DetailRow icon={Users} label="Total Students">
                            {formatNumber(counts?.students ?? 0)}
                        </DetailRow>
                        <DetailRow
                            icon={ClipboardList}
                            label="Total Assignments"
                        >
                            {formatNumber(counts?.assignments ?? 0)}
                        </DetailRow>
                        <DetailRow icon={School} label="Total Classes">
                            {formatNumber(counts?.classes ?? 0)}
                        </DetailRow>
                        <DetailRow icon={Users} label="Total Streams">
                            {formatNumber(counts?.streams ?? 0)}
                        </DetailRow>
                    </ProfileSection>
                )}

                {showFinance && (
                    <ProfileSection title="Finance Information">
                        <DetailRow icon={Receipt} label="Invoices">
                            {formatNumber(staff.invoices_count ?? 0)}
                        </DetailRow>
                        <DetailRow icon={Wallet} label="Payments">
                            {formatNumber(staff.payments_count ?? 0)}
                        </DetailRow>
                        <DetailRow icon={CreditCard} label="Expenses">
                            {formatNumber(staff.expenses_count ?? 0)}
                        </DetailRow>
                    </ProfileSection>
                )}

                {showTeaching && (
                    <ProfileSection title="Qualifications & Specialization">
                        <DetailRow icon={GraduationCap} label="Qualifications">
                            {qualificationsLabel ?? (
                                <span className="italic text-muted-foreground">
                                    N/A
                                </span>
                            )}
                        </DetailRow>
                        <DetailRow icon={Star} label="Specialization">
                            {teacher?.specialization ?? (
                                <span className="italic text-muted-foreground">
                                    N/A
                                </span>
                            )}
                        </DetailRow>
                    </ProfileSection>
                )}

                <ProfileSection title="Additional Information">
                    <DetailRow icon={CalendarDays} label="Created">
                        {formatDate(staff.created_at)}
                    </DetailRow>
                    <DetailRow icon={Clock} label="Last Updated">
                        {formatDate(staff.updated_at)}
                    </DetailRow>
                </ProfileSection>
            </div>
        </div>
    );
}
