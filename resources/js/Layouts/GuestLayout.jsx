import { usePage } from "@inertiajs/react";
import { Card, Col, Container } from "react-bootstrap";
import { motion } from "framer-motion";

export default function GuestLayout({ children }) {
    const { tenant, tenantInfo, systemEnv, accessMode } = usePage().props;

    const isLocal = systemEnv === "local";
    const rawDomain = tenant?.domains?.[0]?.domain ?? "edupulse.co.ke";
    const applicationDomain = `${rawDomain}${isLocal ? ":8000" : ""}`;

    // Extract tenant contacts
    const contacts = tenantInfo?.contacts ?? [];
    const images = tenantInfo?.images ?? [];

    const phoneContact =
        contacts.find((c) => c.contact_type === "phone")?.value ??
        "+254796594366";
    const emailContact =
        contacts.find((c) => c.contact_type === "email")?.value ??
        "info@edupulse.co.ke";
    const addressContact =
        contacts.find((c) => c.contact_type === "address")?.value ??
        "222-90200 Kitui";

    // Extract tenant images
    const logoImage =
        images.find((c) => c.image_type === "logo")?.image_path ??
        "images/landlord/logo/default.png";

    const config = {
        applicationName: tenant?.name ?? "EduPulse",
        applicationDomain,
        platformTagline: tenant?.tagline ?? "Empowering Education Everywhere",
        applicationLogo: `/storage/${logoImage}`,
        headerTitle: tenant?.name ?? "Trusted by 500+ Schools Nationwide",
        platformDescription:
            tenant?.description ?? "Empowering Education Everywhere",
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center vh-100"
        >
            <Col md={6} lg={4}>
                <Card className="auth-card shadow-sm">
                    <Card.Body className="p-4">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Logo */}
                            <motion.div
                                className="logo text-center"
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                            >
                                <motion.img
                                    src={config.applicationLogo}
                                    alt="System Logo"
                                    style={{ maxWidth: 140 }}
                                    whileHover={{ scale: 1.05 }}
                                />
                            </motion.div>

                            <h4 className="text-center text-capitalize fw-semibold">
                                {`${accessMode} login`}
                            </h4>

                            <hr className="dashed-hr" />

                            {/* Main Content */}
                            {children}
                        </motion.div>
                    </Card.Body>
                </Card>

                <p className="text-muted text-center mt-3">
                    <i className="bi bi-c-circle" aria-hidden="true"></i>{" "}
                    {config.applicationName}
                </p>
            </Col>
        </Container>
    );
}
