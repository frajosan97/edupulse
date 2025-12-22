import { useEffect, useMemo } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useForm } from "@inertiajs/react";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function ClassCreateModal({
    show,
    onHide,
    teachers = [],
    editingClass = null,
}) {
    const isEditing = Boolean(editingClass);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset, errors } = useForm({
        name: "",
        class_teacher_id: "",
        assistant_teacher_id: "",
        is_active: true,
    });

    /* --------------------------------------------------------------
     | Teacher select options (memoized)
     * -------------------------------------------------------------- */
    const teacherOptions = useMemo(
        () =>
            teachers.map((t) => ({
                value: t.id,
                label: t.full_name,
            })),
        [teachers]
    );

    /* --------------------------------------------------------------
     | Sync form when editing
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (isEditing) {
            setData({
                name: editingClass.name ?? "",
                class_teacher_id: editingClass.class_teacher_id ?? "",
                assistant_teacher_id: editingClass.assistant_teacher_id ?? "",
                is_active: editingClass.is_active ?? true,
            });
        } else {
            reset();
        }
    }, [editingClass, isEditing]);

    /* --------------------------------------------------------------
     | Helpers for react-select values
     * -------------------------------------------------------------- */
    const getSelectedTeacher = (id) =>
        teacherOptions.find((opt) => opt.value === id) || null;

    /* --------------------------------------------------------------
     | Submit handler
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Class`,
                text: `Confirm to ${action.toLowerCase()} this class.`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!confirm.isConfirmed) return;

            // Loading Swal
            Swal.fire({
                title: "Please wait...",
                text: `${action} in progress`,
                icon: "info",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            const url = isEditing
                ? route("admin.class.update", editingClass.id)
                : route("admin.class.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data?.success) {
                toast.success(
                    response.data.message ||
                        `Class ${action.toLowerCase()}d successfully`
                );
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
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Class" : "Create New Class"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Class Name */}
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Class Name{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>

                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaChalkboardTeacher />
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        isInvalid={!!errors.name}
                                        required
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Teachers */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Class Teacher{" "}
                                    <span className="text-danger">*</span>
                                </Form.Label>

                                <Select
                                    options={teacherOptions}
                                    value={getSelectedTeacher(
                                        data.class_teacher_id
                                    )}
                                    onChange={(opt) =>
                                        setData(
                                            "class_teacher_id",
                                            opt?.value || ""
                                        )
                                    }
                                    placeholder="Select Teacher"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assistant Teacher</Form.Label>

                                <Select
                                    options={teacherOptions}
                                    value={getSelectedTeacher(
                                        data.assistant_teacher_id
                                    )}
                                    onChange={(opt) =>
                                        setData(
                                            "assistant_teacher_id",
                                            opt?.value || ""
                                        )
                                    }
                                    placeholder="Select Assistant (Optional)"
                                    isClearable
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Active */}
                    <Form.Check
                        type="switch"
                        id="class-active"
                        label="Active"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="mt-3"
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={onHide}
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
                            ? `${isEditing ? "Updating" : "Creating"}...`
                            : isEditing
                            ? "Update Class"
                            : "Create Class"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
