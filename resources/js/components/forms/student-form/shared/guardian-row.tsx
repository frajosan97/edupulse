// resources/js/components/forms/student-form/shared/guardian-row.tsx
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect, RSOption, findOption } from "@/components/ui/form-select";
import type { RelationshipType } from "@/types/student";
import { RELATIONSHIP_TYPES } from "@/types/student";
import type { GuardianFormRow, GuardianOption } from "@/types/student";
import { humanize } from "../constants";
import { FieldError } from "./field-error";

interface Props {
    index: number;
    guardian: GuardianFormRow;
    guardianOptions: GuardianOption[];
    errors: Record<string, string>;
    busy: boolean;
    onChange: (index: number, patch: Partial<GuardianFormRow>) => void;
    onRemove: (index: number) => void;
}

const relationshipOptions: RSOption<RelationshipType>[] =
    RELATIONSHIP_TYPES.map((r) => ({
        value: r,
        label: humanize(r),
    }));

const guardianOptionsRS: RSOption<number>[] = []; // filled per-render below

export function GuardianRow({
    index,
    guardian: g,
    guardianOptions,
    errors,
    busy,
    onChange,
    onRemove,
}: Props) {
    const isNew = g.mode === "new";

    const guardianOptionsRS: RSOption<number>[] = guardianOptions.map((o) => ({
        value: o.value,
        label: o.label,
    }));

    const err = (key: string) => errors[`guardians.${index}.${key}`];

    return (
        <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            {/* Mode toggle + primary + remove */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={!isNew ? "default" : "ghost"}
                        className="h-7 px-3 text-xs"
                        onClick={() => onChange(index, { mode: "existing" })}
                        disabled={busy}
                    >
                        Existing parent
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={isNew ? "default" : "ghost"}
                        className="h-7 px-3 text-xs"
                        onClick={() => onChange(index, { mode: "new" })}
                        disabled={busy}
                    >
                        New parent
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <Checkbox
                            checked={g.is_primary}
                            onCheckedChange={(c) =>
                                onChange(index, { is_primary: c === true })
                            }
                        />
                        Primary
                    </label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(index)}
                        disabled={busy}
                        aria-label="Remove guardian"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Fields */}
            {isNew ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">First Name *</Label>
                        <Input
                            value={g.first_name}
                            onChange={(e) =>
                                onChange(index, {
                                    first_name: e.target.value,
                                })
                            }
                            className="mt-1"
                            placeholder="e.g. Jane"
                            aria-invalid={!!err("first_name")}
                        />
                        <FieldError message={err("first_name")} />
                    </div>

                    <div>
                        <Label className="text-xs">Last Name *</Label>
                        <Input
                            value={g.last_name}
                            onChange={(e) =>
                                onChange(index, { last_name: e.target.value })
                            }
                            className="mt-1"
                            placeholder="e.g. Doe"
                            aria-invalid={!!err("last_name")}
                        />
                        <FieldError message={err("last_name")} />
                    </div>

                    <div>
                        <Label className="text-xs">Email *</Label>
                        <Input
                            type="email"
                            value={g.email}
                            onChange={(e) =>
                                onChange(index, { email: e.target.value })
                            }
                            className="mt-1"
                            placeholder="parent@example.com"
                            aria-invalid={!!err("email")}
                        />
                        <FieldError message={err("email")} />
                    </div>

                    <div>
                        <Label className="text-xs">Phone *</Label>
                        <Input
                            type="tel"
                            value={g.phone}
                            onChange={(e) =>
                                onChange(index, { phone: e.target.value })
                            }
                            className="mt-1"
                            placeholder="254712345678"
                            inputMode="tel"
                            aria-invalid={!!err("phone")}
                        />
                        <FieldError message={err("phone")} />
                    </div>

                    <div className="sm:col-span-2">
                        <FormSelect
                            label="Relationship"
                            options={relationshipOptions}
                            value={findOption(
                                g.relationship_type as RelationshipType,
                                relationshipOptions,
                            )}
                            onChange={(opt) =>
                                onChange(index, {
                                    relationship_type: (opt?.value ??
                                        "guardian") as string,
                                })
                            }
                            usePortal
                        />
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    <FormSelect
                        label="Existing Parent"
                        placeholder={
                            guardianOptionsRS.length === 0
                                ? "No parent accounts found"
                                : "Select parent"
                        }
                        options={guardianOptionsRS}
                        value={findOption(
                            g.user_id ? Number(g.user_id) : undefined,
                            guardianOptionsRS,
                        )}
                        onChange={(opt) =>
                            onChange(index, {
                                user_id:
                                    opt?.value != null ? String(opt.value) : "",
                            })
                        }
                        error={err("user_id")}
                        usePortal
                    />

                    <FormSelect
                        label="Relationship"
                        options={relationshipOptions}
                        value={findOption(
                            g.relationship_type as RelationshipType,
                            relationshipOptions,
                        )}
                        onChange={(opt) =>
                            onChange(index, {
                                relationship_type: (opt?.value ??
                                    "guardian") as string,
                            })
                        }
                        usePortal
                    />
                </div>
            )}
        </div>
    );
}
