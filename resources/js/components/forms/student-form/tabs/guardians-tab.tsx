// resources/js/components/forms/student-form/tabs/guardians-tab.tsx
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GuardianFormRow, GuardianOption } from "@/types/student";
import { GuardianRow } from "../shared/guardian-row";
import type { TabProps } from "../types";

interface Props extends TabProps {
    guardianOptions: GuardianOption[];
    onAdd: () => void;
    onChange: (index: number, patch: Partial<GuardianFormRow>) => void;
    onRemove: (index: number) => void;
}

export function GuardiansTab({
    data,
    errors,
    busy,
    guardianOptions,
    onAdd,
    onChange,
    onRemove,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-500">
                    <Users className="h-4 w-4" />
                    Parents / Guardians
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    disabled={busy}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add guardian
                </Button>
            </div>

            {data.guardians.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                    No guardians linked yet. Click <strong>Add guardian</strong>{" "}
                    to attach an existing parent or create a new one.
                </p>
            ) : (
                <div className="space-y-3">
                    {data.guardians.map((g, i) => (
                        <GuardianRow
                            key={i}
                            index={i}
                            guardian={g}
                            guardianOptions={guardianOptions}
                            errors={errors}
                            busy={busy}
                            onChange={onChange}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
