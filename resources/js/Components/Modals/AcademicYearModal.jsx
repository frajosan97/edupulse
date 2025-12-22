import { useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { FaCalendar } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { useErrorToast } from "@/Hooks/useErrorToast";
import xios from "@/Utils/xios";

export default function AcademicYearCreateModal({
    show,
    onHide,
    academicYear = null,
}) {
    const isEditing = Boolean(academicYear);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset } = useForm({
        name: "",
        start_date: "",
        end_date: "",
        is_active: true,
    });

    /* --------------------------------------------------------------
     | Populate form when editing
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (isEditing) {
            setData({
                name: academicYear.name ?? "",
                start_date: academicYear.start_date ?? "",
                end_date: academicYear.end_date ?? "",
                is_active: academicYear.is_active ?? true,
            });
        } else {
            reset();
        }
    }, [academicYear, isEditing]);

    /* --------------------------------------------------------------
     | Submit handler
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Academic Year`,
                text: `Confirm to ${action.toLowerCase()} this academic year.`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!confirm.isConfirmed) return;

            // Show processing Swal
            Swal.fire({
                title: "Please wait...",
                text: `${action} in progress`,
                icon: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            const url = isEditing
                ? route("admin.academic-year.update", academicYear.id)
                : route("admin.academic-year.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data?.success) {
                toast.success(response.data.message);
                reset();
                onHide();
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing
                            ? "Edit Academic Year"
                            : "Create Academic Year"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="mb-3">
                        <Col>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaCalendar />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Name (e.g. 2024/2025)"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                required
                            />
                        </Col>

                        <Col>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                required
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Check
                                type="checkbox"
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
                            : "Save"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
