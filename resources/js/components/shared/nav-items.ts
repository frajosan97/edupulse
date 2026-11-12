import {
    BarChart3,
    Laptop,
    MessageCircle,
    Phone,
    Tag,
    LayoutGrid,
    type LucideIcon,
} from "lucide-react";

export interface MarketingNavItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
}

const LANDLORD_NAV: MarketingNavItem[] = [
    { id: "home", label: "Home", href: "#home", icon: BarChart3 },
    { id: "about", label: "About Us", href: "#about", icon: Laptop },
    { id: "sms", label: "SMS Center", href: "#sms", icon: MessageCircle },
    { id: "pricing", label: "Pricing", href: "#pricing", icon: Tag },
    { id: "contact", label: "Contact Us", href: "#contact", icon: Phone },
];

const TENANT_NAV: MarketingNavItem[] = [
    { id: "home", label: "Home", href: "#home", icon: LayoutGrid },
    { id: "about", label: "About", href: "#about", icon: Laptop },
    { id: "academics", label: "Academics", href: "#academics", icon: BarChart3 },
    { id: "admissions", label: "Admissions", href: "#admissions", icon: Tag },
    { id: "contact", label: "Contact", href: "#contact", icon: Phone },
];

export function getNavItems(isLandlord: boolean): MarketingNavItem[] {
    return isLandlord ? LANDLORD_NAV : TENANT_NAV;
}