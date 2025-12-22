import React from "react";
import {
    Container,
    Nav,
    Navbar,
    Offcanvas,
    Image,
    NavDropdown,
} from "react-bootstrap";
import { Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const navItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.3,
            ease: "easeOut",
        },
    }),
    hover: {
        scale: 1.05,
        transition: { duration: 0.2 },
    },
    tap: {
        scale: 0.95,
    },
};

const offcanvasVariants = {
    hidden: { x: "100%" },
    visible: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        x: "100%",
        transition: {
            ease: "easeIn",
            duration: 0.2,
        },
    },
};

const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
    hover: {
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.5 },
    },
};

// Recursive Dropdown Renderer
const RenderNavItem = ({ item, depth = 0 }) => {
    const { label, icon, children, path, align } = item;

    if (children && children.length > 0) {
        return (
            <NavDropdown
                title={
                    <>
                        {icon && <i className={icon}></i>} {label}
                    </>
                }
                id={`dropdown-${label}-${depth}`}
                className={`nested-dropdown depth-${depth}`}
                drop={depth > 0 ? "end" : "down"}
                align={align}
            >
                {children.map((child, index) => (
                    <RenderNavItem
                        key={child.label + index}
                        item={child}
                        depth={depth + 1}
                    />
                ))}
            </NavDropdown>
        );
    }

    return (
        <NavDropdown.Item
            as={Link}
            href={path}
            className="d-flex align-items-center gap-2"
        >
            {icon && <i className={icon}></i>} {label}
        </NavDropdown.Item>
    );
};

export default function NavBar({ applicationLogo, navItems }) {
    return (
        <Navbar bg="light" expand="lg" className="shadow-sm p-0 sticky-top">
            <Container>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    variants={logoVariants}
                >
                    <Navbar.Brand
                        href="/"
                        className="fw-semibold text-primary d-flex align-items-center"
                    >
                        <Image
                            src={applicationLogo}
                            className="brand-logo"
                            alt="Company Logo"
                        />
                    </Navbar.Brand>
                </motion.div>

                <Navbar.Toggle
                    aria-controls="offcanvas-navbar"
                    as={motion.button}
                    whileTap={{ scale: 0.9 }}
                    className="ms-auto"
                />

                <AnimatePresence>
                    <Navbar.Offcanvas
                        id="offcanvas-navbar"
                        aria-labelledby="offcanvas-navbar-label"
                        placement="end"
                        as={motion.div}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={offcanvasVariants}
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvas-navbar-label">
                                Menu
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="ms-auto">
                                {navItems.map((item, i) =>
                                    item.children &&
                                    item.children.length > 0 ? (
                                        <RenderNavItem
                                            key={item.label + i}
                                            item={item}
                                            depth={0}
                                        />
                                    ) : (
                                        <Nav.Link
                                            key={item.path || item.label}
                                            as={motion(item.as || Link)}
                                            href={item.path}
                                            className={`d-flex align-items-center gap-2`}
                                            custom={i}
                                            variants={navItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            {item.icon && (
                                                <i className={item.icon}></i>
                                            )}{" "}
                                            {item.label}
                                        </Nav.Link>
                                    )
                                )}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </AnimatePresence>
            </Container>
        </Navbar>
    );
}
