import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { shell } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";
import Counter from "../../shared/counter";

export default function Stats() {
    const { statsData, themes } = useAppData();

    const primary = themes.primary_color || "#0070c0";

    const cardRef = useRef<HTMLDivElement>(null);
    const [half, setHalf] = useState(110);

    // Measure the card and offset it by half its height.
    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const measure = () => setHalf(Math.round(el.offsetHeight / 2));

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    if (!statsData.length) return null;

    return (
        <section
            id="stats"
            className="relative flow-root bg-slate-50 pb-4 dark:bg-slate-900"
        >
            <div
                className={`${shell} relative z-10`}
                style={{ marginTop: -half }}
            >
                <motion.div
                    ref={cardRef}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-3xl bg-white p-6 sm:p-10 dark:bg-slate-800"
                    style={{
                        boxShadow: "0 20px 50px rgba(11,111,184,0.18)",
                        backgroundImage: `radial-gradient(circle, ${primary}12 1.5px, transparent 2px)`,
                        backgroundSize: "14px 14px",
                    }}
                >
                    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                        {statsData.map(({ title, to, suffix, icon }, i) => (
                            <motion.li
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: i * 0.08,
                                    duration: 0.5,
                                }}
                                whileHover={{ y: -4 }}
                                className="flex items-center gap-4 rounded-2xl border-t-4 bg-white px-5 py-10 shadow-md shadow-slate-200/80 sm:px-6 dark:bg-slate-900 dark:shadow-none"
                                style={{ borderTopColor: primary }}
                            >
                                <span
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{
                                        backgroundImage: `linear-gradient(to bottom right, ${primary}, ${primary})`,
                                    }}
                                >
                                    <i className={`${icon} text-xl`} />
                                </span>

                                <div>
                                    <div
                                        className="text-2xl font-extrabold leading-none sm:text-3xl dark:text-sky-300"
                                        style={{ color: primary }}
                                    >
                                        <Counter
                                            to={
                                                typeof to === "number"
                                                    ? to
                                                    : Number(to)
                                            }
                                            suffix={suffix}
                                        />
                                    </div>

                                    <div className="mt-1.5 text-sm font-semibold text-slate-500 dark:text-slate-300">
                                        {title}
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
}
