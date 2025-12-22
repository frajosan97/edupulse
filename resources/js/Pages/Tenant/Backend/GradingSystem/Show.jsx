// resources/js/Pages/Tenant/Backend/GradingSystem/Show.jsx
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Row, Col, Card, Table, Button, ButtonGroup } from "react-bootstrap";
import { Pencil, Trash2, Info, ArrowUpDown, Hash } from "lucide-react";
import { FaArrowAltCircleLeft, FaPlusSquare } from "react-icons/fa";

import PortalLayout from "@/Layouts/PortalLayout";
import GradeScaleCreateModal from "@/Components/Modals/GradeScaleCreateModal";
import { InfoCircle } from "react-bootstrap-icons";

export default function GradingSystemShow({ gradingSystem }) {
    const { auth } = usePage().props;

    // Modal states
    const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
    const [editingGradeScale, setEditingGradeScale] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: "display_order",
        direction: "asc",
    });

    const openModal = (gradeScale = null) => {
        setEditingGradeScale(gradeScale);
        setShowGradeScaleModal(true);
    };

    const closeModal = () => {
        setEditingGradeScale(null);
        setShowGradeScaleModal(false);
        router.reload();
    };

    // Sort grade scales
    const sortedGradeScales = [...(gradingSystem.grade_scales || [])].sort(
        (a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        }
    );

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
        return sortConfig.direction === "asc" ? (
            <ArrowUpDown size={14} className="text-primary" />
        ) : (
            <ArrowUpDown
                size={14}
                className="text-primary"
                style={{ transform: "rotate(180deg)" }}
            />
        );
    };

    return (
        <PortalLayout user={auth.user}>
            <Head title={`Grading System - ${gradingSystem.name}`} />

            {/* Header with actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">{gradingSystem.name}</h1>
                <ButtonGroup className="gap-2">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        as="a"
                        href={route("admin.grading-system.index")}
                    >
                        <FaArrowAltCircleLeft className="me-2" />
                        Back to List
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openModal()}
                    >
                        <FaPlusSquare size={16} className="me-1" /> Add Grade
                        Scale
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            {gradingSystem.grade_scales?.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover className="border m-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th
                                                    style={{
                                                        width: "5%",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        requestSort("name")
                                                    }
                                                    className="py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        Name{" "}
                                                        {getSortIcon("name")}
                                                    </div>
                                                </th>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        requestSort("code")
                                                    }
                                                    className="py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        Code{" "}
                                                        {getSortIcon("code")}
                                                    </div>
                                                </th>
                                                <th
                                                    style={{
                                                        width: "15%",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        requestSort("min_score")
                                                    }
                                                    className="py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        Range{" "}
                                                        {getSortIcon(
                                                            "min_score"
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        requestSort(
                                                            "grade_point"
                                                        )
                                                    }
                                                    className="py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        Point{" "}
                                                        {getSortIcon(
                                                            "grade_point"
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    style={{ width: "20%" }}
                                                    className="py-3"
                                                >
                                                    Remark
                                                </th>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        requestSort(
                                                            "display_order"
                                                        )
                                                    }
                                                    className="py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <Hash
                                                            size={14}
                                                            className="me-1"
                                                        />{" "}
                                                        Order{" "}
                                                        {getSortIcon(
                                                            "display_order"
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    style={{ width: "15%" }}
                                                    className="text-end py-3"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedGradeScales.map((scale) => (
                                                <tr key={scale.id}>
                                                    <td className="align-middle">
                                                        <div className="fw-semibold">
                                                            {scale.name}
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">
                                                        <code>
                                                            {scale.code}
                                                        </code>
                                                    </td>
                                                    <td className="align-middle">
                                                        <span className="badge bg-light text-dark">
                                                            {scale.min_score} -{" "}
                                                            {scale.max_score}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        {scale.grade_point ?? (
                                                            <span className="text-muted">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="align-middle">
                                                        {scale.remark || (
                                                            <span className="text-muted">
                                                                No remark
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="align-middle">
                                                        {scale.display_order}
                                                    </td>
                                                    <td className="text-end align-middle">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="me-2 d-inline-flex align-items-center"
                                                            onClick={() =>
                                                                openModal(scale)
                                                            }
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <InfoCircle
                                        size={48}
                                        className="text-muted mb-3"
                                    />
                                    <h5 className="text-muted">
                                        No grade scales defined yet
                                    </h5>
                                    <p className="text-muted mb-4">
                                        Get started by adding your first grade
                                        scale
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Grade Scale Modal */}
            <GradeScaleCreateModal
                show={showGradeScaleModal}
                onHide={closeModal}
                gradingSystem={gradingSystem}
                gradeScale={editingGradeScale}
            />
        </PortalLayout>
    );
}
