// resources/js/pages/tenant/students/show.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ClipboardList,
    Info,
    Loader2,
    Pencil,
    Receipt,
    School,
    Trash2,
    User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import type { StudentShowTab, StudentWithRelations } from "@/types/student";

import { ProfileTab } from "@/components/partials/student/tabs/profile-tab";
import { SubjectsTab } from "@/components/partials/student/tabs/subjects-tab";
import { AssessmentsTab } from "@/components/partials/student/tabs/assessments-tab";
import { FeesTab } from "@/components/partials/student/tabs/fees-tab";
import { AttendanceTab } from "@/components/partials/student/tabs/attendance-tab";
import { NotificationsTab } from "@/components/partials/student/tabs/notifications-tab";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    student: StudentWithRelations;
}

export default function StudentShow({ student }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tab, setTab] = useState<StudentShowTab>("profile");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route("students.destroy", student.id), {
            onSuccess: () =>
                toast.success(`"${student.user?.name ?? "Student"}" removed.`),
            onError: () => toast.error("Failed to delete student."),
            onFinish: () => setDeleting(false),
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    const displayName = student.user?.name ?? "Student";
    const isActive = student.user?.status === "active";
    const statusLabel =
        student.user?.status_label ?? (isActive ? "Active" : "Inactive");
    const genderLabel = student.user?.gender_label ?? "—";

    const subjectsCount =
        student.subjects_count ?? student.subjects?.length ?? 0;
    const subjects = student.subjects ?? [];

    const assessmentsCount = student.assessments_count ?? 0;
    const avgPoints = student.assessments_average_points ?? null;
    const avgGrade = student.assessments_average_grade ?? null;

    const feesBilled = student.fees_billed ?? null;
    const feesPaid = student.fees_paid ?? null;
    const feesBalance =
        student.fees_balance ??
        (feesBilled != null && feesPaid != null
            ? Math.max(0, feesBilled - feesPaid)
            : null);

    const attendancePresent = student.attendance_present ?? 0;
    const attendanceAbsent = student.attendance_absent ?? 0;
    const attendanceTotal =
        student.attendance_total ?? attendancePresent + attendanceAbsent;
    const attendanceRate =
        attendanceTotal > 0
            ? Math.round((attendancePresent / attendanceTotal) * 100)
            : null;

    const notificationsCount =
        student.notifications_count ?? student.notifications?.length ?? 0;

    const transactions = student.transactions ?? [];

    const statCards: StatCardData[] = [
        {
            id: "subjects",
            label: "Total Subjects",
            value: formatNumber(subjectsCount),
            hint:
                subjectsCount === 1 ? "Subject enrolled" : "Subjects enrolled",
            icon: BookOpen,
            accent: true,
        },
        {
            id: "assessments",
            label: "Assessments",
            value: formatNumber(assessmentsCount),
            hint:
                assessmentsCount === 0
                    ? "No assessments yet"
                    : `${formatNumber(avgPoints, 1)} pts · ${avgGrade ?? "—"}`,
            icon: ClipboardList,
        },
        {
            id: "fees",
            label: "Fees",
            value: formatCurrency(feesBilled),
            hint:
                feesBilled == null
                    ? "Not billed"
                    : `Paid ${formatCurrency(feesPaid)} · Bal ${formatCurrency(
                          feesBalance,
                      )}`,
            icon: Receipt,
        },
        {
            id: "attendance",
            label: "Attendance",
            value: attendanceRate == null ? "—" : `${attendanceRate}%`,
            hint: `${attendancePresent} present · ${attendanceAbsent} absent`,
            icon: CalendarCheck,
        },
    ];

    const tabs: {
        id: StudentShowTab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "profile", label: "Profile", icon: UserIcon },
        {
            id: "subjects",
            label: "Subjects",
            icon: BookOpen,
            badge: subjectsCount,
        },
        {
            id: "assessments",
            label: "Assessments",
            icon: ClipboardList,
            badge: assessmentsCount,
        },
        { id: "fees", label: "Fees/Finance", icon: Receipt },
        { id: "attendance", label: "Attendance", icon: CalendarCheck },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            badge: notificationsCount,
        },
    ];

    return (
        <>
            <Head title={displayName} />
            <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={displayName}
                    icon={
                        <UserAvatar
                            name={displayName}
                            src={student.user?.avatar_url}
                            size="lg"
                        />
                    }
                    meta={
                        <>
                            <span>
                                Admission:{" "}
                                <span className="font-medium text-foreground">
                                    {student.admission_number}
                                </span>
                            </span>
                            {student.user?.email && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{student.user.email}</span>
                                </>
                            )}
                            {student.user?.phone && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{student.user.phone}</span>
                                </>
                            )}
                        </>
                    }
                    statuses={
                        <>
                            <Badge
                                className={cn(
                                    "rounded-full border-none px-3 py-1 font-semibold text-white",
                                    isActive
                                        ? "bg-[#16a34a] hover:bg-[#16a34a]/90"
                                        : "bg-[#eab308] hover:bg-[#eab308]/90",
                                )}
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                {statusLabel}
                            </Badge>
                            {student.class?.name && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 rounded-full px-3 py-1 font-medium"
                                >
                                    <School className="h-3 w-3" />
                                    {student.class.name}
                                    {student.class_stream?.stream
                                        ? ` · ${student.class_stream.stream}`
                                        : ""}
                                </Badge>
                            )}
                            <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm"
                            >
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Admitted {formatDate(student.admission_date)}
                            </Badge>
                        </>
                    }
                    backHref={route("students.index")}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                            >
                                <Link href={route("students.edit", student.id)}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    }
                />

                <StatsCards data={statCards} cols={4} />

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
                    className="rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden border-b px-3">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {t.label}
                                    {t.badge !== undefined && t.badge > 0 && (
                                        <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                                            {t.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <motion.div
                                            layoutId="student-show-tab-underline"
                                            className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 md:p-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15, ease: easeOut }}
                            >
                                {tab === "profile" && (
                                    <ProfileTab
                                        student={student}
                                        displayName={displayName}
                                        isActive={isActive}
                                        statusLabel={statusLabel}
                                        genderLabel={genderLabel}
                                    />
                                )}

                                {tab === "subjects" && (
                                    <SubjectsTab
                                        studentId={student.id}
                                        subjects={subjects}
                                        availableSubjects={
                                            student.available_subjects ??
                                            subjects
                                        }
                                        enrolledSubjectIds={
                                            student.enrolled_subject_ids ??
                                            subjects.map((s) => s.id)
                                        }
                                    />
                                )}

                                {tab === "assessments" && (
                                    <AssessmentsTab
                                        count={assessmentsCount}
                                        avgPoints={avgPoints}
                                        avgGrade={avgGrade}
                                    />
                                )}

                                {tab === "fees" && (
                                    <FeesTab transactions={transactions} />
                                )}

                                {tab === "attendance" && (
                                    <AttendanceTab
                                        present={attendancePresent}
                                        absent={attendanceAbsent}
                                        total={attendanceTotal}
                                        rate={attendanceRate}
                                    />
                                )}

                                {tab === "notifications" && (
                                    <NotificationsTab
                                        count={notificationsCount}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        Student records are part of your school directory. Use
                        the tabs above to review subjects, assessments, fees,
                        attendance, and notifications. Detailed records live in
                        the corresponding modules.
                    </span>
                </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <strong>{displayName}</strong> and
                            all linked guardian relationships. Their account and
                            academic records will be soft-deleted and can be
                            restored later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing…
                                </>
                            ) : (
                                "Remove"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

StudentShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Students", href: "/students" },
        {
            title: props.student?.user?.name ?? "Student",
            href: `/students/${props.student?.id ?? ""}`,
        },
    ],
});
