import { Head, Link } from "@inertiajs/react";
import { useEffect, useCallback } from "react";
import { Row, Col, Card, ButtonGroup, Table } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

import PortalLayout from "@/Layouts/PortalLayout";

export default function SchoolIndex() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#tenantaTable")) {
            $("#tenantaTable").DataTable().destroy();
        }

        $("#tenantaTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("admin.tenant.index"),
                type: "GET",
            },
            columns: [
                { data: "name", title: "Name" },
                { data: "domains", title: "Domain" },
                { data: "email", title: "Email" },
                { data: "phone", title: "Phone" },
                { data: "plan.name", title: "Plan" },
                { data: "status", title: "Status" },
                { data: "action", title: "Actions" },
            ],
            order: [[0, "desc"]],
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#tenantaTable")) {
                $("#tenantaTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    return (
        <PortalLayout>
            <Head title="Tenants List" />

            <Row>
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center"
                >
                    <h2 className="m-0 text-capitalize">Registered Tenants</h2>
                    <ButtonGroup>
                        <Link
                            href={route("admin.tenant.create")}
                            className="btn btn-outline-primary"
                        >
                            <FaPlus className="me-2" />
                            New Tenants
                        </Link>
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
                                id="tenantaTable"
                                className="w-100"
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </PortalLayout>
    );
}
