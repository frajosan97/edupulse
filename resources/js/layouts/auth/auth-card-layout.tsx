import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import AppLogoIcon from "@/components/app-logo-icon";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAppData } from "@/hooks/use-app-data";

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    const { platformName, contacts, themes } = useAppData();

    const primary = themes.primary_color || "#0070c0";
    const secondary = themes.secondary_color || "#16a34a";

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-slate-50 p-6 md:p-10 dark:bg-slate-900">
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

            <div className="relative flex w-full max-w-md flex-col gap-6">
                <Link
                    href="/"
                    className="group flex items-center gap-2.5 self-center font-semibold"
                >
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/20 transition-transform group-hover:-translate-y-0.5"
                        style={{
                            backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary}cc)`,
                            boxShadow: `0 10px 20px ${primary}40`,
                        }}
                    >
                        <AppLogoIcon className="size-7 fill-current text-white" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                        <CardHeader className="space-y-1.5 px-10 pb-0 pt-8 text-center">
                            <CardTitle
                                className="text-2xl font-extrabold tracking-tight"
                                style={{ color: primary }}
                            >
                                {title}
                            </CardTitle>
                            <CardDescription className="text-balance text-slate-500 dark:text-slate-400">
                                {description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                    © {new Date().getFullYear()} {platformName}. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
