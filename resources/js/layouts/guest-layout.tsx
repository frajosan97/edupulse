import { motion, useScroll, useSpring } from "framer-motion";
import { PropsWithChildren, useEffect, useState } from "react";

const THEME_KEY = "edupulse-theme";

export default function GuestLayout({ children }: PropsWithChildren) {
    // Read theme synchronously to avoid a light-mode flash for dark users.
    const [dark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(THEME_KEY) === "dark";
    });

    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, {
        stiffness: 140,
        damping: 28,
        restDelta: 0.001,
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", dark);
        localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    }, [dark]);

    return (
        <div className="relative min-h-screen bg-white font-sans text-slate-800 antialiased dark:bg-slate-900 dark:text-slate-100">
            {/* Scroll progress bar */}
            <motion.div
                style={{ scaleX: progress }}
                className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#1a8fd8] to-[#43a047]"
                aria-hidden="true"
            />
            {children}
        </div>
    );
}
