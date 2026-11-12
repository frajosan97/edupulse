// resources/js/pages/modules/module-form.tsx
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    AlertCircle,
    BookOpen,
    CircleDollarSign,
    Info,
    Loader2,
    Plus,
    Repeat,
    Save,
    Sparkles,
    Star,
    Trash2,
    Users,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { Module } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});

const easeOut = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface ModuleFormData {
    name: string;
    code: string;
    icon: string;
    description: string;
    base_price: number;
    included_students: number;
    per_student_price: number;
    min_bill_amount: number;
    max_bill_amount: number;
    period: string;
    featured: boolean;
    is_active: boolean;
    order_number: number;
    features: string[];
}

interface Props {
    module?: Module;
    mode?: "create" | "edit";
    periods?: string[];
}

type TabKey = "identity" | "pricing" | "features" | "visibility";

const TABS = [
    { key: "identity", label: "Identity", icon: Info },
    { key: "pricing", label: "Pricing", icon: CircleDollarSign },
    { key: "features", label: "Features", icon: Sparkles },
    { key: "visibility", label: "Visibility", icon: Star },
] as const;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>
    );
}

function FieldHint({ children }: { children: React.ReactNode }) {
    return <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>;
}

// Maps validation errors to the correct tab
function tabForError(field: string): TabKey | null {
    if (
        ["name", "code", "icon", "description", "order_number"].includes(field)
    ) {
        return "identity";
    }
    if (
        [
            "base_price",
            "per_student_price",
            "included_students",
            "period",
            "min_bill_amount",
            "max_bill_amount",
        ].includes(field)
    ) {
        return "pricing";
    }
    if (field === "features" || field.startsWith("features.")) {
        return "features";
    }
    if (["featured", "is_active"].includes(field)) {
        return "visibility";
    }
    return null;
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function ModuleForm({
    module,
    mode = module ? "edit" : "create",
    periods = ["monthly", "quarterly", "yearly"],
}: Props) {
    const isEdit = mode === "edit" && !!module;

    const { data, setData, post, put, processing, errors, reset } =
        useForm<ModuleFormData>({
            name: module?.name ?? "",
            code: module?.code ?? "",
            icon: module?.icon ?? "bi-graph-up",
            description: module?.description ?? "",
            base_price: module?.base_price ?? 0,
            included_students: module?.included_students ?? 200,
            per_student_price: module?.per_student_price ?? 0,
            min_bill_amount: module?.min_bill_amount ?? 0,
            max_bill_amount: module?.max_bill_amount ?? 0,
            period: module?.period ?? "yearly",
            featured: module?.featured ?? false,
            is_active: module?.is_active ?? true,
            order_number: module?.order_number ?? 1,
            features: module?.features ?? [],
        });

    const [tab, setTab] = useState<TabKey>("identity");

    /* -------------------- validation errors → toast + auto-tab ------------ */
    const errorSignature = useMemo(
        () => JSON.stringify(errors ?? {}),
        [errors],
    );
    const lastErrorSig = useRef<string>("");

    useEffect(() => {
        if (errorSignature === lastErrorSig.current) return;
        lastErrorSig.current = errorSignature;

        const keys = Object.keys(errors ?? {});
        if (keys.length === 0) return;

        toast.error(
            keys.length === 1
                ? "Please fix 1 field before submitting."
                : `Please fix ${keys.length} fields before submitting.`,
            {
                description: keys
                    .slice(0, 3)
                    .map((k) => `• ${(errors as Record<string, string>)[k]}`)
                    .join("\n"),
            },
        );

        for (const key of keys) {
            const target = tabForError(key);
            if (target) {
                setTab(target);
                break;
            }
        }
    }, [errorSignature, errors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && module) {
            put(route("modules.update", { module: module.id }), {
                preserveScroll: true,
            });
        } else {
            post(route("modules.store"), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    /* --------------------------- Features editor --------------------------- */
    const addFeature = () => setData("features", [...data.features, ""]);
    const updateFeature = (i: number, value: string) => {
        const next = [...data.features];
        next[i] = value;
        setData("features", next);
    };
    const removeFeature = (i: number) =>
        setData(
            "features",
            data.features.filter((_, idx) => idx !== i),
        );

    /* ---------------------------- Preview bill ----------------------------- */
    const projectedBill =
        data.base_price + data.per_student_price * data.included_students;

    /* -------------------------- Icon normalization ------------------------- */
    const normalizedIcon = data.icon.trim()
        ? data.icon.startsWith("bi-")
            ? data.icon
            : `bi-${data.icon}`
        : "bi-question-circle";

    return (
        <>
            <Head title={isEdit ? `Edit ${module!.name}` : "Create Module"} />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
                {/* Reusable PageHeader */}
                <PageHeader
                    title={isEdit ? "Edit Module" : "Create Module"}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <i
                                className={cn(
                                    "bi",
                                    normalizedIcon,
                                    "text-2xl leading-none",
                                )}
                            />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            {isEdit
                                ? `Updating ${module!.name}. Changes take effect immediately.`
                                : "Add a new module to your catalogue."}
                        </p>
                    }
                    backHref={route("modules.index")}
                />

                <form onSubmit={submit} className="space-y-4">
                    {/* error banner */}
                    {Object.keys(errors).length > 0 && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                                <strong className="block">
                                    Please fix {Object.keys(errors).length}{" "}
                                    field
                                    {Object.keys(errors).length === 1
                                        ? ""
                                        : "s"}
                                    :
                                </strong>
                                <ul className="mt-1 list-disc pl-5">
                                    {Object.entries(errors).map(
                                        ([field, msg]) => (
                                            <li key={field}>
                                                <span className="font-mono text-xs">
                                                    {field}
                                                </span>
                                                : {msg as string}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Unified Tab Card */}
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        {/* Tab bar */}
                        <div className="flex w-full flex-wrap items-center border-b px-3 pt-1">
                            {TABS.map((t) => {
                                const Icon = t.icon;
                                const active = tab === t.key;
                                const badgeCount =
                                    t.key === "features"
                                        ? data.features.length
                                        : undefined;

                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setTab(t.key)}
                                        className={cn(
                                            "relative flex items-center gap-1.5 rounded-sm px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary",
                                            active
                                                ? "text-foreground"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {t.label}
                                        {badgeCount !== undefined &&
                                            badgeCount > 0 && (
                                                <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                                                    {badgeCount}
                                                </span>
                                            )}
                                        {active && (
                                            <motion.div
                                                layoutId="module-tab-underline"
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

                        {/* Tab content */}
                        <div className="p-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{
                                        duration: 0.15,
                                        ease: easeOut,
                                    }}
                                >
                                    {/* IDENTITY TAB */}
                                    {tab === "identity" && (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <Label htmlFor="name">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            "name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. Student Analytics"
                                                    className="mt-1.5"
                                                />
                                                <FieldError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="code">
                                                    Code
                                                </Label>
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={(e) =>
                                                        setData(
                                                            "code",
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="e.g. ANALYTICS"
                                                    className="mt-1.5 font-mono"
                                                />
                                                <FieldHint>
                                                    Unique identifier,
                                                    uppercase, no spaces.
                                                </FieldHint>
                                                <FieldError
                                                    message={errors.code}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="order_number">
                                                    Order
                                                </Label>
                                                <Input
                                                    id="order_number"
                                                    type="number"
                                                    min={1}
                                                    value={data.order_number}
                                                    onChange={(e) =>
                                                        setData(
                                                            "order_number",
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="mt-1.5"
                                                />
                                                <FieldHint>
                                                    Lower numbers appear first.
                                                </FieldHint>
                                                <FieldError
                                                    message={
                                                        errors.order_number
                                                    }
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <Label htmlFor="icon">
                                                    Icon
                                                </Label>
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground">
                                                        <i
                                                            className={cn(
                                                                "bi",
                                                                normalizedIcon,
                                                                "text-lg leading-none",
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                    <Input
                                                        id="icon"
                                                        value={data.icon}
                                                        onChange={(e) =>
                                                            setData(
                                                                "icon",
                                                                e.target.value.trim(),
                                                            )
                                                        }
                                                        placeholder="e.g. bi-graph-up"
                                                        className="font-mono"
                                                    />
                                                </div>
                                                <FieldHint>
                                                    Bootstrap Icon class — e.g.{" "}
                                                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                                                        bi-graph-up
                                                    </code>
                                                    ,{" "}
                                                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                                                        bi-cash-stack
                                                    </code>
                                                    . Browse at{" "}
                                                    <a
                                                        href="https://icons.getbootstrap.com"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="underline underline-offset-2 hover:text-foreground"
                                                    >
                                                        icons.getbootstrap.com
                                                    </a>
                                                    .
                                                </FieldHint>
                                                <FieldError
                                                    message={errors.icon}
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <Label htmlFor="description">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                    placeholder="Briefly describe what this module offers."
                                                    className="mt-1.5 resize-none"
                                                />
                                                <FieldError
                                                    message={errors.description}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* PRICING TAB */}
                                    {tab === "pricing" && (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="base_price">
                                                        Base price
                                                    </Label>
                                                    <div className="relative mt-1.5">
                                                        <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            id="base_price"
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={
                                                                data.base_price
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "base_price",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <FieldHint>
                                                        Charged per billing
                                                        period.
                                                    </FieldHint>
                                                    <FieldError
                                                        message={
                                                            errors.base_price
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="per_student_price">
                                                        Per student price
                                                    </Label>
                                                    <div className="relative mt-1.5">
                                                        <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            id="per_student_price"
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={
                                                                data.per_student_price
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "per_student_price",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <FieldHint>
                                                        Added for each student
                                                        above the included
                                                        limit.
                                                    </FieldHint>
                                                    <FieldError
                                                        message={
                                                            errors.per_student_price
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="included_students">
                                                        Included students
                                                    </Label>
                                                    <div className="relative mt-1.5">
                                                        <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            id="included_students"
                                                            type="number"
                                                            min={0}
                                                            value={
                                                                data.included_students
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "included_students",
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <FieldHint>
                                                        Students covered by the
                                                        base price.
                                                    </FieldHint>
                                                    <FieldError
                                                        message={
                                                            errors.included_students
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="period">
                                                        Billing period
                                                    </Label>
                                                    <Select
                                                        value={data.period}
                                                        onValueChange={(v) =>
                                                            setData("period", v)
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1.5">
                                                            <Repeat className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {periods.map(
                                                                (p) => (
                                                                    <SelectItem
                                                                        key={p}
                                                                        value={
                                                                            p
                                                                        }
                                                                        className="capitalize"
                                                                    >
                                                                        {p}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldError
                                                        message={errors.period}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="min_bill_amount">
                                                        Min bill
                                                    </Label>
                                                    <div className="relative mt-1.5">
                                                        <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            id="min_bill_amount"
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={
                                                                data.min_bill_amount
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "min_bill_amount",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <FieldError
                                                        message={
                                                            errors.min_bill_amount
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="max_bill_amount">
                                                        Max bill
                                                    </Label>
                                                    <div className="relative mt-1.5">
                                                        <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            id="max_bill_amount"
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={
                                                                data.max_bill_amount
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "max_bill_amount",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <FieldError
                                                        message={
                                                            errors.max_bill_amount
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="rounded-lg border bg-muted/30 p-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">
                                                        Projected bill (base +{" "}
                                                        {data.included_students.toLocaleString()}{" "}
                                                        students)
                                                    </span>
                                                    <span className="font-semibold text-foreground">
                                                        {currency.format(
                                                            projectedBill,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* FEATURES TAB */}
                                    {tab === "features" && (
                                        <div className="space-y-3">
                                            {data.features.length === 0 && (
                                                <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                                                    <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        No features yet.
                                                    </p>
                                                </div>
                                            )}

                                            {data.features.map((feature, i) => (
                                                <motion.div
                                                    key={i}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        y: 4,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Input
                                                        value={feature}
                                                        onChange={(e) =>
                                                            updateFeature(
                                                                i,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Feature ${i + 1}`}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeFeature(i)
                                                        }
                                                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        aria-label="Remove feature"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            ))}

                                            {errors.features && (
                                                <FieldError
                                                    message={errors.features}
                                                />
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFeature}
                                                className="w-full"
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add feature
                                            </Button>
                                        </div>
                                    )}

                                    {/* VISIBILITY TAB */}
                                    {tab === "visibility" && (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <ToggleRow
                                                icon={Star}
                                                title="Featured"
                                                description="Highlight on the catalogue."
                                                checked={data.featured}
                                                onChange={(v) =>
                                                    setData("featured", v)
                                                }
                                            />
                                            <ToggleRow
                                                icon={BookOpen}
                                                title="Active"
                                                description="Available for tenants to subscribe."
                                                checked={data.is_active}
                                                onChange={(v) =>
                                                    setData("is_active", v)
                                                }
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                toast.info("Form reset.");
                            }}
                            disabled={processing}
                        >
                            Reset form
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
                                    {isEdit ? "Save changes" : "Create module"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  ToggleRow                                 */
/* -------------------------------------------------------------------------- */

function ToggleRow({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-input bg-background hover:bg-muted/50",
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    checked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                )}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                        {title}
                    </span>
                    <Badge
                        variant={checked ? "default" : "secondary"}
                        className="shrink-0 text-[10px]"
                    >
                        {checked ? "On" : "Off"}
                    </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </button>
    );
}
