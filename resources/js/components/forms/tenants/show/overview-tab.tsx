import {
    Building2,
    Calendar,
    Database,
    Mail,
    MapPin,
    Phone,
    UserRound,
    Layers,
} from "lucide-react";
import { motion } from "framer-motion";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { formatDateTime } from "./helpers";
import type { Tenant } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface Props {
    tenant: Tenant;
    locationLabel: string;
    activeModules: number;
    totalModules: number;
}

function Field({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground border">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </div>
                <div className="mt-0.5 break-words text-sm text-foreground">
                    {value ?? "—"}
                </div>
            </div>
        </div>
    );
}

export function OverviewTab({
    tenant,
    locationLabel,
    activeModules,
    totalModules,
}: Props) {
    const progress =
        totalModules === 0
            ? 0
            : Math.round((activeModules / totalModules) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="grid gap-4 lg:grid-cols-2"
        >
            {/* Organisation */}
            <div className="rounded-xl border bg-muted/30 p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        Organisation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Identity and database details
                    </p>
                </div>
                <div className="space-y-0.5">
                    <Field
                        icon={Building2}
                        label="Tenant name"
                        value={tenant.name}
                    />
                    <Field
                        icon={Database}
                        label="Database"
                        value={
                            tenant.tenancy_db_name ? (
                                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {tenant.tenancy_db_name}
                                </span>
                            ) : (
                                "—"
                            )
                        }
                    />
                    <Field
                        icon={UserRound}
                        label="Contact name"
                        value={tenant.contact_name ?? "—"}
                    />
                    <Field
                        icon={Mail}
                        label="Email"
                        value={
                            tenant.email ? (
                                <a
                                    href={`mailto:${tenant.email}`}
                                    className="text-primary hover:underline"
                                >
                                    {tenant.email}
                                </a>
                            ) : (
                                "—"
                            )
                        }
                    />
                    <Field
                        icon={Phone}
                        label="Phone"
                        value={
                            tenant.phone ? (
                                <a
                                    href={`tel:${tenant.phone}`}
                                    className="text-primary hover:underline"
                                >
                                    {tenant.phone}
                                </a>
                            ) : (
                                "—"
                            )
                        }
                    />
                </div>
            </div>

            {/* Location & lifecycle */}
            <div className="space-y-3">
                <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            Location
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Physical and administrative location
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <Field
                            icon={MapPin}
                            label="Address"
                            value={tenant.address ?? "—"}
                        />
                        <Field
                            icon={MapPin}
                            label="Location"
                            value={locationLabel}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            Subscription
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Module activation progress
                        </p>
                    </div>

                    <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            {activeModules} of {totalModules} active
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                            {progress}%
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-muted" />

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-2">
                        <Field
                            icon={Calendar}
                            label="Created"
                            value={formatDateTime(tenant.created_at)}
                        />
                        <Field
                            icon={Calendar}
                            label="Updated"
                            value={formatDateTime(tenant.updated_at)}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
