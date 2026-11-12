// resources/js/components/invoices/invoice-form.tsx
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, Receipt, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    emptyLine,
    inDays,
    lineFromModel,
    normalizeStatus,
    toDate,
    today,
    type InvoiceFormData,
} from "./invoice-form-types";
import { InvoiceCompanyHeader } from "./sections/invoice-company-header";
import { InvoiceBillTo } from "./sections/invoice-bill-to";
import { InvoiceDatesCard } from "./sections/invoice-dates-card";
import { InvoiceLineItems } from "./sections/invoice-line-items";
import { InvoiceBillingNotes } from "./sections/invoice-billing-notes";
import { InvoiceTotals } from "./sections/invoice-totals";
import { InvoicePaymentTerms } from "./sections/invoice-payment-terms";

import type { Invoice, Module, Tenant } from "@/types";

interface Props {
    invoice?: Invoice;
    mode?: "create" | "edit";
    tenants?: Tenant[];
    modules?: Module[];
    defaultTenantId?: string;
}

export function InvoiceForm({
    invoice,
    mode = invoice ? "edit" : "create",
    tenants = [],
    modules = [],
    defaultTenantId,
}: Props) {
    const isEdit = mode === "edit" && !!invoice;

    const { data, setData, post, put, processing, errors, reset } =
        useForm<InvoiceFormData>({
            tenant_id: invoice?.tenant?.id ?? defaultTenantId ?? "",
            invoice_number: invoice?.invoice_number ?? "",
            invoice_date: toDate(invoice?.invoice_date) ?? today(),
            due_date: toDate(invoice?.due_date) ?? inDays(30),
            period_start: toDate(invoice?.period_start),
            period_end: toDate(invoice?.period_end),
            currency: invoice?.currency ?? "KES",
            description: invoice?.description ?? null,
            status: normalizeStatus(invoice?.status),
            items:
                invoice?.items && invoice.items.length > 0
                    ? invoice.items.map(lineFromModel)
                    : [emptyLine()],
        });

    const err = (errors as Record<string, string>) || {};
    const errorCount = Object.keys(err).length;

    const selectedTenant = useMemo(
        () => tenants.find((t) => t.id === data.tenant_id) ?? null,
        [tenants, data.tenant_id],
    );

    /* single toast for validation errors */
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
            {
                description: Object.values(err).slice(0, 3).join("\n"),
            },
        );
    }, [sig, errorCount, err]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.tenant_id) {
            toast.error("Please select a tenant.");
            return;
        }
        const hasValid = data.items.some(
            (i) => i.description.trim() && i.quantity > 0,
        );
        if (!hasValid) {
            toast.error("Add at least one valid line item.");
            return;
        }

        const payload = {
            ...data,
            items: data.items.map(({ key, ...rest }) => rest),
        };

        const opts = {
            preserveScroll: true,
            data: payload,
        } as any;

        if (isEdit && invoice) {
            put(route("invoices.update", { invoice: invoice.id }), opts);
        } else {
            post(route("invoices.store"), {
                ...opts,
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <>
            <Head
                title={
                    isEdit
                        ? `Edit ${invoice!.invoice_number}`
                        : "Create Invoice"
                }
            />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
                <form onSubmit={submit} className="space-y-4">
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

                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="space-y-6 p-5 md:p-6">
                            <InvoiceCompanyHeader
                                data={data}
                                setData={setData}
                                invoiceNumberError={err.invoice_number}
                            />

                            <div className="grid gap-4 md:grid-cols-12">
                                <InvoiceBillTo
                                    tenantId={data.tenant_id}
                                    selectedTenant={selectedTenant}
                                    tenants={tenants}
                                    setData={setData}
                                    error={err.tenant_id}
                                />
                                <InvoiceDatesCard
                                    data={data}
                                    setData={setData}
                                    invoiceDateError={err.invoice_date}
                                    dueDateError={err.due_date}
                                />
                            </div>

                            <InvoiceLineItems
                                data={data}
                                setData={setData}
                                modules={modules}
                                errors={err}
                                onRemoveBlocked={() =>
                                    toast.warning(
                                        "At least one line item is required.",
                                    )
                                }
                            />

                            <InvoiceBillingNotes
                                data={data}
                                setData={setData}
                                periodStartError={err.period_start}
                                periodEndError={err.period_end}
                                descriptionError={err.description}
                            />

                            <InvoiceTotals items={data.items} />

                            <InvoicePaymentTerms />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="outline" asChild>
                            <Link href={route("invoices.index")}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Link>
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
                                        {isEdit ? "Updating…" : "Creating…"}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 h-4 w-4" />
                                        {isEdit
                                            ? "Update Invoice"
                                            : "Create Invoice"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
