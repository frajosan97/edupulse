import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

import GuestLayout from "@/layouts/guest-layout";
import TopBar from "@/components/partials/welcome/top-bar";
import Navbar from "@/components/partials/welcome/navbar";
import Footer from "@/components/partials/welcome/footer";
import Hero from "@/components/partials/welcome/hero";
import Stats from "@/components/partials/welcome/stats";
import { useAppData } from "@/hooks/use-app-data";
import About from "@/components/partials/welcome/about";

const SECTION_IDS = ["home", "about", "sms", "pricing", "contact"] as const;
type SectionId = (typeof SECTION_IDS)[number];

function TenantWelcomePage() {
    const [active, setActive] = useState<SectionId>("home");
    const [slide, setSlide] = useState(0);
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

    const title = platformName ? `${platformName} — Welcome` : "Welcome";

    return (
        <>
            <Head title={title} />
            <TopBar />
            <Navbar active={active} />
            <main>
                <Hero index={slide} setIndex={setSlide} />
                <Stats />
                <About />
            </main>
            <Footer />
        </>
    );
}

TenantWelcomePage.layout = (page: React.ReactNode) => (
    <GuestLayout>{page}</GuestLayout>
);

export default TenantWelcomePage;
