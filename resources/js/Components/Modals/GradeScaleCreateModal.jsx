import { useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";

import xios from "@/Utils/xios";
import Swal from "sweetalert2";

/* -------------------------------------------------
 | Helpers
 -------------------------------------------------*/
const generateGradeScaleCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `GSCALE-${timestamp}-${random}`.toUpperCase();
};

const getInitialForm = (gradingSystemId, gradeScale = null) => ({
    grading_system_id: gradingSystemId,
    name: gradeScale?.name ?? "",
    code: gradeScale?.code ?? generateGradeScaleCode(),
    min_score: gradeScale?.min_score ?? "",
    max_score: gradeScale?.max_score ?? "",
    grade_point: gradeScale?.grade_point ?? "",
    remark: gradeScale?.remark ?? "",
    display_order: gradeScale?.display_order ?? 0,
});

/* -------------------------------------------------
 | Component
 -------------------------------------------------*/
export default function GradeScaleCreateModal({
    show,
    onHide,
    gradingSystem,
    gradeScale = null,
}) {
    const isEditing = Boolean(gradeScale);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset } = useForm(
        getInitialForm(gradingSystem.id)
    );

    /* -------------------------------------------------
     | Sync form on open / edit
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;

        setData(
            getInitialForm(gradingSystem.id, isEditing ? gradeScale : null)
        );
    }, [show, gradeScale, gradingSystem.id, isEditing, setData]);

    /* -------------------------------------------------
     | Submit
     -------------------------------------------------*/
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Scale`,
                text: `Confirm to ${action.toLowerCase()} this grade scale.`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!confirm.isConfirmed) return;

            // Swal loader with INFO icon
            Swal.fire({
                title: "Please wait...",
                text: `${action} in progress`,
                icon: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            const url = isEditing
                ? route("admin.grade-scale.update", gradeScale.id)
                : route("admin.grade-scale.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data.success) {
                toast.success(response.data.message || "Saved successfully");
                reset();
                onHide();
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    /* -------------------------------------------------
     | Render
     -------------------------------------------------*/
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Grade Scale" : "Create Grade Scale"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Code</Form.Label>
                                <Form.Control
                                    value={data.code}
                                    readOnly
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Min Score</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={data.min_score}
                                    onChange={(e) =>
                                        setData("min_score", e.target.value)
                                    }
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Max Score</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={data.max_score}
                                    onChange={(e) =>
                                        setData("max_score", e.target.value)
                                    }
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Grade Point</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={data.grade_point}
                                    onChange={(e) =>
                                        setData("grade_point", e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Remark</Form.Label>
                                <Form.Control
                                    value={data.remark}
                                    onChange={(e) =>
                                        setData("remark", e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group>
                        <Form.Label>Display Order</Form.Label>
                        <Form.Control
                            type="number"
                            value={data.display_order}
                            onChange={(e) =>
                                setData("display_order", e.target.value)
                            }
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? "Saving..."
                            : isEditing
                            ? "Update"
                            : "Create"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
