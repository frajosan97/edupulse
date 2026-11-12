// resources/js/components/invoices/invoice-form-field.tsx
import { Label } from "@/components/ui/label";

export function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label className="text-[11px] font-semibold text-muted-foreground">
                {label}
            </Label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}
