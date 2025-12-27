import AppLayout from "@/Layouts/AppLayout";
import HeroSlider from "@/Components/Pages/HeroSlider";
import DataCard from "@/Components/Pages/DataCard";
import WelcomeSection from "@/Components/Pages/WelcomeSection";
import PricingSection from "@/Components/Pages/PricingSection";
import InfoSection from "@/Components/Pages/InfoSection";
import WhyChooseUs from "@/Components/Pages/WhyChooseUs";
import TestimonialsSection from "@/Components/Pages/TestimonialsSection";

import { Head } from "@inertiajs/react";

export default function Home() {
    return (
        <AppLayout>
            <Head title="Kenya's Leading School Management Platform | EduPulse" />

            {/* Hero Slider */}
            <HeroSlider />

            {/* Platform Statistics */}
            <DataCard />

            {/* Welcome/About Section */}
            <WelcomeSection />

            {/* Pricing Plans */}
            <PricingSection />

            {/* Feature Highlight */}
            <InfoSection />

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Testimonials */}
            <TestimonialsSection />
        </AppLayout>
    );
}
