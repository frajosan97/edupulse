import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    Copy,
    GraduationCap,
    Info,
    Layers,
    LayoutGrid,
    Loader2,
    Pencil,
    Repeat,
    Sparkles,
    Star,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { Module } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    module: Module;
}

/* -------------------------------------------------------------------------- */
/*                                    Icons                                   */
/* -------------------------------------------------------------------------- */

function ModuleIcon({
    icon,
    size = "md",
}: {
    icon: string | null;
    size?: "md" | "lg" | "xl";
}) {
    const dims =
        size === "xl"
            ? "h-16 w-16 text-3xl"
            : size === "lg"
              ? "h-14 w-14 text-2xl"
              : "h-12 w-12 text-xl";

    if (!icon) {
        return (
            <div
                className={cn(
                    "flex shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground",
                    dims,
                )}
            >
                <Layers className="h-1/2 w-1/2" />
            </div>
        );
    }

    const className = icon.startsWith("bi-") ? icon : `bi-${icon}`;

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20",
                dims,
            )}
        >
            <i className={cn("bi", className, "leading-none")} />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  DetailRow                                 */
/* -------------------------------------------------------------------------- */

function DetailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </div>
                <div className="mt-1 text-sm text-foreground">{children}</div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  CopyChip                                  */
/* -------------------------------------------------------------------------- */

