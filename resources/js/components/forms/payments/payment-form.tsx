// resources/js/components/payments/payment-form.tsx
import { useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Info, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { InvoiceRef, Payment, PaymentMethodRef } from "@/types";
import {
    currency,
    findInvoice,
    SETTING_FIELDS,
    toDate,
    today,
    type PaymentFormData,
    type PaymentStatus,
} from "./payment-form-types";

interface Props {
    payment?: Payment;
    mode: "create" | "edit";
    invoices?: InvoiceRef[];
    paymentMethods?: PaymentMethodRef[];
    defaultInvoiceId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function PaymentForm({
    payment,
    mode,
    invoices = [],
    paymentMethods = [],
    defaultInvoiceId,
    onSuccess,
    onCancel,
}: Props) {
    const isEdit = mode === "edit" && !!payment;

    const { data, setData, post, put, processing, errors, reset } =
        useForm<PaymentFormData>({
            invoice_id: payment?.invoice_id ?? defaultInvoiceId ?? null,
            payment_method_id: payment?.payment_method_id ?? null,

            provider: payment?.provider ?? null,
            provider_transaction_id: payment?.provider_transaction_id ?? null,
            reference: payment?.reference ?? null,
            payer_name: payment?.payer_name ?? null,
            payer_phone: (payment as any)?.payer_phone ?? null,

            currency: payment?.currency ?? "KES",
            amount: payment?.amount ?? 0,
            payment_date: toDate(payment?.payment_date) ?? today(),
            status: payment?.status ?? "completed",

            notes: payment?.notes ?? null,

            // Initialize settings with existing payment settings or empty object
            settings: (payment as any)?.settings ?? {},
        });

    const err = (errors as Record<string, string>) || {};
    const errorCount = Object.keys(err).length;

    const selectedInvoice = useMemo(
        () => findInvoice(invoices, data.invoice_id),
        [invoices, data.invoice_id],
    );

    const selectedMethod = useMemo(
        () =>
            data.payment_method_id
                ? (paymentMethods.find(
                      (m) => m.id === data.payment_method_id,
                  ) ?? null)
                : null,
        [paymentMethods, data.payment_method_id],
    );

    // Derive the fields to show based on the method's settings keys
    const methodSettingsKeys = useMemo(() => {
        if (!selectedMethod?.settings) return [];
        return Object.keys(selectedMethod.settings).filter(
            (k) => SETTING_FIELDS[k],
        );
    }, [selectedMethod]);

    /* Auto-fill amount from invoice */
    const lastInvoiceRef = useRef<number | null>(null);
    useEffect(() => {
        if (isEdit) return;
        if (data.invoice_id === lastInvoiceRef.current) return;
        lastInvoiceRef.current = data.invoice_id;
        if (selectedInvoice && data.amount === 0) {
            setData("amount", selectedInvoice.amount_due);
        }
    }, [data.invoice_id, selectedInvoice, isEdit, setData, data.amount]);

    /* Validation error toast */
    const sig = JSON.stringify(err);
    const lastSig = useRef("");
    useEffect(() => {
        if (sig === lastSig.current) return;
        lastSig.current = sig;
        if (errorCount === 0) return;
        toast.error(
            errorCount === 1
                ? "Please fix 1 field before submitting."
                : `Please fix ${errorCount} fields before submitting.`,
            { description: Object.values(err).slice(0, 3).join("\n") },
        );
    }, [sig, errorCount, err]);

    /* Update a specific setting key */
    const updateSetting = (key: string, value: any) => {
        setData("settings", {
            ...data.settings,
            [key]: value,
        });
    };

    /* ------------------------------------------------------------------ */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.invoice_id) return toast.error("Please select an invoice.");
        if (!data.payment_method_id)
            return toast.error("Please select a payment method.");
        if (data.amount <= 0)
            return toast.error("Amount must be greater than zero.");

        // Validate required fields dynamically based on settings keys
        const missing = methodSettingsKeys.filter((key) => {
            const meta = SETTING_FIELDS[key];
            return meta?.required && !data.settings[key];
        });

        if (missing.length > 0) {
            toast.error("Missing required fields for this method.", {
                description: missing
                    .map((f) => SETTING_FIELDS[f]?.label ?? f)
                    .join(", "),
            });
            return;
        }

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success(
                    isEdit ? "Payment updated." : "Payment recorded.",
                );
                onSuccess?.();
            },
            onError: (e: Record<string, string>) =>
                toast.error("Please fix the highlighted fields.", {
                    description: Object.values(e).slice(0, 3).join("\n"),
                }),
        };

        if (isEdit && payment) {
            put(route("payments.update", { payment: payment.id }), opts);
        } else {
            post(route("payments.store"), opts);
        }
    };

    /* ------------------------------------------------------------------ */

    return (
        <form onSubmit={submit} className="w-full min-w-0 space-y-8">
            {errorCount > 0 && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                        <strong className="block">
                            Please fix {errorCount} field
                            {errorCount === 1 ? "" : "s"}:
                        </strong>
                        <ul className="mt-1 list-disc pl-5">
                            {Object.entries(err).map(([field, msg]) => (
                                <li key={field}>
                                    <span className="font-mono text-xs">
                                        {field}
                                    </span>
                                    : {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* STEP 1 — INVOICE */}
            <Step
                number={1}
                title="Select invoice"
                description="Which invoice is this payment settling?"
                done={!!data.invoice_id}
            >
                <div className="space-y-3">
                    <div className="max-w-xl">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Invoice
                        </Label>
                        <Select
                            value={data.invoice_id?.toString() ?? ""}
                            onValueChange={(v) => {
                                const inv = invoices.find(
                                    (i) => i.id === Number(v),
                                );
                                setData("invoice_id", Number(v));
                                if (inv && data.amount === 0) {
                                    setData("amount", inv.amount_due);
                                }
                            }}
                            disabled={isEdit}
                        >
                            <SelectTrigger className="mt-1 h-10 w-full bg-white">
                                <SelectValue placeholder="Select an outstanding invoice…" />
                            </SelectTrigger>
                            <SelectContent>
                                {invoices.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                        No outstanding invoices
                                    </div>
                                ) : (
                                    invoices.map((inv) => (
                                        <SelectItem
                                            key={inv.id}
                                            value={inv.id.toString()}
                                        >
                                            {inv.invoice_number} —{" "}
                                            {currency.format(inv.amount_due)}{" "}
                                            due
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {err.invoice_id && (
                            <p className="mt-1 text-xs text-destructive">
                                {err.invoice_id}
                            </p>
                        )}
                    </div>

                    {selectedInvoice && (
                        <div className="rounded-lg border bg-muted/40 p-4 max-w-xl">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total
                                    </p>
                                    <p className="font-medium">
                                        {currency.format(selectedInvoice.total)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Paid
                                    </p>
                                    <p className="font-medium">
                                        {currency.format(
                                            selectedInvoice.amount_paid,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Due
                                    </p>
                                    <p className="font-semibold text-primary">
                                        {currency.format(
                                            selectedInvoice.amount_due,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Step>

            {/* STEP 2 — METHOD + AMOUNT */}
            <Step
                number={2}
                title="Payment method & amount"
                description="How the funds were collected."
                done={!!data.payment_method_id && data.amount > 0}
            >
                <div className="space-y-4">
                    <div>
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Payment Method
                        </Label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {paymentMethods.map((m) => {
                                const active = data.payment_method_id === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                            setData("payment_method_id", m.id);
                                            // Optionally reset settings when changing method
                                            setData("settings", {});
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors",
                                            active
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                                : "border-input bg-background hover:bg-muted/50",
                                        )}
                                    >
                                        {m.icon && (
                                            <span className="text-lg leading-none">
                                                {m.icon}
                                            </span>
                                        )}
                                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                                            {m.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {err.payment_method_id && (
                            <p className="mt-1 text-xs text-destructive">
                                {err.payment_method_id}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg border bg-muted/20 p-4">
                        <div>
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Amount
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.amount}
                                onChange={(e) =>
                                    setData(
                                        "amount",
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                disabled={isEdit}
                                className="mt-1 h-10 bg-white"
                            />
                            {selectedInvoice && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Max:{" "}
                                    {currency.format(
                                        selectedInvoice.amount_due,
                                    )}{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                "amount",
                                                selectedInvoice.amount_due,
                                            )
                                        }
                                        className="font-medium text-primary hover:underline"
                                    >
                                        (Pay full)
                                    </button>
                                </p>
                            )}
                            {err.amount && (
                                <p className="mt-1 text-xs text-destructive">
                                    {err.amount}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Payment Date
                            </Label>
                            <Input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) =>
                                    setData("payment_date", e.target.value)
                                }
                                className="mt-1 h-10 bg-white"
                            />
                            {err.payment_date && (
                                <p className="mt-1 text-xs text-destructive">
                                    {err.payment_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Status
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(v: PaymentStatus) =>
                                    setData("status", v)
                                }
                            >
                                <SelectTrigger className="mt-1 h-10 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                    <SelectItem value="refunded">
                                        Refunded
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Step>

            {/* STEP 3 — METHOD-SPECIFIC DETAILS (DYNAMIC FROM DATABASE SETTINGS) */}
            {selectedMethod && methodSettingsKeys.length > 0 && (
                <Step
                    number={3}
                    title={`${selectedMethod.name} details`}
                    description={`Enter the ${selectedMethod.name} reference details below.`}
                    done={methodSettingsKeys.every(
                        (k) =>
                            !SETTING_FIELDS[k]?.required || !!data.settings[k],
                    )}
                >
                    <div className="rounded-lg border bg-slate-50 border-slate-200 p-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {methodSettingsKeys.map((key) => {
                                const meta = SETTING_FIELDS[key];
                                const fieldError = err[`settings.${key}`]; // Laravel validation error format for arrays
                                return (
                                    <div key={key}>
                                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {meta.label}
                                            {meta.required && (
                                                <span className="ml-0.5 text-destructive">
                                                    *
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            type={meta.type ?? "text"}
                                            value={data.settings[key] ?? ""}
                                            onChange={(e) =>
                                                updateSetting(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={meta.placeholder}
                                            className={cn(
                                                "mt-1 bg-white",
                                                meta.mono && "font-mono",
                                            )}
                                        />
                                        {fieldError && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {fieldError}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Step>
            )}

            {/* STEP 4 — PAYER + NOTES */}
            <Step
                number={selectedMethod && methodSettingsKeys.length > 0 ? 4 : 3}
                title="Payer & notes"
                description="Who paid, and any internal notes for the ledger."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Payer name
                        </Label>
                        <Input
                            value={data.payer_name ?? ""}
                            onChange={(e) =>
                                setData("payer_name", e.target.value || null)
                            }
                            placeholder="Name on the payment"
                            className="mt-1 bg-white"
                        />
                        {err.payer_name && (
                            <p className="mt-1 text-xs text-destructive">
                                {err.payer_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Payer phone
                        </Label>
                        <Input
                            type="tel"
                            value={data.payer_phone ?? ""}
                            onChange={(e) =>
                                setData("payer_phone", e.target.value || null)
                            }
                            placeholder="+254 7XX XXX XXX"
                            className="mt-1 bg-white"
                        />
                        {err.payer_phone && (
                            <p className="mt-1 text-xs text-destructive">
                                {err.payer_phone}
                            </p>
                        )}
                    </div>
                    <div className="sm:col-span-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Notes
                        </Label>
                        <Textarea
                            value={data.notes ?? ""}
                            onChange={(e) =>
                                setData("notes", e.target.value || null)
                            }
                            rows={3}
                            placeholder="Internal notes — reconciliation reference, follow-up, etc."
                            className="mt-1 resize-none bg-white"
                        />
                        {err.notes && (
                            <p className="mt-1 text-xs text-destructive">
                                {err.notes}
                            </p>
                        )}
                    </div>
                </div>
            </Step>

            {/* SUMMARY */}
            {selectedInvoice && data.amount > 0 && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">
                            {currency.format(data.amount)} against{" "}
                            {selectedInvoice.invoice_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {selectedInvoice.amount_due - data.amount > 0
                                ? `${currency.format(selectedInvoice.amount_due - data.amount)} will remain outstanding.`
                                : data.amount > selectedInvoice.amount_due
                                  ? `Overpayment of ${currency.format(data.amount - selectedInvoice.amount_due)} — confirm this is intended.`
                                  : "This settles the invoice in full."}
                        </div>
                    </div>
                    {data.amount >= selectedInvoice.amount_due && (
                        <Badge
                            variant="default"
                            className="shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-600"
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            Settles
                        </Badge>
                    )}
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            reset();
                            toast.info("Form reset.");
                        }}
                        disabled={processing}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="mr-1.5 h-4 w-4" />
                                {isEdit
                                    ? "Save changes"
                                    : `Record ${currency.format(data.amount)}`}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Sub-components                           */
/* -------------------------------------------------------------------------- */

function Step({
    number,
    title,
    description,
    done,
    children,
}: {
    number: number;
    title: string;
    description: string;
    done?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <div className="mb-3 flex items-start gap-3">
                <div
                    className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
                        done
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground border",
                    )}
                >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : number}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div className="pl-10 border-l-2 border-muted ml-3.5 pb-2">
                {children}
            </div>
        </div>
    );
}
