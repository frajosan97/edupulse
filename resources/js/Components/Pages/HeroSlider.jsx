import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button, Container } from "react-bootstrap";
import SlickCarousel from "../Settings/SlickCarousel";
import "../../../css/perComponent/hero.css";
import useTenantData from "@/Hooks/useTenantData";

export default function HeroSlider() {
    const { slides: dataSlides } = useTenantData();

    // Fallback slides if no data from useTenantData
    const fallbackSlides = [
        {
            id: 1,
            title: "Join Our Movement",
            description: "Be part of the change for a better future",
            image_path: "/storage/images/landlord/slides/1.jpg",
            cta: "Learn More",
        },
        {
            id: 2,
            title: "Join Our Movement",
            description: "Be part of the change for a better future",
            image_path: "/storage/images/landlord/slides/2.jpg",
            cta: "Learn More",
        },
        {
            id: 3,
            title: "Join Our Movement",
            description: "Be part of the change for a better future",
            image_path: "/storage/images/landlord/slides/3.jpg",
            cta: "Learn More",
        },
    ];

    // Transform dataSlides to match the expected structure
    const transformSlides = (slides) => {
        if (!slides || !Array.isArray(slides)) return fallbackSlides;

        return slides.map((slide) => ({
            id: slide.id || Math.random(),
            title: slide.title || "Join Our Movement",
            description:
                slide.description ||
                "Be part of the change for a better future",
            image_path:
                slide.image_path || "/storage/images/landlord/slides/1.jpg",
            cta: slide.cta || "Learn More",
            link_url: slide.link_url || null,
            // Add other properties from the data if needed
            ...slide,
        }));
    };

    // Get slides based on data availability
    const slides =
        dataSlides && dataSlides.length > 0
            ? transformSlides(dataSlides)
            : fallbackSlides;

    const settings = {
        slidesToShow: 1,
        autoplay: false,
        autoplaySpeed: 6000,
        speed: 800,
        customSettings: {
            infinite: true,
            arrows: true,
            dots: true,
            pauseOnHover: true,
            appendDots: (dots) => (
                <div className="custom-dots">
                    <ul>{dots}</ul>
                </div>
            ),
            customPaging: (i) => (
                <div className="custom-dot">
                    <div className="dot-inner"></div>
                </div>
            ),
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        dots: false,
                    },
                },
            ],
        },
    };

    return (
        <div className="slick-carousel-container">
            <SlickCarousel {...settings}>
                {slides.map((slide) => (
                    <div key={slide.id} className="slick-slide">
                        <div className="slide-background">
                            {/* Always render as image since your API returns image_path */}
                            <img
                                src={`/storage/${slide.image_path}`}
                                alt={slide.title}
                                className="background-media"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        "/storage/images/landlord/slides/1.jpg";
                                }}
                            />
                            <div className="slide-overlay"></div>
                            <Container className="h-100 d-flex align-items-center slide-content">
                                <div className="">
                                    <h3 className="slide-title animate__animated animate__fadeInDown">
                                        {slide.title}
                                    </h3>
                                    <p className="slide-description animate__animated animate__fadeInUp">
                                        {slide.description}
                                    </p>
                                    <Button
                                        variant="primary"
                                        className="learn-more-btn"
                                        href={slide.link_url || "#"}
                                    >
                                        {slide.cta}{" "}
                                        <i className="bi bi-arrow-right"></i>
                                    </Button>
                                </div>
                            </Container>
                        </div>
                    </div>
                ))}
            </SlickCarousel>
        </div>
    );
}
