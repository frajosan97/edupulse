import { useEffect, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Select from "react-select";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

/* --------------------------------------------------------------
 | Exam code generator
 * -------------------------------------------------------------- */
const generateExamCode = () => {
    const timestamp = Date.now();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    return (
        "EX-" +
        timestamp +
        "-" +
        Array.from({ length: 3 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join("")
    );
};

export default function ExamCreateModal({
    show,
    onHide,
    exam = null,
    terms = [],
    classes = [],
    streams = [],
}) {
    const isEditing = Boolean(exam);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset } = useForm({
        name: "",
        code: generateExamCode(),
        term_id: "",
        start_date: "",
        end_date: "",
        max_score: 100,
        is_active: true,
        class_ids: [],
        stream_ids: [],
    });

    /* --------------------------------------------------------------
     | Select options (memoized)
     * -------------------------------------------------------------- */
    const termOptions = useMemo(
        () => terms.map((t) => ({ value: t.id, label: t.name })),
        [terms]
    );

    const classOptions = useMemo(
        () => classes.map((c) => ({ value: c.id, label: c.name })),
        [classes]
    );

    const streamOptions = useMemo(
        () => streams.map((s) => ({ value: s.id, label: s.name })),
        [streams]
    );

    /* --------------------------------------------------------------
     | Sync form when editing
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (isEditing) {
            setData({
                name: exam.name ?? "",
                code: exam.code ?? generateExamCode(),
                term_id: exam.term_id ?? "",
                start_date: exam.start_date
                    ? exam.start_date.split("T")[0]
                    : "",
                end_date: exam.end_date ? exam.end_date.split("T")[0] : "",
                max_score: exam.max_score ?? 100,
                is_active: exam.is_active ?? true,
                class_ids: exam.classes?.map((c) => c.id) ?? [],
                stream_ids: exam.streams?.map((s) => s.id) ?? [],
            });
        } else {
            reset();
            setData("code", generateExamCode());
        }
    }, [exam, isEditing]);

    /* --------------------------------------------------------------
     | Submit handler
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Exam`,
                text: `Confirm to ${action.toLowerCase()} this exam.`,
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
                ? route("admin.exam.update", exam.id)
                : route("admin.exam.store");

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
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Exam" : "Create Exam"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Code & Name */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                value={data.code}
                                disabled
                                className="bg-light"
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                placeholder="Exam Name (e.g. Midterm Exam)"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                            />
                        </Col>
                    </Row>

                    {/* Term / Classes / Streams */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Select
                                options={termOptions}
                                value={termOptions.find(
                                    (o) => o.value === data.term_id
                                )}
                                onChange={(opt) =>
                                    setData("term_id", opt?.value || "")
                                }
                                placeholder="Select Term"
                                isClearable
                            />
                        </Col>

                        <Col md={4}>
                            <Select
                                isMulti
                                options={classOptions}
                                value={classOptions.filter((o) =>
                                    data.class_ids.includes(o.value)
                                )}
                                onChange={(opts) =>
                                    setData(
                                        "class_ids",
                                        opts.map((o) => o.value)
                                    )
                                }
                                placeholder="Assign to Classes"
                            />
                        </Col>

                        <Col md={4}>
                            <Select
                                isMulti
                                options={streamOptions}
                                value={streamOptions.filter((o) =>
                                    data.stream_ids.includes(o.value)
                                )}
                                onChange={(opts) =>
                                    setData(
                                        "stream_ids",
                                        opts.map((o) => o.value)
                                    )
                                }
                                placeholder="Assign to Streams"
                            />
                        </Col>
                    </Row>

                    {/* Dates */}
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

                    {/* Max Score */}
                    <Row className="mb-3">
                        <Col>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={data.max_score}
                                onChange={(e) =>
                                    setData("max_score", e.target.value)
                                }
                                required
                            />
                        </Col>
                    </Row>

                    {/* Active */}
                    <Form.Check
                        type="switch"
                        label="Active"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
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
                        variant="primary"
                        type="submit"
                        disabled={processing}
                    >
                        {processing
                            ? `${isEditing ? "Updating" : "Saving"}...`
                            : isEditing
                            ? "Update"
                            : "Save"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
