import { Head, usePage } from "@inertiajs/react";
import { FaChalkboardTeacher, FaUserGraduate, FaAward } from "react-icons/fa";

import AppLayout from "@/Layouts/AppLayout";
import HeroSlider from "@/Components/Pages/HeroSlider";
import DataCard from "@/Components/Pages/DataCard";
import WelcomeSection from "@/Components/Pages/WelcomeSection";
import InfoSection from "@/Components/Pages/InfoSection";
import TestimonialsSection from "@/Components/Pages/TestimonialsSection";

export default function Home() {
    return (
        <AppLayout>
            <Head title="Home | Katheka Boys Secondary School" />

            {/* Hero Slider - Showcases key school highlights */}
            <HeroSlider />

            {/* Statistics Cards - School achievements at a glance */}
            <DataCard />

            {/* Welcome Section - School introduction */}
            <WelcomeSection />

            {/* Info Section - Parent portal information */}
            <InfoSection />

            {/* Testimonials - Stakeholder feedback */}
            <TestimonialsSection />
        </AppLayout>
    );
}
