// resources/js/components/invoices/sections/invoice-bill-to.tsx
import { Mail, MapPin, Phone, User } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Tenant } from "@/types";
import type { SetDataFn } from "../invoice-form-types";

interface Props {
    tenantId: string;
    selectedTenant: Tenant | null;
    tenants: Tenant[];
    setData: SetDataFn;
    error?: string;
}

export function InvoiceBillTo({
    tenantId,
    selectedTenant,
    tenants,
    setData,
    error,
}: Props) {
    return (
        <div className="rounded-lg bg-muted/40 p-4 md:col-span-7">
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Bill To
            </h3>

            <Select
                value={tenantId}
                onValueChange={(v) => setData("tenant_id", v)}
            >
                <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Search and select tenant…" />
                </SelectTrigger>
                <SelectContent>
                    {tenants.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                            No tenants available
                        </div>
                    ) : (
                        tenants.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                                {t.name}
                                {t.email ? ` — ${t.email}` : ""}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

            {selectedTenant && (
                <div className="mt-3 space-y-1 text-xs">
                    <div className="font-semibold text-foreground">
                        {selectedTenant.name}
                    </div>
                    {selectedTenant.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {selectedTenant.email}
                        </div>
                    )}
                    {selectedTenant.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {selectedTenant.phone}
                        </div>
                    )}
                    {selectedTenant.address && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {selectedTenant.address}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