function CopyChip({ value }: { value: string }) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
        } catch {
            toast.error("Failed to copy");
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={copy}
                        className="group inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[12px] text-foreground transition-colors hover:bg-muted/70"
                    >
                        {value}
                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Click to copy</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

type Tab = "overview" | "features" | "pricing";

export default function ModuleShow({ module }: Props) {
    const { flash } = usePage<{
        flash: { success?: string; error?: string };
    }>().props;

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [tab, setTab] = useState<Tab>("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route("modules.destroy", { module: module.id }), {
            onSuccess: () => toast.success(`"${module.name}" deleted.`),
            onError: () => toast.error("Failed to delete module."),
            onFinish: () => setDeleting(false),
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    const features = module.features ?? [];
    const featureCount = features.length;
    const hasBillRange =
        module.min_bill_amount !== null || module.max_bill_amount !== null;

    const tabs: {
        id: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "overview", label: "Overview", icon: Info },
        {
            id: "features",
            label: "Features",
            icon: Sparkles,
            badge: featureCount,
        },
        { id: "pricing", label: "Pricing", icon: CircleDollarSign },
    ];

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = [
        {
            id: "base_price",
            label: "Base price",
            value: currency.format(module.base_price),
            icon: CircleDollarSign,
            accent: true,
        },
        {
            id: "per_student",
            label: "Per student",
            value: currency.format(module.per_student_price),
            hint: "Billed per enrolled student",
            icon: Sparkles,
        },
        {
            id: "included_students",
            label: "Included students",
            value: module.included_students.toLocaleString(),
            hint: "In base price",
            icon: Users,
        },
        {
            id: "period",
            label: "Billing period",
            value: module.period ? (
                <span className="capitalize">{module.period}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
            hint: "Recurring cycle",
            icon: Repeat,
        },
    ];

    return (
        <>
            <Head title={module.name} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                {/* Reusable Hero Component */}
                <PageHeader
                    title={module.name}
                    icon={<ModuleIcon icon={module.icon} size="lg" />}
                    meta={
                        <>
                            <span>
                                ID:{" "}
                                <span className="font-medium text-foreground">
                                    {module.code}
                                </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>{featureCount} features</span>
                            <span className="mx-2">•</span>
                            <span>
                                {module.included_students.toLocaleString()}{" "}
                                students
                            </span>
                        </>
                    }
                    statuses={
                        <>
                            <Badge className="rounded-full bg-[#eab308] text-white hover:bg-[#eab308]/90 px-3 py-1 font-semibold border-none">
                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                Pending
                            </Badge>

                            <Badge
                                className={cn(
                                    "rounded-full text-white px-3 py-1 font-semibold border-none",
                                    module.is_active
                                        ? "bg-[#16a34a] hover:bg-[#16a34a]/90"
                                        : "bg-slate-500 hover:bg-slate-500/90",
                                )}
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                {module.is_active ? "Active" : "Inactive"}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm border-slate-200"
                            >
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Joined{" "}
                                {new Date(module.updated_at || Date.now())
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")}
                            </Badge>

                            {module.featured && (
                                <Badge
                                    variant="secondary"
                                    className="rounded-full gap-1 font-medium px-3 py-1"
                                >
                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                    Featured
                                </Badge>
                            )}
                        </>
                    }
                    backHref={route("modules.index")}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                            >
                                <Link
                                    href={route("modules.edit", {
                                        module: module.id,
                                    })}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    }
                />

                {/* Stats grid */}
                <StatsCards data={statCards} />

                {/* Tabbed content */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
                    className="rounded-xl border bg-card shadow-sm"
                >
                    {/* Tab bar */}
                    <div className="flex items-center gap-1 border-b px-3">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors",
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {t.label}
                                    {t.badge !== undefined && t.badge > 0 && (
                                        <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                                            {t.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab panels */}
                    <div className="p-5">
                        {tab === "overview" && (
                            <div className="divide-y divide-border">
                                <DetailRow icon={BookOpen} label="Code">
                                    <CopyChip value={module.code} />
                                </DetailRow>
                                <DetailRow icon={Layers} label="Description">
                                    {module.description || (
                                        <span className="text-muted-foreground">
                                            No description provided
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow icon={LayoutGrid} label="Order">
                                    Position{" "}
                                    <span className="font-medium">
                                        #{module.order_number}
                                    </span>{" "}
                                    in the catalogue
                                </DetailRow>
                                <DetailRow icon={Clock} label="Last updated">
                                    {module.updated_at
                                        ? new Date(
                                              module.updated_at,
                                          ).toLocaleDateString(undefined, {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : "—"}
                                </DetailRow>
                            </div>
                        )}

                        {tab === "features" && (
                            <div>
                                {featureCount === 0 ? (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <div className="rounded-2xl bg-muted p-4">
                                            <Sparkles className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                No features listed
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Add features when editing this
                                                module.
                                            </p>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link
                                                href={route("modules.edit", {
                                                    module: module.id,
                                                })}
                                            >
                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                Edit module
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {features.map((feature, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.25,
                                                    delay: i * 0.04,
                                                }}
                                                className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <span className="text-foreground">
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {tab === "pricing" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Base price
                                    </div>
                                    <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                                        {currency.format(module.base_price)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Covers up to{" "}
                                        {module.included_students.toLocaleString()}{" "}
                                        students
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Per additional student
                                    </div>
                                    <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                                        {currency.format(
                                            module.per_student_price,
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Billed per enrolled student above the
                                        included limit
                                    </div>
                                </div>

                                {hasBillRange && (
                                    <div className="rounded-xl border bg-muted/30 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Bill range
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                                            <span>
                                                {module.min_bill_amount !== null
                                                    ? currency.format(
                                                          module.min_bill_amount,
                                                      )
                                                    : "—"}
                                            </span>
                                            <span className="text-muted-foreground">
                                                →
                                            </span>
                                            <span>
                                                {module.max_bill_amount !== null
                                                    ? currency.format(
                                                          module.max_bill_amount,
                                                      )
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Minimum and maximum total monthly
                                            bill
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        Billing period:{" "}
                                        <span className="font-medium capitalize text-foreground">
                                            {module.period ?? "—"}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete module?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <strong>{module.name}</strong> from
                            the platform. Existing tenant subscriptions are
                            unaffected, but the module will no longer be
                            assignable.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

ModuleShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Modules", href: "/modules" },
        { title: props.module?.name ?? "Module", href: "/modules/edit" },
    ],
});
