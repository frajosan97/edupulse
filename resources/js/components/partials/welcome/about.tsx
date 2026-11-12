import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "framer-motion";
import {
    ArrowRight,
    Check,
    Eye,
    GraduationCap,
    Laptop,
    School,
    Target,
    Users,
} from "lucide-react";
import { useRef } from "react";
import { shell, unsplash } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";
import Img from "../../shared/img";

const ABOUT_POINTS = [
    "Built around the Kenyan CBC curriculum",
    "Fees, exams, attendance and SMS in one platform",
    "Simple for teachers, clear for principals",
    "Friendly support whenever your school needs it",
];

interface FigmaCursorProps {
    color: string;
    name: string;
    className?: string;
    drift?: {
        x?: number[];
        y?: number[];
    };
    duration?: number;
}

/** Figma-style cursor with a name tag. */
function FigmaCursor({
    color,
    name,
    className = "",
    drift,
    duration = 8,
}: FigmaCursorProps) {
    return (
        <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute z-40 ${className}`}
            animate={drift}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 18 18"
                fill={color}
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))" }}
            >
                <path
                    d="M2 1.5 15.5 8l-5.6 1.7L7.6 15.5Z"
                    stroke="#fff"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                />
            </svg>
            <span
                className="-mt-1 ml-4 inline-block rounded-full rounded-tl-none px-2.5 py-1 text-[11px] font-semibold text-white shadow-md"
                style={{ background: color }}
            >
                {name}
            </span>
        </motion.div>
    );
}

/** Overlapping, floating photo collage on a design-canvas backdrop. */
function AboutCollage() {
    const { images, contacts, themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 70, damping: 16 });
    const sy = useSpring(my, { stiffness: 70, damping: 16 });

    // three depth layers move by different amounts as the pointer moves
    const aX = useTransform(sx, [-0.5, 0.5], [-8, 8]);
    const aY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
    const bX = useTransform(sx, [-0.5, 0.5], [16, -16]);
    const bY = useTransform(sy, [-0.5, 0.5], [12, -12]);
    const cX = useTransform(sx, [-0.5, 0.5], [-26, 26]);
    const cY = useTransform(sy, [-0.5, 0.5], [-18, 18]);

    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const float = (dy: number, rot: number, duration: number, delay = 0) =>
        reduce
            ? undefined
            : {
                  animate: { y: [0, dy, 0], rotate: [rot, rot + 1.6, rot] },
                  transition: {
                      duration,
                      delay,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                  },
              };

    return (
        <motion.div
            ref={ref}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative isolate mx-auto h-[500px] w-full max-w-[540px] rounded-[32px] border border-slate-200 bg-white sm:h-[520px] lg:mx-0 dark:border-slate-700 dark:bg-slate-800"
            style={{
                backgroundImage: `radial-gradient(circle, ${primary}2e 1.2px, transparent 1.6px)`,
                backgroundSize: "18px 18px",
            }}
        >
            {/* A: back, large, selected like a Figma frame */}
            <motion.div
                style={{ x: aX, y: aY }}
                className="absolute left-5 top-14 z-10 w-[58%]"
            >
                <motion.div {...(float(-8, 0, 7) || {})} className="relative">
                    <Img
                        src={
                            images.others.avatar ||
                            unsplash("photo-1580582932707-520aed937b7b")
                        }
                        alt={`Learners at ${contacts.name || "school"}`}
                        icon={School}
                        className="aspect-[4/5] w-full rounded-2xl shadow-2xl shadow-slate-900/20"
                    />
                    <span
                        className="pointer-events-none absolute -inset-1.5 rounded-md border-[1.5px]"
                        style={{ borderColor: primary }}
                        aria-hidden="true"
                    >
                        {[
                            "-left-[5px] -top-[5px]",
                            "-right-[5px] -top-[5px]",
                            "-bottom-[5px] -left-[5px]",
                            "-bottom-[5px] -right-[5px]",
                        ].map((pos) => (
                            <span
                                key={pos}
                                className={`absolute h-2.5 w-2.5 border-[1.5px] bg-white ${pos}`}
                                style={{ borderColor: primary }}
                            />
                        ))}
                    </span>
                    <span
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: primary }}
                    >
                        Classroom · 312 × 390
                    </span>
                </motion.div>
            </motion.div>

            {/* B: right, tilted, overlaps A */}
            <motion.div
                style={{ x: bX, y: bY }}
                className="absolute right-4 top-4 z-20 w-[48%]"
            >
                <motion.div
                    {...(float(10, 5, 6, 0.6) || {})}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    style={{ rotate: reduce ? 5 : undefined }}
                    className="cursor-pointer"
                >
                    <Img
                        src={
                            images.others.elearning ||
                            unsplash("photo-1509062522246-3755977927d7")
                        }
                        alt="Teacher helping a learner"
                        icon={GraduationCap}
                        className="aspect-square w-full rounded-2xl border-[5px] border-white shadow-2xl shadow-slate-900/25 dark:border-slate-800"
                    />
                </motion.div>
            </motion.div>

            {/* C: front, bottom, overlaps A and B */}
            <motion.div
                style={{ x: cX, y: cY }}
                className="absolute bottom-5 right-6 z-30 w-[56%]"
            >
                <motion.div
                    {...(float(-12, -3, 8, 1.2) || {})}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    style={{ rotate: reduce ? -3 : undefined }}
                    className="cursor-pointer"
                >
                    <Img
                        src={
                            images.others.sms ||
                            unsplash("photo-1523240795612-9a054b0db644")
                        }
                        alt="Students studying together"
                        icon={Users}
                        className="aspect-[4/3] w-full rounded-2xl border-[5px] border-white shadow-2xl shadow-slate-900/30 dark:border-slate-800"
                    />
                </motion.div>
            </motion.div>

            {/* Floating UI chips */}
            <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -left-4 top-2 z-40 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-700"
            >
                <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: primary }}
                >
                    <School size={22} />
                </span>
                <div>
                    <div
                        className="text-lg font-extrabold leading-none"
                        style={{ color: primary }}
                    >
                        500+
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                        Schools trust us
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={reduce ? undefined : { y: [0, 8, 0] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                }}
                className="absolute bottom-3 left-3 z-40 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-700"
            >
                <div className="flex -space-x-2" aria-hidden="true">
                    {[
                        ["#7b61ff", "JM"],
                        ["#0acf83", "AK"],
                        ["#f24e1e", "PW"],
                    ].map(([bg, initials]) => (
                        <span
                            key={initials}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-slate-900"
                            style={{ background: bg }}
                        >
                            {initials}
                        </span>
                    ))}
                </div>
                <div>
                    <div className="text-sm font-extrabold leading-none text-slate-800 dark:text-white">
                        10K+
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                        Teachers on board
                    </div>
                </div>
            </motion.div>

            {/* Collaborator cursors */}
            <FigmaCursor
                color={primary}
                name="Principal"
                className="left-[46%] top-[40%]"
                drift={
                    reduce
                        ? undefined
                        : { x: [0, 28, -8, 0], y: [0, -18, 12, 0] }
                }
                duration={9}
            />
            <FigmaCursor
                color={primary}
                name="Teacher Mary"
                className="right-[14%] top-[72%]"
                drift={
                    reduce
                        ? undefined
                        : { x: [0, -24, 10, 0], y: [0, 14, -16, 0] }
                }
                duration={11}
            />
        </motion.div>
    );
}

export default function About() {
    const { contacts, isLandlord, themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    // Mission/vision come from the backend; fall back to landlord defaults
    // so the section never shows empty cards for tenants that haven't
    // configured them yet.
    const mission =
        contacts.mission ||
        "To give every school in Kenya simple, reliable tools that save time on admin so teachers can focus on learners.";
    const vision =
        contacts.vission ||
        "Schools where parents, teachers and learners stay connected, and decisions are made with clear, current information.";

    const aboutCards = [
        { icon: Target, title: "Our mission", text: mission },
        { icon: Eye, title: "Our vision", text: vision },
    ];

    // Landlord gets the marketing blurb; tenants get their own description
    // from SchoolContact, with the landlord copy as fallback.
    const description =
        contacts.description ||
        "EduPulse is Kenya's leading school management platform. We bring fees, exams, attendance, e-learning and parent communication together in one place, so your staff spend less time on paperwork and more time with learners.";

    return (
        <section
            id="about"
            className="scroll-mt-20 bg-slate-50 pb-20 pt-16 dark:bg-slate-900"
        >
            <div className={`${shell} grid items-center gap-14 lg:grid-cols-2`}>
                <AboutCollage />

                {/* Copy */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.1,
                    }}
                >
                    <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                        style={{
                            backgroundColor: `${primary}1a`,
                            color: primary,
                        }}
                    >
                        <Laptop size={16} /> About Us
                    </span>
                    <h2
                        className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
                        style={{ color: primary }}
                    >
                        {isLandlord
                            ? "Designed by educators, for educators"
                            : `About ${contacts.name || "our school"}`}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        {description}
                    </p>

                    <ul className="mt-6 space-y-3">
                        {ABOUT_POINTS.map((p) => (
                            <li
                                key={p}
                                className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-200"
                            >
                                <span
                                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: primary }}
                                >
                                    <Check size={13} strokeWidth={3.5} />
                                </span>
                                {p}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {aboutCards.map(({ icon: Icon, title, text }) => (
                            <motion.div
                                key={title}
                                whileHover={{ y: -4 }}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                            >
                                <span
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: `${primary}1a`,
                                        color: primary,
                                    }}
                                >
                                    <Icon size={20} />
                                </span>
                                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-snug text-slate-500 dark:text-slate-300">
                                    {text}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#contact"
                            className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                                backgroundColor: primary,
                                ["--tw-shadow-color" as string]: `${primary}40`,
                                ["--tw-ring-color" as string]: primary,
                            }}
                        >
                            Talk to our team
                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </a>
                        <a
                            href="#pricing"
                            className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:bg-slate-800"
                            style={{
                                borderColor: primary,
                                color: primary,
                                ["--tw-ring-color" as string]: primary,
                            }}
                        >
                            See pricing
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
