import { Head, Link } from "@inertiajs/react";
import { useEffect, useCallback } from "react";
import { Row, Col, Card, ButtonGroup, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import PortalLayout from "@/Layouts/PortalLayout";

export default function StudentIndex() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#studentTable")) {
            $("#studentTable").DataTable().destroy();
        }

        $("#studentTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("admin.student.index"),
                type: "GET",
            },
            columns: [
                {
                    data: "student.admission_number",
                    title: "Adm No.",
                    className: "text-start text-capitalize text-nowrap",
                },
                {
                    data: "full_name",
                    title: "Name",
                    className: "text-start text-capitalize",
                },
                {
                    data: "student.class.name",
                    title: "Class",
                    className: "text-start text-capitalize",
                },
                {
                    data: "stream",
                    title: "Stream",
                    className: "text-start text-capitalize",
                },
                // { data: "email", title: "Email" },
                { data: "status", title: "Status" },
                { data: "action", title: "Action", className: "text-end" },
            ],
            order: [[0, "desc"]],
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#studentTable")) {
                $("#studentTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <PortalLayout>
            <Head title="Student List" />

            {/* Header with quick actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Students</h1>
                <ButtonGroup className="gap-2">
                    <Link
                        href={route("admin.student.create")}
                        className="btn btn-outline-custom rounded"
                    >
                        <FaPlus className="me-2" />
                        New Student
                    </Link>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Row>
                <Col>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <Table
                                    bordered
                                    striped
                                    hover
                                    responsive
                                    id="studentTable"
                                    className="w-100"
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </PortalLayout>
    );
}
