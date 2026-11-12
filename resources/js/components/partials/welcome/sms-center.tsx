import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    Banknote,
    BellRing,
    CheckCheck,
    FileText,
    Fingerprint,
    LineChart,
    MessageCircle,
    Send,
    Users,
} from "lucide-react";
import { useState } from "react";
import { shell } from "../../shared/tokens";
import { useAppData } from "@/hooks/use-app-data";

/**
 * SmsCenter — LANDLORD-ONLY marketing section.
 *
 * Illustrative preview of the bulk-SMS feature using hardcoded sample
 * templates, audiences and copy. Does NOT read tenant data — the phone
 * preview always shows "EduPulse" branding by design.
 *
 * For tenant-facing SMS UI (real recipients, real templates, real send
 * endpoint), build a separate `<TenantSmsCenter>` that consumes
 * `useAppData()`. Do not repurpose this component.
 */

const SMS_TEMPLATES = [
    {
        id: "fees",
        label: "Fee reminder",
        icon: Banknote,
        text: "Dear Parent, kindly clear the outstanding fee balance of KES 12,500 for Amina before 15th Nov. Pay via M-Pesa Paybill 123456. Thank you.",
    },
    {
        id: "attendance",
        label: "Attendance alert",
        icon: Fingerprint,
        text: "Dear Parent, Amina arrived at school at 7:42 AM today. Have a great day!",
    },
    {
        id: "exams",
        label: "Exam results",
        icon: LineChart,
        text: "Dear Parent, Term 3 results for Amina are ready. Mean score: 78 (B+). Log in to the parent portal to view the full report card.",
    },
    {
        id: "notice",
        label: "Announcement",
        icon: BellRing,
        text: "Dear Parent, the school will close for half-term on Friday at 1:00 PM. Learners resume on Monday at 7:30 AM.",
    },
];

const AUDIENCES = [
    "All parents",
    "Grade 6 parents",
    "Form 1 parents",
    "Fee defaulters",
    "Teaching staff",
];

const SMS_FEATURES = [
    {
        icon: Send,
        title: "Instant delivery",
        text: "Reach every parent and staff member in seconds.",
    },
    {
        icon: Users,
        title: "Targeted groups",
        text: "Message a class, a stream, or only fee defaulters.",
    },
    {
        icon: FileText,
        title: "Ready templates",
        text: "Reuse fee, attendance and exam messages in one tap.",
    },
    {
        icon: CheckCheck,
        title: "Delivery reports",
        text: "See who received each message and who did not.",
    },
];

interface PhonePreviewProps {
    message: string;
    tplKey: string;
    accent: string;
}

