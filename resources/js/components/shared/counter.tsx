import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CounterProps {
    to: number;
    suffix?: string;
}

export default function Counter({ to, suffix = "" }: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const reduce = useReducedMotion();
    const [val, setVal] = useState(reduce ? to : 0);

    useEffect(() => {
        if (reduce) return setVal(to);
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 1.6,
            ease: "easeOut",
            onUpdate: (v) => setVal(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, to, reduce]);

    return (
        <span ref={ref}>
            {val}
            {suffix}
        </span>
    );
}
