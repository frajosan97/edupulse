import {
    BookMarked,
    BookOpen,
    Building2,
    CalendarDays,
    GraduationCap,
    HelpCircle,
    Image as ImageIcon,
    Landmark,
    Users,
    type LucideIcon,
} from "lucide-react";

export interface FooterLink {
    label: string;
    icon: LucideIcon;
    href: string;
}

/* ------------------------------------------------------------------ */
/* Landlord / public marketing footer                                  */
/* ------------------------------------------------------------------ */
const LANDLORD_QUICK_LINKS: FooterLink[] = [
    { label: "School Calendar", icon: CalendarDays, href: "#" },
    { label: "E-Learning", icon: BookOpen, href: "#" },
    { label: "Photo Gallery", icon: ImageIcon, href: "#" },
    { label: "Alumni", icon: Users, href: "#" },
    { label: "FAQs", icon: HelpCircle, href: "#" },
];

const LANDLORD_RESOURCES: FooterLink[] = [
    {
        label: "Teachers Service Commission (TSC)",
        icon: Building2,
        href: "https://www.tsc.go.ke",
    },
    { label: "KUCCPS", icon: GraduationCap, href: "https://www.kuccps.net" },
    {
        label: "Kenya Institute of Curriculum Development (KICD)",
        icon: BookMarked,
        href: "https://kicd.ac.ke",
    },
    {
        label: "Higher Education Loans Board (HELB)",
        icon: Landmark,
        href: "https://www.helb.co.ke",
    },
    {
        label: "Ministry of Education",
        icon: Building2,
        href: "https://www.education.go.ke",
    },
];

/* ------------------------------------------------------------------ */
/* Tenant / school public landing footer                               */
/* ------------------------------------------------------------------ */
const TENANT_QUICK_LINKS: FooterLink[] = [
    { label: "School Calendar", icon: CalendarDays, href: "#" },
    { label: "Admissions", icon: Users, href: "#admissions" },
    { label: "Photo Gallery", icon: ImageIcon, href: "#gallery" },
    { label: "Alumni", icon: Users, href: "#alumni" },
    { label: "FAQs", icon: HelpCircle, href: "#faqs" },
];

const TENANT_RESOURCES: FooterLink[] = [
    {
        label: "Ministry of Education",
        icon: Building2,
        href: "https://www.education.go.ke",
    },
    {
        label: "Kenya Institute of Curriculum Development (KICD)",
        icon: BookMarked,
        href: "https://kicd.ac.ke",
    },
    {
        label: "KUCCPS",
        icon: GraduationCap,
        href: "https://www.kuccps.net",
    },
];

export interface FooterLinks {
    quickLinks: FooterLink[];
    resources: FooterLink[];
}

export function getFooterLinks(isLandlord: boolean): FooterLinks {
    return isLandlord
        ? { quickLinks: LANDLORD_QUICK_LINKS, resources: LANDLORD_RESOURCES }
        : { quickLinks: TENANT_QUICK_LINKS, resources: TENANT_RESOURCES };
}