// resources/js/components/tenants/tabs/modules-tab.tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Layers, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    FormSelect,
    RSOption,
    selectValue,
    toOptions,
} from "@/components/ui/form-select";

import { Field, currency, inputClass } from "../shared/helpers";
import type {
    BillingCycle,
    ModuleSelection,
    TenantFormPayload,
} from "../shared/types";
import type { Module } from "@/types";

const BILLING_OPTIONS: RSOption<BillingCycle>[] = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
];

interface Props {
    selections: ModuleSelection[];
    modules: Module[];
    moduleError?: string;
    setSelections: (rows: ModuleSelection[]) => void;
}

export function ModulesTab({
    selections,
    modules,
    moduleError,
    setSelections,
}: Props) {
    const selectedIds = useMemo(
        () => new Set(selections.map((m) => m.module_id)),
        [selections],
    );

    const availableModules = useMemo(
        () => modules.filter((m) => !selectedIds.has(m.id)),
        [modules, selectedIds],
    );

    const moduleOptions = useMemo(
        () =>
            toOptions(
                availableModules,
                "id",
                (m) => `${m.name}${m.code ? ` (${m.code})` : ""}`,
            ),
        [availableModules],
    );

    const moduleById = useMemo(() => {
        const map = new Map<number, Module>();
        modules.forEach((m) => map.set(m.id, m));
        return map;
    }, [modules]);

    const addModule = (moduleId: number) => {
        if (selectedIds.has(moduleId)) return;
        setSelections([
            ...selections,
            {
                module_id: moduleId,
                student_count: null,
                billing_cycle: "annual",
                status: "active",
            },
        ]);
    };

    const removeModule = (moduleId: number) =>
        setSelections(selections.filter((m) => m.module_id !== moduleId));

    const updateModule = (moduleId: number, patch: Partial<ModuleSelection>) =>
        setSelections(
            selections.map((m) =>
                m.module_id === moduleId ? { ...m, ...patch } : m,
            ),
        );

    const projectedTotal = useMemo(() => {
        return selections.reduce((sum, sel) => {
            const mod = moduleById.get(sel.module_id);
            if (!mod) return sum;
            const count = sel.student_count ?? 0;
            const extra = Math.max(0, count - mod.included_students);
            const raw = mod.base_price + extra * mod.per_student_price;
            const min = mod.min_bill_amount ?? 0;
            const max = mod.max_bill_amount ?? Number.POSITIVE_INFINITY;
            return sum + Math.min(Math.max(raw, min), max);
        }, 0);
    }, [selections, moduleById]);

    return (
        <section className="rounded-xl border border-sidebar-border/70 bg-card px-4 py-3">
            <div className="space-y-3">
                <Field label="Add module" error={moduleError}>
                    <FormSelect<RSOption<number>>
                        isSearchable
                        placeholder={
                            availableModules.length
                                ? "Search and choose a module…"
                                : "All modules already added"
                        }
                        isDisabled={availableModules.length === 0}
                        options={moduleOptions}
                        value={null}
                        onChange={(opt) => {
                            const id = selectValue(opt);
                            if (id != null) addModule(id);
                        }}
                    />
                </Field>

                {selections.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                        <Layers className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            No modules selected yet.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {selections.map((sel) => {
                            const mod = moduleById.get(sel.module_id);
                            if (!mod) return null;
                            return (
                                <motion.li
                                    key={sel.module_id}
                                    layout
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg border bg-background p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="truncate font-medium">
                                                    {mod.name}
                                                </span>
                                                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                    {mod.code}
                                                </code>
                                            </div>
                                            <div className="mt-0.5 text-xs text-muted-foreground">
                                                Base{" "}
                                                {currency.format(
                                                    mod.base_price,
                                                )}{" "}
                                                · {mod.included_students} incl ·
                                                +
                                                {currency.format(
                                                    mod.per_student_price,
                                                )}
                                                /extra
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                removeModule(sel.module_id)
                                            }
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                        <Field label="Students">
                                            <input
                                                type="number"
                                                min={0}
                                                className={inputClass}
                                                value={sel.student_count ?? ""}
                                                onChange={(e) =>
                                                    updateModule(
                                                        sel.module_id,
                                                        {
                                                            student_count:
                                                                e.target
                                                                    .value ===
                                                                ""
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                        },
                                                    )
                                                }
                                                placeholder={`${mod.included_students} included`}
                                            />
                                        </Field>
                                        <Field label="Billing cycle">
                                            <FormSelect<RSOption<BillingCycle>>
                                                isSearchable={false}
                                                options={BILLING_OPTIONS}
                                                value={
                                                    BILLING_OPTIONS.find(
                                                        (o) =>
                                                            o.value ===
                                                            sel.billing_cycle,
                                                    ) ?? BILLING_OPTIONS[2]
                                                }
                                                onChange={(opt) => {
                                                    const v = selectValue(opt);
                                                    if (v)
                                                        updateModule(
                                                            sel.module_id,
                                                            {
                                                                billing_cycle:
                                                                    v,
                                                            },
                                                        );
                                                }}
                                            />
                                        </Field>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ul>
                )}

                {selections.length > 0 && (
                    <div className="flex items-center justify-between border-t border-sidebar-border/50 pt-2 text-sm">
                        <span className="text-muted-foreground">
                            Estimated total
                        </span>
                        <span className="font-semibold">
                            {currency.format(projectedTotal)}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
