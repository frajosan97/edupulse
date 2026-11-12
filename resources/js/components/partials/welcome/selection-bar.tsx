import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { kes } from "../../shared/tokens";
import type { SelectedMap } from "../../shared/data";
import { useAppData } from "@/hooks/use-app-data";

interface SelectionBarProps {
    selected: SelectedMap;
    clear: () => void;
    demoUrl: string;
}

/** Sticky summary so people can see what they picked and what it costs. */
export default function SelectionBar({
    selected,
    clear,
    demoUrl,
}: SelectionBarProps) {
    const { themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    const items = Object.values(selected);
    const total = items.reduce((s, i) => s + i.price, 0);
    const bundleSaving =
        !Object.keys(selected).some((k) => k.startsWith("bundle")) &&
        total > 62000
            ? total - 62000
            : 0;

    return (
        <AnimatePresence>
            {items.length > 0 && (
                <motion.div
                    initial={{ y: 90, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 90, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    className="fixed inset-x-0 bottom-4 z-50 px-4"
                >
                    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-3 pl-5 text-white shadow-2xl ring-1 ring-white/10">
                        <div className="min-w-0">
                            <div className="text-sm text-white/70">
                                {items.length} selected ·{" "}
                                <span className="truncate">
                                    {items.map((i) => i.name).join(", ")}
                                </span>
                            </div>
                            <div className="text-lg font-bold">
                                {kes(total)}{" "}
                                <span className="text-sm font-medium text-white/70">
                                    / Yearly
                                </span>
                            </div>
                            {bundleSaving > 0 && (
                                <div className="text-xs text-amber-300">
                                    Tip: the Complete Bundle would save you{" "}
                                    {kes(bundleSaving)}.
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={clear}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Clear
                            </button>
                            <a
                                href={demoUrl}
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                style={{ backgroundColor: primary }}
                            >
                                Request quote <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
