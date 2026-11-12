// resources/js/components/tenants/tabs/basic-tab.tsx
import { Building2, Mail, Phone, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormSelect, RSOption, selectValue } from "@/components/ui/form-select";

import { Field, SectionHeader, inputClass } from "../shared/helpers";
import type { TenantFormPayload } from "../shared/types";

const STATUS_OPTIONS: RSOption<"active" | "inactive">[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

interface Props {
    data: TenantFormPayload;
    errors: Record<string, string | undefined>;
    setData: {
        <K extends keyof TenantFormPayload>(
            key: K,
            value: TenantFormPayload[K],
        ): void;
        (updater: (data: TenantFormPayload) => TenantFormPayload): void;
    };
}

export function BasicTab({ data, errors, setData }: Props) {
    return (
        <section className="space-y-4 rounded-xl border border-sidebar-border/70 bg-card px-4 py-3">
            <div>
                <SectionHeader icon={Building2} title="Tenant" />
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                        label="School / Organisation name"
                        error={errors.name}
                        required
                    >
                        <input
                            className={inputClass}
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g. Nairobi Academy"
                            autoFocus
                            required
                        />
                    </Field>

                    <Field label="Status" error={errors.status}>
                        <FormSelect<RSOption<"active" | "inactive">>
                            isSearchable={false}
                            options={STATUS_OPTIONS}
                            value={
                                STATUS_OPTIONS.find(
                                    (o) => o.value === data.status,
                                ) ?? STATUS_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                const v = selectValue(opt);
                                if (v) setData("status", v);
                            }}
                        />
                    </Field>
                </div>
            </div>

            <div>
                <SectionHeader
                    icon={UserRound}
                    title="Contact person"
                    description="Primary contact for billing and support."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" error={errors.contact_name}>
                        <input
                            className={inputClass}
                            value={data.contact_name}
                            onChange={(e) =>
                                setData("contact_name", e.target.value)
                            }
                            placeholder="Jane Doe"
                            autoComplete="name"
                        />
                    </Field>

                    <Field label="Email" error={errors.email} required>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                className={cn(inputClass, "pl-8")}
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="jane@school.ac.ke"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </Field>

                    <Field
                        label="Phone"
                        error={errors.phone}
                        hint="Used for SMS notifications."
                    >
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                className={cn(inputClass, "pl-8")}
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="07XX XXX XXX"
                                autoComplete="tel"
                            />
                        </div>
                    </Field>

                    <Field
                        label="Address"
                        error={errors.address}
                        hint="Postal / physical address."
                    >
                        <input
                            className={inputClass}
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            placeholder="P.O. Box 1234, Nairobi"
                        />
                    </Field>
                </div>
            </div>
        </section>
    );
}
