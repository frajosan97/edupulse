import { Head, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import {
    Card,
    Row,
    Col,
    Alert,
    Badge,
    Button,
    ButtonGroup,
} from "react-bootstrap";
import { Database, Table as TableIcon } from "react-bootstrap-icons";
import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

export default function DatabaseShow({
    database,
    dbInfo,
    tables = [],
    totalSize,
    error = null,
}) {
    const initializeDataTable = useCallback(() => {
        if ($.fn.DataTable.isDataTable("#tablesTable")) {
            $("#tablesTable").DataTable().destroy();
        }
        $("#tablesTable").DataTable({
            responsive: true,
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50, 100],
            order: [[1, "asc"]],
        });
    }, []);

    useEffect(() => {
        if (!error && tables.length > 0) {
            initializeDataTable();
        }
    }, [tables, error, initializeDataTable]);

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
            const response = await xios.put(
                route("admin.database.update", database.id)
            );

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
            <Head title={`${database?.database} Database`} />

            <Row>
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center mb-3"
                >
                    <h2 className="m-0 text-capitalize">
                        <Database className="me-2" />
                        {database?.database} Database
                    </h2>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => handleRunMigration()}
                        >
                            Re-run Migration
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr" />

            {error && (
                <Alert variant="danger">
                    <strong>Error:</strong> {error}
                </Alert>
            )}

            {!error && (
                <>
                    {/* Database Info */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-transparent fw-bold">
                                    Database Info
                                </Card.Header>
                                <Card.Body>
                                    <p>
                                        <strong>Name:</strong>{" "}
                                        {dbInfo?.database_name}
                                    </p>
                                    <p>
                                        <strong>Character Set:</strong>{" "}
                                        {dbInfo?.character_set}
                                    </p>
                                    <p>
                                        <strong>Collation:</strong>{" "}
                                        {dbInfo?.collation}
                                    </p>
                                    <p>
                                        <strong>SQL Path:</strong>{" "}
                                        {dbInfo?.sql_path || "N/A"}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-transparent fw-bold">
                                    Size Summary
                                </Card.Header>
                                <Card.Body>
                                    <p>
                                        <strong>Total Size:</strong>{" "}
                                        {totalSize?.total_size_mb} MB
                                    </p>
                                    <p>
                                        <strong>Data Size:</strong>{" "}
                                        {totalSize?.data_size_mb} MB
                                    </p>
                                    <p>
                                        <strong>Index Size:</strong>{" "}
                                        {totalSize?.index_size_mb} MB
                                    </p>
                                    <p>
                                        <strong>Table Count:</strong>{" "}
                                        {totalSize?.table_count}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tables List with DataTables */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-transparent fw-bold d-flex align-items-center">
                            <TableIcon className="me-2" />
                            Tables ({tables.length})
                        </Card.Header>
                        <Card.Body>
                            <table
                                id="tablesTable"
                                className="table table-striped table-bordered table-hover w-100 mb-0"
                            >
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Table Name</th>
                                        <th>Rows</th>
                                        <th>Exact Rows</th>
                                        <th>Engine</th>
                                        <th>Collation</th>
                                        <th>Created</th>
                                        <th>Updated</th>
                                        <th>Data Size</th>
                                        <th>Index Size</th>
                                        <th>Total Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables.length > 0 ? (
                                        tables.map((table, idx) => (
                                            <tr key={table.table_name}>
                                                <td>{idx + 1}</td>
                                                <td>{table.table_name}</td>
                                                <td>{table.row_count}</td>
                                                <td>{table.exact_row_count}</td>
                                                <td>
                                                    <Badge bg="secondary">
                                                        {table.engine}
                                                    </Badge>
                                                </td>
                                                <td>{table.collation}</td>
                                                <td>
                                                    {table.created_at || "—"}
                                                </td>
                                                <td>
                                                    {table.updated_at || "—"}
                                                </td>
                                                <td>{table.data_size_mb} MB</td>
                                                <td>
                                                    {table.index_size_mb} MB
                                                </td>
                                                <td>
                                                    {table.total_size_mb} MB
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="text-center"
                                            >
                                                No tables found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </>
            )}
        </PortalLayout>
    );
}
