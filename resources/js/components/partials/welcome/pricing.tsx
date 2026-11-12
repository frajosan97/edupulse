import { AnimatePresence, motion } from "framer-motion";
import { Check, Gift, Minus, Package, Plus } from "lucide-react";
import { useState } from "react";
import { GREEN, kes, shell } from "../../shared/tokens";
import {
    BUNDLES,
    MODULES,
    type ModuleItem,
    type SelectedMap,
} from "../../shared/data";
import Img from "../../shared/img";

interface SelectButtonProps {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

function SelectButton({ selected, onClick, children }: SelectButtonProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
            aria-pressed={selected}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0b6fb8] py-3 text-[15px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b6fb8] focus-visible:ring-offset-2 ${
                selected
                    ? "bg-[#0b6fb8] text-white"
                    : "bg-transparent text-[#0b6fb8] hover:bg-[#0b6fb8]/10 dark:text-sky-300"
            }`}
        >
            {selected ? (
                <>
                    <Check size={18} strokeWidth={3} /> Selected
                </>
            ) : (
                children
            )}
        </motion.button>
    );
}

interface PlanCardProps {
    item: ModuleItem;
    selected: boolean;
    onToggle: () => void;
    label: string;
}

function PlanCard({ item, selected, onToggle, label }: PlanCardProps) {
    const [open, setOpen] = useState(false);
    const Icon = item.icon;
    const hasMore = (item.more?.length ?? 0) > 0;

    return (
        <motion.article
            layout="position"
            variants={{
                hidden: { opacity: 0, y: 28 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
            }}
            whileHover={{ y: -6 }}
            className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-xl dark:bg-slate-800 ${
                selected
                    ? "border-[#0b6fb8] ring-2 ring-[#0b6fb8]/30"
                    : "border-slate-200 dark:border-slate-700"
            }`}
        >
            {item.best && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow">
                    Best value
                </span>
            )}
            <div className="relative">
                <Img
                    src={item.image}
                    alt=""
                    icon={Icon}
                    className="h-36 w-full"
                    imgClassName="transition-transform duration-700 hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a4f86]/70 to-transparent" />
                <span className="absolute -bottom-5 left-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0b6fb8] shadow-lg dark:bg-slate-900 dark:text-sky-300">
                    <Icon size={22} strokeWidth={1.75} />
                </span>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5 pt-9">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {item.name}
                </h3>
                <p className="mt-1.5 min-h-[44px] text-sm leading-snug text-slate-500 dark:text-slate-300">
                    {item.description}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {label}
                    </h4>
                    <ul className="mt-3 space-y-2">
                        {item.features.map((f) => (
                            <li
                                key={f}
                                className="flex items-start gap-2.5 text-sm leading-snug text-slate-600 dark:text-slate-300"
                            >
                                <Check
                                    size={15}
                                    strokeWidth={3}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: GREEN }}
                                />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>

                    <AnimatePresence initial={false}>
                        {open && hasMore && (
                            <motion.ul
                                key="more"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.28,
                                    ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-2 pt-2">
                                    {item.more!.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-start gap-2.5 text-sm leading-snug text-slate-600 dark:text-slate-300"
                                        >
                                            <Check
                                                size={15}
                                                strokeWidth={3}
                                                className="mt-0.5 shrink-0"
                                                style={{ color: GREEN }}
                                            />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </div>
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            className="mt-4 flex items-center gap-1.5 rounded text-sm font-semibold text-[#0b6fb8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b6fb8] dark:text-sky-300"
                        >
                            {open ? <Minus size={14} /> : <Plus size={14} />}
                            {open
                                ? "Show Less"
                                : `Show More (${item.more!.length} more)`}
                        </button>
                    )}
                </div>

                <div className="mt-auto pt-6">
                    {item.was && (
                        <div className="text-sm text-slate-400 line-through">
                            {kes(item.was)}
                        </div>
                    )}
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[28px] font-extrabold leading-none text-[#0b6fb8] dark:text-sky-300">
                            {kes(item.price)}
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                            / Yearly
                        </span>
                    </div>
                    <div className="mt-4">
                        <SelectButton selected={selected} onClick={onToggle}>
                            {item.id.startsWith("bundle")
                                ? "Select Bundle"
                                : "Select Module"}
                        </SelectButton>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

interface PricingProps {
    selected: SelectedMap;
    toggle: (item: ModuleItem) => void;
}

export default function Pricing({ selected, toggle }: PricingProps) {
    const [tab, setTab] = useState<"modules" | "bundles">("modules");
    const tabs = [
        {
            id: "modules" as const,
            label: "Buy Individual Modules",
            icon: Package,
        },
        { id: "bundles" as const, label: "Save with Bundles", icon: Gift },
    ];
    const list: ModuleItem[] = tab === "modules" ? MODULES : BUNDLES;

    return (
        <section
            id="pricing"
            className="scroll-mt-20 bg-slate-50 pb-24 pt-20 dark:bg-slate-900"
        >
            <div className={shell}>
                <div className="text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-extrabold tracking-tight text-[#1a8fd8] sm:text-4xl"
                    >
                        Flexible Pricing for Every School
                    </motion.h2>
                    <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 sm:text-lg dark:text-slate-300">
                        Buy modules individually or save big with bundles
                    </p>

                    {/* Segmented control */}
                    <div
                        role="tablist"
                        aria-label="Pricing type"
                        className="mx-auto mt-8 inline-flex flex-wrap justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                        {tabs.map(({ id, label, icon: Icon }) => {
                            const on = tab === id;
                            return (
                                <button
                                    key={id}
                                    role="tab"
                                    aria-selected={on}
                                    type="button"
                                    onClick={() => setTab(id)}
                                    className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b6fb8] sm:text-[15px] ${
                                        on
                                            ? "text-white"
                                            : "text-[#0b6fb8] hover:bg-[#0b6fb8]/10 dark:text-sky-300"
                                    }`}
                                >
                                    {on && (
                                        <motion.span
                                            layoutId="price-pill"
                                            className="absolute inset-0 rounded-full bg-[#0b6fb8]"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 32,
                                            }}
                                        />
                                    )}
                                    <span className="relative flex items-center gap-2">
                                        <Icon size={18} />
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                        exit={{
                            opacity: 0,
                            y: 10,
                            transition: { duration: 0.15 },
                        }}
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.09 } },
                        }}
                        className={`mt-12 grid items-stretch gap-6 ${
                            tab === "modules"
                                ? "sm:grid-cols-2 xl:grid-cols-4"
                                : "md:grid-cols-2 lg:grid-cols-3"
                        }`}
                    >
                        {list.map((item) => (
                            <PlanCard
                                key={item.id}
                                item={item}
                                selected={!!selected[item.id]}
                                onToggle={() => toggle(item)}
                                label={
                                    tab === "modules"
                                        ? "Key features:"
                                        : "Includes:"
                                }
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
