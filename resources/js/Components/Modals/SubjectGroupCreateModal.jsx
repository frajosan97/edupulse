import { useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaLayerGroup, FaHashtag } from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function SubjectGroupCreateModal({
    show,
    handleClose,
    group = null,
    users = [],
    departments = [],
    gradingSystems = [],
}) {
    const isEditing = !!group;

    const { data, setData, processing, reset, errors } = useForm({
        name: "",
        code: "",
        description: "",
        department_id: "",
        coordinator_id: "",
        grading_system_id: "",
        display_order: 0,
        is_active: true,
    });

    const { showErrorToast } = useErrorToast();

    // Auto-generate code for new groups
    const generateCode = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SG-${timestamp}-${random}`;
    };

    // Sync form with edit values or initialize for creation
    useEffect(() => {
        if (isEditing && group) {
            setData({
                name: group.name || "",
                code: group.code || "",
                description: group.description || "",
                department_id: group.department_id || "",
                coordinator_id: group.coordinator_id || "",
                grading_system_id: group.grading_system_id || "",
                display_order: group.display_order ?? 0,
                is_active: group.is_active ?? true,
            });
        } else {
            reset();
            setData("code", generateCode());
        }
    }, [group, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Subject Group`,
                text: `Confirm to ${action.toLowerCase()} this subject group.`,
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
                ? route("admin.subject-group.update", group.id)
                : route("admin.subject-group.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data.success) {
                toast.success(
                    response.data.message ||
                        `Subject group ${action.toLowerCase()}d successfully!`
                );
                reset();
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
                            ? "Edit Subject Group"
                            : "Create New Subject Group"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Name & Code */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaLayerGroup />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value.trimStart()
                                        )
                                    }
                                    isInvalid={!!errors.name}
                                    placeholder="Group Name"
                                    required
                                    maxLength={100}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaHashtag />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            "code",
                                            e.target.value.trim().toUpperCase()
                                        )
                                    }
                                    isInvalid={!!errors.code}
                                    placeholder="Group Code"
                                    required
                                    maxLength={30}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.code}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* Description */}
                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            maxLength={255}
                        />
                    </Form.Group>

                    {/* Department & Coordinator */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Select
                                options={departments.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                }))}
                                value={
                                    departments.find(
                                        (d) => d.id == data.department_id
                                    )
                                        ? {
                                              value: data.department_id,
                                              label: departments.find(
                                                  (d) =>
                                                      d.id == data.department_id
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={(selected) =>
                                    setData(
                                        "department_id",
                                        selected?.value || ""
                                    )
                                }
                                placeholder="Select Department"
                            />
                        </Col>
                        <Col md={6}>
                            <Select
                                options={users.map((u) => ({
                                    value: u.id,
                                    label: u.full_name,
                                }))}
                                value={
                                    users.find(
                                        (u) => u.id == data.coordinator_id
                                    )
                                        ? {
                                              value: data.coordinator_id,
                                              label: users.find(
                                                  (u) =>
                                                      u.id ==
                                                      data.coordinator_id
                                              ).full_name,
                                          }
                                        : null
                                }
                                onChange={(selected) =>
                                    setData(
                                        "coordinator_id",
                                        selected?.value || ""
                                    )
                                }
                                placeholder="Select Coordinator"
                            />
                        </Col>
                    </Row>

                    {/* Grading System & Display Order */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Select
                                options={gradingSystems.map((g) => ({
                                    value: g.id,
                                    label: g.name,
                                }))}
                                value={
                                    gradingSystems.find(
                                        (g) => g.id == data.grading_system_id
                                    )
                                        ? {
                                              value: data.grading_system_id,
                                              label: gradingSystems.find(
                                                  (g) =>
                                                      g.id ==
                                                      data.grading_system_id
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={(selected) =>
                                    setData(
                                        "grading_system_id",
                                        selected?.value || ""
                                    )
                                }
                                placeholder="Select Grading System"
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                min={0}
                                max={999}
                                step={1}
                                value={data.display_order}
                                onChange={(e) =>
                                    setData(
                                        "display_order",
                                        e.target.value === ""
                                            ? 0
                                            : parseInt(e.target.value, 10)
                                    )
                                }
                                placeholder="Display Order"
                            />
                        </Col>
                    </Row>

                    {/* Active Switch */}
                    <Form.Check
                        type="switch"
                        id="group-active"
                        label="Active"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        {processing
                            ? isEditing
                                ? "Updating..."
                                : "Creating..."
                            : isEditing
                            ? "Update Group"
                            : "Create Group"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
