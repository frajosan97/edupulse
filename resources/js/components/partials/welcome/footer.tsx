import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Copyright,
    Facebook,
    FileText,
    Instagram,
    Mail,
    MapPin,
    Network,
    Phone,
    ShieldCheck,
    Twitter,
    Youtube,
} from "lucide-react";
import { shell } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";

import AppLogoIcon from "../../app-logo-icon";
import { getFooterLinks } from "../../shared/footer-links";

const SOCIALS = [
    { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
] as const;

const LEGAL_LINKS = [
    { icon: FileText, label: "Terms of Service", href: "/terms" },
    { icon: ShieldCheck, label: "Privacy Policy", href: "/privacy" },
    { icon: Network, label: "Sitemap", href: "/sitemap" },
] as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-lg font-semibold">{children}</h3>
            <span className="mt-2 block h-[3px] w-10 rounded bg-white/40" />
        </div>
    );
}

export default function Footer() {
    const { isLandlord, platformName, contacts, themes } = useAppData();
    const { quickLinks, resources } = getFooterLinks(isLandlord);

    const primary = themes.primary_color || "#0070c0";

    const linkCls =
        "flex items-start gap-3 text-[15px] text-white/85 transition hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded";
    const iconCls = "mt-0.5 h-[18px] w-[18px] shrink-0 text-white/60";

    return (
        <footer
            id="site-footer"
            style={{ backgroundColor: primary }}
            className="text-white"
        >
            <div
                className={`${shell} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4`}
            >
                {/* Brand */}
                <div>
                    <AppLogoIcon className="h-10 w-auto" />

                    <p className="mt-5 text-[15px] leading-relaxed text-white/80">
                        {contacts.description ||
                            `${platformName} is Kenya's leading school management platform, designed by educators for educators.`}
                    </p>

                    <div className="mt-5 flex gap-3">
                        {SOCIALS.map(({ icon: Icon, label, href }) => (
                            <motion.a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                whileHover={{ y: -3, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <Icon size={18} aria-hidden="true" />
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <FooterHeading>Contact Us</FooterHeading>
                    <address className="mt-6 not-italic">
                        <ul className="space-y-4">
                            {contacts.phone && (
                                <li>
                                    <a
                                        href={`tel:${contacts.phone.replace(/\s+/g, "")}`}
                                        className={linkCls}
                                    >
                                        <Phone
                                            className={iconCls}
                                            aria-hidden="true"
                                        />
                                        {contacts.phone}
                                    </a>
                                </li>
                            )}
                            {contacts.email && (
                                <li>
                                    <a
                                        href={`mailto:${contacts.email}`}
                                        className={linkCls}
                                    >
                                        <Mail
                                            className={iconCls}
                                            aria-hidden="true"
                                        />
                                        {contacts.email}
                                    </a>
                                </li>
                            )}
                            {contacts.address && (
                                <li className="flex items-start gap-3 text-[15px] text-white/85">
                                    <MapPin
                                        className={iconCls}
                                        aria-hidden="true"
                                    />
                                    {contacts.address}
                                </li>
                            )}
                        </ul>
                    </address>
                </div>

                {/* Quick Links */}
                <div>
                    <FooterHeading>Quick Links</FooterHeading>
                    <ul className="mt-6 space-y-4">
                        {quickLinks.map(({ label, icon: Icon, href }) => (
                            <li key={label}>
                                <a href={href} className={linkCls}>
                                    <Icon
                                        className={iconCls}
                                        aria-hidden="true"
                                    />
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <FooterHeading>Important Resources</FooterHeading>
                    <ul className="mt-6 space-y-4">
                        {resources.map(({ label, icon: Icon, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkCls}
                                >
                                    <Icon
                                        className={iconCls}
                                        aria-hidden="true"
                                    />
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom bar — darkened overlay on top of the tenant primary */}
            <div className="relative">
                <div
                    className="absolute inset-0 bg-black/20"
                    aria-hidden="true"
                />
                <div
                    className={`${shell} relative flex flex-col items-center justify-between gap-3 py-5 text-sm text-white/90 sm:flex-row`}
                >
                    <div className="flex items-center gap-2">
                        <Copyright size={16} aria-hidden="true" />
                        <span>
                            {new Date().getFullYear()} {platformName}. All
                            rights reserved
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {LEGAL_LINKS.map(({ icon: Icon, label, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="flex items-center gap-1.5 rounded text-white/90 transition hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                            >
                                <Icon size={16} aria-hidden="true" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
