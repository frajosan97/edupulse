import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
    FaAward,
    FaBookOpen,
    FaChalkboardTeacher,
    FaSchool,
    FaUserGraduate,
    FaUserShield,
} from "react-icons/fa";
import { usePage } from "@inertiajs/react";

const statItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
    hover: {
        y: -3,
        transition: { duration: 0.2 },
    },
};

const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: 0.1 * i,
            duration: 0.5,
        },
    }),
};

export default function DataCard() {
    const { tenant, tenantInfo } = usePage().props;

    const stats = tenant
        ? [
              {
                  id: 1,
                  icon: <FaChalkboardTeacher size={32} />,
                  value: "42+",
                  label: "Qualified Teachers",
                  description: "Trained and TSC certified",
              },
              {
                  id: 2,
                  icon: <FaUserGraduate size={32} />,
                  value: "800+",
                  label: "Students",
                  description: "Boarding facility available",
              },
              {
                  id: 3,
                  icon: <FaAward size={32} />,
                  value: "15+",
                  label: "Clubs & Societies",
                  description: "For holistic development",
              },
          ]
        : [
              {
                  id: 1,
                  icon: <FaSchool size={32} className="text-blue-600" />,
                  value: "500+",
                  label: "Schools",
                  description: "Managing their operations with EduPulse",
              },
              {
                  id: 2,
                  icon: <FaUserGraduate size={32} className="text-green-600" />,
                  value: "250K+",
                  label: "Students",
                  description: "Across our partner institutions",
              },
              {
                  id: 3,
                  icon: <FaBookOpen size={32} className="text-purple-600" />,
                  value: "50K+",
                  label: "Resources",
                  description: "In our shared educational library",
              },
              {
                  id: 4,
                  icon: <FaUserShield size={32} className="text-red-600" />,
                  value: "10K+",
                  label: "Teachers",
                  description: "Using our platform daily",
              },
          ];

    return (
        <Container className="mb-5">
            <Card className="border-0 data-card shadow">
                <Card.Body className="p-4">
                    <Row className="g-4">
                        {stats.map((stat, index) => (
                            <Col key={stat.id}>
                                <motion.div
                                    className="data-card-item d-flex align-items-center"
                                    variants={statItemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    whileHover="hover"
                                    viewport={{ once: true, margin: "-50px" }}
                                    custom={index}
                                >
                                    <div className="feature-icon-wrapper system-icon">
                                        {stat.icon}
                                    </div>
                                    <div className="data-card-content">
                                        <motion.h3
                                            className="data-card-value mb-1"
                                            variants={textVariants}
                                            custom={1}
                                        >
                                            {stat.value}
                                        </motion.h3>
                                        <motion.h5
                                            className="data-card-label mb-2"
                                            variants={textVariants}
                                            custom={2}
                                        >
                                            {stat.label}
                                        </motion.h5>
                                        <motion.p
                                            className="data-card-description mb-0"
                                            variants={textVariants}
                                            custom={3}
                                        >
                                            {stat.description}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
