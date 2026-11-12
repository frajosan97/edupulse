// resources/js/lib/formatters.ts

export function formatDate(value?: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-GB").replace(/\//g, "-");
}

export function formatDateTime(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatCurrency(
    amount: number | null | undefined,
    currency = "KES",
): string {
    if (amount == null) return "—";
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(
    value: number | null | undefined,
    decimals = 0,
): string {
    if (value == null) return "—";
    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
    }).format(value);
}

export function stringToHue(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
}

export function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}