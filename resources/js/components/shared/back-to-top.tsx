import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppData } from "@/hooks/use-app-data";

interface BackToTopProps {
    /** Scroll threshold (px) before the button appears. Default 700. */
    threshold?: number;
    /** Lift the button up so it clears a fixed bottom bar. */
    raised?: boolean;
}

export default function BackToTop({
    threshold = 700,
    raised = false,
}: BackToTopProps) {
    const { themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > threshold);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    return (
        <AnimatePresence>
            {show && (
                <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className={`fixed right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-[bottom] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        raised ? "bottom-32 sm:bottom-24" : "bottom-5"
                    }`}
                    style={{
                        backgroundColor: primary,
                        ["--tw-ring-color" as string]: primary,
                    }}
                    aria-label="Back to top"
                >
                    <ArrowUp size={20} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
