import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            when: "beforeChildren",
        },
    },
};

const logoVariants = {
    hidden: {
        y: 20,
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10,
            duration: 0.5,
        },
    },
    hover: {
        scale: 1.1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
        },
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: "easeOut",
        },
    },
};

export default function TrustedBySection() {
    const logos = [
        { id: 1, name: "Company 1", logo: "logo1.png" },
        { id: 2, name: "Company 2", logo: "logo2.png" },
        { id: 3, name: "Company 3", logo: "logo3.png" },
        { id: 4, name: "Company 4", logo: "logo4.png" },
        { id: 5, name: "Company 5", logo: "logo5.png" },
    ];

    return (
        <Container className="trusted-section py-5 my-5">
            <motion.div
                className="text-center mb-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
            >
                <span className="section-subtitle">TRUSTED BY</span>
                <h2 className="section-title">
                    Leading Institutions Nationwide
                </h2>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
            >
                <Row className="align-items-center justify-content-center g-4">
                    {logos.map((company) => (
                        <Col key={company.id} xs={6} sm={4} md={3} lg={2}>
                            <motion.div
                                className="logo-item"
                                variants={logoVariants}
                                whileHover="hover"
                            >
                                <motion.img
                                    src={`/assets/images/logos/${company.logo}`}
                                    alt={company.name}
                                    className="img-fluid"
                                    loading="lazy"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                />
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </motion.div>
        </Container>
    );
}
