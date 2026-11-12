// resources/js/components/forms/student-form/utils.ts

/**
 * Today's date as `YYYY-MM-DD` in the user's local timezone.
 * Avoids the UTC day-shift bug of `new Date().toISOString().slice(0, 10)`.
 */
export function todayISO(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}