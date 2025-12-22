import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
import { IoMdNotifications } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
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
            ease: "easeOut",
        },
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8 },
    },
};

export default function SmsSection() {
    const { tenant, tenantInfo } = usePage().props;

    const contacts = tenantInfo?.contacts ?? [];
    const images = tenantInfo?.images ?? [];

    const config = {
        backgroundImage:
            images.find((c) => c.image_type === "background")?.image_path ??
            "images/landlord/background/default.png",
        badgeIcon: <IoMdNotifications className="me-2" />,
        badgeText: tenant ? "PARENT PORTAL" : "NEW FEATURE",
        title: tenant
            ? "Stay Updated on Your Child's Progress"
            : "Parent Engagement Portal",
        description: tenant
            ? "Our parent portal provides real-time access to academic reports, fee statements, and school announcements. Never miss important updates about your child's education."
            : "Our new parent portal bridges the communication gap between schools and families with real-time updates on academic progress, fee statements, and school announcements.",
        features: tenant
            ? [
                  "Instant exam results notification",
                  "Fee payment tracking",
                  "School calendar access",
                  "Direct communication with teachers",
              ]
            : [
                  "Instant progress reports",
                  "Direct messaging with teachers",
                  "Fee payment tracking",
                  "Event calendar integration",
              ],
        buttonText: "Access Parent Portal",
        buttonIcon: <FaArrowRight className="ms-2" />,
    };

    return (
        <Container
            fluid
            className="sms-hero-section"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
                    url(/storage/${config.backgroundImage})
                `,
            }}
        >
            <Row className="align-items-center min-vh-75">
                <Col lg={6} className="d-none d-lg-block"></Col>
                <Col lg={6} className="main-background p-5">
                    <motion.div
                        className="sms-inner"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                    >
                        <motion.span
                            className="section-badge"
                            variants={itemVariants}
                        >
                            {config.badgeIcon} {config.badgeText}
                        </motion.span>

                        <motion.h2
                            variants={itemVariants}
                            className="section-title"
                        >
                            {config.title}
                        </motion.h2>

                        <motion.p
                            className="section-text"
                            variants={itemVariants}
                        >
                            {config.description}
                        </motion.p>

                        <motion.div
                            className="features-list"
                            variants={containerVariants}
                        >
                            {config.features.map((feature, index) => (
                                <motion.div
                                    className="feature-item"
                                    key={index}
                                    variants={itemVariants}
                                >
                                    <div className="feature-icon">✓ </div>
                                    <span>{feature}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div variants={fadeIn}>
                            <Button
                                variant="primary"
                                className="cta-button mt-4 p-3 px-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {config.buttonText} {config.buttonIcon}
                            </Button>
                        </motion.div>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
}
