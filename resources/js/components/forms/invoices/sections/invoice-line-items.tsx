// resources/js/components/invoices/sections/invoice-line-items.tsx
import { Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Module } from "@/types";
import {
    computeLine,
    currency,
    emptyLine,
    type InvoiceFormData,
    type LineItem,
    type SetDataFn,
} from "../invoice-form-types";

interface Props {
    data: InvoiceFormData;
    setData: SetDataFn;
    modules: Module[];
    errors: Record<string, string>;
    onRemoveBlocked: () => void;
}

export function InvoiceLineItems({
    data,
    setData,
    modules,
    errors,
    onRemoveBlocked,
}: Props) {
    const addLine = () => setData("items", [...data.items, emptyLine()]);

    const removeLine = (key: string) => {
        if (data.items.length <= 1) return onRemoveBlocked();
        setData(
            "items",
            data.items.filter((i) => i.key !== key),
        );
    };

    const updateLine = <K extends keyof LineItem>(
        key: string,
        field: K,
        value: LineItem[K],
    ) => {
        setData(
            "items",
            data.items.map((i) =>
                i.key === key ? { ...i, [field]: value } : i,
            ),
        );
    };

    const onModuleSelect = (key: string, value: string) => {
        const moduleId = value === "none" ? null : Number(value);
        const mod = moduleId ? modules.find((m) => m.id === moduleId) : null;
        setData(
            "items",
            data.items.map((i) =>
                i.key === key
                    ? {
                          ...i,
                          module_id: moduleId,
                          description: mod?.name ?? i.description,
                          unit_price: mod?.base_price ?? i.unit_price,
                      }
                    : i,
            ),
        );
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    Line Items
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {data.items.length}
                    </span>
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLine}
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add item
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 font-semibold">
                                Description
                            </th>
                            <th className="hidden px-3 py-2 font-semibold md:table-cell">
                                Module
                            </th>
                            <th className="w-[90px] px-3 py-2 text-center font-semibold">
                                Qty
                            </th>
                            <th className="w-[130px] px-3 py-2 text-right font-semibold">
                                Unit price
                            </th>
                            <th className="hidden w-[110px] px-3 py-2 text-right font-semibold sm:table-cell">
                                Discount
                            </th>
                            <th className="hidden w-[90px] px-3 py-2 text-right font-semibold sm:table-cell">
                                Tax %
                            </th>
                            <th className="w-[130px] px-3 py-2 text-right font-semibold">
                                Total
                            </th>
                            <th className="w-[48px] px-2 py-2" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.items.map((item, i) => {
                            const t = computeLine(item);
                            const rowErr = (f: string) =>
                                errors[`items.${i}.${f}`];
                            return (
                                <tr key={item.key} className="align-middle">
                                    <td className="px-3 py-2">
                                        <Input
                                            value={item.description}
                                            onChange={(e) =>
                                                updateLine(
                                                    item.key,
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Item description…"
                                            className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                                        />
                                        {rowErr("description") && (
                                            <p className="mt-0.5 px-1 text-[11px] text-destructive">
                                                {rowErr("description")}
                                            </p>
                                        )}
                                    </td>
                                    <td className="hidden px-3 py-2 md:table-cell">
                                        <Select
                                            value={
                                                item.module_id?.toString() ??
                                                "none"
                                            }
                                            onValueChange={(v) =>
                                                onModuleSelect(item.key, v)
                                            }
                                        >
                                            <SelectTrigger className="h-8 border-0 bg-transparent px-1 text-xs shadow-none">
                                                <SelectValue placeholder="—" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    None
                                                </SelectItem>
                                                {modules.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id.toString()}
                                                    >
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input
                                            type="number"
                                            step="1"
                                            min={0}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateLine(
                                                    item.key,
                                                    "quantity",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="h-8 border-0 bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={item.unit_price}
                                            onChange={(e) =>
                                                updateLine(
                                                    item.key,
                                                    "unit_price",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
                                        />
                                    </td>
                                    <td className="hidden px-2 py-2 sm:table-cell">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={item.discount_amount}
                                            onChange={(e) =>
                                                updateLine(
                                                    item.key,
                                                    "discount_amount",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
                                        />
                                    </td>
                                    <td className="hidden px-2 py-2 sm:table-cell">
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            min={0}
                                            max={100}
                                            value={item.tax_rate}
                                            onChange={(e) =>
                                                updateLine(
                                                    item.key,
                                                    "tax_rate",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                                        {currency.format(t.total)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeLine(item.key)}
                                            disabled={data.items.length <= 1}
                                            className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            aria-label="Remove line"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {errors.items && (
                <p className="mt-1.5 text-xs text-destructive">
                    {errors.items}
                </p>
            )}
        </div>
    );
}
