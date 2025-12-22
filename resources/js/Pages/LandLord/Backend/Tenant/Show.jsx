import React, { useEffect } from "react";
import PortalLayout from "@/Layouts/PortalLayout";
import { Card, Badge, Table, ButtonGroup, Tabs, Tab } from "react-bootstrap";
import { Head, Link } from "@inertiajs/react";
import { formatDate, formatCurrency } from "@/Utils/helpers";
import { FiArrowLeftCircle } from "react-icons/fi";

export default function TenantShow({ school }) {
    useEffect(() => {
        // Initialize Invoices DataTable
        $("#invoices-table").DataTable({
            data: school?.invoices,
            columns: [
                {
                    title: "Invoice Number",
                    data: "invoice_number",
                    render: function (data, type, row) {
                        return `<strong>${data}</strong><br><small className="text-muted">${row.description}</small>`;
                    },
                },
                {
                    title: "Amount",
                    data: "total_amount",
                    render: function (data) {
                        return formatCurrency(data);
                    },
                },
                {
                    title: "Due Date",
                    data: "due_date",
                    render: function (data) {
                        return formatDate(data, "DD/MM/YYYY");
                    },
                    className: "text-end",
                },
                {
                    title: "Invoice Date",
                    data: "created_at",
                    render: function (data) {
                        return formatDate(data, "DD/MM/YYYY");
                    },
                    className: "text-end",
                },
                {
                    title: "Status",
                    data: "status",
                    render: function (data) {
                        return data === "paid"
                            ? '<span class="badge bg-success">Paid</span>'
                            : '<span class="badge bg-warning">Unpaid</span>';
                    },
                },
                {
                    title: "Actions",
                    data: null,
                    render: function (data, type, row) {
                        return `<a href="/tenant/invoices/${row.id}" class="btn btn-sm btn-primary">View</a>`;
                    },
                    className: "text-end",
                },
            ],
            responsive: true,
            language: {
                emptyTable: "No invoices found",
            },
        });

        // Initialize Payments DataTable
        $("#payments-table").DataTable({
            data: school?.payments,
            columns: [
                {
                    title: "#",
                    data: null,
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    },
                },
                {
                    title: "Method",
                    data: "method",
                    render: function (data) {
                        return data.charAt(0).toUpperCase() + data.slice(1);
                    },
                },
                {
                    title: "Amount",
                    data: "amount",
                    render: function (data) {
                        return `KSh ${formatCurrency(data)}`;
                    },
                },
                {
                    title: "Date",
                    data: "created_at",
                    render: function (data) {
                        return formatDate(data);
                    },
                },
                {
                    title: "Invoice",
                    data: "invoice",
                    render: function (data) {
                        return data ? `#${data.invoice_number}` : "N/A";
                    },
                },
            ],
            responsive: true,
            language: {
                emptyTable: "No payments found",
            },
        });

        // Cleanup function
        return () => {
            const invoicesTable = $("#invoices-table").DataTable();
            const paymentsTable = $("#payments-table").DataTable();

            if ($.fn.DataTable.isDataTable("#invoices-table")) {
                invoicesTable.destroy();
            }
            if ($.fn.DataTable.isDataTable("#payments-table")) {
                paymentsTable.destroy();
            }
        };
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge bg="success">Active</Badge>;
            case "inactive":
                return (
                    <Badge bg="warning" text="dark">
                        Inactive
                    </Badge>
                );
            case "suspended":
                return <Badge bg="danger">Suspended</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <PortalLayout>
            <Head title={school?.name} />

            <div className="d-flex justify-content-between align-items-center">
                <h2 className="m-0 text-capitalize">{school?.name}</h2>
                <ButtonGroup>
                    <Link
                        href={route("admin.tenant.index")}
                        className="btn btn-outline-primary"
                    >
                        <FiArrowLeftCircle className="me-2" />
                        Back to Tenants
                    </Link>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Card className="mb-4">
                <Card.Body>
                    <Tabs defaultActiveKey="info" className="mb-3">
                        {/* Basic Info Tab */}
                        <Tab eventKey="info" title="Basic Info">
                            <Table borderless className="border mb-0">
                                <tbody>
                                    <tr>
                                        <th width="50">Name:</th>
                                        <td>{school?.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Domain:</th>
                                        <td>
                                            {/* for each domains */}
                                            {school?.domains.map(
                                                (domain, index) => (
                                                    <div key={index}>
                                                        {domain.domain}
                                                    </div>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Database:</th>
                                        <td>{school?.database}</td>
                                    </tr>
                                    <tr>
                                        <th>Email:</th>
                                        <td>{school?.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Phone:</th>
                                        <td>{school?.phone}</td>
                                    </tr>
                                    <tr>
                                        <th>Address:</th>
                                        <td>{school?.address}</td>
                                    </tr>
                                    <tr>
                                        <th>Location:</th>
                                        <td>
                                            <ol>
                                                <li>{school?.county.name}</li>
                                                <li>
                                                    {school?.constituency.name}
                                                </li>
                                                <li>{school?.ward.name}</li>
                                            </ol>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Tab>

                        {/* Billing Tab */}
                        <Tab eventKey="billing" title="Billing">
                            <Table borderless className="border mb-0">
                                <tbody>
                                    <tr>
                                        <th width="50">Plan:</th>
                                        <td>{school?.plan.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Status:</th>
                                        <td>
                                            {getStatusBadge(school?.status)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Date:</th>
                                        <td>
                                            {formatDate(
                                                school?.created_at,
                                                "DD/MM/YYYY"
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Tab>

                        {/* Invoices Tab */}
                        <Tab eventKey="invoices" title="Invoices">
                            <Table
                                bordered
                                striped
                                hover
                                responsive
                                id="invoices-table"
                                className="w-100"
                            />
                        </Tab>

                        {/* Payments Tab */}
                        <Tab eventKey="payments" title="Payments">
                            <Table
                                bordered
                                striped
                                hover
                                responsive
                                id="payments-table"
                                className="w-100"
                            />
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </PortalLayout>
    );
}
