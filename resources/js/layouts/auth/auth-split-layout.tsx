import { Link } from "@inertiajs/react";
import { GraduationCap, Mail, Phone, ShieldCheck } from "lucide-react";
import AppLogoIcon from "@/components/app-logo-icon";
import type { AuthLayoutProps } from "@/types";
import { useAppData } from "@/hooks/use-app-data";

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { platformName, contacts, themes, isLandlord } = useAppData();

    const primary = themes.primary_color || "#0070c0";
    const secondary = themes.secondary_color || "#16a34a";

    const marketingBadge = isLandlord
        ? "Trusted by 500+ schools nationwide"
        : contacts.motto || null;

    const marketingHeadline = isLandlord
        ? "One platform for fees, exams, attendance and SMS."
        : contacts.mission || `Welcome to ${platformName}`;

    const marketingBody = isLandlord
        ? contacts.description ||
          "EduPulse brings everything your school needs into one simple place, so your staff spend less time on paperwork and more time with learners."
        : contacts.description ||
          `Access your ${platformName} portal to manage classes, students, fees, and results — all in one place.`;

    return (
        <div className="relative grid min-h-dvh grid-cols-1 lg:h-dvh lg:max-w-none lg:grid-cols-2">
            {/* ------------------------------------------------------- */}
            {/* Left brand panel                                        */}
            {/* ------------------------------------------------------- */}
            <div
                className="relative hidden h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex"
                style={{
                    backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary}cc, ${primary}aa)`,
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1.5px)",
                        backgroundSize: "18px 18px",
                    }}
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-25 blur-3xl"
                    style={{ backgroundColor: secondary }}
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl"
                    aria-hidden="true"
                />

                <Link
                    href="/"
                    className="relative z-20 flex items-center gap-2.5 text-lg font-semibold tracking-tight"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </span>
                    {platformName}
                </Link>

                <div className="relative z-20 max-w-md">
                    {marketingBadge && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                            <GraduationCap size={14} />
                            {marketingBadge}
                        </span>
                    )}
                    <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">
                        {marketingHeadline}
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                        {marketingBody}
                    </p>

                    {(contacts.phone || contacts.email) && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                            {contacts.phone && (
                                <a
                                    href={`tel:${contacts.phone}`}
                                    className="inline-flex items-center gap-1.5 hover:text-white"
                                >
                                    <Phone size={14} aria-hidden="true" />
                                    {contacts.phone}
                                </a>
                            )}
                            {contacts.email && (
                                <a
                                    href={`mailto:${contacts.email}`}
                                    className="inline-flex items-center gap-1.5 hover:text-white"
                                >
                                    <Mail size={14} aria-hidden="true" />
                                    {contacts.email}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative z-20 flex items-center gap-2 text-xs text-white/75">
                    <ShieldCheck size={14} />
                    Secure sign-in. Your data stays private.
                </div>
            </div>

            {/* ------------------------------------------------------- */}
            {/* Right auth form                                          */}
            {/* ------------------------------------------------------- */}
            <div className="flex w-full items-center justify-center bg-white px-6 py-10 dark:bg-slate-900 lg:p-8">
                <div className="mx-auto flex w-full max-w-[380px] flex-col space-y-6">
                    <Link
                        href="/"
                        className="relative z-20 flex items-center justify-center gap-2.5 lg:hidden"
                    >
                        <span
                            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                            style={{
                                backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary}cc)`,
                                boxShadow: `0 10px 20px ${primary}40`,
                            }}
                        >
                            <AppLogoIcon className="size-7 fill-current text-white" />
                        </span>
                        <span
                            className="text-lg font-bold"
                            style={{ color: primary }}
                        >
                            {platformName}
                        </span>
                    </Link>

                    <div className="flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center">
                        <h1
                            className="text-2xl font-extrabold tracking-tight"
                            style={{ color: primary }}
                        >
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>

                    {children}

                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} {platformName}. All rights
                        reserved.
                    </p>

                    {isLandlord && contacts.address && (
                        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                            {contacts.address}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
