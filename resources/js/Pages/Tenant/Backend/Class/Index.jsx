import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";
import { FaFolderOpen, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";

import ClassCreateModal from "@/Components/Modals/ClassCreateModal";
import StreamListModal from "@/Components/Modals/StreamListModal";
import PortalLayout from "@/Layouts/PortalLayout";

export default function ClassIndex({ streams = [], teachers = [] }) {
    const { auth, accessMode } = usePage().props;

    // Modal states
    const [showStreamListModal, setShowStreamListModal] = useState(false);
    const [showClassCreateModal, setShowClassCreateModal] = useState(false);

    const [editingClass, setEditingClass] = useState(null); // holds class being edited

    /** =======================
     * Initialize DataTable
     ======================= */
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#classTable")) {
            $("#classTable").DataTable().destroy();
        }

        $("#classTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.class.index"), type: "GET" },
            columns: [
                { data: "name", title: "Class/Form", className: "text-start" },
                { data: "class_streams_count", title: "Streams" },
                { data: "students_count", title: "Students" },
                { data: "class_teacher.full_name", title: "Manager" },
                { data: "assistant_teacher.full_name", title: "Assistant" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[0, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    /** =======================
     * Delete Class
     ======================= */
    const handleDeleteClass = useCallback(async (classId) => {
        try {
            const result = await Swal.fire({
                title: "Delete Class?",
                text: "Are you sure you want to delete this class?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(
                route("admin.class.destroy", classId)
            );

            if (response.status === 200) {
                $("#classTable").DataTable().ajax.reload(null, false);
                toast.success("Class deleted successfully!");
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
            const classData = $(e.currentTarget).data("data");
            if (!classData) return toast.error("Class data not found.");
            setEditingClass(classData);
            setShowClassCreateModal(true);
        };

        const handleDeleteClick = (e) => {
            const classId = $(e.currentTarget).data("id");
            if (!classId) return toast.error("Class ID not found.");
            handleDeleteClass(classId);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#classTable")) {
                $("#classTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDeleteClass]);

    const onHide = useCallback(() => {
        setShowStreamListModal(false);
        setShowClassCreateModal(false);
        setEditingClass(null);
        router.reload();
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Classes Management" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Classes Management</h1>
                {accessMode === "admin" && (
                    <ButtonGroup>
                        <Button
                            variant="outline-primary"
                            onClick={() => setShowStreamListModal(true)}
                            className="rounded me-2"
                        >
                            <FaFolderOpen className="me-1" /> Streams
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                setEditingClass(null); // reset form
                                setShowClassCreateModal(true);
                            }}
                            className="rounded"
                        >
                            <FaPlus className="me-1" /> New Class
                        </Button>
                    </ButtonGroup>
                )}
            </div>

            <hr className="dashed-hr" />

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
                                    id="classTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Modals */}
            <StreamListModal
                streams={streams}
                show={showStreamListModal}
                onHide={onHide}
            />
            <ClassCreateModal
                show={showClassCreateModal}
                onHide={onHide}
                teachers={teachers}
                editingClass={editingClass}
            />
        </PortalLayout>
    );
}
