import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function ClassStreamModal({
    show,
    handleClose,
    isEditing = false,
    currentStreamId = null,
    teachers = [],
    streams = [],
    classId,
}) {
    const { showErrorToast } = useErrorToast();

    const [formData, setFormData] = useState({
        class_id: classId,
        stream_id: "",
        class_teacher_id: "",
        assistant_teacher_id: "",
        is_active: true,
    });

    /* --------------------------------------------------------------
     | Load stream data when editing
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (!isEditing || !currentStreamId) return;

        Swal.fire({
            title: "Loading...",
            text: "Fetching class stream details",
            icon: "info",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
        });

        xios.get(route("admin.class-stream.edit", currentStreamId))
            .then((res) => {
                setFormData(res.data.data);
            })
            .catch(() => {
                toast.error("Failed to load stream data");
            })
            .finally(() => Swal.close());
    }, [isEditing, currentStreamId]);

    /* --------------------------------------------------------------
     | Handle input change
     * -------------------------------------------------------------- */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* --------------------------------------------------------------
     | Submit handler
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Add";

        try {
            const confirm = await Swal.fire({
                title: `${action} Class Stream`,
                text: `Confirm to ${action.toLowerCase()} this class stream.`,
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

            const endpoint = isEditing
                ? route("admin.class-stream.update", currentStreamId)
                : route("admin.class-stream.store");

            const method = isEditing ? "put" : "post";

            const response = await xios[method](endpoint, formData);

            if (response.data?.success) {
                toast.success(response.data.message);
                handleClose();
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing
                            ? "Edit Class Stream"
                            : "Add Stream to Class"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Stream */}
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Stream{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>

                                <Form.Select
                                    name="stream_id"
                                    value={formData.stream_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Select a Stream</option>
                                    {streams.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Managers */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Manager{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>

                                <Form.Select
                                    name="class_teacher_id"
                                    value={formData.class_teacher_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Manager</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.full_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assistant Manager</Form.Label>

                                <Form.Select
                                    name="assistant_teacher_id"
                                    value={formData.assistant_teacher_id}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select Assistant Manager
                                    </option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.full_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Active */}
                    <Form.Check
                        type="switch"
                        id="is_active"
                        name="is_active"
                        label="Active Stream"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="mt-2"
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>

                    <Button variant="primary" type="submit">
                        {isEditing ? "Update Stream" : "Add Stream"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
