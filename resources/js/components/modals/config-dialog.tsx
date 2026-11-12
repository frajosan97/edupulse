// resources/js/components/modals/config-dialog.tsx
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type AssessmentKey = "cat_1" | "cat_2" | "pp_1" | "pp_2" | "pp_3";

export const ASSESSMENTS: ReadonlyArray<{
    key: AssessmentKey;
    outOfKey: `${AssessmentKey}_outof`;
    label: string;
}> = [
    { key: "cat_1", outOfKey: "cat_1_outof", label: "CAT 1" },
    { key: "cat_2", outOfKey: "cat_2_outof", label: "CAT 2" },
    { key: "pp_1", outOfKey: "pp_1_outof", label: "PP 1" },
    { key: "pp_2", outOfKey: "pp_2_outof", label: "PP 2" },
    { key: "pp_3", outOfKey: "pp_3_outof", label: "PP 3" },
];

export type AssessmentConfig = {
    components: Record<AssessmentKey, { enabled: boolean; outOf: string }>;
    /** Bulk denominator for the final Score column (both modes). */
    scoreOutOf: string;
};

export const defaultConfig = (): AssessmentConfig => ({
    components: ASSESSMENTS.reduce(
        (acc, a) => {
            acc[a.key] = { enabled: false, outOf: "100" };
            return acc;
        },
        {} as AssessmentConfig["components"],
    ),
    scoreOutOf: "100",
});

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

interface ConfigDialogProps {
    open: boolean;
    config: AssessmentConfig;
    onOpenChange: (open: boolean) => void;
    onConfigChange: (next: AssessmentConfig) => void;
    onApply: () => void;
}

export function ConfigDialog({
    open,
    config,
    onOpenChange,
    onConfigChange,
    onApply,
}: ConfigDialogProps) {
    const enabledCount = ASSESSMENTS.filter(
        (a) => config.components[a.key].enabled,
    ).length;
    const hasComponents = enabledCount > 0;

    const updateComponent = (
        key: AssessmentKey,
        patch: Partial<{ enabled: boolean; outOf: string }>,
    ) => {
        onConfigChange({
            ...config,
            components: {
                ...config.components,
                [key]: { ...config.components[key], ...patch },
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                        <DialogTitle>Configure Assessments</DialogTitle>
                    </div>
                    <DialogDescription>
                        Choose which assessments apply and set the total out-of
                        for the final score. Enabling any component locks the
                        final score to the computed, scaled value.
                    </DialogDescription>
                </DialogHeader>

                {/* Components */}
                <div className="space-y-3">
                    {ASSESSMENTS.map((a) => {
                        const c = config.components[a.key];
                        return (
                            <div
                                key={a.key}
                                className="flex items-center gap-3 rounded-lg border p-3"
                            >
                                <input
                                    type="checkbox"
                                    id={`enable_${a.key}`}
                                    checked={c.enabled}
                                    onChange={(e) =>
                                        updateComponent(a.key, {
                                            enabled: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-input accent-emerald-600"
                                />
                                <Label
                                    htmlFor={`enable_${a.key}`}
                                    className="flex-1 cursor-pointer text-sm font-medium"
                                >
                                    {a.label}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Label
                                        htmlFor={`outof_${a.key}`}
                                        className="text-xs text-muted-foreground"
                                    >
                                        Out of
                                    </Label>
                                    <Input
                                        id={`outof_${a.key}`}
                                        type="number"
                                        min={1}
                                        step="0.01"
                                        value={c.outOf}
                                        onChange={(e) =>
                                            updateComponent(a.key, {
                                                outOf: e.target.value,
                                            })
                                        }
                                        disabled={!c.enabled}
                                        className="h-8 w-20 px-2 text-right text-sm"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bulk score out-of — always editable */}
                <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <Label
                                htmlFor="score_outof"
                                className="text-sm font-medium"
                            >
                                Final Score Out Of
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {hasComponents
                                    ? "Computed component sum is scaled to this value."
                                    : "Used as the denominator for each student's score."}
                            </p>
                        </div>
                        <Input
                            id="score_outof"
                            type="number"
                            min={1}
                            step="0.01"
                            value={config.scoreOutOf}
                            onChange={(e) =>
                                onConfigChange({
                                    ...config,
                                    scoreOutOf: e.target.value,
                                })
                            }
                            className="h-8 w-24 px-2 text-right text-sm"
                        />
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    {hasComponents
                        ? `${enabledCount} assessment${
                              enabledCount === 1 ? "" : "s"
                          } enabled — final score will be computed and scaled to ${config.scoreOutOf}.`
                        : "No components enabled — enter each student's raw score; out-of is fixed at " +
                          config.scoreOutOf +
                          "."}
                </p>

                <DialogFooter className="mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={onApply}>
                        Apply Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
