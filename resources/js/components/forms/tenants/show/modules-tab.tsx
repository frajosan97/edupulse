import { Layers } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "./helpers";
import type { TenantModule } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    modules: TenantModule[];
}

function cycleLabel(cycle: string): string {
    return cycle === "monthly"
        ? "/mo"
        : cycle === "quarterly"
          ? "/qtr"
          : cycle === "annual"
            ? "/yr"
            : "";
}

export function ModulesTab({ modules }: Props) {
    const now = new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
        >
            {modules.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-background/50 p-10 text-center">
                    <Layers className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                    <p className="text-sm font-medium">No modules yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Assign modules to start billing this tenant.
                    </p>
                </div>
            ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                    {modules.map((m) => {
                        const expired = m.pivot.expires_at
                            ? new Date(m.pivot.expires_at) < now
                            : false;
                        const active = m.pivot.status === "active" && !expired;

                        return (
                            <li
                                key={m.id}
                                className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-semibold text-foreground">
                                                {m.name}
                                            </span>
                                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                {m.code}
                                            </code>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Base {formatMoney(m.base_price)} ·{" "}
                                            {m.included_students} incl · +
                                            {formatMoney(m.per_student_price)}
                                            /extra
                                        </div>
                                    </div>
                                    <Badge
                                        className="rounded-full"
                                        variant={
                                            expired
                                                ? "destructive"
                                                : active
                                                  ? "default"
                                                  : "secondary"
                                        }
                                    >
                                        {expired
                                            ? "Expired"
                                            : active
                                              ? "Active"
                                              : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t pt-3 text-xs">
                                    <Stat
                                        label="Cycle price"
                                        value={
                                            <>
                                                {formatMoney(m.base_price)}
                                                <span className="ml-1 font-normal text-muted-foreground">
                                                    {cycleLabel(
                                                        m.pivot.billing_cycle,
                                                    )}
                                                </span>
                                            </>
                                        }
                                    />
                                    <Stat
                                        label="Students"
                                        value={m.pivot.student_count ?? 0}
                                    />
                                    <Stat
                                        label="Activated"
                                        value={formatDate(m.pivot.activated_at)}
                                    />
                                    <Stat
                                        label="Expires"
                                        value={
                                            m.pivot.expires_at
                                                ? formatDate(m.pivot.expires_at)
                                                : "No expiry"
                                        }
                                        tone={
                                            expired ? "destructive" : undefined
                                        }
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </motion.div>
    );
}

function Stat({
    label,
    value,
    tone,
}: {
    label: string;
    value: React.ReactNode;
    tone?: "destructive";
}) {
    return (
        <div>
            <div className="text-muted-foreground font-medium mb-0.5">
                {label}
            </div>
            <div
                className={
                    tone === "destructive"
                        ? "font-semibold text-destructive"
                        : "font-semibold text-foreground"
                }
            >
                {value}
            </div>
        </div>
    );
}
