// @/Components/Modals/SlideCreateEditModal.jsx
import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

const INITIAL_FORM = {
    title: "",
    description: "",
    image: null,
    link_url: "",
    link_text: "",
    display_order: "",
    is_active: true,
    start_date: "",
    end_date: "",
};

export default function SlideCreateEditModal({ show, onHide, slide = null }) {
    const isEditing = Boolean(slide);
    const [form, setForm] = useState(INITIAL_FORM);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const { showErrorToast } = useErrorToast();

    /* --------------------------------------------------------------
     | Populate / reset form
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (!show) return;

        if (isEditing) {
            setForm({
                title: slide.title ?? "",
                description: slide.description ?? "",
                image: null,
                link_url: slide.link_url ?? "",
                link_text: slide.link_text ?? "",
                display_order: slide.display_order ?? "",
                is_active:
                    slide.is_active !== undefined ? slide.is_active : true,
                start_date: slide.start_date
                    ? slide.start_date.split("T")[0]
                    : "",
                end_date: slide.end_date ? slide.end_date.split("T")[0] : "",
            });
            setPreview(slide.image_url ?? null);
        } else {
            setForm(INITIAL_FORM);
            setPreview(null);
        }

        setErrors({});
    }, [show, slide, isEditing]);

    /* --------------------------------------------------------------
     | Change handler
     * -------------------------------------------------------------- */
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const file = files[0] || null;
            setForm((prev) => ({ ...prev, image: file }));

            if (file) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    /* --------------------------------------------------------------
     | Submit handler (ALIGNED STRUCTURE)
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !form.image) {
            toast.error("Please select a slide image");
            return;
        }

        const action = isEditing ? "Update" : "Create";

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== "") {
                formData.append(key, value);
            }
        });

        try {
            const confirm = await Swal.fire({
                title: `${action} Slide`,
                text: `Confirm to ${action.toLowerCase()} this slide.`,
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
                ? route("admin.school-slide.update", slide.id)
                : route("admin.school-slide.store");

            const response = isEditing
                ? await xios.post(url, formData, {
                      headers: {
                          "Content-Type": "multipart/form-data",
                      },
                  })
                : await xios.post(url, formData, {
                      headers: {
                          "Content-Type": "multipart/form-data",
                      },
                  });

            if (response.data?.success) {
                toast.success(response.data.message);
                onHide();
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Slide" : "Create Slide"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        {/* Image Upload */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Slide Image {!isEditing && "*"}
                                </Form.Label>

                                <div className="border rounded p-3 text-center">
                                    {preview ? (
                                        <Image
                                            src={preview}
                                            fluid
                                            className="rounded mb-2"
                                            style={{ maxHeight: 180 }}
                                        />
                                    ) : (
                                        <div className="py-4 text-muted">
                                            No image selected
                                        </div>
                                    )}

                                    <Form.Control
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                        isInvalid={!!errors.image}
                                        required={!isEditing}
                                    />

                                    <small className="text-muted d-block mt-2">
                                        Max 5MB, JPG/PNG/WebP
                                    </small>
                                </div>
                            </Form.Group>
                        </Col>

                        {/* Title & Description */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    isInvalid={!!errors.title}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Links */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Link URL</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="link_url"
                                    value={form.link_url}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Link Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="link_text"
                                    value={form.link_text}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Order & Dates */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Display Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    name="display_order"
                                    value={form.display_order}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Active */}
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            name="is_active"
                            label="Active"
                            checked={form.is_active}
                            onChange={handleChange}
                        />
                        <small className="text-muted ms-2">
                            Inactive slides won’t show
                        </small>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>

                    <Button variant="primary" type="submit">
                        {isEditing ? "Update" : "Create"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
