import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
import {
    Container,
    Navbar,
    Nav,
    Dropdown,
    Offcanvas,
    Button,
} from "react-bootstrap";
import {
    BiMenu,
    BiChevronDown,
    BiChevronRight,
    BiChevronLeft,
} from "react-icons/bi";
import ThemeToggle from "@/Components/Settings/ThemeToggle";
import useData from "@/Hooks/useData";

import "../../css/portal.css";

const PortalLayout = ({ children }) => {
    const { tenant, tenantInfo, systemEnv, accessMode, auth } = usePage().props;
    const { menu } = useData();

    // Extract tenant contacts
    const images = tenantInfo?.images ?? [];

    // Extract tenant images
    const logoImage =
        images.find((c) => c.image_type === "logo")?.image_path ??
        "images/landlord/logo/default.png";

    const config = {
        applicationName: tenant?.name ?? "EduPulse",
        applicationLogo: `/storage/${logoImage}`,
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarMinimized, setSidebarMinimized] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
            if (!mobile) {
                setSidebarMinimized(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarMinimized(!sidebarMinimized);
        }
    };

    const toggleMenu = (menuLabel) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuLabel]: !prev[menuLabel],
        }));
    };

    const renderNavItems = (items, level = 0) => {
        return (
            items?.length > 0 &&
            items?.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus[item.label];
                const canHaveSubmenu = level === 0;

                return (
                    <Nav.Item key={index} className="text-capitalize">
                        {hasChildren && canHaveSubmenu ? (
                            <>
                                <Button
                                    variant="link"
                                    as="a"
                                    onClick={() => toggleMenu(item.label)}
                                    className="nav-link text-white d-flex align-items-center justify-content-between w-100 text-start fancy-nav-link text-capitalize"
                                >
                                    <span className="d-flex align-items-center">
                                        {item.icon && (
                                            <i
                                                className={`${
                                                    item.icon
                                                } me-2 nav-icon ${
                                                    sidebarMinimized
                                                        ? "d-none"
                                                        : ""
                                                }`}
                                            />
                                        )}
                                        <span
                                            className={
                                                sidebarMinimized ? "d-none" : ""
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </span>
                                    {!sidebarMinimized &&
                                        (isExpanded ? (
                                            <BiChevronDown className="menu-chevron" />
                                        ) : (
                                            <BiChevronRight className="menu-chevron" />
                                        ))}
                                </Button>
                                {isExpanded && !sidebarMinimized && (
                                    <ul className="nav flex-column ps-4 submenu">
                                        {renderNavItems(
                                            item.children,
                                            level + 1
                                        )}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Nav.Link
                                href={item.path}
                                className="text-white d-flex align-items-center fancy-nav-link"
                                onClick={() =>
                                    isMobile && setSidebarOpen(false)
                                }
                            >
                                {item.icon && (
                                    <i
                                        className={`${
                                            item.icon
                                        } me-2 nav-icon ${
                                            sidebarMinimized ? "me-0" : ""
                                        }`}
                                    />
                                )}
                                <span
                                    className={sidebarMinimized ? "d-none" : ""}
                                >
                                    {item.label}
                                </span>
                            </Nav.Link>
                        )}
                    </Nav.Item>
                );
            })
        );
    };

    let navItems = menu;

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
            />

            {/* Sidebar */}
            {isMobile ? (
                <Offcanvas
                    show={sidebarOpen}
                    onHide={toggleSidebar}
                    responsive="md"
                    className="mobile-menu"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Menu</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="flex-column flex-grow-1 overflow-auto custom-scrollbar">
                            {renderNavItems(navItems)}
                        </Nav>
                    </Offcanvas.Body>
                </Offcanvas>
            ) : (
                <div
                    className={`d-flex flex-column position-fixed h-100 sidebar ${
                        sidebarOpen ? "open" : "closed"
                    } ${!isMobile && sidebarMinimized ? "minimized" : ""}`}
                >
                    <div className="h-100 d-flex flex-column">
                        {/* Sidenav top */}
                        <div className="d-flex align-items-center justify-content-center px-3 py-4">
                            <h3
                                className={`m-0 sidebar-title text-trancate w-100 ${
                                    sidebarMinimized ? "d-none" : ""
                                }`}
                            >
                                {config.applicationName}
                            </h3>
                            <div
                                className={`sidebar-minimized-title ${
                                    sidebarMinimized ? "d-block" : "d-none"
                                }`}
                            >
                                <img
                                    src={config.applicationLogo}
                                    alt="Logo"
                                    className="sidebar-logo-icon rounded-3"
                                />
                            </div>
                        </div>

                        <a href="" className="user-account-info fancy-nav-link">
                            <i className="bi bi-person fs-4"></i>
                            {!sidebarMinimized && (
                                <div className="px-3 py-2">
                                    <h6 className="m-0 p-0">
                                        {auth?.user?.full_name}
                                    </h6>
                                    <small className="text-capitalize">
                                        {auth?.user?.roles
                                            .map((role) => role.name)
                                            .join(", ")}
                                    </small>
                                </div>
                            )}
                        </a>

                        {/* sidenav menu */}
                        <div className="flex-grow-1 overflow-auto custom-scrollbar">
                            <Nav className="flex-column">
                                {renderNavItems(navItems)}
                            </Nav>
                        </div>
                        <a href="" className="fancy-nav-link py-2">
                            <i className="bi bi-download fs-4"></i>
                            {!sidebarMinimized && (
                                <div className="ms-3">
                                    <h6 className="m-0 p-0">Download App</h6>
                                </div>
                            )}
                        </a>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div
                className={`flex-grow-1 main-content 
                ${
                    sidebarOpen
                        ? isMobile
                            ? ""
                            : sidebarMinimized
                            ? "sidebar-minimized-shifted"
                            : "sidebar-shifted"
                        : ""
                }`}
            >
                <Navbar
                    bg="white"
                    expand="lg"
                    className="shadow-sm border-0 sticky-top py-4 header-bar text-capitalize"
                >
                    <Container fluid>
                        <Button
                            variant="outline-secondary"
                            onClick={toggleSidebar}
                            className="me-3 toggle-btn"
                            aria-label="Toggle sidebar"
                        >
                            {isMobile ? (
                                <BiMenu />
                            ) : sidebarMinimized ? (
                                <BiMenu />
                            ) : (
                                <BiChevronLeft />
                            )}
                        </Button>
                        <Navbar.Brand href="#" className="text-capitalize">
                            {accessMode}
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse
                            id="basic-navbar-nav"
                            className="justify-content-end"
                        >
                            <Nav>
                                <Dropdown as={Nav.Item}>
                                    <Dropdown.Toggle
                                        as={Nav.Link}
                                        id="navbarUserDropdown"
                                    >
                                        <i className="bi bi-person"></i>{" "}
                                        <span>{auth?.user?.full_name}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu
                                        align="end"
                                        className="p-0 border-0 shadow rounded"
                                    >
                                        <Dropdown.Item href="/profile">
                                            <i className="bi bi-person-gear"></i>{" "}
                                            My Profile
                                        </Dropdown.Item>

                                        <ThemeToggle type="dropdown" />

                                        <Dropdown.Item href="/profile">
                                            <i className="bi bi-question-circle"></i>{" "}
                                            Need Help
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            onClick={() =>
                                                router.post(route("logout"))
                                            }
                                        >
                                            <i className="bi bi-box-arrow-in-right"></i>{" "}
                                            Log Out
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <main className="main-body py-4">
                    <Container fluid>{children}</Container>
                </main>

                <div className="footer-bar px-4 py-3 sticky-bottom shadow">
                    &copy; 2025 {config.applicationName}
                </div>
            </div>
        </div>
    );
};

export default PortalLayout;
