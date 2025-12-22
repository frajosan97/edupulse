import { useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { FaBook, FaCode } from "react-icons/fa";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";

import Select from "react-select";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

/* -------------------------------------------------
 | Helpers
 -------------------------------------------------*/
const generateGradingSystemCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `GS-${timestamp}-${random}`.toUpperCase();
};

const getInitialForm = (gradingSystem = null) => ({
    name: gradingSystem?.name ?? "",
    code: gradingSystem?.code ?? generateGradingSystemCode(),
    description: gradingSystem?.description ?? "",
    type: gradingSystem?.type ?? "percentage",
    is_default: gradingSystem?.is_default ?? false,
    is_active: gradingSystem?.is_active ?? true,
});

/* -------------------------------------------------
 | Component
 -------------------------------------------------*/
export default function GradingSystemCreateModal({
    show,
    onHide,
    editingGradingSystem = null,
}) {
    const isEditing = Boolean(editingGradingSystem);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset } = useForm(getInitialForm());

    const typeOptions = [
        { value: "percentage", label: "Percentage" },
        { value: "letter", label: "Letter" },
        { value: "gpa", label: "GPA" },
        { value: "custom", label: "Custom" },
    ];

    /* -------------------------------------------------
     | Sync form on open / edit
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;

        setData(getInitialForm(isEditing ? editingGradingSystem : null));
    }, [show, isEditing, editingGradingSystem, setData]);

    /* -------------------------------------------------
     | Submit
     -------------------------------------------------*/
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Grading System`,
                text: `Confirm to ${action.toLowerCase()} this grading system.`,
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
                ? route("admin.grading-system.update", editingGradingSystem.id)
                : route("admin.grading-system.store");

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
                        {isEditing
                            ? "Edit Grading System"
                            : "Create Grading System"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaBook />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Grading System Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                            </InputGroup>
                        </Col>

                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaCode />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Code"
                                    value={data.code}
                                    readOnly
                                    className="bg-light"
                                />
                            </InputGroup>
                        </Col>

                        <Col md={4}>
                            <Select
                                options={typeOptions}
                                value={typeOptions.find(
                                    (o) => o.value === data.type
                                )}
                                onChange={(val) =>
                                    setData("type", val?.value ?? "percentage")
                                }
                                placeholder="Select Grading Type"
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Check
                                label="Default Grading System"
                                checked={data.is_default}
                                onChange={(e) =>
                                    setData("is_default", e.target.checked)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Check
                                label="Active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData("is_active", e.target.checked)
                                }
                            />
                        </Col>
                    </Row>
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
