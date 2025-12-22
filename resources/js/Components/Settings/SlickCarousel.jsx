// resources/js/Components/SlickCarousel.jsx
import React from "react";
import Slider from "react-slick";
import { ChevronRight, ChevronLeft } from "react-feather";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../../css/perComponent/slick.css";

// Custom Next Arrow
const SampleNextArrow = ({ className, style, onClick }) => (
    <div
        className={`${className} custom-arrow next-arrow`}
        style={style}
        onClick={onClick}
    >
        <div className="arrow-circle">
            <ChevronRight size={20} />
        </div>
    </div>
);

// Custom Prev Arrow
const SamplePrevArrow = ({ className, style, onClick }) => (
    <div
        className={`${className} custom-arrow prev-arrow`}
        style={style}
        onClick={onClick}
    >
        <div className="arrow-circle">
            <ChevronLeft size={20} />
        </div>
    </div>
);

export default function SlickCarousel({
    children,
    slidesToShow = 4,
    autoplay = true,
    speed = 500,
    autoplaySpeed = 3000,
    customSettings = {},
}) {
    const settings = {
        dots: false,
        infinite: true,
        speed,
        autoplay,
        autoplaySpeed,
        slidesToShow,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 992,
                settings: { slidesToShow: Math.min(3, slidesToShow) },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: Math.min(2, slidesToShow) },
            },
            {
                breakpoint: 576,
                settings: { slidesToShow: 2 },
            },
        ],
        appendDots: (dots) => (
            <div className="custom-dots">
                <ul>{dots}</ul>
            </div>
        ),
        customPaging: () => (
            <div className="custom-dot">
                <div className="dot-inner" />
            </div>
        ),
        ...customSettings,
    };

    return (
        <Slider className="slick-container" {...settings}>
            {children}
        </Slider>
    );
}
