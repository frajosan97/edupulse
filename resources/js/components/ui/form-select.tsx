// resources/js/components/ui/form-select.tsx
import React from "react";
import RS, { Props as RSProps, GroupBase } from "react-select";
import Async, { AsyncProps } from "react-select/async";
import Creatable, { CreatableProps } from "react-select/creatable";
import { cn } from "@/lib/utils";

/* --------------------------------- types --------------------------------- */

export interface RSOption<V = string | number> {
    value: V;
    label: string;
    isDisabled?: boolean;
}

interface BaseProps {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    wrapperClassName?: string;
    usePortal?: boolean;
    id?: string;
}

export type FormSelectProps<O = RSOption, M extends boolean = false> = Omit<
    RSProps<O, M, GroupBase<O>>,
    "theme"
> &
    BaseProps;

export type AsyncFormSelectProps<
    O = RSOption,
    M extends boolean = false,
> = Omit<AsyncProps<O, M, GroupBase<O>>, "theme"> & BaseProps;

export type CreatableFormSelectProps<
    O = RSOption,
    M extends boolean = false,
> = Omit<CreatableProps<O, M, GroupBase<O>>, "theme"> & BaseProps;

/* -------------------------------- styling -------------------------------- */

/**
 * Colors are read from CSS custom properties defined in your stylesheet
 * (`:root` / `.dark`). They are already `oklch(...)` values, so we use them
 * directly via `var(--token)` — do NOT wrap in `hsl()`.
 *
 * Opacity is applied with `color-mix`, which respects the active theme
 * automatically (no separate dark-mode overrides needed).
 */
const c = (token: string, alpha?: number) =>
    alpha === undefined
        ? `var(${token})`
        : `color-mix(in oklab, var(${token}) ${Math.round(alpha * 100)}%, transparent)`;

const baseStyles: any = {
    control: (base: any, state: any) => ({
        ...base,
        minHeight: 36,
        borderRadius: "var(--radius-md)",
        borderColor: state.isFocused
            ? c("--primary")
            : state.selectProps["aria-invalid"]
              ? c("--destructive")
              : c("--border"),
        backgroundColor: c("--background"),
        boxShadow: state.isFocused
            ? state.selectProps["aria-invalid"]
                ? `0 0 0 2px ${c("--destructive", 0.4)}`
                : `0 0 0 2px ${c("--primary", 0.4)}`
            : "none",
        fontSize: "0.875rem",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        ":hover": {
            borderColor: state.isFocused
                ? c("--primary")
                : state.selectProps["aria-invalid"]
                  ? c("--destructive")
                  : c("--muted-foreground"),
        },
    }),
    valueContainer: (b: any) => ({ ...b, padding: "0 0.625rem", gap: 4 }),
    singleValue: (b: any) => ({ ...b, color: c("--foreground") }),
    placeholder: (b: any) => ({ ...b, color: c("--muted-foreground") }),
    input: (b: any) => ({
        ...b,
        margin: 0,
        padding: 0,
        color: c("--foreground"),
    }),
    indicatorsContainer: (b: any) => ({ ...b, height: 34 }),
    dropdownIndicator: (b: any, s: any) => ({
        ...b,
        color: s.isFocused ? c("--primary") : c("--muted-foreground"),
        ":hover": { color: c("--primary") },
    }),
    clearIndicator: (b: any) => ({
        ...b,
        color: c("--muted-foreground"),
        ":hover": { color: c("--destructive") },
    }),
    menu: (b: any) => ({
        ...b,
        zIndex: 50,
        borderRadius: "var(--radius-md)",
        border: `1px solid ${c("--border")}`,
        backgroundColor: c("--popover"),
        boxShadow:
            "0 10px 20px -8px color-mix(in oklab, black 15%, transparent)",
        overflow: "hidden",
    }),
    menuList: (b: any) => ({ ...b, padding: 4 }),
    menuPortal: (b: any) => ({ ...b, zIndex: 9999 }),
    option: (b: any, s: any) => ({
        ...b,
        fontSize: "0.875rem",
        borderRadius: "calc(var(--radius-md) - 2px)",
        backgroundColor: s.isSelected
            ? c("--primary", 0.12)
            : s.isFocused
              ? c("--accent", 0.12)
              : "transparent",
        color: s.isSelected ? c("--primary") : c("--foreground"),
        cursor: "pointer",
        ":active": {
            backgroundColor: s.isSelected
                ? c("--primary", 0.2)
                : c("--accent", 0.2),
        },
    }),
    multiValue: (b: any) => ({
        ...b,
        backgroundColor: c("--primary", 0.1),
        borderRadius: "calc(var(--radius-sm) - 2px)",
    }),
    multiValueLabel: (b: any) => ({
        ...b,
        color: c("--primary"),
        fontSize: "0.8125rem",
    }),
    multiValueRemove: (b: any) => ({
        ...b,
        color: c("--primary"),
        borderRadius:
            "0 calc(var(--radius-sm) - 2px) calc(var(--radius-sm) - 2px) 0",
        ":hover": {
            backgroundColor: c("--destructive", 0.15),
            color: c("--destructive"),
        },
    }),
    indicatorSeparator: (b: any) => ({
        ...b,
        backgroundColor: c("--border"),
    }),
    noOptionsMessage: (b: any) => ({
        ...b,
        fontSize: "0.8125rem",
        color: c("--muted-foreground"),
    }),
    loadingMessage: (b: any) => ({
        ...b,
        fontSize: "0.8125rem",
        color: c("--muted-foreground"),
    }),
};

