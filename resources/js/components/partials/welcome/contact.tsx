import { useForm } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Banknote,
    Check,
    Clock,
    Laptop,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Send,
    UserCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shell } from "../../shared/tokens";
import { BUNDLES, MODULES, type SelectedMap } from "../../shared/data";
import { useAppData } from "@/hooks/use-app-data";

const REQUEST_TYPES = [
    { id: "demo", label: "Request a demo", icon: Laptop },
    { id: "service", label: "Request a service", icon: UserCog },
    { id: "quote", label: "Get a quote", icon: Banknote },
] as const;

type RequestType = (typeof REQUEST_TYPES)[number]["id"];

const MODULE_CHIPS = [
    "Analytics",
    "Finance",
    "E-Learning",
    "Biometric Attendance",
    "Bulk SMS",
];

const SUBMIT_LABEL: Record<RequestType, string> = {
    demo: "Book my demo",
    service: "Send request",
    quote: "Get my quote",
};

const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[15px] text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}

function Field({
    label,
    htmlFor,
    error,
    className = "",
    children,
}: FieldProps) {
    return (
        <div className={className}>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
                {label}
            </label>
            {children}
            {error && (
                <p
                    className="mt-1 text-xs font-medium text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

interface ContactProps {
    selected: SelectedMap;
    contactUrl: string;
}

export default function Contact({ selected, contactUrl }: ContactProps) {
    const { themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    const { data, setData, post, processing, errors, reset } = useForm({
        type: "demo" as RequestType,
        name: "",
        school: "",
        email: "",
        phone: "",
        modules: [] as string[],
        date: "",
        message: "",
    });
    const [sent, setSent] = useState(false);
    const typeTouched = useRef(false);
    const today = new Date().toISOString().split("T")[0];

    const focusRing = {
        ["--tw-ring-color" as string]: primary,
    };

    // Anything picked in the pricing section is pre-ticked here.
    useEffect(() => {
        const ids = Object.keys(selected);
        if (!ids.length) return;
        const names = new Set<string>();
        ids.forEach((id) => {
            const m = MODULES.find((x) => x.id === id);
            if (m) names.add(m.name);
            const b = BUNDLES.find((x) => x.id === id);
            if (b) b.features.forEach((f) => names.add(f));
        });
        setData((d) => ({
            ...d,
            modules: [...names],
            type: typeTouched.current ? d.type : "quote",
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    const toggleModule = (m: string) =>
        setData(
            "modules",
            data.modules.includes(m)
                ? data.modules.filter((x) => x !== m)
                : [...data.modules, m],
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(contactUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                reset();
            },
        });
    };

    const details = [
        {
            icon: Phone,
            label: "Call us",
            value: "+254796594366",
            href: "tel:+254796594366",
        },
        {
            icon: Mail,
            label: "Email us",
            value: "info@edupulse.co.ke",
            href: "mailto:info@edupulse.co.ke",
        },
        { icon: MapPin, label: "Visit us", value: "222-90200 Kitui" },
    ];

    return (
        <section
            id="contact"
            className="scroll-mt-20 bg-white py-20 dark:bg-slate-900"
        >
            <div
                className={`${shell} grid gap-12 lg:grid-cols-[0.85fr_1.15fr]`}
            >
                {/* Left: details */}
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2
                        className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                        style={{ color: primary }}
                    >
                        Let&apos;s get your school started
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        Tell us what you need. We will set up a demo, answer
                        your questions, or send a quote for the modules you
                        picked.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {details.map(({ icon: Icon, label, value, href }) => {
                            const inner = (
                                <>
                                    <span
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            backgroundColor: `${primary}1a`,
                                            color: primary,
                                        }}
                                    >
                                        <Icon size={20} />
                                    </span>
                                    <span>
                                        <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {label}
                                        </span>
                                        <span className="block text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                                            {value}
                                        </span>
                                    </span>
                                </>
                            );
                            const cls =
                                "flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 pr-5 dark:border-slate-700 dark:bg-slate-800";
                            return (
                                <li key={label}>
                                    {href ? (
                                        <a
                                            href={href}
                                            className={`${cls} transition focus:outline-none focus-visible:ring-2`}
                                            style={focusRing}
                                        >
                                            {inner}
                                        </a>
                                    ) : (
                                        <div className={cls}>{inner}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <div
                        className="mt-8 rounded-2xl p-5 dark:bg-slate-800"
                        style={{ backgroundColor: `${primary}0d` }}
                    >
                        <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 dark:text-white">
                            <Clock size={17} style={{ color: primary }} /> What
                            happens next
                        </h3>
                        <ol className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                            {[
                                "We read your request and match you with a team member.",
                                "We contact you to confirm the date or the details.",
                                "You get a walkthrough, a setup plan, or your quote.",
                            ].map((step, i) => (
                                <li key={step} className="flex gap-3">
                                    <span
                                        className="font-bold"
                                        style={{ color: primary }}
                                    >
                                        {i + 1}.
                                    </span>{" "}
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </motion.div>

                {/* Right: form */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.1,
                    }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800"
                    style={{
                        boxShadow: "0 20px 50px rgba(11,111,184,0.12)",
                    }}
                >
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex min-h-[420px] flex-col items-center justify-center text-center"
                                role="status"
                            >
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 16,
                                        delay: 0.1,
                                    }}
                                    className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: primary }}
                                >
                                    <Check size={32} strokeWidth={3} />
                                </motion.span>
                                <h3 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
                                    Request received
                                </h3>
                                <p className="mt-2 max-w-sm text-slate-600 dark:text-slate-300">
                                    Thank you. We will contact you soon on the
                                    phone or email you gave us.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="mt-6 rounded-xl border-2 px-5 py-2.5 font-semibold focus:outline-none focus-visible:ring-2"
                                    style={{
                                        borderColor: primary,
                                        color: primary,
                                        ...focusRing,
                                    }}
                                >
                                    Send another request
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={submit}
                                noValidate
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                <fieldset>
                                    <legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        What do you need?
                                    </legend>
                                    <div
                                        className="grid gap-2 sm:grid-cols-3"
                                        role="radiogroup"
                                    >
                                        {REQUEST_TYPES.map(
                                            ({ id, label, icon: Icon }) => {
                                                const on = data.type === id;
                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={on}
                                                        onClick={() => {
                                                            typeTouched.current = true;
                                                            setData("type", id);
                                                        }}
                                                        className={`relative flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${
                                                            on
                                                                ? "text-white"
                                                                : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-200"
                                                        }`}
                                                        style={{
                                                            borderColor: on
                                                                ? primary
                                                                : undefined,
                                                            ...focusRing,
                                                        }}
                                                    >
                                                        {on && (
                                                            <motion.span
                                                                layoutId="request-type"
                                                                className="absolute inset-0 rounded-xl"
                                                                style={{
                                                                    backgroundColor:
                                                                        primary,
                                                                }}
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 380,
                                                                    damping: 32,
                                                                }}
                                                            />
                                                        )}
                                                        <span className="relative flex items-center gap-2">
                                                            <Icon size={16} />
                                                            {label}
                                                        </span>
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </fieldset>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        label="Your name"
                                        htmlFor="c-name"
                                        error={errors.name}
                                    >
                                        <input
                                            id="c-name"
                                            className={inputCls}
                                            style={focusRing}
                                            autoComplete="name"
                                            placeholder="Jane Mwende"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="School name"
                                        htmlFor="c-school"
                                        error={errors.school}
                                    >
                                        <input
                                            id="c-school"
                                            className={inputCls}
                                            style={focusRing}
                                            autoComplete="organization"
                                            placeholder="Kitui Hill Academy"
                                            value={data.school}
                                            onChange={(e) =>
                                                setData(
                                                    "school",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Email"
                                        htmlFor="c-email"
                                        error={errors.email}
                                    >
                                        <input
                                            id="c-email"
                                            type="email"
                                            className={inputCls}
                                            style={focusRing}
                                            autoComplete="email"
                                            placeholder="you@school.ac.ke"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Phone"
                                        htmlFor="c-phone"
                                        error={errors.phone}
                                    >
                                        <input
                                            id="c-phone"
                                            type="tel"
                                            className={inputCls}
                                            style={focusRing}
                                            autoComplete="tel"
                                            placeholder="+254 7XX XXX XXX"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            required
                                        />
                                    </Field>
                                </div>

                                <fieldset>
                                    <legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Which modules interest you?
                                    </legend>
                                    <div className="flex flex-wrap gap-2">
                                        {MODULE_CHIPS.map((m) => {
                                            const on = data.modules.includes(m);
                                            return (
                                                <motion.button
                                                    key={m}
                                                    type="button"
                                                    aria-pressed={on}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() =>
                                                        toggleModule(m)
                                                    }
                                                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${
                                                        on
                                                            ? ""
                                                            : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                                                    }`}
                                                    style={{
                                                        borderColor: on
                                                            ? primary
                                                            : undefined,
                                                        backgroundColor: on
                                                            ? `${primary}1a`
                                                            : undefined,
                                                        color: on
                                                            ? primary
                                                            : undefined,
                                                        ...focusRing,
                                                    }}
                                                >
                                                    {on && (
                                                        <Check
                                                            size={14}
                                                            strokeWidth={3}
                                                        />
                                                    )}
                                                    {m}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    {errors.modules && (
                                        <p
                                            className="mt-1 text-xs font-medium text-red-600"
                                            role="alert"
                                        >
                                            {errors.modules}
                                        </p>
                                    )}
                                </fieldset>

                                <AnimatePresence initial={false}>
                                    {data.type === "demo" && (
                                        <motion.div
                                            key="date"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <Field
                                                label="Preferred demo date (optional)"
                                                htmlFor="c-date"
                                                error={errors.date}
                                            >
                                                <input
                                                    id="c-date"
                                                    type="date"
                                                    min={today}
                                                    className={inputCls}
                                                    style={focusRing}
                                                    value={data.date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "date",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Field
                                    label="Anything else we should know? (optional)"
                                    htmlFor="c-message"
                                    error={errors.message}
                                >
                                    <textarea
                                        id="c-message"
                                        rows={4}
                                        className={`${inputCls} resize-none`}
                                        style={focusRing}
                                        placeholder="Number of students, current system, questions…"
                                        value={data.message}
                                        onChange={(e) =>
                                            setData("message", e.target.value)
                                        }
                                    />
                                </Field>

                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                                    style={{
                                        backgroundColor: primary,
                                        ["--tw-shadow-color" as string]: `${primary}40`,
                                        ...focusRing,
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />{" "}
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />{" "}
                                            {SUBMIT_LABEL[data.type]}
                                        </>
                                    )}
                                </motion.button>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                    We only use your details to reply to this
                                    request.
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
