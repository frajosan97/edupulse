import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

import GradingSystemCreateModal from "@/Components/Modals/GradingSystemCreateModal";
import PortalLayout from "@/Layouts/PortalLayout";

export default function GradingSystemListing() {
    const { auth } = usePage().props;

    // Modal states
    const [showGradingSystemCreateModal, setShowGradingSystemCreateModal] =
        useState(false);
    const [editingGradingSystem, setEditingGradingSystem] = useState(null);

    /** =======================
     * Initialize DataTable
     ======================= */
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#gradingSystemsTable")) {
            $("#gradingSystemsTable").DataTable().destroy();
        }

        $("#gradingSystemsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.grading-system.index"), type: "GET" },
            columns: [
                { data: "code", title: "Code" },
                { data: "name", title: "Name" },
                { data: "type", title: "Type" },
                {
                    data: "is_default",
                    title: "Default",
                    render: (data) => (data ? "✔️" : "❌"),
                },
                { data: "status", title: "Active" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[1, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    /** =======================
     * Delete Grading System
     ======================= */
    const handleDeleteGradingSystem = useCallback(async (id) => {
        try {
            const result = await Swal.fire({
                title: "Delete Grading System?",
                text: "This will remove the grading system permanently.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(
                route("admin.grading-system.destroy", id)
            );

            if (response.status === 200) {
                $("#gradingSystemsTable").DataTable().ajax.reload(null, false);
                toast.success("Grading System deleted successfully!");
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    "An error occurred. Please try again."
            );
        }
    }, []);

    /** =======================
     * DataTable Row Events
     ======================= */
    useEffect(() => {
        initializeDataTable();

        const handleEditClick = (e) => {
            const gsData = $(e.currentTarget).data("data");
            if (!gsData) return toast.error("Grading System data not found.");
            setEditingGradingSystem(gsData);
            setShowGradingSystemCreateModal(true);
        };

        const handleDeleteClick = (e) => {
            const gsId = $(e.currentTarget).data("id");
            if (!gsId) return toast.error("Grading System ID not found.");
            handleDeleteGradingSystem(gsId);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#gradingSystemsTable")) {
                $("#gradingSystemsTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDeleteGradingSystem]);

    /** =======================
     * Modal Hide Handler
     ======================= */
    const onHide = useCallback(() => {
        setShowGradingSystemCreateModal(false);
        setEditingGradingSystem(null);
        $("#gradingSystemsTable").DataTable().ajax.reload(null, false);
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Grading System Management" />

            {/* Header with actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Grading System Management</h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingGradingSystem(null);
                            setShowGradingSystemCreateModal(true);
                        }}
                        className="rounded"
                    >
                        <FaPlus className="me-1" /> New Grading System
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            {/* DataTable */}
            <Row>
                <Col>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <Card.Body>
                                <Table
                                    id="gradingSystemsTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <GradingSystemCreateModal
                show={showGradingSystemCreateModal}
                onHide={onHide}
                editingGradingSystem={editingGradingSystem}
            />
        </PortalLayout>
    );
}
