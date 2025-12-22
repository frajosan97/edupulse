import { Head, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";
import { FaFolderOpen, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import SubjectCreateModal from "@/Components/Modals/SubjectCreateModal";
import SubjectGroupListModal from "@/Components/Modals/SubjectGroupListModal";
import PortalLayout from "@/Layouts/PortalLayout";

export default function SubjectsListing({
    subjectGroups = [],
    gradingSystems = [],
}) {
    const { auth } = usePage().props;

    // Modal states
    const [showSubjectCreateModal, setShowSubjectCreateModal] = useState(false);
    const [showSubjectGroupListModal, setShowSubjectGroupListModal] =
        useState(false);

    const [editingSubject, setEditingSubject] = useState(null);

    /** =======================
     * Initialize DataTable
     ======================= */
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#subjectsTable")) {
            $("#subjectsTable").DataTable().destroy();
        }

        $("#subjectsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.subject.index"), type: "GET" },
            columns: [
                { data: "code", title: "Code" },
                { data: "name", title: "Name" },
                { data: "subject_group.name", title: "Group" },
                {
                    data: "department.name",
                    title: "Department",
                    render: function (data, type, row, meta) {
                        return data ? data : "N/A";
                    },
                },
                {
                    data: "grading_system.name",
                    title: "Grading",
                    render: function (data, type, row, meta) {
                        return data ? data : "N/A";
                    },
                },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[0, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    /** =======================
     * Delete Subject
     ======================= */
    const handleDeleteSubject = useCallback(async (subjectId) => {
        try {
            const result = await Swal.fire({
                title: "Delete Subject?",
                text: "Are you sure you want to delete this subject?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            const response = await xios.delete(
                route("admin.subject.destroy", subjectId)
            );

            if (response.status === 200) {
                $("#subjectsTable").DataTable().ajax.reload(null, false);
                toast.success("Subject deleted successfully!");
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
            const subjectData = $(e.currentTarget).data("data");
            if (!subjectData) return toast.error("Subject data not found.");
            setEditingSubject(subjectData);
            setShowSubjectCreateModal(true);
        };

        const handleDeleteClick = (e) => {
            const subjectId = $(e.currentTarget).data("id");
            if (!subjectId) return toast.error("Subject ID not found.");
            handleDeleteSubject(subjectId);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#subjectsTable")) {
                $("#subjectsTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDeleteSubject]);

    /** =======================
     * Modal Hide Handler
     ======================= */
    const onHide = useCallback(() => {
        setShowSubjectCreateModal(false);
        setShowSubjectGroupListModal(false);
        setEditingSubject(null);
        $("#subjectsTable").DataTable().ajax.reload(null, false);
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Subjects Management" />

            {/* Header with actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Subjects Management</h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowSubjectGroupListModal(true)}
                        className="rounded me-2"
                    >
                        <FaFolderOpen className="me-1" /> Subject Groups
                    </Button>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingSubject(null);
                            setShowSubjectCreateModal(true);
                        }}
                        className="rounded"
                    >
                        <FaPlus className="me-1" /> New Subject
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
                                    id="subjectsTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Modals */}
            <SubjectGroupListModal
                subjectGroups={subjectGroups}
                gradingSystems={gradingSystems}
                show={showSubjectGroupListModal}
                onHide={onHide}
            />
            <SubjectCreateModal
                subjectGroups={subjectGroups}
                gradingSystems={gradingSystems}
                show={showSubjectCreateModal}
                onHide={onHide}
                subject={editingSubject}
            />
        </PortalLayout>
    );
}
