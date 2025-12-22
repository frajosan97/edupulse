import { Container, Row, Col } from "react-bootstrap";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function Footer({
    currentYear,
    applicationName,
    applicationLogo,
    platformDescription,
    footerData,
}) {
    const { socialIcons, footerLinks, bottomLinks } = footerData;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
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

    return (
        <footer className="app-footer border-0">
            <Container className="py-5">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    <Row className="gy-4 pb-4">
                        <Col xs={6} md={3}>
                            <motion.div variants={itemVariants}>
                                <motion.img
                                    src={applicationLogo}
                                    alt="EduPulse Logo"
                                    className="mb-2"
                                    style={{ maxWidth: 140 }}
                                    whileHover={{ scale: 1.05 }}
                                />
                                <p>
                                    {platformDescription
                                        ?.split(" ")
                                        .slice(0, 20)
                                        .join(" ") +
                                        (platformDescription?.split(" ")
                                            .length > 20
                                            ? "..."
                                            : "")}
                                </p>
                                <div className="d-flex gap-3 mb-3">
                                    {socialIcons.map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            className="text-dark"
                                            variants={itemVariants}
                                            whileHover={{ y: -3, scale: 1.1 }}
                                        >
                                            <item.icon />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </Col>

                        {footerLinks.map((section, index) => (
                            <Col xs={6} md={3} key={index}>
                                <motion.div variants={itemVariants}>
                                    <h6 className="fw-semibold mb-3">
                                        {section.title}
                                    </h6>
                                    <ul className="list-unstyled">
                                        {section.links.map((link, idx) => (
                                            <motion.li
                                                key={idx}
                                                className="mb-2"
                                                variants={itemVariants}
                                                whileHover={{ x: 5 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    className="text-decoration-none"
                                                >
                                                    <i
                                                        className={`${link.icon} me-2`}
                                                    ></i>
                                                    {link.text}
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </Container>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="main-background py-4"
            >
                <Container className="d-flex justify-content-between">
                    <motion.span
                        className="d-flex align-items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                    >
                        <i className="bi bi-c-circle" aria-hidden="true"></i>
                        {currentYear} {applicationName}, All rights reserved
                    </motion.span>
                    <div className="d-flex align-items-center gap-3">
                        {bottomLinks.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Link
                                    href={item.href}
                                    className="text-decoration-none text-muted d-flex align-items-center gap-1"
                                >
                                    <i
                                        className={item.icon}
                                        aria-hidden="true"
                                    ></i>
                                    {item.text}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </motion.div>
        </footer>
    );
}
