import { useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { FaBook, FaCode } from "react-icons/fa";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function SubjectCreateModal({
    show,
    onHide,
    subject = null,
    subjectGroups = [],
    departments = [],
    gradingSystems = [],
}) {
    const isEditing = !!subject;

    const { data, setData, processing, reset } = useForm({
        name: "",
        code: "",
        short_name: "",
        description: "",
        subject_group_id: "",
        department_id: "",
        grading_system_id: "",
        type: "core",
        has_theory: true,
        has_practical: false,
        theory_hours: "",
        practical_hours: "",
        passing_score: "",
        max_score: 100,
        theory_weightage: "",
        practical_weightage: "",
        is_active: true,
    });

    const { showErrorToast } = useErrorToast();

    // Sync subject data when editing or reset when creating
    useEffect(() => {
        if (isEditing && subject) {
            setData({ ...data, ...subject });
        } else {
            reset();
        }
    }, [subject, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Subject`,
                text: `Confirm to ${action.toLowerCase()} this subject.`,
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
                ? route("admin.subject.update", subject.id)
                : route("admin.subject.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data.success) {
                toast.success(
                    response.data.message ||
                        `Subject ${action.toLowerCase()}d successfully!`
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

    const subjectTypeOptions = [
        { value: "core", label: "Core" },
        { value: "elective", label: "Elective" },
        { value: "additional", label: "Additional" },
        { value: "optional", label: "Optional" },
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Subject" : "Create Subject"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Name + Code */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaBook />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Subject Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaCode />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData("code", e.target.value)
                                    }
                                    required
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* Short Name + Type */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                placeholder="Short Name"
                                value={data.short_name}
                                onChange={(e) =>
                                    setData("short_name", e.target.value)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Select
                                options={subjectTypeOptions}
                                value={subjectTypeOptions.find(
                                    (o) => o.value === data.type
                                )}
                                onChange={(val) =>
                                    setData("type", val?.value || "")
                                }
                                placeholder="Select Subject Type"
                            />
                        </Col>
                    </Row>

                    {/* Subject Group + Department */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Select
                                options={subjectGroups.map((g) => ({
                                    value: g.id,
                                    label: g.name,
                                }))}
                                value={
                                    subjectGroups.find(
                                        (g) => g.id === data.subject_group_id
                                    )
                                        ? {
                                              value: data.subject_group_id,
                                              label: subjectGroups.find(
                                                  (g) =>
                                                      g.id ===
                                                      data.subject_group_id
                                              )?.name,
                                          }
                                        : null
                                }
                                onChange={(val) =>
                                    setData(
                                        "subject_group_id",
                                        val?.value || ""
                                    )
                                }
                                placeholder="Select Subject Group"
                            />
                        </Col>
                        <Col md={6}>
                            <Select
                                options={departments.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                }))}
                                value={
                                    departments.find(
                                        (d) => d.id === data.department_id
                                    )
                                        ? {
                                              value: data.department_id,
                                              label: departments.find(
                                                  (d) =>
                                                      d.id ===
                                                      data.department_id
                                              )?.name,
                                          }
                                        : null
                                }
                                onChange={(val) =>
                                    setData("department_id", val?.value || "")
                                }
                                placeholder="Select Department"
                            />
                        </Col>
                    </Row>

                    {/* Grading System */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Select
                                options={gradingSystems.map((gs) => ({
                                    value: gs.id,
                                    label: gs.name,
                                }))}
                                value={
                                    gradingSystems.find(
                                        (gs) => gs.id === data.grading_system_id
                                    )
                                        ? {
                                              value: data.grading_system_id,
                                              label: gradingSystems.find(
                                                  (gs) =>
                                                      gs.id ===
                                                      data.grading_system_id
                                              )?.name,
                                          }
                                        : null
                                }
                                onChange={(val) =>
                                    setData(
                                        "grading_system_id",
                                        val?.value || ""
                                    )
                                }
                                placeholder="Select Grading System"
                            />
                        </Col>
                    </Row>

                    {/* Description */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Control
                                as="textarea"
                                rows={1}
                                placeholder="Description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    {/* Toggles */}
                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Check
                                label="Has Theory"
                                checked={data.has_theory}
                                onChange={(e) =>
                                    setData("has_theory", e.target.checked)
                                }
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Check
                                label="Has Practical"
                                checked={data.has_practical}
                                onChange={(e) =>
                                    setData("has_practical", e.target.checked)
                                }
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Check
                                label="Active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData("is_active", e.target.checked)
                                }
                            />
                        </Col>
                    </Row>

                    {/* Hours */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                placeholder="Theory Hours"
                                value={data.theory_hours}
                                onChange={(e) =>
                                    setData("theory_hours", e.target.value)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                placeholder="Practical Hours"
                                value={data.practical_hours}
                                onChange={(e) =>
                                    setData("practical_hours", e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    {/* Scores */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Passing Score"
                                value={data.passing_score}
                                onChange={(e) =>
                                    setData("passing_score", e.target.value)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Max Score"
                                value={data.max_score}
                                onChange={(e) =>
                                    setData("max_score", e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    {/* Weightage */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Theory Weightage (%)"
                                value={data.theory_weightage}
                                onChange={(e) =>
                                    setData("theory_weightage", e.target.value)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Practical Weightage (%)"
                                value={data.practical_weightage}
                                onChange={(e) =>
                                    setData(
                                        "practical_weightage",
                                        e.target.value
                                    )
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
