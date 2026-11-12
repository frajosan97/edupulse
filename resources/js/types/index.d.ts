// resources/js/types/index.d.ts
/**
 * Public type barrel.
 *
 * Import everything from here:
 *   import type { Tenant, PaginatedData } from "@/types";
 *
 * Direct module imports (e.g. `@/types/tenant`) also work and are
 * acceptable, but the barrel is the canonical entry point.
 *
 * Note: `./invoice` and `./payment` form a type-only cycle through
 * `InvoiceRef`. Long-term fix: extract shared refs into `./refs.d.ts`.
 */

export * from "./common";
export * from "./pagination";
export * from "./auth";
export * from "./navigation";
export * from "./ui";
export * from "./staff";
export * from "./tenant";
export * from "./invoice";
export * from "./module";
export * from "./payment";
export * from "./department";
export * from "./student";
export * from "./classes";
export * from "./stream";
export * from "./class-stream";
export * from "./curriculum";
export * from "./pathway";
export * from "./subject";
export * from "./academic-year";
export * from "./term";
export * from "./school-slide";
export * from "./grading-system";
export * from "./grade-scale";
export * from "./exam";
export * from "./results";