function PhonePreview({ message, tplKey, accent }: PhonePreviewProps) {
    return (
        <div
            className="mx-auto w-[210px] shrink-0 rounded-[30px] border-[6px] border-slate-800 bg-slate-100 shadow-xl dark:border-slate-600"
            role="img"
            aria-label="Phone preview of the message"
        >
            <div className="flex items-center justify-between rounded-t-[22px] bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                    <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white"
                        style={{ backgroundColor: accent }}
                    >
                        EP
                    </span>
                    EduPulse
                </span>
                <span className="text-[10px] font-normal text-slate-400">
                    now
                </span>
            </div>
            <div className="h-[290px] overflow-y-auto p-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tplKey}
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl rounded-tl-sm bg-white p-3 text-[13px] leading-snug text-slate-700 shadow-sm"
                    >
                        {message || (
                            <span className="text-slate-400">
                                Your message appears here…
                            </span>
                        )}
                        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                            Delivered{" "}
                            <CheckCheck size={12} style={{ color: accent }} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * LANDLORD-ONLY. `smsUrl` points to the platform SMS tool
 * (e.g. /sms). No tenant data is consumed.
 */
interface SmsCenterProps {
    smsUrl: string;
}

export default function SmsCenter({ smsUrl }: SmsCenterProps) {
    const { themes } = useAppData();
    const primary = themes.primary_color || "#0070c0";

    const [tpl, setTpl] = useState(SMS_TEMPLATES[0].id);
    const [message, setMessage] = useState(SMS_TEMPLATES[0].text);
    const [audience, setAudience] = useState(AUDIENCES[0]);

    const pick = (t: (typeof SMS_TEMPLATES)[number]) => {
        setTpl(t.id);
        setMessage(t.text);
    };
    const segments = Math.max(1, Math.ceil(message.length / 160));

    const focusRing = { ["--tw-ring-color" as string]: primary };
    const inputCls =
        "mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-700 focus:outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

    return (
        <section
            id="sms"
            className="scroll-mt-20 bg-white py-20 dark:bg-slate-900"
        >
            <div
                className={`${shell} grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]`}
            >
                {/* Copy */}
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                        style={{
                            backgroundColor: `${primary}1a`,
                            color: primary,
                        }}
                    >
                        <MessageCircle size={16} /> SMS Center
                    </span>
                    <h2
                        className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
                        style={{ color: primary }}
                    >
                        Talk to every parent in seconds
                    </h2>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                        Send fee reminders, attendance alerts, examination
                        updates and announcements from one simple screen. Pick a
                        template, choose who should get it, and see exactly what
                        they will read.
                    </p>

                    <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                        {SMS_FEATURES.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex gap-3">
                                <span
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: `${primary}1a`,
                                        color: primary,
                                    }}
                                >
                                    <Icon size={20} />
                                </span>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                                        {title}
                                    </h3>
                                    <p className="mt-0.5 text-sm leading-snug text-slate-500 dark:text-slate-300">
                                        {text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href={smsUrl}
                            className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                                backgroundColor: primary,
                                ["--tw-shadow-color" as string]: `${primary}40`,
                                ...focusRing,
                            }}
                        >
                            Send Messages
                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </a>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                                borderColor: primary,
                                color: primary,
                                ...focusRing,
                            }}
                        >
                            Request a demo
                        </a>
                    </div>
                </motion.div>

                {/* Composer + phone */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.1,
                    }}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800"
                >
                    <div className="grid gap-6 sm:grid-cols-[1fr_210px]">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                1. Choose a template
                            </h3>
                            <div
                                className="mt-3 flex flex-wrap gap-2"
                                role="group"
                                aria-label="Message templates"
                            >
                                {SMS_TEMPLATES.map((t) => {
                                    const on = tpl === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => pick(t)}
                                            aria-pressed={on}
                                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${
                                                on
                                                    ? "text-white"
                                                    : "border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                            }`}
                                            style={{
                                                borderColor: on
                                                    ? primary
                                                    : undefined,
                                                backgroundColor: on
                                                    ? primary
                                                    : undefined,
                                                ...focusRing,
                                            }}
                                        >
                                            <t.icon size={15} />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <h3 className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                                2. Choose who gets it
                            </h3>
                            <label htmlFor="sms-audience" className="sr-only">
                                Recipients
                            </label>
                            <select
                                id="sms-audience"
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className={inputCls}
                                style={focusRing}
                            >
                                {AUDIENCES.map((a) => (
                                    <option key={a}>{a}</option>
                                ))}
                            </select>

                            <h3 className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                                3. Edit your message
                            </h3>
                            <label htmlFor="sms-message" className="sr-only">
                                Message
                            </label>
                            <textarea
                                id="sms-message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`${inputCls} resize-none leading-snug`}
                                style={focusRing}
                            />
                            <div className="mt-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{message.length} characters</span>
                                <span>{segments} SMS per recipient</span>
                            </div>

                            <a
                                href={smsUrl}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                style={{
                                    backgroundColor: primary,
                                    ...focusRing,
                                }}
                            >
                                <Send size={17} /> Send to{" "}
                                {audience.toLowerCase()}
                            </a>
                            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                                This is a preview. Sign in to send real
                                messages.
                            </p>
                        </div>

                        <PhonePreview
                            message={message}
                            tplKey={tpl}
                            accent={primary}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
