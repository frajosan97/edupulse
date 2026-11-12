// resources/js/components/partials/student/tabs/profile-tab.tsx
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    Clock,
    Contact,
    GraduationCap,
    Hash,
    Layers,
    Mail,
    Phone,
    School,
    ShieldCheck,
    Star,
    TrendingUp,
    User as UserIcon,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate, initialsOf } from "@/lib/formatters";
import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { StudentWithRelations } from "@/types";

interface ProfileTabProps {
    student: StudentWithRelations;
    displayName: string;
    isActive: boolean;
    statusLabel: string;
    genderLabel: string;
}

export function ProfileTab({
    student,
    displayName,
    isActive,
    statusLabel,
    genderLabel,
}: ProfileTabProps) {
    const guardians = student.parents ?? [];

    return (
        <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5">
                <ProfileSection title="Personal Information">
                    <DetailRow icon={UserIcon} label="Full Name">
                        <span className="font-medium">{displayName}</span>
                    </DetailRow>
                    <DetailRow icon={Mail} label="Email">
                        {student.user?.email ? (
                            <a
                                href={`mailto:${student.user.email}`}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {student.user.email}
                            </a>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={Phone} label="Phone">
                        {student.user?.phone ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {student.user.phone}
                            </span>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={CircleDot} label="Gender">
                        {genderLabel}
                    </DetailRow>
                    <DetailRow icon={Contact} label="Initials">
                        {initialsOf(displayName)}
                    </DetailRow>
                    <DetailRow icon={CalendarDays} label="Date of Birth">
                        {formatDate(student.date_of_birth)}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Admission Information">
                    <DetailRow icon={Hash} label="Admission #">
                        {student.admission_number}
                    </DetailRow>
                    <DetailRow icon={ClipboardList} label="Assessment #">
                        {student.assessment_number ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={CalendarDays} label="Admission Date">
                        {formatDate(student.admission_date)}
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
                </ProfileSection>

                <ProfileSection title="Guardians">
                    {guardians.length === 0 ? (
                        <div className="py-2 text-sm italic text-muted-foreground">
                            No guardians linked.
                        </div>
                    ) : (
                        guardians.map((g) => (
                            <div
                                key={g.id}
                                className="flex items-center gap-2.5 py-2"
                            >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-foreground">
                                            {g.name}
                                        </div>
                                        {g.relationship_type && (
                                            <div className="text-xs capitalize text-muted-foreground">
                                                {g.relationship_type}
                                            </div>
                                        )}
                                    </div>
                                    {g.is_primary && (
                                        <Badge className="h-5 rounded-full border-none bg-emerald-600 px-1.5 text-[10px] text-white hover:bg-emerald-600/90">
                                            Primary
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ProfileSection>
            </div>

            <div className="space-y-5">
                <ProfileSection title="Academic Placement">
                    <DetailRow icon={School} label="Class">
                        {student.class?.name ?? (
                            <span className="italic text-muted-foreground">
                                Not assigned
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={Layers} label="Stream">
                        {student.class_stream?.stream ??
                            student.class_stream?.name ?? (
                                <span className="italic text-muted-foreground">
                                    Not assigned
                                </span>
                            )}
                    </DetailRow>
                    <DetailRow icon={BookOpen} label="Curriculum">
                        {student.curriculum?.name ?? (
                            <span className="italic text-muted-foreground">
                                Not set
                            </span>
                        )}
                        {student.curriculum?.code && (
                            <span className="ml-1 text-xs text-muted-foreground">
                                ({student.curriculum.code})
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={GraduationCap} label="Pathway">
                        {student.pathway?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Academic Performance">
                    <DetailRow icon={Star} label="KCPE Marks">
                        {student.kcpe_marks ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                    <DetailRow icon={TrendingUp} label="Points">
                        {student.points ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Account">
                    <DetailRow icon={CalendarDays} label="Created">
                        {formatDate(student.created_at)}
                    </DetailRow>
                    <DetailRow icon={Clock} label="Last Updated">
                        {formatDate(student.updated_at)}
                    </DetailRow>
                    <DetailRow icon={ShieldCheck} label="Account Status">
                        {statusLabel}
                    </DetailRow>
                </ProfileSection>
            </div>
        </div>
    );
}
