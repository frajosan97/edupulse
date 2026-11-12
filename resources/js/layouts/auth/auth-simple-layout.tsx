import { Link } from "@inertiajs/react";
import AppLogoIcon from "@/components/app-logo-icon";
import type { AuthLayoutProps } from "@/types";
import { useAppData } from "@/hooks/use-app-data";

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { platformName, themes } = useAppData();

    const primary = themes.primary_color || "#0070c0";
    const secondary = themes.secondary_color || "#16a34a";

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 md:p-10 dark:bg-slate-900">
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(11,111,184,0.07) 1.5px, transparent 2px)",
                    backgroundSize: "22px 22px",
                }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: primary }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: secondary }}
                aria-hidden="true"
            />

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href="/"
                            className="group flex flex-col items-center gap-2 font-semibold"
                        >
                            <div
                                className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-white/20 transition-transform group-hover:-translate-y-0.5"
                                style={{
                                    backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary}cc)`,
                                    boxShadow: `0 10px 20px ${primary}40`,
                                }}
                            >
                                <AppLogoIcon className="size-8 fill-current text-white" />
                            </div>
                            <span className="sr-only">{platformName}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1
                                className="text-2xl font-extrabold tracking-tight"
                                style={{ color: primary }}
                            >
                                {title}
                            </h1>
                            <p className="text-center text-sm text-balance text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
