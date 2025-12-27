import AppLayout from "@/Layouts/AppLayout";
import HeroSlider from "@/Components/Pages/HeroSlider";
import DataCard from "@/Components/Pages/DataCard";
import WelcomeSection from "@/Components/Pages/WelcomeSection";
import InfoSection from "@/Components/Pages/InfoSection";
import TestimonialsSection from "@/Components/Pages/TestimonialsSection";

import { Head, usePage } from "@inertiajs/react";

export default function Home() {
    const { tenant } = usePage().props;

    return (
        <AppLayout>
            <Head title={tenant ? tenant.name : "Home"} />

            {/* Hero Slider */}
            <HeroSlider />

            {/* Platform Statistics */}
            <DataCard />

            {/* Welcome/About Section */}
            <WelcomeSection />

            {/* Feature Highlight */}
            <InfoSection />

            {/* Testimonials */}
            <TestimonialsSection />
        </AppLayout>
    );
}
