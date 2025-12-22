import { Head, Link } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";

import PortalLayout from "@/Layouts/PortalLayout";
import Swal from "sweetalert2";
import NavbarModal from "@/Components/Modals/NavbarModal";
import xios from "@/Utils/xios";

export default function Navbars() {
    const [showModal, setShowModal] = useState(false);
    const [currentNavbar, setCurrentNavbar] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#navbarsTable")) {
            $("#navbarsTable").DataTable().destroy();
        }

        $("#navbarsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("admin.navbar.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Name" },
                { data: "slug", title: "Slug" },
                { data: "description", title: "Description" },
                { data: "status_badge", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            drawCallback: () => {
                $(".edit-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleEditNavbar(id);
                    });

                $(".delete-btn")
                    .off("click")
                    .on("click", function () {
                        const id = $(this).data("id");
                        handleDeleteNavbar(id);
                    });
            },
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
    }, [initializeDataTable]);

    const handleCreate = useCallback(() => {
        setCurrentNavbar(null);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setCurrentNavbar(null);
    }, []);

    const handleSuccess = useCallback((message) => {
        toast.success(message);
        $("#navbarsTable").DataTable().ajax.reload(null, false);
        setShowModal(false);
    }, []);

    const handleEditNavbar = async (id) => {
        try {
            const response = await xios.get(route("admin.navbar.edit", id));

            if (response.data.success) {
                setCurrentNavbar(response.data.data);
                setShowModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const handleDeleteNavbar = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Navbar?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            await xios.delete(route("admin.navbar.destroy", id));
            $("#navbarsTable").DataTable().ajax.reload(null, false);
            Swal.fire("Deleted!", "Navbar has been deleted.", "success");
        } catch (err) {
            Swal.fire("Error!", "Delete failed.", "error");
        }
    };

    return (
        <PortalLayout>
            <Head title="Navbars Management" />

            <Row>
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center"
                >
                    <h2 className="m-0 text-capitalize">Navbars Management</h2>
                    <ButtonGroup>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-1 d-flex align-items-center"
                            onClick={handleCreate}
                        >
                            <FiPlusSquare className="me-1" />
                            New Navbar
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr" />

            <Row>
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <Table
                                bordered
                                striped
                                hover
                                responsive
                                id="navbarsTable"
                                className="w-100"
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <NavbarModal
                show={showModal}
                onHide={handleModalClose}
                navbar={currentNavbar}
                onSuccess={handleSuccess}
            />
        </PortalLayout>
    );
}
