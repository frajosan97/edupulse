// resources/js/pages/payments/show.tsx
import { Head, Link } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Info,
    Receipt,
    User,
    Wallet,
    XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { Payment, PaymentStatus } from "@/types";
import {
    currency,
    SETTING_FIELDS,
} from "@/components/forms/payments/payment-form-types";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface Props {
    payment: Payment;
}

const STATUS_MAP: Record<
    PaymentStatus,
    {
        label: string;
        className: string;
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    pending: {
        label: "Pending",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        icon: Clock,
    },
    completed: {
        label: "Completed",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    paid: {
        label: "Paid",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        icon: CheckCircle2,
    },
    failed: {
        label: "Failed",
        className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        icon: XCircle,
    },
    refunded: {
        label: "Refunded",
        className:
            "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        icon: AlertCircle,
    },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
    const config = STATUS_MAP[status] ?? STATUS_MAP.pending;
    const Icon = config.icon;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function PaymentShow({ payment }: Props) {
    // Derive settings fields to show (only non-null values)
    const settingsEntries = Object.entries(
        ((payment as any).settings as Record<string, any> | null) ?? {},
    ).filter(
        ([, value]) => value !== null && value !== "" && value !== undefined,
    );

    /* ------------------------------------------------------------------ */
    /*                             Stat Cards                             */
    /* ------------------------------------------------------------------ */

    const statCards: StatCardData[] = [
        {
            id: "amount",
            label: "Amount",
            value: currency.format(payment.amount),
            icon: Wallet,
            accent: true,
        },
        {
            id: "method",
            label: "Method",
            value: payment.payment_method?.name ?? "—",
            icon: CreditCard,
        },
        {
            id: "invoice",
            label: "Invoice",
            value: payment.invoice?.invoice_number ?? "—",
            icon: Receipt,
        },
    ];

    return (
        <>
            <Head title={`Payment #${payment.id}`} />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title={`Payment #${payment.id}`}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Wallet className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            Recorded on {payment.formatted_payment_date ?? "—"}
                        </p>
                    }
                    statuses={<StatusBadge status={payment.status} />}
                    backHref={route("payments.index")}
                />

                {/* Summary strip */}
                <StatsCards data={statCards} />

                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Payment details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Payment details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <DetailRow
                                label="Reference"
                                value={payment.reference}
                                mono
                            />
                            <DetailRow
                                label="Provider"
                                value={payment.provider}
                            />
                            <DetailRow
                                label="Provider transaction"
                                value={payment.provider_transaction_id}
                                mono
                            />
                            <DetailRow
                                label="Payer name"
                                value={payment.payer_name}
                            />
                            {(payment as any).payer_phone && (
                                <DetailRow
                                    label="Payer phone"
                                    value={(payment as any).payer_phone}
                                />
                            )}
                            <DetailRow
                                label="Currency"
                                value={payment.currency}
                            />
                        </CardContent>
                    </Card>

                    {/* Invoice details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                Linked invoice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {payment.invoice ? (
                                <>
                                    <DetailRow
                                        label="Invoice #"
                                        value={payment.invoice.invoice_number}
                                        mono
                                    />
                                    <DetailRow
                                        label="Invoice total"
                                        value={currency.format(
                                            payment.invoice.total,
                                        )}
                                    />
                                    <DetailRow
                                        label="Amount paid"
                                        value={currency.format(
                                            payment.invoice.amount_paid,
                                        )}
                                    />
                                    <Separator />
                                    <DetailRow
                                        label="Amount due"
                                        value={currency.format(
                                            payment.invoice.amount_due,
                                        )}
                                        emphasis
                                    />
                                    <DetailRow
                                        label="Invoice status"
                                        value={payment.invoice.status}
                                    />
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    No invoice linked to this payment.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Method-specific settings */}
                {settingsEntries.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                {payment.payment_method?.name ?? "Method"}{" "}
                                details
                            </CardTitle>
                            <CardDescription>
                                Reference information captured for this payment
                                method.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {settingsEntries.map(([key, value]) => {
                                    const meta = SETTING_FIELDS[key];
                                    const label =
                                        meta?.label ??
                                        key
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase(),
                                            );
                                    return (
                                        <div key={key} className="min-w-0">
                                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {label}
                                            </dt>
                                            <dd
                                                className={cn(
                                                    "mt-1 truncate text-sm text-foreground",
                                                    meta?.mono && "font-mono",
                                                )}
                                            >
                                                {String(value)}
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {payment.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line text-sm text-foreground">
                                {payment.notes}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Audit trail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Audit trail
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <DetailRow
                            label="Recorded"
                            value={payment.created_at ?? "—"}
                        />
                        <DetailRow
                            label="Last updated"
                            value={payment.updated_at ?? "—"}
                        />
                        {(payment as any).confirmed_at && (
                            <DetailRow
                                label="Confirmed"
                                value={(payment as any).confirmed_at}
                            />
                        )}
                        {(payment as any).processed_at && (
                            <DetailRow
                                label="Processed"
                                value={(payment as any).processed_at}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

function DetailRow({
    label,
    value,
    mono,
    emphasis,
}: {
    label: string;
    value: string | number | null | undefined;
    mono?: boolean;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span
                className={cn(
                    "truncate text-right text-sm",
                    mono && "font-mono",
                    emphasis ? "font-semibold text-primary" : "text-foreground",
                )}
            >
                {value ?? "—"}
            </span>
        </div>
    );
}

PaymentShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: "Payments", href: "/payments" },
        { title: props.payment?.id ?? "Payment", href: "/payments/edit" },
    ],
});
