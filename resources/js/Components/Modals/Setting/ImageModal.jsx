import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Image as BootstrapImage } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import { router } from "@inertiajs/react";

export default function ImageModal({
    show,
    onHide,
    editingImage = null,
    imageData,
    setImageData,
    imageErrors = {},
    imageProcessing,
    onFileChange,
    resetImageForm,
}) {
    const isEditing = Boolean(editingImage);
    const { showErrorToast } = useErrorToast();

    /* --------------------------------------------------------------
     | Submit handler (ALIGNED STRUCTURE)
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Require image file on create
        if (!isEditing && !imageData.image_file) {
            toast.error("Please select an image file");
            return;
        }

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Image`,
                text: `Confirm to ${action.toLowerCase()} this image.`,
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
                ? route("admin.school-image.update", editingImage.id)
                : route("admin.school-image.store");

            const response = isEditing
                ? await xios.post(url, imageData, {
                      headers: { "Content-Type": "multipart/form-data" },
                  })
                : await xios.post(url, imageData, {
                      headers: { "Content-Type": "multipart/form-data" },
                  });

            if (response.data?.success) {
                toast.success(response.data.message);
                resetImageForm?.();
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
        <Modal show={show} onHide={onHide} centered size="lg">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Image" : "Add New Image"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Image Type</Form.Label>
                                <Form.Select
                                    value={imageData.image_type}
                                    onChange={(e) =>
                                        setImageData(
                                            "image_type",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={!!imageErrors.image_type}
                                >
                                    <option value="logo">Logo</option>
                                    <option value="welcome">
                                        Welcome Image
                                    </option>
                                    <option value="background">
                                        Background
                                    </option>
                                    <option value="gallery">Gallery</option>
                                    <option value="stamp">Stamp</option>
                                    <option value="signature">Signature</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {imageErrors.image_type}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Image File</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    isInvalid={!!imageErrors.image_file}
                                />
                                <Form.Text className="text-muted">
                                    {isEditing
                                        ? "Leave empty to keep current image"
                                        : "Select an image to upload (Max 5MB, JPG/PNG/GIF/WebP)"}
                                </Form.Text>
                                <Form.Control.Feedback type="invalid">
                                    {imageErrors.image_file}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Alt Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={imageData.alt_text}
                                    onChange={(e) =>
                                        setImageData("alt_text", e.target.value)
                                    }
                                    isInvalid={!!imageErrors.alt_text}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {imageErrors.alt_text}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Caption</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={imageData.caption}
                                    onChange={(e) =>
                                        setImageData("caption", e.target.value)
                                    }
                                    isInvalid={!!imageErrors.caption}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {imageErrors.caption}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Display Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={imageData.display_order}
                                    onChange={(e) =>
                                        setImageData(
                                            "display_order",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={!!imageErrors.display_order}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {imageErrors.display_order}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Check
                                    type="switch"
                                    label="Active"
                                    checked={imageData.is_active}
                                    onChange={(e) =>
                                        setImageData(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <div className="mb-3">
                                <Form.Label>Preview</Form.Label>
                                <div className="border rounded p-3 text-center">
                                    {imageData.image_path ? (
                                        <BootstrapImage
                                            src={`/storage/${imageData.image_path}`}
                                            fluid
                                            style={{ maxHeight: 200 }}
                                        />
                                    ) : isEditing ? (
                                        <BootstrapImage
                                            src={`/storage/${editingImage.image_url}`}
                                            fluid
                                            style={{ maxHeight: 200 }}
                                        />
                                    ) : (
                                        <div className="text-muted">
                                            No image selected
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        disabled={imageProcessing}
                    >
                        {imageProcessing
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
