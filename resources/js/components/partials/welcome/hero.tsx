import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { shell } from "../../shared/tokens";
import useAppData from "@/hooks/use-app-data";

const AUTOPLAY_MS = 6500;

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 22 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
};

interface HeroProps {
    index: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function Hero({ index, setIndex }: HeroProps) {
    const { slides, themes } = useAppData();
    const reduce = useReducedMotion();
    const [paused, setPaused] = useState(false);

    const primary = themes.primary_color || "#0070c0";

    const count = slides.length;

    useEffect(() => {
        if (count === 0) return;
        if (index >= count) setIndex(0);
    }, [count, index, setIndex]);

    const go = useCallback(
        (n: number) => {
            if (count === 0) return;
            setIndex(((n % count) + count) % count);
        },
        [setIndex, count],
    );

    useEffect(() => {
        if (paused || reduce || count < 2) return;
        const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
        return () => clearTimeout(t);
    }, [index, paused, reduce, count, go]);

    if (count === 0) return null;

    const safeIndex = index % count;
    const slide = slides[safeIndex];

    return (
        <section
            id="home"
            className="relative h-[clamp(560px,80vh,680px)] overflow-hidden text-white"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Featured modules"
            style={{ touchAction: "pan-y", backgroundColor: primary }}
        >
            {/* Background cross-fade */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={slide.id ?? safeIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                >
                    <img
                        src={slide.image}
                        alt=""
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Tinted overlay driven by the tenant primary color */}
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage: `linear-gradient(to right, ${primary}e6, ${primary}b3, ${primary}73)`,
                }}
            />

            {/* Copy */}
            <div
                className={`${shell} relative flex h-full flex-col justify-center pb-32 pt-6 lg:pb-28`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id ?? safeIndex}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="max-w-[640px]"
                        aria-live="polite"
                    >
                        <motion.h1
                            variants={item}
                            className="text-4xl font-extrabold leading-[1.1] tracking-tight drop-shadow sm:text-5xl lg:text-[56px]"
                        >
                            {slide.title}
                        </motion.h1>
                        <motion.p
                            variants={item}
                            className="mt-5 max-w-[540px] text-base leading-relaxed text-white/90 sm:text-lg"
                        >
                            {slide.text}
                        </motion.p>
                        <motion.div variants={item} className="mt-7">
                            <a
                                href={slide.href}
                                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-base font-semibold shadow-lg shadow-black/10 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                                style={{
                                    color: primary,
                                    ["--tw-ring-offset-color" as string]:
                                        primary,
                                }}
                            >
                                {slide.cta}
                                <ArrowRight
                                    size={18}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </a>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div
                className={`${shell} absolute inset-x-0 bottom-12 flex items-center justify-between gap-4`}
            >
                <div
                    className="flex items-center gap-2"
                    role="tablist"
                    aria-label="Choose slide"
                >
                    {slides.map((s, i) => (
                        <button
                            key={s.id ?? i}
                            type="button"
                            role="tab"
                            aria-selected={i === safeIndex}
                            aria-label={s.title}
                            onClick={() => go(i)}
                            className="group relative h-6 focus:outline-none"
                            style={{
                                ["--tw-ring-color" as string]: "#ffffff",
                            }}
                        >
                            <span
                                className={`relative block h-1.5 rounded-full bg-white/35 transition-all duration-300 group-focus-visible:ring-2 ${
                                    i === safeIndex
                                        ? "w-12 bg-white"
                                        : "w-6 group-hover:bg-white/60"
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => go(index - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => go(index + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}