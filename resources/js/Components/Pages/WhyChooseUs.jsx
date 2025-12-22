import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
    FaAward,
    FaUserTie,
    FaChartLine,
    FaLightbulb,
    FaHandsHelping,
    FaShieldAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function WhyChooseUs() {
    const featuresLeft = [
        {
            id: 1,
            icon: <FaAward className="feature-icon" />,
            title: "Proven Excellence",
            description:
                "Award-winning programs recognized by education leaders",
        },
        {
            id: 2,
            icon: <FaUserTie className="feature-icon" />,
            title: "Expert Educators",
            description: "Certified professionals with industry experience",
        },
        {
            id: 3,
            icon: <FaChartLine className="feature-icon" />,
            title: "Measurable Results",
            description: "94% of students show significant improvement",
        },
    ];

    const featuresRight = [
        {
            id: 4,
            icon: <FaLightbulb className="feature-icon" />,
            title: "Innovative Methods",
            description: "Cutting-edge curriculum designed for modern learners",
        },
        {
            id: 5,
            icon: <FaHandsHelping className="feature-icon" />,
            title: "Personalized Support",
            description: "Dedicated advisors for each student's journey",
        },
        {
            id: 6,
            icon: <FaShieldAlt className="feature-icon" />,
            title: "Safe Environment",
            description: "Secure platform with privacy-first policies",
        },
    ];

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <Container className="why-choose-us py-5 my-5">
            <Row className="align-items-center">
                {/* Left Features Column */}
                <Col lg={4} className="pe-lg-5">
                    {featuresLeft.map((feature) => (
                        <motion.div
                            key={feature.id}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeIn}
                            transition={{
                                duration: 0.5,
                                delay: feature.id * 0.1,
                            }}
                            className="feature-card mb-4"
                        >
                            <div className="feature-icon-wrapper system-icon">
                                {feature.icon}
                            </div>
                            <div className="feature-content">
                                <h4 className="feature-title">
                                    {feature.title}
                                </h4>
                                <p className="feature-description">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </Col>

                {/* Center Image Column */}
                <Col lg={4} className="d-none d-lg-block px-lg-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="feature-image-container"
                    >
                        <img
                            src={
                                "/storage/images/landlord/featured/default.png"
                            }
                            alt="Happy students learning"
                            className="feature-image img-fluid border-0 rounded-3"
                        />
                        <div className="image-overlay"></div>
                    </motion.div>
                </Col>

                {/* Right Features Column */}
                <Col lg={4} className="ps-lg-5">
                    {featuresRight.map((feature) => (
                        <motion.div
                            key={feature.id}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeIn}
                            transition={{
                                duration: 0.5,
                                delay: (feature.id - 3) * 0.1,
                            }}
                            className="feature-card mb-4"
                        >
                            <div className="feature-icon-wrapper system-icon">
                                {feature.icon}
                            </div>
                            <div className="feature-content">
                                <h4 className="feature-title">
                                    {feature.title}
                                </h4>
                                <p className="feature-description">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </Col>
            </Row>
        </Container>
    );
}
