import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { ModuleItem, SelectedMap } from "@/components/shared/data";

import GuestLayout from "@/layouts/guest-layout";

import TopBar from "@/components/partials/welcome/top-bar";
import Navbar from "@/components/partials/welcome/navbar";
import Hero from "@/components/partials/welcome/hero";
import Stats from "@/components/partials/welcome/stats";
import About from "@/components/partials/welcome/about";
import SmsCenter from "@/components/partials/welcome/sms-center";
import Pricing from "@/components/partials/welcome/pricing";
import Contact from "@/components/partials/welcome/contact";
import Footer from "@/components/partials/welcome/footer";
import SelectionBar from "@/components/partials/welcome/selection-bar";
import BackToTop from "@/components/shared/back-to-top";

import { useAppData } from "@/hooks/use-app-data";

interface WelcomeProps {
    smsUrl?: string;
    contactUrl?: string;
}

const SECTION_IDS = ["home", "about", "sms", "pricing", "contact"] as const;
type SectionId = (typeof SECTION_IDS)[number];

function LandlordWelcomePage({
    smsUrl = "/sms",
    contactUrl = "/contact",
}: WelcomeProps) {
    const [slide, setSlide] = useState(0);
    const [active, setActive] = useState<SectionId>("home");
    const [selected, setSelected] = useState<SelectedMap>({});

    const { platformName, slides } = useAppData();

    // Reset slide index if the slide set changes underneath us
    useEffect(() => {
        if (slide >= slides.length) setSlide(0);
    }, [slides.length, slide]);

    // Scroll-spy: highlight the section currently in view
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        setActive(e.target.id as SectionId);
                    }
                }
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
        );

        for (const id of SECTION_IDS) {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        }

        return () => obs.disconnect();
    }, []);

    const toggle = (item: ModuleItem) =>
        setSelected((s) => {
            const next = { ...s };
            if (next[item.id]) delete next[item.id];
            else next[item.id] = { name: item.name, price: item.price };
            return next;
        });

    const hasSelection = Object.keys(selected).length > 0;

    const title = platformName
        ? `${platformName} — Kenya's Leading School Management Platform`
        : "Kenya's Leading School Management Platform";

    return (
        <>
            <Head title={title} />

            <TopBar />
            <Navbar active={active} />

            <main>
                <Hero index={slide} setIndex={setSlide} />
                <Stats />
                <About />
                <SmsCenter smsUrl={smsUrl} />
                <Pricing selected={selected} toggle={toggle} />
                <Contact selected={selected} contactUrl={contactUrl} />
            </main>

            <Footer />

            <SelectionBar
                selected={selected}
                clear={() => setSelected({})}
                demoUrl="#contact"
            />

            <BackToTop raised={hasSelection} />
        </>
    );
}

LandlordWelcomePage.layout = (page: React.ReactNode) => (
    <GuestLayout>{page}</GuestLayout>
);

export default LandlordWelcomePage;
