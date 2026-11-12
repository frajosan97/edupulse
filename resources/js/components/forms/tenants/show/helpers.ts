// resources/js/components/tenants/show/helpers.ts

export type BadgeVariant =
    | "default"
    | "secondary"
    | "destructive"
    | "outline";

export function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatMoney(value: number | string | null | undefined): string {
    const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
    if (Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(n);
}

export function getStatusBadge(
    status: string | null | undefined,
    isActive: boolean,
): { label: string; variant: BadgeVariant } {
    if (isActive) return { label: "Active", variant: "default" };
    if (status === "pending") return { label: "Pending", variant: "outline" };
    if (status === "suspended")
        return { label: "Suspended", variant: "destructive" };
    return { label: "Inactive", variant: "secondary" };
}