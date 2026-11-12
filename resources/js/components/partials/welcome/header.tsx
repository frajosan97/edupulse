import { Link } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Mail, Menu, Phone, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { shell } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";

import AppLogoIcon from "../../app-logo-icon";
import { getNavItems } from "../../shared/nav-items";

interface HeaderProps {
    active: string;
}

export default function Header({ active }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const mobileNavId = useId();
    const scrolledRef = useRef(false);

    const { isLandlord, platformName, contacts, themes, systemPortals } =
        useAppData();

    const navItems = useMemo(() => getNavItems(isLandlord), [isLandlord]);

    const primary = themes.primary_color || "#0070c0";

    useEffect(() => {
        const onScroll = () => {
            const next = window.scrollY > 40;
            if (next !== scrolledRef.current) {
                scrolledRef.current = next;
                setScrolled(next);
            }
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    const closeMenu = () => setOpen(false);

    return (
        <>
            {/* Top utility bar */}
            <div className="text-white" style={{ backgroundColor: primary }}>
                <div
                    className={`${shell} flex h-11 items-center justify-between gap-4 text-sm`}
                >
                    <div className="flex min-w-0 items-center gap-2 font-semibold">
                        <GraduationCap size={18} aria-hidden="true" />
                        <span className="hidden truncate sm:inline">
                            {contacts.motto ||
                                "Trusted By 500+ Schools Nationwide"}
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

            {/* Main header */}
            <header
                className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow dark:bg-slate-900/90 ${
                    scrolled
                        ? "border-slate-200 shadow-md dark:border-slate-800"
                        : "border-transparent"
                }`}
            >
                <div
                    className={`${shell} flex h-[80px] items-center justify-between`}
                >
                    <Link
                        href="/"
                        aria-label={`${platformName} home`}
                        className="inline-flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ ["--tw-ring-color" as string]: primary }}
                    >
                        <AppLogoIcon className="h-10 w-auto" />
                    </Link>

                    <nav
                        className="hidden items-center gap-1 lg:flex"
                        aria-label="Main"
                    >
                        {navItems.map(({ id, label, href, icon: Icon }) => {
                            const isActive = active === id;
                            return (
                                <a
                                    key={id}
                                    href={href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 ${
                                        isActive
                                            ? ""
                                            : "text-slate-600 dark:text-slate-300"
                                    }`}
                                    style={{
                                        ["--tw-ring-color" as string]: primary,
                                        color: isActive ? primary : undefined,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive)
                                            e.currentTarget.style.color =
                                                primary;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive)
                                            e.currentTarget.style.color = "";
                                    }}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute inset-0 -z-10 rounded-lg"
                                            style={{
                                                backgroundColor: `${primary}1a`,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 32,
                                            }}
                                        />
                                    )}
                                    <Icon
                                        size={18}
                                        strokeWidth={1.75}
                                        aria-hidden="true"
                                    />
                                    {label}
                                </a>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        className="rounded-lg p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 lg:hidden dark:hover:bg-slate-800"
                        style={{
                            color: primary,
                            ["--tw-ring-color" as string]: primary,
                        }}
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-controls={mobileNavId}
                        aria-label="Toggle menu"
                    >
                        {open ? (
                            <X size={24} aria-hidden="true" />
                        ) : (
                            <Menu size={24} aria-hidden="true" />
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.nav
                            id={mobileNavId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-900"
                            aria-label="Mobile"
                        >
                            <div
                                className={`${shell} flex flex-col gap-1 py-3`}
                            >
                                {navItems.map(
                                    ({ id, label, href, icon: Icon }) => (
                                        <a
                                            key={id}
                                            href={href}
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold focus:outline-none focus-visible:ring-2"
                                            style={{
                                                color: primary,
                                                backgroundColor: `${primary}1a`,
                                                ["--tw-ring-color" as string]:
                                                    primary,
                                            }}
                                        >
                                            <Icon
                                                size={20}
                                                aria-hidden="true"
                                            />
                                            {label}
                                        </a>
                                    ),
                                )}

                                {contacts.phone && (
                                    <a
                                        href={`tel:${contacts.phone}`}
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                                    >
                                        <Phone size={20} aria-hidden="true" />
                                        {contacts.phone}
                                    </a>
                                )}
                                {contacts.email && (
                                    <a
                                        href={`mailto:${contacts.email}`}
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                                    >
                                        <Mail size={20} aria-hidden="true" />
                                        {contacts.email}
                                    </a>
                                )}

                                {systemPortals.length > 0 && (
                                    <div className="mt-2 flex flex-col gap-2">
                                        {systemPortals.map((portal) => (
                                            <a
                                                key={portal.url}
                                                href={portal.url}
                                                onClick={closeMenu}
                                                className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-center font-semibold text-white"
                                                style={{
                                                    backgroundColor: primary,
                                                }}
                                            >
                                                <i
                                                    className={portal.icon}
                                                    aria-hidden="true"
                                                />
                                                {portal.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}