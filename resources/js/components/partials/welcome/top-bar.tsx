import { GraduationCap, Mail, Phone } from "lucide-react";
import { shell } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";

export default function TopBar() {
    const { contacts, themes, systemPortals } = useAppData();

    const primary = themes.primary_color || "#0070c0";

    return (
        <div className="text-white" style={{ backgroundColor: primary }}>
            <div
                className={`${shell} flex h-11 items-center justify-between gap-4 text-sm`}
            >
                <div className="flex min-w-0 items-center gap-2 font-semibold">
                    <GraduationCap size={18} aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                        {contacts.motto || "Trusted By 500+ Schools Nationwide"}
                    </span>
                    <span className="sm:hidden">
                        {contacts.motto ? "EduPulse" : "500+ Schools"}
                    </span>
                </div>

                <div className="flex items-center gap-5">
                    {contacts.phone && (
                        <a
                            href={`tel:${contacts.phone}`}
                            className="hidden items-center gap-1.5 hover:underline md:inline-flex"
                        >
                            <Phone size={14} aria-hidden="true" />
                            {contacts.phone}
                        </a>
                    )}
                    {contacts.email && (
                        <a
                            href={`mailto:${contacts.email}`}
                            className="hidden items-center gap-1.5 hover:underline lg:inline-flex"
                        >
                            <Mail size={14} aria-hidden="true" />
                            {contacts.email}
                        </a>
                    )}
                    {systemPortals.map((portal) => (
                        <a
                            key={portal.url}
                            href={portal.url}
                            className="hidden items-center gap-1.5 hover:underline sm:inline-flex"
                        >
                            <i className={portal.icon} aria-hidden="true" />
                            {portal.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
