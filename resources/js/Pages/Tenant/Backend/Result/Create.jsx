import { useState } from "react";
import { Head } from "@inertiajs/react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/Hooks/useErrorToast";

// Bootstrap
import {
    Card,
    Col,
    Row,
    FormCheck,
    Button,
    ButtonGroup,
    Table,
    FormControl,
    InputGroup,
    Form,
} from "react-bootstrap";

// Icons
import { BiArrowBack, BiSave } from "react-icons/bi";
import { Download } from "react-bootstrap-icons";

// External libs
import Select from "react-select";
import Swal from "sweetalert2";

// Custom
import xios from "@/Utils/xios";
import PortalLayout from "@/Layouts/PortalLayout";

export default function MarksEntry({ classes, subjects }) {
    const { showErrorToast } = useErrorToast();

    // State
    const [examType] = useState("normal");
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStream, setSelectedStream] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [streamOptions, setStreamOptions] = useState([]);
    const [entryListData, setEntryListData] = useState(null);
    const [scores, setScores] = useState({});

    // Toggles
    const [hasP1, setHasP1] = useState(false);
    const [hasP2, setHasP2] = useState(false);
    const [hasP3, setHasP3] = useState(false);

    // Out-of values
    const [outOfScore, setOutOfScore] = useState(100);
    const [outOfP1, setOutOfP1] = useState(100);
    const [outOfP2, setOutOfP2] = useState(100);
    const [outOfP3, setOutOfP3] = useState(100);

    /** 🔹 Handle Class Change */
    const handleClassChange = (selected) => {
        setSelectedClass(selected);
        setSelectedStream(null);

        const cls = classes.find((c) => c.id === selected?.value);
        setStreamOptions(
            cls?.class_streams?.map((s) => ({
                value: s.id,
                label: s.stream?.name,
            })) || []
        );
    };

    /** 🔹 Reset form */
    const handleReset = () => {
        setSelectedClass(null);
        setSelectedStream(null);
        setSelectedSubject(null);
        setStreamOptions([]);
        setEntryListData(null);
        setScores({});
    };

    /** 🔹 Fetch Students */
    const handleSubmit = async () => {
        if (!selectedClass) return toast.warning("Please select a class.");
        if (!selectedSubject) return toast.warning("Please select a subject.");

        const payload = {
            examType,
            classId: selectedClass?.value,
            streamId: selectedStream?.value,
            subjectId: selectedSubject?.value,
        };

        try {
            Swal.fire({
                title: "Processing...",
                text: "Please wait while we process your request.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const { data } = await xios.post(
                route("admin.result.request"),
                payload
            );

            if (!data.success)
                return toast.error("Error occurred while fetching marks list.");

            toast.success(data.message);
            setEntryListData(data.data);

            // Initialize scores
            const initialScores = {};
            data.data.students.forEach((st) => {
                initialScores[st.id] = {
                    score: st.result?.score || "",
                    P1: st.result?.P1 || "",
                    P2: st.result?.P2 || "",
                    P3: st.result?.P3 || "",
                };
            });
            setScores(initialScores);

            // Restore "outOf" values if editing
            if (data.data.students.some((st) => st.result)) {
                const first = data.data.students[0].result;
                setOutOfScore(first?.score_outof || 100);
                setOutOfP1(first?.P1_outof || 100);
                setOutOfP2(first?.P2_outof || 100);
                setOutOfP3(first?.P3_outof || 100);
            }

            // Auto-detect if P1, P2, P3 exist
            setHasP1(
                (prev) =>
                    prev ||
                    data.data.students.some(
                        (st) => parseFloat(st.result?.P1) > 0
                    )
            );
            setHasP2(
                (prev) =>
                    prev ||
                    data.data.students.some(
                        (st) => parseFloat(st.result?.P2) > 0
                    )
            );
            setHasP3(
                (prev) =>
                    prev ||
                    data.data.students.some(
                        (st) => parseFloat(st.result?.P3) > 0
                    )
            );
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    /** 🔹 Score Change */
    const handleScoreChange = (studentId, field, value) => {
        const updated = {
            ...scores,
            [studentId]: { ...scores[studentId], [field]: value },
        };

        if (hasP1 || hasP2 || hasP3) {
            const parts = [
                hasP1
                    ? (parseFloat(updated[studentId].P1) || 0) * (100 / outOfP1)
                    : 0,
                hasP2
                    ? (parseFloat(updated[studentId].P2) || 0) * (100 / outOfP2)
                    : 0,
                hasP3
                    ? (parseFloat(updated[studentId].P3) || 0) * (100 / outOfP3)
                    : 0,
            ];

            const active = [hasP1, hasP2, hasP3].filter(Boolean).length;

            updated[studentId].score = (
                (parts.reduce((a, b) => a + b, 0) / active) *
                (outOfScore / 100)
            ).toFixed(2);
        }

        setScores(updated);
    };

    /** 🔹 Save Marks */
    const handleSave = async () => {
        if (!entryListData)
            return toast.warning("No marks entry list to save.");

        const confirm = await Swal.fire({
            title: "Save Marks?",
            text: "Do you want to submit the entered marks?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#198754",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Save",
        });

        if (!confirm.isConfirmed) return;

        try {
            Swal.fire({
                title: "Submitting...",
                text: "Please wait while we save marks.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const payload = {
                examId: entryListData.exam.id,
                classId: selectedClass?.value,
                streamId: selectedStream?.value,
                subjectId: selectedSubject?.value,
                scores,
                outOf: {
                    score: outOfScore,
                    P1: hasP1 ? outOfP1 : null,
                    P2: hasP2 ? outOfP2 : null,
                    P3: hasP3 ? outOfP3 : null,
                },
            };

            const { data } = await xios.post(
                route("admin.result.store"),
                payload
            );

            data.success
                ? toast.success(data.message || "Marks saved successfully!")
                : toast.error(data.message || "Failed to save marks.");
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    return (
        <PortalLayout>
            <Head title="Exam Marks Entry" />

            <Row>
                <Col md={12}>
                    {entryListData ? (
                        <Card>
                            <Card.Body>
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        {entryListData.exam.name}
                                    </h5>
                                    <ButtonGroup className="gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            as="a"
                                            href={route("admin.result.create")}
                                        >
                                            <BiArrowBack className="me-1" />
                                            Back
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-success"
                                            onClick={handleSave}
                                        >
                                            <BiSave className="me-1" />
                                            Save
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                <hr className="dashed-hr" />

                                {/* Toggles */}
                                <div className="bg-light border rounded p-2 mb-3">
                                    <Row className="g-2">
                                        {[
                                            {
                                                label: "Paper 1",
                                                state: hasP1,
                                                set: setHasP1,
                                                outOf: outOfP1,
                                                setOutOf: setOutOfP1,
                                            },
                                            {
                                                label: "Paper 2",
                                                state: hasP2,
                                                set: setHasP2,
                                                outOf: outOfP2,
                                                setOutOf: setOutOfP2,
                                            },
                                            {
                                                label: "Paper 3",
                                                state: hasP3,
                                                set: setHasP3,
                                                outOf: outOfP3,
                                                setOutOf: setOutOfP3,
                                            },
                                        ].map(
                                            (
                                                {
                                                    label,
                                                    state,
                                                    set,
                                                    outOf,
                                                    setOutOf,
                                                },
                                                i
                                            ) => (
                                                <Col md={4} key={i}>
                                                    <InputGroup className="border rounded">
                                                        <InputGroup.Text className="bg-light border-0">
                                                            <FormCheck
                                                                type="checkbox"
                                                                label={`Has ${label}`}
                                                                checked={state}
                                                                onChange={() =>
                                                                    set(!state)
                                                                }
                                                                className="m-0"
                                                            />
                                                        </InputGroup.Text>
                                                        {state && (
                                                            <>
                                                                <InputGroup.Text className="bg-light border-0">
                                                                    /
                                                                </InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    min={1}
                                                                    value={
                                                                        outOf
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setOutOf(
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                100
                                                                        )
                                                                    }
                                                                    className="bg-light border-0 text-center fw-semibold"
                                                                />
                                                            </>
                                                        )}
                                                    </InputGroup>
                                                </Col>
                                            )
                                        )}
                                    </Row>
                                </div>

                                {/* Table */}
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Adm</th>
                                            <th>Name</th>
                                            {hasP1 && (
                                                <th>Paper 1 ({outOfP1})</th>
                                            )}
                                            {hasP2 && (
                                                <th>Paper 2 ({outOfP2})</th>
                                            )}
                                            {hasP3 && (
                                                <th>Paper 3 ({outOfP3})</th>
                                            )}
                                            <th>
                                                <InputGroup className="border-0">
                                                    <InputGroup.Text className="bg-transparent border-0 fw-semibold">
                                                        Score ({outOfScore})
                                                    </InputGroup.Text>
                                                    {!hasP1 &&
                                                        !hasP2 &&
                                                        !hasP3 && (
                                                            <FormControl
                                                                type="number"
                                                                value={
                                                                    outOfScore
                                                                }
                                                                onChange={(e) =>
                                                                    setOutOfScore(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 100
                                                                    )
                                                                }
                                                                className="bg-light border-0 fw-semibold p-0 ps-2"
                                                            />
                                                        )}
                                                </InputGroup>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entryListData.students.map((st) => (
                                            <tr key={st.id}>
                                                <td>{st.admission_number}</td>
                                                <td>{st.user.full_name}</td>
                                                {["P1", "P2", "P3"].map(
                                                    (p) =>
                                                        ((p === "P1" &&
                                                            hasP1) ||
                                                            (p === "P2" &&
                                                                hasP2) ||
                                                            (p === "P3" &&
                                                                hasP3)) && (
                                                            <td key={p}>
                                                                <FormControl
                                                                    size="sm"
                                                                    type="number"
                                                                    value={
                                                                        scores[
                                                                            st
                                                                                .id
                                                                        ]?.[
                                                                            p
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleScoreChange(
                                                                            st.id,
                                                                            p,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        )
                                                )}
                                                <td>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        value={
                                                            scores[st.id]
                                                                ?.score || ""
                                                        }
                                                        readOnly={
                                                            hasP1 ||
                                                            hasP2 ||
                                                            hasP3
                                                        }
                                                        onChange={(e) =>
                                                            handleScoreChange(
                                                                st.id,
                                                                "score",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        Request marks entry list
                                    </h5>
                                </div>

                                <hr className="dashed-hr" />

                                <Row className="g-3">
                                    <Col md={3}>
                                        <Select
                                            options={classes?.map(
                                                ({ id, name }) => ({
                                                    value: id,
                                                    label: name,
                                                })
                                            )}
                                            placeholder="Select class"
                                            onChange={handleClassChange}
                                            value={selectedClass}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Select
                                            options={streamOptions}
                                            placeholder="Select stream"
                                            value={selectedStream}
                                            onChange={setSelectedStream}
                                            isDisabled={!streamOptions.length}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Select
                                            options={subjects?.map(
                                                ({ id, name }) => ({
                                                    value: id,
                                                    label: name,
                                                })
                                            )}
                                            placeholder="Select subject"
                                            value={selectedSubject}
                                            onChange={setSelectedSubject}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <ButtonGroup className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={handleSubmit}
                                            >
                                                <Download className="me-1" />
                                                Get
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={handleReset}
                                            >
                                                Reset
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </PortalLayout>
    );
}
