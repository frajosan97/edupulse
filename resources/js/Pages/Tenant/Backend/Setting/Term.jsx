import { Head, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import PortalLayout from "@/Layouts/PortalLayout";

import TermCreateModal from "@/Components/Modals/TermCreateModal";
import { formatDate } from "@/Utils/helpers";

export default function TermsListing({ academicYears = [] }) {
    const { auth } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editingTerm, setEditingTerm] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#termsTable")) {
            $("#termsTable").DataTable().destroy();
        }

        $("#termsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.term.index"), type: "GET" },
            columns: [
                { data: "name", title: "Name" },
                { data: "academic_year", title: "Academic Year" },
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
                { data: "status", title: "Status" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[1, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            const result = await Swal.fire({
                title: "Delete Term?",
                text: "Are you sure?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            });
            if (!result.isConfirmed) return;

            await xios.delete(route("admin.terms.destroy", id));

            $("#termsTable").DataTable().ajax.reload(null, false);
            toast.success("Term deleted successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error deleting.");
        }
    }, []);

    useEffect(() => {
        initializeDataTable();

        const handleEditClick = (e) => {
            const data = $(e.currentTarget).data("data");
            setEditingTerm(data);
            setShowModal(true);
        };

        const handleDeleteClick = (e) => {
            const id = $(e.currentTarget).data("id");
            handleDelete(id);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#termsTable")) {
                $("#termsTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDelete]);

    const onHide = useCallback(() => {
        setShowModal(false);
        setEditingTerm(null);
        $("#termsTable").DataTable().ajax.reload(null, false);
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Terms" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Terms</h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingTerm(null);
                            setShowModal(true);
                        }}
                    >
                        <FaPlus className="me-1" /> New Term
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
                                    id="termsTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <TermCreateModal
                academicYears={academicYears}
                show={showModal}
                onHide={onHide}
                term={editingTerm}
            />
        </PortalLayout>
    );
}
