import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    icon?: LucideIcon;
    className?: string;
    headerClassName?: string;
    cell: (row: T) => ReactNode;
}

export interface LaravelPaginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

/**
 * Base filter shape every DataTable expects.
 * No index signature — extending types (like ModuleFilters) stay assignable.
 */
export interface DataTableFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page?: number;
}

export interface DataTableProps<
    T,
    F extends DataTableFilters = DataTableFilters,
> {
    paginator: LaravelPaginator<T>;
    filters: F;
    columns: Column<T>[];
    routeName: string;

    /** Static route params for the current page — e.g. `{ exam: 12 }` for `exams.show`. */
    routeParams?: Record<string, string | number>;

    rowKey: (row: T) => string | number;
    searchPlaceholder?: string;
    toolbar?: ReactNode;
    actions?: (row: T) => ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    pageSizeOptions?: number[];
    extraParams?: Record<string, unknown>;

    /** Hide the search box + clear button + per-page selector (defaults to true). */
    showFilters?: boolean;
}