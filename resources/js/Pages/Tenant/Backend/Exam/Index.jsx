import { Head, usePage } from "@inertiajs/react";
import { useEffect, useCallback, useState } from "react";
import { Row, Col, Card, Button, ButtonGroup, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import PortalLayout from "@/Layouts/PortalLayout";

import ExamCreateModal from "@/Components/Modals/ExamCreateModal";
import { formatDate } from "@/Utils/helpers";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function ExamsListing({ terms = [] }) {
    const { auth } = usePage().props;
    const { showErrorToast } = useErrorToast();

    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);

    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#examsTable")) {
            $("#examsTable").DataTable().destroy();
        }

        $("#examsTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: { url: route("admin.exam.index"), type: "GET" },
            columns: [
                // { data: "code", title: "Code" },
                { data: "name", title: "Name" },
                { data: "term.name", title: "Term" },
                { data: "term.academic_year.name", title: "Ac/Year" },
                {
                    data: "start_date",
                    title: "From",
                    render: function (data, type, row, meta) {
                        return formatDate(data);
                    },
                },
                {
                    data: "end_date",
                    title: "To",
                    render: function (data, type, row, meta) {
                        return formatDate(data);
                    },
                },
                // { data: "status", title: "Status" },
                { data: "published", title: "Published" },
                { data: "action", title: "Actions", className: "text-end" },
            ],
            order: [[0, "asc"]],
            responsive: true,
            autoWidth: false,
        });
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            const result = await Swal.fire({
                title: "Delete Exam?",
                text: "Are you sure?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            });
            if (!result.isConfirmed) return;

            await xios.delete(route("admin.exam.destroy", id));

            $("#examsTable").DataTable().ajax.reload(null, false);
            toast.success("Exam deleted successfully!");
        } catch (error) {
            showErrorToast(error);
        }
    }, []);

    useEffect(() => {
        initializeDataTable();

        const handleEditClick = (e) => {
            const data = $(e.currentTarget).data("data");
            setEditingExam(data);
            setShowModal(true);
        };

        const handleDeleteClick = (e) => {
            const id = $(e.currentTarget).data("id");
            handleDelete(id);
        };

        $(document).on("click", ".edit-btn", handleEditClick);
        $(document).on("click", ".delete-btn", handleDeleteClick);

        return () => {
            if ($.fn.DataTable.isDataTable("#examsTable")) {
                $("#examsTable").DataTable().destroy();
            }
            $(document).off("click", ".edit-btn", handleEditClick);
            $(document).off("click", ".delete-btn", handleDeleteClick);
        };
    }, [initializeDataTable, handleDelete]);

    const onHide = useCallback(() => {
        setShowModal(false);
        setEditingExam(null);
        $("#examsTable").DataTable().ajax.reload(null, false);
    }, []);

    return (
        <PortalLayout user={auth.user}>
            <Head title="Exams" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Exams</h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingExam(null);
                            setShowModal(true);
                        }}
                    >
                        <FaPlus className="me-1" /> New Exam
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
                                    id="examsTable"
                                    className="w-100 table-striped table-bordered"
                                    responsive
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <ExamCreateModal
                terms={terms}
                show={showModal}
                onHide={onHide}
                exam={editingExam}
            />
        </PortalLayout>
    );
}
