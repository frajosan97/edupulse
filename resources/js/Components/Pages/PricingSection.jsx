import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaCheck, FaStar, FaRocket } from "react-icons/fa";
import { motion } from "framer-motion";

export default function PricingSection() {
    const plans = [
        {
            id: 1,
            name: "Basic Package",
            price: "15,000",
            period: "Year",
            featured: false,
            features: [
                "Less than 100 students",
                "Performance Analytics",
                "Free SMS System",
                "Free school sub-domain",
            ],
        },
        {
            id: 2,
            name: "Standard Package",
            price: "40,000",
            period: "Year",
            featured: true,
            features: [
                "Unlimited Students",
                "Performance Analytics",
                "Finance System",
                "E-Learning Module",
                "Free SMS System (Free Sender ID)",
                "Free customized .sc.ke or .ac.ke domain",
            ],
        },
        {
            id: 3,
            name: "Executive Package",
            price: "60,000",
            period: "Year",
            featured: false,
            features: [
                "All features for Standard Package",
                "Unlimited mentoring",
                "Team progress tracking",
                "Dedicated account manager",
            ],
        },
    ];

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

    const cardVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "backOut",
            },
        },
    };

    const featuredCardVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "backOut",
            },
        },
        hover: {
            y: -10,
            transition: {
                duration: 0.3,
            },
        },
    };

    const badgeVariants = {
        hidden: { scale: 0, rotate: -20 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                delay: 0.4,
                type: "spring",
                stiffness: 300,
            },
        },
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
            },
        },
    };

    return (
        <Container fluid className="pricing-section py-5">
            <Container>
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="section-subtitle">OUR PLANS</span>
                    <h2 className="section-title">Simple, Transparent Pricing</h2>
                    <motion.p
                        className="section-description py-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Choose the perfect plan for your Institution
                    </motion.p>
                </motion.div>

                <Row className="g-4 justify-content-center">
                    <motion.div
                        className="row g-4 justify-content-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                    >
                        {plans.map((plan) => (
                            <Col key={plan.id} lg={4} md={6}>
                                <motion.div
                                    variants={
                                        plan.featured
                                            ? featuredCardVariants
                                            : cardVariants
                                    }
                                    whileHover={plan.featured ? { y: -10 } : {}}
                                >
                                    <Card
                                        className={`pricing-card ${plan.featured ? "featured" : ""
                                            }`}
                                    >
                                        {plan.featured && (
                                            <motion.div
                                                className="featured-badge"
                                                variants={badgeVariants}
                                                whileHover={{
                                                    rotate: [0, 5, -5, 0],
                                                }}
                                            >
                                                <FaStar className="me-2" /> Most
                                                Popular
                                            </motion.div>
                                        )}
                                        <Card.Body>
                                            <motion.div
                                                className="pricing-header mb-4"
                                                variants={itemVariants}
                                            >
                                                <h3 className="plan-name">
                                                    {plan.name}
                                                </h3>
                                                <div className="price">
                                                    <span className="currency">
                                                        Ksh
                                                    </span>
                                                    <span className="amount">
                                                        {plan.price}
                                                    </span>
                                                    <span className="period">
                                                        /{plan.period}
                                                    </span>
                                                </div>
                                            </motion.div>

                                            <motion.ul
                                                className="features-list"
                                                variants={containerVariants}
                                            >
                                                {plan.features.map(
                                                    (feature, index) => (
                                                        <motion.li
                                                            key={index}
                                                            variants={itemVariants}
                                                            whileHover={{ x: 5 }}
                                                        >
                                                            <FaCheck className="me-2" />{" "}
                                                            {feature}
                                                        </motion.li>
                                                    )
                                                )}
                                            </motion.ul>

                                            <motion.div variants={itemVariants}>
                                                <Button
                                                    variant="primary"
                                                    className="learn-more-btn w-100"
                                                    as={motion.button}
                                                    whileHover={{
                                                        scale: 1.03,
                                                        transition: {
                                                            duration: 0.2,
                                                        },
                                                    }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    Get Started
                                                    {plan.name ===
                                                        "Professional" && (
                                                            <FaRocket className="ms-2" />
                                                        )}
                                                </Button>
                                            </motion.div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </motion.div>
                </Row>
            </Container>
        </Container>
    );
}
