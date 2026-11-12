// resources/js/pages/tenant/staff/show.tsx
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    CreditCard,
    Info,
    Layers,
    Loader2,
    Pencil,
    Receipt,
    ShieldCheck,
    Trash2,
    User as UserIcon,
    UserCog,
    Users,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/formatters";
import type {
    AssignmentContext,
    AssignmentOptions,
    Staff,
    StaffClassAssignment,
    StaffShowTab,
    StaffSubjectAssignment,
    StaffTeacherProfile,
} from "@/types/staff";

import { ProfileTab } from "@/components/partials/staff/tabs/profile-tab";
import { ClassesTab } from "@/components/partials/staff/tabs/classes-tab";
import { SubjectsTab } from "@/components/partials/staff/tabs/subjects-tab";
import { InvoicesTab } from "@/components/partials/staff/tabs/invoices-tab";
import { PaymentsTab } from "@/components/partials/staff/tabs/payments-tab";
import { ExpensesTab } from "@/components/partials/staff/tabs/expenses-tab";
import { AttendanceTab } from "@/components/partials/staff/tabs/attendance-tab";
import { NotificationsTab } from "@/components/partials/staff/tabs/notifications-tab";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    staff: Staff;
    teacher: StaffTeacherProfile | null;
    assignments: {
        classes: StaffClassAssignment[];
        subjects: StaffSubjectAssignment[];
    };
    /** Matches `academic_period` from StaffController@show. */
    academic_period: AssignmentContext;
    options: AssignmentOptions;
}

