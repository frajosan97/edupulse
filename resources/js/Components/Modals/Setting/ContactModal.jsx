import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import { router } from "@inertiajs/react";

export default function ContactModal({
    show,
    onHide,
    editingContact = null,
    contactData,
    setContactData,
    contactErrors = {},
    contactProcessing,
    resetContactForm,
}) {
    const isEditing = Boolean(editingContact);
    const { showErrorToast } = useErrorToast();

    /* --------------------------------------------------------------
     | Submit handler (FULLY ALIGNED STRUCTURE)
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Contact`,
                text: `Confirm to ${action.toLowerCase()} this contact.`,
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
                ? route("admin.school-contact.update", editingContact.id)
                : route("admin.school-contact.store");

            const response = isEditing
                ? await xios.put(url, contactData)
                : await xios.post(url, contactData);

            if (response.data?.success) {
                toast.success(response.data.message);
                resetContactForm?.();
                onHide();
                router.reload();
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
                        {isEditing ? "Edit Contact" : "Add New Contact"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Contact Type</Form.Label>
                        <Form.Select
                            value={contactData.contact_type}
                            onChange={(e) =>
                                setContactData("contact_type", e.target.value)
                            }
                            isInvalid={!!contactErrors.contact_type}
                        >
                            <option value="phone">Phone</option>
                            <option value="email">Email</option>
                            <option value="address">Address</option>
                            <option value="social">Social Media</option>
                            <option value="description">
                                School Short Description
                            </option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {contactErrors.contact_type}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Value</Form.Label>
                        <Form.Control
                            type="text"
                            value={contactData.value}
                            onChange={(e) =>
                                setContactData("value", e.target.value)
                            }
                            isInvalid={!!contactErrors.value}
                        />
                        <Form.Control.Feedback type="invalid">
                            {contactErrors.value}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Display Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={contactData.display_order}
                                    onChange={(e) =>
                                        setContactData(
                                            "display_order",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={!!contactErrors.display_order}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {contactErrors.display_order}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Check
                                    type="switch"
                                    label="Active"
                                    checked={contactData.is_active}
                                    onChange={(e) =>
                                        setContactData(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>
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
                        disabled={contactProcessing}
                    >
                        {contactProcessing
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
