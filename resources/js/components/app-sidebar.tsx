import { Link } from "@inertiajs/react";
import {
    BookOpen,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    Database,
    FileCheck2,
    FilePenLine,
    FileText,
    GraduationCap,
    Layers,
    LayoutGrid,
    LibraryBig,
    ListChecks,
    MessageSquareMore,
    PencilRuler,
    Receipt,
    ReceiptText,
    ScrollText,
    TrendingUp,
    University,
    UserCheck,
    Users,
    Wallet,
} from "lucide-react";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types";
import AppLogo from "@/components/app-logo";
import { useAppData } from "@/hooks/use-app-data";

const landlordNavItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: LayoutGrid },
    { title: "Modules", href: "/modules", icon: ClipboardList },
    { title: "Tenants", href: "/tenants", icon: University },
    { title: "Invoices", href: "/invoices", icon: ReceiptText },
    { title: "Payments", href: "/payments", icon: CreditCard },
    { title: "Database", href: "/database", icon: Database },
];

const tenantInstitutionItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: LayoutGrid },
    { title: "Staff & Teachers", href: "/staff", icon: UserCheck },
    { title: "Students", href: "/students", icon: GraduationCap },
    { title: "Departments", href: "/departments", icon: LibraryBig },
];

const tenantAcademicItems: NavItem[] = [
    { title: "Classes & Groups", href: "/classes", icon: Users },
    { title: "Curriculum", href: "/curricula", icon: BookOpen },
    { title: "Academic Pathways", href: "/pathways", icon: ScrollText },
    { title: "Subjects & Courses", href: "/subjects", icon: PencilRuler },
];

const tenantAssessmentItems: NavItem[] = [
    { title: "Grading Systems", href: "/grading-systems", icon: ListChecks },
    { title: "Examinations", href: "/exams", icon: FileText },
    { title: "Marks Entry", href: "/results/create", icon: FilePenLine },
    { title: "Academic Results", href: "/results", icon: FileCheck2 },
];

const tenantFinanceItems: NavItem[] = [
    { title: "Fee Structure", href: "/finance/fee-structures", icon: Layers },
    { title: "Student Invoices", href: "/finance/invoices", icon: ReceiptText },
    { title: "Payments", href: "/finance/payments", icon: CreditCard },
    { title: "Fee Balances", href: "/finance/balances", icon: Wallet },
    { title: "Expenses", href: "/finance/expenses", icon: ClipboardList },
    { title: "Other Income", href: "/finance/income", icon: TrendingUp },
    { title: "Receipts", href: "/finance/receipts", icon: Receipt },
];

const tenantCommunicationItems: NavItem[] = [
    { title: "Messages", href: "/messages", icon: MessageSquareMore },
    { title: "Attendance", href: "/attendance", icon: CalendarCheck },
];

const tenantSettingsItems: NavItem[] = [
    // { title: "System Settings", href: "/system-settings", icon: Settings },
    { title: "Slides Management", href: "/school-slides", icon: ScrollText },
    { title: "Academic Year", href: "/academic-years", icon: CalendarCheck },
    { title: "Semester / Term", href: "/terms", icon: CalendarCheck },
    // { title: "Database Backup", href: "/backup", icon: Database },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { isLandlord } = useAppData();
    const homeHref = isLandlord ? "/" : "/dashboard";

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isLandlord ? (
                    <NavMain items={landlordNavItems} label="Platform" />
                ) : (
                    <>
                        <NavMain
                            items={tenantInstitutionItems}
                            label="Platform"
                        />
                        <NavMain
                            items={tenantAcademicItems}
                            label="Academics"
                        />
                        <NavMain
                            items={tenantAssessmentItems}
                            label="Examinations"
                        />
                        <NavMain items={tenantFinanceItems} label="Finance" />
                        <NavMain
                            items={tenantCommunicationItems}
                            label="Communication"
                        />
                        <NavMain items={tenantSettingsItems} label="System" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
