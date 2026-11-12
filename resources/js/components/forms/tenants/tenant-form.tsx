// resources/js/components/tenants/tenant-form.tsx
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    AlertCircle,
    Building2,
    Globe,
    Layers,
    Loader2,
    MapPin,
    Save,
    UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BasicTab } from "./form-tabs/basic-tab";
import { DomainsTab } from "./form-tabs/domains-tab";
import { LocationTab } from "./form-tabs/location-tab";
import { ModulesTab } from "./form-tabs/modules-tab";
import { tabForError } from "./shared/helpers";
import type {
    DomainRow,
    LocationOption,
    ModuleSelection,
    TabKey,
    TenantFormPayload,
} from "./shared/types";

import type { Module, Tenant } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

const TABS = [
    { key: "basic", label: "Basic Info", icon: UserRound },
    { key: "domains", label: "Domains", icon: Globe },
    { key: "location", label: "Location", icon: MapPin },
    { key: "modules", label: "Modules", icon: Layers },
] as const;

interface Props {
    tenant?: Tenant;
    mode?: "create" | "edit";
    modules?: Module[];
    counties?: LocationOption[];
    constituencies?: LocationOption[];
    wards?: LocationOption[];
    flash?: { success?: string | null; error?: string | null };
}

export function TenantForm({
    tenant,
    mode = tenant ? "edit" : "create",
    modules = [],
    counties = [],
    constituencies = [],
    wards = [],
    flash,
}: Props) {
    const isEdit = mode === "edit" && !!tenant;

    const initialModules: ModuleSelection[] =
        tenant?.modules?.map((m) => ({
            module_id: m.id,
            student_count:
                m.pivot.student_count ?? tenant.student_count ?? null,
            billing_cycle: m.pivot.billing_cycle ?? "annual",
            status:
                m.pivot.status === "active" || m.pivot.status === "inactive"
                    ? m.pivot.status
                    : "active",
        })) ?? [];

    const initialDomains: DomainRow[] =
        tenant?.domains?.map((d) => ({
            id: d.id,
            domain: d.domain,
            is_primary: d.is_primary,
            status: d.status,
        })) ?? [];

    const { data, setData, post, put, processing, errors, reset } =
        useForm<TenantFormPayload>({
            name: tenant?.name ?? "",
            contact_name: tenant?.contact_name ?? "",
            email: tenant?.email ?? "",
            phone: tenant?.phone ?? "",
            address: tenant?.address ?? "",
            county_id: tenant?.county_id ?? null,
            constituency_id: tenant?.constituency_id ?? null,
            ward_id: tenant?.ward_id ?? null,
            location_id: tenant?.location_id ?? null,
            status:
                tenant?.status === "active" || tenant?.status === "inactive"
                    ? tenant.status
                    : "active",
            domains: initialDomains,
            modules: initialModules,
        });

    const [tab, setTab] = useState<TabKey>("basic");

    /* -------------------- flash toast (on mount) -------------------------- */
    const flashShown = useRef(false);
    useEffect(() => {
        if (flashShown.current) return;
        flashShown.current = true;
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

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

    /* -------------------- submit ------------------------------------------ */
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanDomains = data.domains
            .map((d) => ({ ...d, domain: d.domain.trim() }))
            .filter((d) => d.domain.length > 0);

        if (cleanDomains.length !== data.domains.length) {
            setData("domains", cleanDomains);
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) reset();
            },
            onError: (errs: Record<string, string>) => {
                const count = Object.keys(errs ?? {}).length;
                if (count > 0) {
                    toast.error(
                        count === 1
                            ? "1 field needs attention."
                            : `${count} fields need attention.`,
                    );
                }
            },
        } as const;

        if (isEdit && tenant) {
            put(route("tenants.update", { tenant: tenant.id }), options);
        } else {
            post(route("tenants.store"), options);
        }
    };

    /* -------------------- render ------------------------------------------ */
    return (
        <>
            <Head title={isEdit ? `Edit ${tenant!.name}` : "Create Tenant"} />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
                <PageHeader
                    title={isEdit ? "Edit Tenant" : "Create Tenant"}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <p className="text-sm text-muted-foreground">
                            {isEdit
                                ? `Updating ${tenant!.name}. Changes take effect immediately.`
                                : "Register a school or organisation, add domains, and choose the modules it subscribes to."}
                        </p>
                    }
                    backHref={route("tenants.index")}
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
                                    t.key === "domains"
                                        ? data.domains.length
                                        : t.key === "modules"
                                          ? data.modules.length
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
                                                layoutId="tenant-tab-underline"
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
                                    {tab === "basic" && (
                                        <BasicTab
                                            data={data}
                                            errors={
                                                errors as Record<
                                                    string,
                                                    string | undefined
                                                >
                                            }
                                            setData={setData}
                                        />
                                    )}

                                    {tab === "domains" && (
                                        <DomainsTab
                                            domains={data.domains}
                                            domainErrors={
                                                (
                                                    errors as unknown as {
                                                        domains?: Array<{
                                                            domain?: string;
                                                        }>;
                                                    }
                                                ).domains
                                            }
                                            setDomains={(rows) =>
                                                setData("domains", rows)
                                            }
                                        />
                                    )}

                                    {tab === "location" && (
                                        <LocationTab
                                            data={data}
                                            errors={
                                                errors as Record<
                                                    string,
                                                    string | undefined
                                                >
                                            }
                                            setData={setData}
                                            counties={counties}
                                            constituencies={constituencies}
                                            wards={wards}
                                        />
                                    )}

                                    {tab === "modules" && (
                                        <ModulesTab
                                            selections={data.modules}
                                            modules={modules}
                                            moduleError={
                                                (
                                                    errors as Record<
                                                        string,
                                                        string | undefined
                                                    >
                                                ).modules
                                            }
                                            setSelections={(rows) =>
                                                setData("modules", rows)
                                            }
                                        />
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
                                    {isEdit ? "Save changes" : "Create tenant"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
