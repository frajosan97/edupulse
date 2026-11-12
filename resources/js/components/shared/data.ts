import {
    BookOpen,
    Fingerprint,
    Gift,
    GraduationCap,
    LineChart,
    School,
    UserCog,
    Banknote,
    type LucideIcon,
} from "lucide-react";
import { unsplash } from "./tokens";

export type {
    AppSlide as Slide,
    AppSlideStat as SlideStat,
} from "@/hooks/use-app-data";

export interface StatItem {
    to: number;
    suffix: string;
    label: string;
    icon: LucideIcon;
}

export interface ModuleItem {
    id: string;
    name: string;
    icon: LucideIcon;
    image: string;
    description: string;
    features: string[];
    more?: string[];
    price: number;
    was?: number;
    best?: boolean;
}

export interface SelectedItem {
    name: string;
    price: number;
}

export type SelectedMap = Record<string, SelectedItem>;

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export const STATS: StatItem[] = [
    { to: 500, suffix: "+", label: "Schools", icon: School },
    { to: 250, suffix: "K+", label: "Students", icon: GraduationCap },
    { to: 50, suffix: "K+", label: "Resources", icon: BookOpen },
    { to: 10, suffix: "K+", label: "Teachers", icon: UserCog },
];

export const MODULES: ModuleItem[] = [
    {
        id: "analytics",
        name: "Analytics",
        icon: LineChart,
        image: unsplash("photo-1551288049-bebda4e38f71"),
        description: "Student analytics and performance tracking system",
        features: [
            "Student Performance Tracking",
            "CBC Competency Assessment",
            "Examination & Report Card Management",
            "Pathway & Career Guidance",
        ],
        more: [
            "Class & Stream Rankings",
            "Subject Performance Trends",
            "Parent Progress Reports",
            "Teacher Performance Insights",
            "Custom Analytics Dashboards",
            "Exportable Reports",
        ],
        price: 15000,
    },
    {
        id: "finance",
        name: "Finance",
        icon: Banknote,
        image: unsplash("photo-1554224155-6726b3ff858f"),
        description: "Financial management and fee collection system",
        features: [
            "Student Fee Management",
            "Fee Collection & Receipting",
            "Expense Management",
            "Budget Planning & Control",
        ],
        more: [
            "M-Pesa Integration",
            "Fee Balance Reminders",
            "Payroll Management",
            "Supplier Management",
            "Financial Statements",
            "Bursary & Scholarship Tracking",
            "Audit Trail",
            "Bank Reconciliation",
            "Fee Structure Templates",
            "Daily Collection Reports",
        ],
        price: 18000,
    },
    {
        id: "elearning",
        name: "E-Learning",
        icon: GraduationCap,
        image: unsplash("photo-1501504905252-473c47e087f8"),
        description: "Complete online learning platform",
        features: [
            "Digital Learning Content Delivery",
            "Virtual Classrooms",
            "Assignments & Online Submissions",
            "Continuous Learning Assessment (CBA)",
        ],
        more: [
            "Online Quizzes & Exams",
            "Learning Resource Library",
            "Teacher–Student Messaging",
            "Progress Tracking",
            "Parent Access Portal",
            "Certificates & Badges",
        ],
        price: 16500,
    },
    {
        id: "biometric",
        name: "Biometric Attendance",
        icon: Fingerprint,
        image: unsplash("photo-1523240795612-9a054b0db644"),
        description: "Biometric attendance register",
        features: [
            "Fingerprint / Facial Recognition Attendance",
            "Real-Time Attendance Tracking",
            "Automated Attendance Reports",
            "Late Arrival & Early Departure Tracking",
        ],
        more: [
            "Parent SMS Alerts",
            "Staff Attendance",
            "Device Management",
            "Leave & Absence Tracking",
            "Attendance Analytics",
        ],
        price: 25000,
    },
];

export const BUNDLES: ModuleItem[] = [
    {
        id: "bundle-starter",
        name: "Starter Bundle",
        icon: Gift,
        image: unsplash("photo-1551288049-bebda4e38f71"),
        description: "Analytics + Finance for growing schools",
        features: ["Analytics", "Finance"],
        price: 29000,
        was: 33000,
    },
    {
        id: "bundle-complete",
        name: "Complete Bundle",
        icon: Gift,
        image: unsplash("photo-1523240795612-9a054b0db644"),
        description: "Every module, one simple yearly price",
        features: [
            "Analytics",
            "Finance",
            "E-Learning",
            "Biometric Attendance",
        ],
        price: 62000,
        was: 74500,
        best: true,
    },
    {
        id: "bundle-learning",
        name: "Learning Bundle",
        icon: Gift,
        image: unsplash("photo-1501504905252-473c47e087f8"),
        description: "Analytics + E-Learning for modern classrooms",
        features: ["Analytics", "E-Learning"],
        price: 27500,
        was: 31500,
    },
];