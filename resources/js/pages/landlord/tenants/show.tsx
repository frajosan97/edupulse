// resources/js/pages/tenants/show.tsx
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    Calendar,
    Layers,
    CheckCircle2,
    Clock,
    Globe,
    BookOpen,
    Receipt,
    Info,
    CircleDollarSign,
    University,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { OverviewTab } from "@/components/forms/tenants/show/overview-tab";
import { DomainsTab } from "@/components/forms/tenants/show/domains-tab";
import { ModulesTab } from "@/components/forms/tenants/show/modules-tab";
import { InvoicesTab } from "@/components/forms/tenants/show/invoices-tab";
import { PaymentsTab } from "@/components/forms/tenants/show/payments-tab";

import type { Tenant } from "@/types";
import { formatDate } from "@/lib/formatters";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    tenant: Tenant;
}

type Tab = "overview" | "domains" | "modules" | "invoices" | "payments";

/**
 * Tenant status badge — maps the single `status` column on the Tenant
 * model (which drives `is_active`) to a visual badge. Avoids the
 * previous behaviour of always rendering "Pending" plus a duplicate
 * "Active" badge.
 */
function StatusBadge({ status }: { status: string }) {
    const config: Record<
        string,
        {
            label: string;
            className: string;
            icon: React.ComponentType<{ className?: string }>;
        }
    > = {
        active: {
            label: "Active",
            className: "bg-[#16a34a] text-white hover:bg-[#16a34a]/90",
            icon: CheckCircle2,
        },
        pending: {
            label: "Pending",
            className: "bg-[#eab308] text-white hover:bg-[#eab308]/90",
            icon: Clock,
        },
        suspended: {
            label: "Suspended",
            className: "bg-[#dc2626] text-white hover:bg-[#dc2626]/90",
            icon: XCircle,
        },
        inactive: {
            label: "Inactive",
            className: "bg-slate-500 text-white hover:bg-slate-500/90",
            icon: AlertCircle,
        },
    };

    const { label, className, icon: Icon } = config[status] ?? config.pending;

    return (
        <Badge
            className={cn(
                "rounded-full px-3 py-1 font-semibold border-none",
                className,
            )}
        >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
        </Badge>
    );
}

export default function TenantShow({ tenant }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("overview");

    const summary = useMemo(() => {
        const domains = tenant.domains ?? [];
        const modules = tenant.modules ?? [];
        const invoices = tenant.invoices ?? [];
        const payments = invoices.flatMap((i) => i.payments ?? []);
        const now = new Date();

        const activeModules = modules.filter((m) => {
            const expired = m.pivot.expires_at
                ? new Date(m.pivot.expires_at) < now
                : false;
            return m.pivot.status === "active" && !expired;
        }).length;
        const pendingInvoices = invoices.filter(
            (i) => i.status === "issued" || i.status === "partially_paid",
        ).length;

        return {
            domainCount: domains.length,
            moduleCount: modules.length,
            invoiceCount: invoices.length,
            paymentCount: payments.length,
            pendingInvoices,
            activeModules,
            progress:
                modules.length === 0
                    ? 0
                    : Math.round((activeModules / modules.length) * 100),
        };
    }, [tenant.domains, tenant.modules, tenant.invoices]);

    const locationInfo = useMemo(() => {
        const parts = [
            tenant.county?.name,
            tenant.constituency?.name,
            tenant.ward?.name,
        ].filter((v): v is string => Boolean(v));
        return parts.length > 0 ? parts.join(" / ") : "Not specified";
    }, [tenant]);

    const refresh = () => {
        setRefreshing(true);
        router.reload({
            only: ["tenant"],
            onSuccess: () => toast.success("Tenant data refreshed."),
            onError: () => toast.error("Failed to refresh tenant."),
            onFinish: () => setRefreshing(false),
        });
    };

    const tabs: {
        id: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "overview", label: "Overview", icon: Info },
        {
            id: "domains",
            label: "Domains",
            icon: Globe,
            badge: summary.domainCount,
        },
        {
            id: "modules",
            label: "Modules",
            icon: Layers,
            badge: summary.moduleCount,
        },
        {
            id: "invoices",
            label: "Invoices",
            icon: Receipt,
            badge: summary.invoiceCount,
        },
        {
            id: "payments",
            label: "Payments",
            icon: CircleDollarSign,
            badge: summary.paymentCount,
        },
    ];

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = [
        {
            id: "modules",
            label: "Modules",
            value: summary.moduleCount,
            hint: `${summary.activeModules} active`,
            icon: BookOpen,
            accent: true,
        },
        {
            id: "domains",
            label: "Domains",
            value: summary.domainCount,
            icon: Globe,
        },
        {
            id: "invoices",
            label: "Total Invoices",
            value: summary.invoiceCount,
            icon: Receipt,
        },
        {
            id: "outstanding",
            label: "Outstanding",
            value: summary.pendingInvoices,
            hint: "issued / partially paid",
            icon: Clock,
            tone: summary.pendingInvoices > 0 ? "warning" : "success",
        },
    ];

    return (
        <>
            <Head title={`${tenant.name} - Tenant Profile`} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={tenant.name}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <University className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <span>
                                ID:{" "}
                                <span className="font-medium text-foreground">
                                    {tenant.id}
                                </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>{summary.moduleCount} modules</span>
                            <span className="mx-2">•</span>
                            <span>{summary.domainCount} domains</span>
                            <span className="mx-2">•</span>
                            <span>{tenant.student_count} students</span>
                        </>
                    }
                    statuses={
                        <>
                            <StatusBadge status={tenant.status} />

                            <Badge
                                variant="outline"
                                className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm border-slate-200"
                            >
                                <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                Joined {formatDate(tenant.created_at)}
                            </Badge>
                        </>
                    }
                    backHref={route("tenants.index")}
                    onRefresh={refresh}
                    isRefreshing={refreshing}
                />

                {/* Stats grid */}
                <StatsCards data={statCards} />

                {/* Tabbed content */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex w-full flex-wrap items-center border-b px-3 pt-1">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex items-center gap-1.5 rounded-sm px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary",
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
                                            className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-primary"
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

                    <div className="p-5">
                        {tab === "overview" && (
                            <OverviewTab
                                tenant={tenant}
                                locationLabel={locationInfo}
                                activeModules={summary.activeModules}
                                totalModules={summary.moduleCount}
                            />
                        )}

                        {tab === "domains" && (
                            <DomainsTab
                                tenantId={tenant.id}
                                domains={tenant.domains ?? []}
                            />
                        )}

                        {tab === "modules" && (
                            <ModulesTab modules={tenant.modules ?? []} />
                        )}

                        {tab === "invoices" && (
                            <InvoicesTab invoices={tenant.invoices ?? []} />
                        )}

                        {tab === "payments" && (
                            <PaymentsTab
                                payments={(tenant.invoices ?? []).flatMap(
                                    (i) => i.payments ?? [],
                                )}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}

TenantShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Tenants", href: "/tenants" },
        { title: props.tenant?.name ?? "Tenant", href: "/tenants/edit" },
    ],
});
