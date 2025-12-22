import Footer from "@/Components/Pages/Footer";
import Header from "@/Components/Pages/Header";
import NavBar from "@/Components/Pages/NavBar";
import useData from "@/Hooks/useData";

import { usePage } from "@inertiajs/react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

import "../../css/main.css";

export default function TenantLayout({ children }) {
    const { tenant, tenantInfo, systemEnv, accessMode } = usePage().props;
    const { menu } = useData();

    const isLocal = systemEnv === "local";
    const rawDomain = tenant?.domains?.[0]?.domain ?? "edupulse.co.ke";
    const applicationDomain = `${rawDomain}${isLocal ? ":8000" : ""}`;

    // Extract tenant contacts
    const contacts = tenantInfo?.contacts ?? [];
    const images = tenantInfo?.images ?? [];

    const phoneContact =
        contacts.find((c) => c.contact_type === "phone")?.value ??
        "+254796594366";
    const emailContact =
        contacts.find((c) => c.contact_type === "email")?.value ??
        "info@edupulse.co.ke";
    const addressContact =
        contacts.find((c) => c.contact_type === "address")?.value ??
        "222-90200 Kitui";

    // Extract tenant images
    const logoImage =
        images.find((c) => c.image_type === "logo")?.image_path ??
        "images/landlord/logo/default.png";

    // Extract tenant theme
    const theme = tenantInfo?.theme ?? {};
    const primaryColor = theme.primary_color ?? "#3498db";
    const secondaryColor = theme.secondary_color ?? "#2ecc71";
    const accentColor = theme.accent_color ?? "#e74c3c";

    const config = {
        applicationName: tenant?.name ?? "EduPulse",
        applicationDomain,
        platformTagline: tenant?.tagline ?? "Empowering Education Everywhere",
        applicationLogo: `/storage/${logoImage}`,
        headerTitle: tenant?.name ?? "Trusted by 500+ Schools Nationwide",
        platformDescription:
            tenant?.description ?? "Empowering Education Everywhere",

        headerButtons: tenant
            ? [
                  {
                      href: `http://${applicationDomain}/student`,
                      classes: "d-none d-md-block btn-outline-light",
                      icon: "bi-person-fill",
                      name: "Student Login",
                  },
                  {
                      href: `http://${applicationDomain}/staff`,
                      classes: "btn-light",
                      icon: "bi-person",
                      name: "Staff Login",
                  },
                  {
                      href: `http://${applicationDomain}/admin`,
                      classes: "d-none d-md-block btn-outline-light",
                      icon: "bi-person",
                      name: "Admin Login",
                  },
              ]
            : [
                  {
                      href: "/bulk-sms",
                      classes: "d-none d-md-block btn-outline-light",
                      icon: "bi-chat-dots-fill",
                      name: "Bulk SMS",
                  },
                  {
                      href: "/request-demo",
                      classes: "btn-light",
                      icon: "bi-calendar-check-fill",
                      name: "Request Demo",
                  },
              ],

        navItems: menu,

        footerData: {
            socialIcons: [
                {
                    href: "https://facebook.com",
                    icon: FaFacebookF,
                    title: "Facebook",
                },
                {
                    href: "https://twitter.com",
                    icon: FaTwitter,
                    title: "Twitter",
                },
                {
                    href: "https://instagram.com",
                    icon: FaInstagram,
                    title: "Instagram",
                },
                {
                    href: "https://youtube.com",
                    icon: FaYoutube,
                    title: "YouTube",
                },
            ],

            footerLinks: [
                {
                    title: "Contact Us",
                    links: [
                        {
                            icon: "bi bi-telephone",
                            href: `tel:${phoneContact}`,
                            text: phoneContact,
                        },
                        {
                            icon: "bi bi-envelope",
                            href: `mailto:${emailContact}`,
                            text: emailContact,
                        },
                        {
                            icon: "bi bi-geo-alt",
                            href: "#",
                            text: addressContact,
                        },
                    ],
                },
                {
                    title: "Quick Links",
                    links: [
                        {
                            icon: "bi bi-calendar-event",
                            href: "/calendar",
                            text: "School Calendar",
                        },
                        {
                            icon: "bi bi-book",
                            href: "/e-learning",
                            text: "E-Learning",
                        },
                        {
                            icon: "bi bi-images",
                            href: "/gallery",
                            text: "Photo Gallery",
                        },
                        {
                            icon: "bi bi-people-fill",
                            href: "/alumni",
                            text: "Alumni",
                        },
                        {
                            icon: "bi bi-question-circle",
                            href: "/faq",
                            text: "FAQs",
                        },
                    ],
                },
                {
                    title: "Important Resources",
                    links: [
                        {
                            icon: "bi bi-building",
                            href: "https://www.tsc.go.ke",
                            text: "Teachers Service Commission (TSC)",
                        },
                        {
                            icon: "bi bi-mortarboard",
                            href: "https://www.kuccps.net",
                            text: "KUCCPS",
                        },
                        {
                            icon: "bi bi-journal-bookmark",
                            href: "https://kicd.ac.ke",
                            text: "Kenya Institute of Curriculum Development (KICD)",
                        },
                        {
                            icon: "bi bi-bank",
                            href: "https://www.helb.co.ke",
                            text: "Higher Education Loans Board (HELB)",
                        },
                        {
                            icon: "bi bi-building-check",
                            href: "https://www.education.go.ke",
                            text: "Ministry of Education",
                        },
                    ],
                },
            ],

            bottomLinks: [
                {
                    href: "/terms",
                    icon: "bi bi-file-earmark-text",
                    text: "Terms of Service",
                },
                {
                    href: "/privacy",
                    icon: "bi bi-shield-lock",
                    text: "Privacy Policy",
                },
                { href: "/sitemap", icon: "bi bi-diagram-3", text: "Sitemap" },
            ],
        },

        themeColors: {
            primaryColor,
            secondaryColor,
            accentColor,
        },
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            <Header
                headerTitle={config.headerTitle}
                headerButtons={config.headerButtons}
            />
            <NavBar
                applicationLogo={config.applicationLogo}
                navItems={config.navItems}
            />
            <main>{children}</main>
            <Footer
                currentYear={currentYear}
                applicationName={config.applicationName}
                platformTagline={config.platformTagline}
                applicationLogo={config.applicationLogo}
                platformDescription={config.platformDescription}
                footerData={config.footerData}
            />
        </>
    );
}
