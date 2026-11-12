import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Boxes,
    Building2,
    CreditCard,
    ReceiptText,
    UserCheck,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Stats = {
    tenants: {
        total: number;
        active: number;
        new_this_month: number;
        trend_pct: number;
    };
    modules: { total: number; active: number };
    invoices: {
        billed_this_month: number;
        billed_last_month: number;
        trend_pct: number;
        outstanding: number;
        overdue: number;
    };
    payments: {
        collected_this_month: number;
        collected_last_month: number;
        trend_pct: number;
    };
    users: { total: number; new_this_month: number };
};

type RevenuePoint = { label: string; billed: number; collected: number };
type GrowthPoint = { label: string; tenants: number };
type InvoiceBreakdown = Record<
    "draft" | "issued" | "partially_paid" | "paid" | "cancelled",
    number
>;
type ModuleSlice = { name: string; code: string; tenants: number };
type PaymentMethod = { name: string; value: number };
type UserRole = { role: string; count: number };
type TopTenant = { id: string; name: string; revenue: number };
type Activity = {
    type: "invoice" | "payment" | "tenant";
    title: string;
    description: string;
    amount: number | null;
    at: string | null;
};

type Props = {
    stats: Stats;
    revenueTrend: RevenuePoint[];
    tenantGrowth: GrowthPoint[];
    invoiceBreakdown: InvoiceBreakdown;
    moduleDistribution: ModuleSlice[];
    paymentMethods: PaymentMethod[];
    userRoles: UserRole[];
    topTenants: TopTenant[];
    recentActivity: Activity[];
};

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});
const numberFmt = new Intl.NumberFormat("en-US");

