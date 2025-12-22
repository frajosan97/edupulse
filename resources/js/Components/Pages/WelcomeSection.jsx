import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
        },
    },
};

const imageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

const badgeVariants = {
    hidden: { scale: 0, rotate: -20 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            delay: 0.5,
            type: "spring",
            stiffness: 200,
        },
    },
};

export default function WelcomeSection() {
    const { tenant, tenantInfo } = usePage().props;

    const contacts = tenantInfo?.contacts ?? [];
    const images = tenantInfo?.images ?? [];

    const config = {
        title: tenant
            ? `Welcome to ${tenant?.name ?? "EduPulse"}`
            : "Revolutionizing School Management in Kenya",
        description:
            contacts.find((c) => c.contact_type === "description")?.value ??
            "EduPulse is Kenya's leading school management platform, designed by educators for educators. Our comprehensive solution integrates all aspects of school administration, from student records to financial management, in one intuitive platform.",
        image:
            images.find((c) => c.image_type === "welcome")?.image_path ??
            "images/landlord/welcome/default.png",
        features: tenant
            ? [
                  "Consistent top KCSE performance",
                  "Modern teaching facilities",
                  "Comprehensive guidance and counseling",
                  "Diverse co-curricular programs",
                  "ICT-integrated learning",
                  "Strong alumni network",
              ]
            : [
                  "Real-time performance analytics",
                  "Automated fee management",
                  "Integrated communication tools",
                  "Customizable reporting",
                  "Mobile-friendly access",
                  "Dedicated support team",
              ],
    };

    return (
        <Container fluid className="py-5">
            <Container className="py-3">
                <Row className="align-items-center">
                    <Col lg={6} className="mb-5 mb-lg-0">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={containerVariants}
                        >
                            <motion.div
                                variants={itemVariants}
                                className="section-header mb-4"
                            >
                                <span className="section-subtitle">
                                    WHO WE ARE
                                </span>
                                <motion.h2 className="section-title">
                                    {config.title}
                                </motion.h2>
                                <motion.div
                                    className="divider"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                />
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="welcome-text mb-4"
                            >
                                {config.description}
                            </motion.p>

                            <motion.div
                                variants={containerVariants}
                                className="features-grid mb-5"
                            >
                                {config.features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="feature-item"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <FaCheck className="feature-check" />
                                        <span>{feature}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button
                                    variant="primary"
                                    className="learn-more-btn"
                                    as={motion.button}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.2 },
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn More About Us{" "}
                                    <FaArrowRight className="ms-2" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    </Col>

                    <Col lg={6}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={imageVariants}
                            className="about-image-container"
                        >
                            <img
                                src={`/storage/${config.image}`}
                                alt="Students learning together"
                                className="w-100 about-image img-fluid rounded-3 shadow-lg"
                            />
                            {!tenant && (
                                <motion.div
                                    variants={badgeVariants}
                                    className="image-badge"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <span>15+ Years Experience</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}
