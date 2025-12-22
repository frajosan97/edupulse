import { Head, router } from "@inertiajs/react";
import { useState, useCallback } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Table,
    Accordion,
    Badge,
    ButtonGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiTrash2, FiExternalLink } from "react-icons/fi";

import PortalLayout from "@/Layouts/PortalLayout";
import NavbarItemModal from "@/Components/Modals/NavbarItemModal";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";

export default function NavbarItems({ navbar = null }) {
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const handleCreate = () => {
        setCurrentItem(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentItem(null);
    };

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        setShowModal(false);
    }, []);

    const handleEditItem = async (id) => {
        try {
            const response = await xios.get(
                route("admin.navbar-items.edit", id)
            );
            if (response.data.success) {
                setCurrentItem(response.data.data);
                setShowModal(true);
                router.reload();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error loading item");
        }
    };

    const handleDeleteItem = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Item?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("admin.navbar-items.destroy", id));
            toast.success("Item has been deleted.");
            router.reload();
        } catch (err) {
            toast.error("Delete failed.");
        }
    };

    return (
        <PortalLayout>
            <Head title={`Managing ${navbar?.name || "Navbar Items"}`} />

            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">Navigation Manager</h2>
                            <p className="text-muted mb-0">
                                Managing:{" "}
                                <span className="fw-semibold text-capitalize">
                                    {navbar?.name}
                                </span>
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlus className="me-2" />
                            Add New Item
                        </Button>
                    </div>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm navbar-items-management">
                <Card.Body className="p-0">
                    {navbar?.items?.length > 0 ? (
                        <Accordion defaultActiveKey="0" flush>
                            {navbar.items.map((item, index) => (
                                <Accordion.Item
                                    eventKey={index.toString()}
                                    key={item.id || index}
                                >
                                    <Accordion.Header className="">
                                        <div className="d-flex align-items-center w-100">
                                            {item.icon && (
                                                <i
                                                    className={`${item.icon} me-3`}
                                                ></i>
                                            )}
                                            <div className="flex-grow-1">
                                                <span className="fw-medium">
                                                    {item.label}
                                                </span>
                                                {item.path && (
                                                    <small className="text-muted ms-2">
                                                        ({item.path})
                                                    </small>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Badge
                                                    bg={
                                                        item.is_active
                                                            ? "success"
                                                            : "danger"
                                                    }
                                                    className="me-2"
                                                >
                                                    {item.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </Badge>
                                                {item.children?.length > 0 && (
                                                    <Badge
                                                        bg="light"
                                                        text="dark"
                                                        className="me-2"
                                                    >
                                                        {item.children.length}{" "}
                                                        sub-items
                                                    </Badge>
                                                )}
                                                <ButtonGroup className="gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditItem(
                                                                item.id
                                                            );
                                                        }}
                                                    >
                                                        <FiEdit size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteItem(
                                                                item.id
                                                            );
                                                        }}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="px-4 py-3 bg-light">
                                        {item.children?.length > 0 ? (
                                            <Table
                                                responsive
                                                borderless
                                                className="mb-0"
                                            >
                                                <thead className="bg-white">
                                                    <tr>
                                                        <th>Label</th>
                                                        <th>Path</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.children.map(
                                                        (child, childIndex) => (
                                                            <tr
                                                                key={
                                                                    child.id ||
                                                                    childIndex
                                                                }
                                                                className="bg-white"
                                                            >
                                                                <td className="align-middle">
                                                                    {child.icon && (
                                                                        <i
                                                                            className={`${child.icon} me-2`}
                                                                        ></i>
                                                                    )}
                                                                    {
                                                                        child.label
                                                                    }
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="text-truncate">
                                                                            {
                                                                                child.path
                                                                            }
                                                                        </span>
                                                                        {child.path && (
                                                                            <FiExternalLink
                                                                                className="ms-2"
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Badge
                                                                        bg={
                                                                            child.is_active
                                                                                ? "success"
                                                                                : "danger"
                                                                        }
                                                                    >
                                                                        {child.is_active
                                                                            ? "Active"
                                                                            : "Inactive"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="align-middle">
                                                                    <ButtonGroup
                                                                        className="gap-2"
                                                                        size="sm"
                                                                    >
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            onClick={() =>
                                                                                handleEditItem(
                                                                                    child.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            onClick={() =>
                                                                                handleDeleteItem(
                                                                                    child.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                No sub-items found for this
                                                navigation item
                                            </div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-5">
                            <FiPlus size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">
                                No navigation items yet
                            </h5>
                            <p className="text-muted mb-4">
                                Get started by creating your first navigation
                                item
                            </p>
                            <Button variant="primary" onClick={handleCreate}>
                                Create First Item
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <NavbarItemModal
                show={showModal}
                onHide={handleModalClose}
                item={currentItem}
                navbarId={navbar?.id}
                onSuccess={handleSuccess}
            />
        </PortalLayout>
    );
}