/* -------------------------------- shell ---------------------------------- */

function Shell({
    label,
    hint,
    error,
    required,
    htmlFor,
    className,
    children,
}: BaseProps & {
    htmlFor?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("block space-y-1", className)}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    {label}
                    {required && (
                        <span className="ml-0.5 text-destructive">*</span>
                    )}
                </label>
            )}
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

/* ------------------------------ FormSelect ------------------------------- */

export function FormSelect<O = RSOption, M extends boolean = false>({
    label,
    hint,
    error,
    required,
    wrapperClassName,
    usePortal,
    id,
    styles,
    ...rest
}: FormSelectProps<O, M>) {
    return (
        <Shell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={id}
            className={wrapperClassName}
        >
            <RS<O, M>
                inputId={id}
                styles={{ ...baseStyles, ...(styles as any) }}
                menuPortalTarget={
                    usePortal && typeof document !== "undefined"
                        ? document.body
                        : undefined
                }
                aria-invalid={!!error}
                {...(rest as any)}
            />
        </Shell>
    );
}

/* ---------------------------- AsyncFormSelect ---------------------------- */

export function AsyncFormSelect<O = RSOption, M extends boolean = false>({
    label,
    hint,
    error,
    required,
    wrapperClassName,
    usePortal,
    id,
    styles,
    ...rest
}: AsyncFormSelectProps<O, M>) {
    return (
        <Shell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={id}
            className={wrapperClassName}
        >
            <Async<O, M>
                inputId={id}
                styles={{ ...baseStyles, ...(styles as any) }}
                menuPortalTarget={
                    usePortal && typeof document !== "undefined"
                        ? document.body
                        : undefined
                }
                aria-invalid={!!error}
                {...(rest as any)}
            />
        </Shell>
    );
}

/* -------------------------- CreatableFormSelect -------------------------- */

export function CreatableFormSelect<O = RSOption, M extends boolean = false>({
    label,
    hint,
    error,
    required,
    wrapperClassName,
    usePortal,
    id,
    styles,
    ...rest
}: CreatableFormSelectProps<O, M>) {
    return (
        <Shell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={id}
            className={wrapperClassName}
        >
            <Creatable<O, M>
                inputId={id}
                styles={{ ...baseStyles, ...(styles as any) }}
                menuPortalTarget={
                    usePortal && typeof document !== "undefined"
                        ? document.body
                        : undefined
                }
                aria-invalid={!!error}
                {...(rest as any)}
            />
        </Shell>
    );
}

/* -------------------------------- helpers -------------------------------- */

/** Shorthand: extract raw value from onChange (single). */
export function selectValue<V extends string | number>(
    opt: RSOption<V> | null | undefined,
): V | null {
    return opt?.value ?? null;
}

/** Shorthand: extract raw values from onChange (multi). */
export function selectValues<V extends string | number>(
    opts: RSOption<V>[] | null | undefined,
): V[] {
    return (opts ?? []).map((o) => o.value);
}

/** Build options from data: `toOptions(counties, 'id', 'name')`. */
export function toOptions<T, V extends string | number = number>(
    items: T[] | undefined,
    valueKey: keyof T | ((item: T) => V),
    labelKey: keyof T | ((item: T) => string),
): RSOption<V>[] {
    if (!items?.length) return [];
    return items.map((item) => ({
        value:
            typeof valueKey === "function"
                ? valueKey(item)
                : (item[valueKey] as unknown as V),
        label:
            typeof labelKey === "function"
                ? labelKey(item)
                : String(item[labelKey]),
    }));
}

/** Resolve id → option. */
export function findOption<V extends string | number>(
    id: V | null | undefined,
    options: RSOption<V>[],
): RSOption<V> | null {
    if (id == null) return null;
    return options.find((o) => o.value === id) ?? null;
}

/** Resolve ids → options. */
export function findOptions<V extends string | number>(
    ids: V[] | null | undefined,
    options: RSOption<V>[],
): RSOption<V>[] {
    const set = new Set(ids ?? []);
    return options.filter((o) => set.has(o.value));
}
