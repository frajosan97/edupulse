import { Head, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import PortalLayout from "@/Layouts/PortalLayout";

// Import your modal component (to create/edit)
import AcademicYearModal from "@/Components/Modals/AcademicYearModal";
import { formatDate } from "@/Utils/helpers";

export default function AcademicYearsListing() {
    const { auth } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editingYear, setEditingYear] = useState(null);

    /** =======================
     * Initialize DataTable
     ======================= */
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#academicYearsTable")) {
            $("#academicYearsTable").DataTable().destroy();
        }

        $("#academicYearsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.academic-year.index"), type: "GET" },
            columns: [
                { data: "name", title: "Name" },
                { data: "is_active", title: "Active" },
                {
                    data: "start_date",
                    title: "Start Date",
                    render: function (data, type, row, meta) {
                        return formatDate(data);
                    },
                },
                {
                    data: "end_date",
                    title: "End Date",
                    render: function (data, type, row, meta) {
                        return formatDate(data);
                    },
                },
                { data: "terms_count", title: "Terms" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[0, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    /** =======================
     * Delete Academic Year
     ======================= */
    const handleDelete = useCallback(async (id) => {
        try {
            const result = await Swal.fire({
                title: "Delete Academic Year?",
                text: "Are you sure?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            await xios.delete(route("admin.academic-years.destroy", id));

            $("#academicYearsTable").DataTable().ajax.reload(null, false);
            toast.success("Academic Year deleted successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error deleting.");
        }
    }, []);

    /** =======================
     * DataTable Events
     ======================= */
    useEffect(() => {
        initializeDataTable();

        const handleEditClick = (e) => {
            const data = $(e.currentTarget).data("data");
            setEditingYear(data);
            setShowModal(true);
        };

        const handleDeleteClick = (e) => {
            const id = $(e.currentTarget).data("id");
            handleDelete(id);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#academicYearsTable")) {
                $("#academicYearsTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDelete]);

    /** =======================
     * Modal Close
     ======================= */
    const onHide = useCallback(() => {
        setShowModal(false);
        setEditingYear(null);
        $("#academicYearsTable").DataTable().ajax.reload(null, false);
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Academic Years" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Academic Years</h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingYear(null);
                            setShowModal(true);
                        }}
                    >
                        <FaPlus className="me-1" /> New Year
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Row>
                <Col>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Card>
                            <Card.Body>
                                <Table
                                    id="academicYearsTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Modal */}
            <AcademicYearModal
                show={showModal}
                onHide={onHide}
                academicYear={editingYear}
            />
        </PortalLayout>
    );
}