const relative = (iso: string | null): string => {
    if (!iso) return "—";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const currencyFormatter = (value: unknown, name: unknown): [string, string] => {
    const n = typeof value === "number" ? value : Number(value ?? 0);
    return [currency.format(Number.isFinite(n) ? n : 0), String(name ?? "")];
};

const tooltipContentStyle: React.CSSProperties = {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
};

const INVOICE_COLORS: Record<keyof InvoiceBreakdown, string> = {
    draft: "hsl(215 20% 65%)",
    issued: "hsl(217 91% 60%)",
    partially_paid: "hsl(38 92% 50%)",
    paid: "hsl(142 71% 45%)",
    cancelled: "hsl(0 84% 60%)",
};

const METHOD_COLORS = [
    "hsl(217 91% 60%)",
    "hsl(142 71% 45%)",
    "hsl(38 92% 50%)",
    "hsl(280 65% 60%)",
    "hsl(0 84% 60%)",
    "hsl(199 89% 48%)",
];

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */

function SectionCard({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1 pt-2">{children}</CardContent>
        </Card>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandlordAdminDashboard(props: Props) {
    const { stats } = props;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        router.reload({
            onStart: () => setIsRefreshing(true),
            onFinish: () => setIsRefreshing(false),
        });
    };

    /* KPI cards — Tenants, Modules, Invoices, Payments, Users */
    const cards: StatCardData[] = [
        {
            id: "tenants",
            label: "Tenants",
            value: numberFmt.format(stats.tenants.total),
            icon: Building2,
            hint: `${stats.tenants.active} active · ${stats.tenants.new_this_month} new this month`,
            accent: true,
            tone: stats.tenants.trend_pct < 0 ? "danger" : undefined,
        },
        {
            id: "modules",
            label: "Modules",
            value: numberFmt.format(stats.modules.total),
            icon: Boxes,
            hint: `${stats.modules.active} active`,
        },
        {
            id: "invoices",
            label: "Billed this month",
            value: currency.format(stats.invoices.billed_this_month),
            icon: ReceiptText,
            accent: true,
            hint: `${stats.invoices.trend_pct >= 0 ? "+" : ""}${stats.invoices.trend_pct.toFixed(1)}% vs last month · ${stats.invoices.overdue} overdue`,
            tone: stats.invoices.overdue > 0 ? "danger" : "success",
        },
        {
            id: "payments",
            label: "Collected this month",
            value: currency.format(stats.payments.collected_this_month),
            icon: CreditCard,
            hint: `vs ${currency.format(stats.payments.collected_last_month)} last month · ${stats.payments.trend_pct >= 0 ? "+" : ""}${stats.payments.trend_pct.toFixed(1)}%`,
            tone: stats.payments.trend_pct < 0 ? "danger" : "success",
        },
        {
            id: "users",
            label: "Users",
            value: numberFmt.format(stats.users.total),
            icon: UserCheck,
            hint: `${stats.users.new_this_month} new this month`,
        },
    ];

    /* Invoice donut data */
    const invoicePie = (
        Object.entries(props.invoiceBreakdown) as [
            keyof InvoiceBreakdown,
            number,
        ][]
    )
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
            name: k.replace("_", " "),
            key: k,
            value: v,
        }));
    const totalInvoices = invoicePie.reduce((s, i) => s + i.value, 0);

    /* Payment methods donut data */
    const totalCollected = props.paymentMethods.reduce(
        (s, i) => s + i.value,
        0,
    );

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* KPI row — 5 cards */}
                <StatsCards data={cards} />

                {/* Revenue trend + tenant growth */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <SectionCard
                        title="Revenue Trend"
                        description="Last 30 days — billed vs. collected"
                        className="xl:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart
                                data={props.revenueTrend}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="billedFill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(217 91% 60%)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(217 91% 60%)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="collectedFill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(142 71% 45%)"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(142 71% 45%)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    tickFormatter={(v: number) =>
                                        v >= 1000
                                            ? `${(v / 1000).toFixed(0)}k`
                                            : String(v)
                                    }
                                />
                                <Tooltip
                                    formatter={currencyFormatter}
                                    contentStyle={tooltipContentStyle}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: 12 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="billed"
                                    name="Billed"
                                    stroke="hsl(217 91% 60%)"
                                    fill="url(#billedFill)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="collected"
                                    name="Collected"
                                    stroke="hsl(142 71% 45%)"
                                    fill="url(#collectedFill)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </SectionCard>

                    <SectionCard
                        title="New Tenants"
                        description="Last 6 months"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={props.tenantGrowth}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    allowDecimals={false}
                                />
                                <Tooltip contentStyle={tooltipContentStyle} />
                                <Bar
                                    dataKey="tenants"
                                    name="Tenants"
                                    fill="hsl(217 91% 60%)"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </SectionCard>
                </div>

                {/* Module adoption + invoice breakdown + payment methods */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <SectionCard
                        title="Module Adoption"
                        description="Active tenants per module"
                    >
                        {props.moduleDistribution.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No data
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart
                                    data={props.moduleDistribution}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 16,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        width={110}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipContentStyle}
                                    />
                                    <Bar
                                        dataKey="tenants"
                                        fill="hsl(199 89% 48%)"
                                        radius={[0, 6, 6, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Invoices This Month"
                        description={`${numberFmt.format(totalInvoices)} total`}
                    >
                        {totalInvoices === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No invoices yet
                            </p>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={invoicePie}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {invoicePie.map((entry) => (
                                                <Cell
                                                    key={entry.key}
                                                    fill={
                                                        INVOICE_COLORS[
                                                            entry.key
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                    {invoicePie.map((entry) => (
                                        <span
                                            key={entry.key}
                                            className="inline-flex items-center gap-1.5"
                                        >
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                    background:
                                                        INVOICE_COLORS[
                                                            entry.key
                                                        ],
                                                }}
                                            />
                                            <span className="capitalize text-muted-foreground">
                                                {entry.name}
                                            </span>
                                            <span className="font-medium">
                                                {entry.value}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Payment Methods"
                        description={`${currency.format(totalCollected)} this month`}
                    >
                        {props.paymentMethods.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No payments yet
                            </p>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={props.paymentMethods}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {props.paymentMethods.map(
                                                (entry, i) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={
                                                            METHOD_COLORS[
                                                                i %
                                                                    METHOD_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={currencyFormatter}
                                            contentStyle={tooltipContentStyle}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-2 text-xs">
                                    {props.paymentMethods.map((entry, i) => (
                                        <span
                                            key={entry.name}
                                            className="inline-flex items-center gap-1.5"
                                        >
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                    background:
                                                        METHOD_COLORS[
                                                            i %
                                                                METHOD_COLORS.length
                                                        ],
                                                }}
                                            />
                                            <span className="capitalize text-muted-foreground">
                                                {entry.name}
                                            </span>
                                            <span className="font-medium">
                                                {currency.format(entry.value)}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Top tenants + user roles */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <SectionCard
                        title="Top Tenants"
                        description="By revenue this month"
                        className="xl:col-span-2"
                    >
                        {props.topTenants.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No revenue yet
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {props.topTenants.map((t, i) => (
                                    <li
                                        key={t.id}
                                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {t.name}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-medium">
                                            {currency.format(t.revenue)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Users by Role"
                        description={`${numberFmt.format(stats.users.total)} total users`}
                    >
                        {props.userRoles.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No users yet
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {props.userRoles.map((r) => (
                                    <li
                                        key={r.role}
                                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                                    >
                                        <span className="text-sm font-medium capitalize">
                                            {r.role}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {numberFmt.format(r.count)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>
                </div>

                {/* Activity feed */}
                <SectionCard
                    title="Recent Activity"
                    description="Latest invoices, payments, and new tenants"
                >
                    {props.recentActivity.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nothing yet
                        </p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {props.recentActivity.map((a, i) => {
                                const tone =
                                    a.type === "invoice"
                                        ? "bg-primary/10 text-primary"
                                        : a.type === "payment"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

                                const Icon =
                                    a.type === "invoice"
                                        ? ReceiptText
                                        : a.type === "payment"
                                          ? CreditCard
                                          : Building2;

                                return (
                                    <li
                                        key={`${a.type}-${i}`}
                                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div
                                            className={cn(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                                tone,
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {a.title}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {a.description}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {a.amount !== null && (
                                                <p className="text-sm font-medium">
                                                    {currency.format(a.amount)}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {relative(a.at)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </SectionCard>
            </div>
        </>
    );
}

LandlordAdminDashboard.layout = {
    breadcrumbs: [{ title: "Dashboard", href: "/" }],
};
