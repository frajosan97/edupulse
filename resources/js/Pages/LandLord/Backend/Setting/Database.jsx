import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useCallback } from "react";
import { Row, Col, Card, ButtonGroup, Table, Button } from "react-bootstrap";

import PortalLayout from "@/Layouts/PortalLayout";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import { toast } from "react-toastify";

export default function Database() {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#databasesTable")) {
            $("#databasesTable").DataTable().destroy();
        }

        $("#databasesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: route("admin.database.index"),
                type: "GET",
            },
            columns: [
                {
                    data: "DT_RowIndex",
                    name: "DT_RowIndex",
                    title: "#",
                    orderable: false,
                    searchable: false,
                },
                { data: "database", title: "Database" },
                { data: "collation", title: "Collation" },
                { data: "tables", title: "Tables" },
                {
                    data: "storage_usage",
                    title: "Storage Usage",
                    render: function (data) {
                        return data || "0 MB";
                    },
                },
                {
                    data: "action",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                },
            ],

            order: [[0, "desc"]],
        });
    }, []);

    useEffect(() => {
        initializeDataTable();
        return () => {
            if ($.fn.DataTable.isDataTable("#databasesTable")) {
                $("#databasesTable").DataTable().destroy();
            }
        };
    }, [initializeDataTable]);

    const handleRunMigration = async () => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes,  migrate!",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: "Migrating",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.post(route("admin.database.store"));

            if (response.data.success === true) {
                Swal.close();
                toast.success(response.data.message);
                router.reload();
            }
        } catch (err) {
            Swal.close();
            toast.error(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <PortalLayout>
            <Head title="Tenants List" />

            <Row>
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center"
                >
                    <h2 className="m-0 text-capitalize">
                        Databases Management
                    </h2>
                    {/* <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => handleRunMigration()}
                        >
                            Re-run Migration
                        </Button>
                    </ButtonGroup> */}
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
                                id="databasesTable"
                                className="w-100"
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </PortalLayout>
    );
}
