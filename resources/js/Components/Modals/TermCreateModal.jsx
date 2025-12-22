import { useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import Select from "react-select";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function TermCreateModal({
    show,
    onHide,
    term = null,
    academicYears = [],
}) {
    const isEditing = !!term;

    const { data, setData, processing, reset } = useForm({
        name: "",
        academic_year_id: "",
        start_date: "",
        end_date: "",
        is_active: true,
    });

    const { showErrorToast } = useErrorToast();

    // Autofill form when editing
    useEffect(() => {
        if (isEditing && term) {
            setData({
                name: term.name || "",
                academic_year_id: term.academic_year_id || "",
                start_date: term.start_date?.split("T")[0] || "",
                end_date: term.end_date?.split("T")[0] || "",
                is_active: term.is_active ?? true,
            });
        } else {
            reset();
        }
    }, [term, isEditing, reset, setData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Term`,
                text: `Confirm to ${action.toLowerCase()} this Term.`,
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
                ? route("admin.term.update", term.id)
                : route("admin.term.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response.data.success) {
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
        <Modal show={show} onHide={onHide} size="md" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Term" : "Create Term"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="mb-3">
                        <Col>
                            <Form.Control
                                placeholder="Term Name (e.g. Term 1)"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Select
                                options={academicYears.map((y) => ({
                                    value: y.id,
                                    label: y.name,
                                }))}
                                value={
                                    academicYears.find(
                                        (y) => y.id === data.academic_year_id
                                    )
                                        ? {
                                              value: data.academic_year_id,
                                              label: academicYears.find(
                                                  (y) =>
                                                      y.id ===
                                                      data.academic_year_id
                                              ).name,
                                          }
                                        : null
                                }
                                onChange={(val) =>
                                    setData(
                                        "academic_year_id",
                                        val?.value || ""
                                    )
                                }
                                placeholder="Select Academic Year"
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
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
                            ? isEditing
                                ? "Updating..."
                                : "Saving..."
                            : isEditing
                            ? "Update"
                            : "Save"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
