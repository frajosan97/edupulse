import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

const ColorPicker = ({ label, value, onChange }) => (
    <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <InputGroup>
            <InputGroup.Text
                style={{ backgroundColor: value, width: "40px" }}
            />
            <Form.Control
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                title={`Choose ${label} color`}
            />
            <Form.Control
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
            />
        </InputGroup>
    </Form.Group>
);

export default function ThemeModal({
    show,
    onHide,
    themes = null,
    themeData,
    setThemeData,
    themeErrors = {},
    themeProcessing,
    resetThemeForm,
}) {
    const isEditing = Boolean(themes);
    const { showErrorToast } = useErrorToast();

    /* --------------------------------------------------------------
     | Submit handler (ALIGNED STRUCTURE)
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Theme`,
                text: `Confirm to ${action.toLowerCase()} this theme.`,
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
                ? route("admin.school-theme.update", themes.id)
                : route("admin.school-theme.store");

            const response = isEditing
                ? await xios.put(url, themeData)
                : await xios.post(url, themeData);

            if (response.data?.success) {
                toast.success(response.data.message);
                resetThemeForm?.();
                onHide();
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
                        {isEditing ? "Edit Theme" : "Create Theme"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Theme Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={themeData.name}
                                    onChange={(e) =>
                                        setThemeData("name", e.target.value)
                                    }
                                    isInvalid={!!themeErrors.name}
                                    placeholder="e.g., Default Theme"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {themeErrors.name}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <ColorPicker
                                label="Primary Color"
                                value={themeData.primary_color}
                                onChange={(color) =>
                                    setThemeData("primary_color", color)
                                }
                            />

                            <ColorPicker
                                label="Secondary Color"
                                value={themeData.secondary_color}
                                onChange={(color) =>
                                    setThemeData("secondary_color", color)
                                }
                            />

                            <ColorPicker
                                label="Accent Color"
                                value={themeData.accent_color}
                                onChange={(color) =>
                                    setThemeData("accent_color", color)
                                }
                            />
                        </Col>

                        <Col md={6}>
                            <ColorPicker
                                label="Text Color"
                                value={themeData.text_color}
                                onChange={(color) =>
                                    setThemeData("text_color", color)
                                }
                            />

                            <ColorPicker
                                label="Background Color"
                                value={themeData.background_color}
                                onChange={(color) =>
                                    setThemeData("background_color", color)
                                }
                            />

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    label="Set as default theme"
                                    checked={themeData.is_default}
                                    onChange={(e) =>
                                        setThemeData(
                                            "is_default",
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            {/* Preview */}
                            <div className="preview-section mt-4">
                                <h6>Preview</h6>
                                <div
                                    style={{
                                        backgroundColor:
                                            themeData.background_color,
                                        color: themeData.text_color,
                                        padding: "15px",
                                        borderRadius: "8px",
                                        border: "1px solid #dee2e6",
                                    }}
                                >
                                    <h5
                                        style={{
                                            color: themeData.primary_color,
                                        }}
                                    >
                                        Preview Heading
                                    </h5>
                                    <p>
                                        This is how text will appear with your
                                        theme.
                                    </p>
                                    <div className="d-flex gap-2">
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor:
                                                    themeData.primary_color,
                                                borderColor:
                                                    themeData.primary_color,
                                            }}
                                        >
                                            Primary
                                        </Button>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor:
                                                    themeData.secondary_color,
                                                borderColor:
                                                    themeData.secondary_color,
                                            }}
                                        >
                                            Secondary
                                        </Button>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor:
                                                    themeData.accent_color,
                                                borderColor:
                                                    themeData.accent_color,
                                            }}
                                        >
                                            Accent
                                        </Button>
                                    </div>
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
                        disabled={themeProcessing}
                    >
                        {themeProcessing
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
