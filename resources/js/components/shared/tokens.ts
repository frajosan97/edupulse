/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

export const BRAND = "#0070c0";
export const BRAND_DARK = "#0b6fb8";
export const BRAND_LIGHT = "#1a8fd8";
export const GREEN = "#2e9e4f";

export const shell = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
export const unsplash = (id: string) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

export const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;