export default function StaffShow({
    staff,
    teacher,
    assignments,
    academic_period,
    options,
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tab, setTab] = useState<StaffShowTab>("profile");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route("staff.destroy", staff.id), {
            onSuccess: () => toast.success(`"${staff.name}" removed.`),
            onError: () => toast.error("Failed to delete staff member."),
            onFinish: () => setDeleting(false),
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    const isActive = staff.status === "active";
    const statusLabel =
        staff.status_label ?? (isActive ? "Active" : "Inactive");
    const roleLabel = staff.primary_role_label ?? "No role";

    const isTeacher = staff.primary_role === "teacher";
    const isFinance = staff.primary_role === "finance";
    const isAdmin = staff.primary_role === "admin";

    const showTeaching = isTeacher || isAdmin;
    const showFinance = isFinance || isAdmin;

    const classesCount = staff.teaching?.counts.classes ?? 0;
    const subjectsCount = staff.teaching?.counts.subjects ?? 0;
    const studentsCount = staff.teaching?.counts.students ?? 0;

    // ---------------------------------------------------------
    // Stat cards
    // ---------------------------------------------------------
    const statCards: StatCardData[] = [];

    if (showTeaching) {
        statCards.push(
            {
                id: "classes",
                label: "Classes",
                value: formatNumber(classesCount),
                hint:
                    classesCount === 1 ? "Class assigned" : "Classes assigned",
                icon: Layers,
                accent: true,
            },
            {
                id: "subjects",
                label: "Subjects",
                value: formatNumber(subjectsCount),
                hint:
                    subjectsCount === 1 ? "Subject taught" : "Subjects taught",
                icon: BookOpen,
            },
            {
                id: "students",
                label: "Students",
                value: formatNumber(studentsCount),
                hint: "Under this staff member",
                icon: Users,
            },
        );
    }

    if (showFinance) {
        statCards.push(
            {
                id: "invoices",
                label: "Invoices",
                value: formatNumber(staff.invoices_count ?? 0),
                hint: "Handled by this staff member",
                icon: Receipt,
                accent: !showTeaching,
            },
            {
                id: "payments",
                label: "Payments",
                value: formatNumber(staff.payments_count ?? 0),
                hint: "Recorded by this staff member",
                icon: Wallet,
            },
            {
                id: "expenses",
                label: "Expenses",
                value: formatNumber(staff.expenses_count ?? 0),
                hint: "Logged by this staff member",
                icon: CreditCard,
            },
        );
    }

    statCards.push({
        id: "status",
        label: "Status",
        value: (
            <span
                className={cn(
                    "inline-flex items-center gap-1.5",
                    isActive ? "text-emerald-600" : "text-amber-600",
                )}
            >
                {isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <XCircle className="h-4 w-4" />
                )}
                {statusLabel}
            </span>
        ),
        hint: staff.can_login ? "Can sign in" : "Login disabled",
        icon: UserCog,
    });

    // ---------------------------------------------------------
    // Tabs
    // ---------------------------------------------------------
    const tabs: {
        id: StaffShowTab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [{ id: "profile", label: "Profile", icon: UserIcon }];

    if (showTeaching) {
        tabs.push(
            {
                id: "classes",
                label: "Classes",
                icon: Layers,
                badge: classesCount,
            },
            {
                id: "subjects",
                label: "Subjects",
                icon: BookOpen,
                badge: subjectsCount,
            },
        );
    }

    if (showFinance) {
        tabs.push(
            {
                id: "invoices",
                label: "Invoices",
                icon: Receipt,
                badge: staff.invoices_count ?? 0,
            },
            {
                id: "payments",
                label: "Payments",
                icon: Wallet,
                badge: staff.payments_count ?? 0,
            },
            {
                id: "expenses",
                label: "Expenses",
                icon: CreditCard,
                badge: staff.expenses_count ?? 0,
            },
        );
    }

    tabs.push(
        {
            id: "attendance",
            label: "Attendance",
            icon: CalendarCheck,
            badge: staff.attendance_logs_count ?? 0,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            badge: staff.notifications_count ?? 0,
        },
    );

    useEffect(() => {
        if (!tabs.some((t) => t.id === tab)) setTab("profile");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staff.primary_role]);

    return (
        <>
            <Head title={staff.name} />
            <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={staff.name}
                    icon={
                        <UserAvatar
                            name={staff.name}
                            src={staff.avatar_url}
                            size="lg"
                        />
                    }
                    meta={
                        <>
                            <span>
                                Role:{" "}
                                <span className="font-medium text-foreground">
                                    {roleLabel}
                                </span>
                            </span>
                            {staff.email && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{staff.email}</span>
                                </>
                            )}
                            {staff.phone && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{staff.phone}</span>
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
                            {roleLabel !== "No role" && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 rounded-full px-3 py-1 font-medium"
                                >
                                    <ShieldCheck className="h-3 w-3" />
                                    {roleLabel}
                                </Badge>
                            )}
                            <Badge
                                variant="outline"
                                className="rounded-full border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm"
                            >
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Joined{" "}
                                {formatDate(
                                    teacher?.joining_date ?? staff.created_at,
                                )}
                            </Badge>
                        </>
                    }
                    backHref={route("staff.index")}
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
                                <Link href={route("staff.edit", staff.id)}>
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

                <StatsCards data={statCards} cols={isAdmin ? 4 : undefined} />

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
                                            layoutId="staff-show-tab-underline"
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
                                        staff={staff}
                                        teacher={teacher}
                                        isActive={isActive}
                                        statusLabel={statusLabel}
                                        showTeaching={showTeaching}
                                        showFinance={showFinance}
                                    />
                                )}

                                {tab === "classes" && (
                                    <ClassesTab
                                        staffId={staff.id}
                                        assignments={assignments.classes}
                                        context={academic_period}
                                        options={options}
                                    />
                                )}

                                {tab === "subjects" && (
                                    <SubjectsTab
                                        staffId={staff.id}
                                        assignments={assignments.subjects}
                                        context={academic_period}
                                        options={options}
                                    />
                                )}

                                {tab === "invoices" && (
                                    <InvoicesTab
                                        count={staff.invoices_count ?? 0}
                                    />
                                )}

                                {tab === "payments" && (
                                    <PaymentsTab
                                        count={staff.payments_count ?? 0}
                                    />
                                )}

                                {tab === "expenses" && (
                                    <ExpensesTab
                                        count={staff.expenses_count ?? 0}
                                    />
                                )}

                                {tab === "attendance" && (
                                    <AttendanceTab
                                        count={staff.attendance_logs_count ?? 0}
                                    />
                                )}

                                {tab === "notifications" && (
                                    <NotificationsTab
                                        count={staff.notifications_count ?? 0}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        Staff records are part of your school directory. Use the
                        tabs above to review classes, subjects, finance, and
                        attendance. Detailed records live in the corresponding
                        modules.
                    </span>
                </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove staff member?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <strong>{staff.name}</strong> from
                            your staff. Their account and any linked records
                            will be soft-deleted and can be restored later.
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

StaffShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Staff", href: "/staff" },
        {
            title: props.staff?.name ?? "Staff",
            href: `/staff/${props.staff?.id ?? ""}`,
        },
    ],
});
