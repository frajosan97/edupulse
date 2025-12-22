import { Container, ButtonGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import ThemeToggle from "../Settings/ThemeToggle";

export default function Header({ headerTitle = "", headerButtons = [] }) {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const iconVariants = {
        hover: {
            rotate: [0, 10, -10, 0],
            transition: { duration: 0.5 },
        },
    };

    return (
        <motion.header
            className="app-header shadow-sm text-capitalize"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Container className="d-flex justify-content-between align-items-center">
                <motion.div
                    className="d-none d-md-flex branding small text-white m-0 d-flex align-items-center"
                    whileHover={{ scale: 1.02 }}
                >
                    <motion.i
                        className="bi bi-mortarboard-fill me-2 fs-5"
                        variants={iconVariants}
                        whileHover="hover"
                    ></motion.i>
                    <span>{headerTitle}</span>
                </motion.div>

                <ButtonGroup className="header-actions gap-1">
                    {/* System buttons */}
                    {headerButtons.map(({ href, classes, icon, name }) => (
                        <a href={href}>
                            <motion.i
                                className={`bi ${icon}`}
                                variants={iconVariants}
                                whileHover="hover"
                            ></motion.i>{" "}
                            {name}
                        </a>
                    ))}

                    {/* Theme toggler */}
                    <ThemeToggle />
                </ButtonGroup>
            </Container>
        </motion.header>
    );
}
