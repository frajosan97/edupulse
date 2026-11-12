import { Globe, Plus, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { Field, SectionHeader, inputClass } from "../shared/helpers";
import type { DomainRow } from "../shared/types";

interface Props {
    domains: DomainRow[];
    domainErrors?: Array<{ domain?: string }>;
    setDomains: (rows: DomainRow[]) => void;
}

const AUTO_SUBDOMAINS = ["admin", "analytics", "finance"] as const;

/** Local row: DomainRow + stable client-side identity. */
type Row = DomainRow & { clientId: string };

function newClientId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `row_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function normalizeDomain(raw: string): string {
    return raw
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "")
        .toLowerCase();
}

function isDerivableDomain(raw: string): boolean {
    const d = normalizeDomain(raw);
    return d.length > 0 && !d.includes(" ") && d.includes(".");
}

function buildSubdomains(primary: string): string[] {
    const base = normalizeDomain(primary);
    if (!isDerivableDomain(base)) return [];
    return AUTO_SUBDOMAINS.map((sub) => `${sub}.${base}`);
}

/**
 * Reconcile auto rows against the current manual primary.
 * - Manual rows keep order and clientId.
 * - Existing auto rows are reused (matched by normalized domain) so their
 *   clientId stays stable across regenerations.
 * - New auto rows get fresh clientIds and are appended.
 * - Dismissed auto rows are preserved as tombstones.
 */
function regenerateAutoSubdomains(rows: Row[]): Row[] {
    const primary = rows.find((d) => d.is_primary && !d.auto_generated);
    const manualRows = rows.filter((d) => !d.auto_generated);
    const dismissedRows = rows.filter((d) => d.auto_generated && d.dismissed);
    const existingAutoRows = rows.filter(
        (d) => d.auto_generated && !d.dismissed,
    );

    if (!primary || !isDerivableDomain(primary.domain)) {
        return [...manualRows, ...dismissedRows];
    }

    const desired = buildSubdomains(primary.domain);
    const manualSet = new Set(manualRows.map((d) => normalizeDomain(d.domain)));
    const dismissedSet = new Set(
        dismissedRows.map((d) => normalizeDomain(d.domain)),
    );
    const existingAutoByDomain = new Map(
        existingAutoRows.map((d) => [normalizeDomain(d.domain), d]),
    );

    const autoRows: Row[] = [];
    for (const domain of desired) {
        if (manualSet.has(domain) || dismissedSet.has(domain)) continue;
        const existing = existingAutoByDomain.get(domain);
        if (existing) {
            autoRows.push(existing);
            existingAutoByDomain.delete(domain);
        } else {
            autoRows.push({
                clientId: newClientId(),
                domain,
                is_primary: false,
                status: "active",
                auto_generated: true,
            });
        }
    }

    return [...manualRows, ...dismissedRows, ...autoRows];
}

function clearDismissed(rows: Row[]): Row[] {
    return rows.filter((d) => !d.dismissed);
}

function stripAutoRows(rows: Row[]): Row[] {
    return rows.filter((d) => !d.auto_generated);
}

/** Assign clientIds to incoming rows, reusing existing ones by clientId when present. */
function hydrateRows(input: DomainRow[], current: Row[]): Row[] {
    const used = new Set<string>();

    const hydrated = input.map((d) => {
        const incomingId = (d as Partial<Row>).clientId;
        if (incomingId) {
            used.add(incomingId);
            return { ...d, clientId: incomingId } as Row;
        }
        // No id from parent — try to match by domain among not-yet-used rows.
        const existing = current.find(
            (r) => !used.has(r.clientId) && r.domain === d.domain,
        );
        const clientId = existing?.clientId ?? newClientId();
        used.add(clientId);
        return { ...d, clientId } as Row;
    });

    // The parent never receives dismissed tombstones (we strip them in
    // commitToParent). Re-append any internal tombstones so the debounced
    // regeneration still knows which auto rows the user removed.
    const tombstones = current.filter(
        (r) => r.dismissed && !used.has(r.clientId),
    );

    return [...hydrated, ...tombstones];
}

/** Strip UI-only fields before handing rows to the parent. */
function toDomainRows(rows: Row[]): DomainRow[] {
    return rows
        .filter((d) => !d.dismissed)
        .map(({ clientId, ...rest }) => rest as DomainRow);
}

export function DomainsTab({ domains, domainErrors, setDomains }: Props) {
    const [autoGenerate, setAutoGenerate] = useState(true);

    const rowsRef = useRef<Row[]>([]);
    const [rows, setRowsState] = useState<Row[]>(() => {
        const hydrated = hydrateRows(domains, []);
        rowsRef.current = hydrated;
        return hydrated;
    });

    /**
     * Commit rows to both local state and parent.
     * Tombstones stay local; the parent only ever sees visible rows, and
     * never sees `clientId` (UI-only) or `dismissed` (UI-only).
     */
    const commitToParent = (next: Row[]) => {
        rowsRef.current = next;
        setRowsState(next);
        setDomains(toDomainRows(next));
    };

    /** Local-only update (used while typing). Does NOT touch the parent. */
    const setRowsLocal = (next: Row[]) => {
        rowsRef.current = next;
        setRowsState(next);
    };

    // Reconcile external `domains` changes. Echoes of our own commits carry
    // the same visible rows; hydrateRows re-appends tombstones so this
    // becomes a no-op (no remount, no churn, no lost tombstones).
    const externalSnapshot = useRef(domains);
    useEffect(() => {
        if (externalSnapshot.current === domains) return;
        externalSnapshot.current = domains;

        const hydrated = hydrateRows(domains, rowsRef.current);

        const prevById = new Map(rowsRef.current.map((r) => [r.clientId, r]));
        const same =
            hydrated.length === rowsRef.current.length &&
            hydrated.every((d) => {
                const prev = prevById.get(d.clientId);
                return (
                    prev !== undefined &&
                    prev.domain === d.domain &&
                    prev.is_primary === d.is_primary &&
                    prev.auto_generated === d.auto_generated &&
                    prev.dismissed === d.dismissed
                );
            });

        if (same) return;

        rowsRef.current = hydrated;
        setRowsState(hydrated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domains]);

    const focusedRef = useRef(false);
    const regenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleRegenerate = () => {
        if (!autoGenerate) return;
        if (focusedRef.current) return;
        if (regenTimer.current) clearTimeout(regenTimer.current);
        regenTimer.current = setTimeout(() => {
            if (focusedRef.current) return;
            commitToParent(regenerateAutoSubdomains(rowsRef.current));
        }, 500);
    };

    useEffect(
        () => () => {
            if (regenTimer.current) clearTimeout(regenTimer.current);
        },
        [],
    );

    // One-time init: existing tenant with a primary but no auto rows.
    const didInit = useRef(false);
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        if (!autoGenerate) return;
        if (rowsRef.current.some((d) => d.auto_generated)) return;
        if (!rowsRef.current.some((d) => d.is_primary)) return;
        commitToParent(regenerateAutoSubdomains(rowsRef.current));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleAutoGenerate = (checked: boolean) => {
        setAutoGenerate(checked);
        if (regenTimer.current) {
            clearTimeout(regenTimer.current);
            regenTimer.current = null;
        }
        if (checked) {
            commitToParent(regenerateAutoSubdomains(rowsRef.current));
        } else {
            commitToParent(stripAutoRows(rowsRef.current));
        }
    };

    const addDomain = () => {
        const next: Row[] = [
            ...rowsRef.current,
            {
                clientId: newClientId(),
                domain: "",
                is_primary: rowsRef.current.length === 0,
                status: "active",
            },
        ];
        commitToParent(autoGenerate ? regenerateAutoSubdomains(next) : next);
    };

    const removeDomain = (clientId: string) => {
        const target = rowsRef.current.find((d) => d.clientId === clientId);
        if (!target) return;

        let next: Row[];
        if (target.auto_generated) {
            // Dismissed tombstones stay so regeneration won't re-add them.
            next = rowsRef.current.map((d) =>
                d.clientId === clientId ? { ...d, dismissed: true } : d,
            );
        } else {
            next = rowsRef.current.filter((d) => d.clientId !== clientId);
            if (target.is_primary && next.length > 0) {
                const visibleIdx = next.findIndex((d) => !d.dismissed);
                if (visibleIdx >= 0) {
                    next = next.map((d, i) => ({
                        ...d,
                        is_primary: i === visibleIdx,
                    }));
                }
            }
        }
        commitToParent(autoGenerate ? regenerateAutoSubdomains(next) : next);
    };

    /** Type-time update: local only. Parent gets committed on blur. */
    const updateDomainLocal = (clientId: string, patch: Partial<DomainRow>) => {
        const next = rowsRef.current.map((d) => {
            if (d.clientId !== clientId) return d;
            const updated: Row = { ...d, ...patch };
            if (d.auto_generated && "domain" in patch) {
                updated.auto_generated = false;
                updated.dismissed = false;
            }
            return updated;
        });
        setRowsLocal(next);
    };

    /** Commit current local rows to parent (on blur). */
    const flushToParent = () => {
        setDomains(toDomainRows(rowsRef.current));
    };

    const setPrimaryDomain = (clientId: string) => {
        const withPrimary = clearDismissed(
            rowsRef.current.map((d) => ({
                ...d,
                is_primary: d.clientId === clientId,
            })),
        );
        commitToParent(
            autoGenerate ? regenerateAutoSubdomains(withPrimary) : withPrimary,
        );
    };

    const visibleDomains = rows.filter((d) => !d.dismissed);

    return (
        <section className="space-y-3 rounded-xl border border-sidebar-border/70 bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    icon={Globe}
                    title="Domains"
                    description="Each tenant can have multiple domains. Exactly one is primary."
                />
                <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="hidden sm:inline">
                        Auto-generate subdomains
                    </span>
                    <Switch
                        checked={autoGenerate}
                        onCheckedChange={handleToggleAutoGenerate}
                        aria-label="Auto-generate subdomains"
                    />
                </label>
            </div>

            {autoGenerate && (
                <p className="text-xs text-muted-foreground">
                    Auto-creates{" "}
                    <code className="font-mono">
                        {AUTO_SUBDOMAINS.join(", ")}
                    </code>{" "}
                    subdomains for the primary domain.
                </p>
            )}

            {visibleDomains.length === 0 && (
                <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                    <Globe className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        No domains yet.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Add at least one domain so the tenant is reachable.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {visibleDomains.map((d, visibleIdx) => {
                    // Error lookup stays on the full-array index, matching
                    // how `domainErrors` is indexed against the parent payload.
                    const errorIdx = rows.findIndex(
                        (r) => r.clientId === d.clientId,
                    );
                    const domainErr = domainErrors?.[errorIdx]?.domain;

                    // Human-facing number: position among visible rows only,
                    // so removing a subdomain renumbers 1,2,3… instead of
                    // leaving gaps (tombstones aren't counted).
                    const displayNum = visibleIdx + 1;

                    return (
                        <div
                            key={d.clientId}
                            className={cn(
                                "rounded-lg border bg-background p-3",
                                d.auto_generated && "border-dashed bg-muted/10",
                            )}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                    <Field
                                        label={
                                            d.auto_generated
                                                ? `Domain ${displayNum} (auto)`
                                                : `Domain ${displayNum}`
                                        }
                                        error={domainErr}
                                    >
                                        <div className="relative">
                                            <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                className={cn(
                                                    inputClass,
                                                    "pl-8 font-mono text-xs",
                                                    d.auto_generated &&
                                                        "text-muted-foreground",
                                                )}
                                                value={d.domain}
                                                onChange={(e) =>
                                                    updateDomainLocal(
                                                        d.clientId,
                                                        {
                                                            domain: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                                onFocus={() => {
                                                    focusedRef.current = true;
                                                }}
                                                onBlur={() => {
                                                    focusedRef.current = false;
                                                    flushToParent();
                                                    if (
                                                        rowsRef.current.find(
                                                            (r) =>
                                                                r.clientId ===
                                                                d.clientId,
                                                        )?.is_primary &&
                                                        autoGenerate
                                                    ) {
                                                        scheduleRegenerate();
                                                    }
                                                }}
                                                placeholder="school.example.com"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        d.is_primary ? "default" : "outline"
                                    }
                                    size="sm"
                                    className="h-9 shrink-0"
                                    onClick={() => setPrimaryDomain(d.clientId)}
                                    disabled={d.is_primary || !d.domain.trim()}
                                    title={
                                        !d.domain.trim()
                                            ? "Enter a domain first"
                                            : undefined
                                    }
                                >
                                    <Star className="mr-1.5 h-3.5 w-3.5" />
                                    {d.is_primary ? "Primary" : "Set primary"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeDomain(d.clientId)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDomain}
            >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add domain
            </Button>

            {visibleDomains.length > 0 &&
                !visibleDomains.some((d) => d.is_primary) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠ No primary domain set. The first one will be used as
                        primary.
                    </p>
                )}
        </section>
    );
}
