// resources/js/components/tenants/shared/helpers.tsx
import React from "react";

import type { TabKey } from "./types";

export const inputClass =
    "w-full rounded-lg border border-sidebar-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});

export function tabForError(key: string): TabKey | null {
    const root = key.split(".")[0];
    const map: Record<string, TabKey> = {
        name: "basic",
        contact_name: "basic",
        email: "basic",
        phone: "basic",
        address: "basic",
        status: "basic",
        domains: "domains",
        county_id: "location",
        constituency_id: "location",
        ward_id: "location",
        location_id: "location",
        modules: "modules",
    };
    return map[root] ?? null;
}

export function Field({
    label,
    error,
    hint,
    required,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className= "block space-y-1" >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" >
            { label }
    { required && <span className="ml-0.5 text-rose-500" >* </span> }
    </span>
    { children }
    {
        hint && !error && (
            <span className="block text-xs text-muted-foreground" >
                { hint }
                </span>
            )
    }
    {
        error && (
            <span className="block text-xs text-rose-600 dark:text-rose-400" >
                { error }
                </span>
            )
    }
    </label>
    );
}

export function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
}) {
    return (
        <div className= "mb-2 flex items-start gap-2 border-b border-sidebar-border/50 pb-2" >
        { Icon && (
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )
}
<div className="min-w-0" >
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" >
        { title }
        </h3>
{
    description && (
        <p className="mt-0.5 text-xs text-muted-foreground/80" >
            { description }
            </p>
                )
}
</div>
    </div>
    );
}