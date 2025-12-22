import { useState } from "react";
import {
    Button,
    ButtonGroup,
    Col,
    Form,
    ListGroup,
    Row,
} from "react-bootstrap";
import { FaSync } from "react-icons/fa";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import xios from "@/Utils/xios";
import { useRolePermissions } from "@/Hooks/useRolePermissions";

const SubjectsTab = ({ student, subjects }) => {
    const { firstRole } = useRolePermissions();

    // Extract enrolled subject IDs
    const enrolledSubjectIds = student.student.subjects.map((s) =>
        typeof s === "object" ? s.id : s
    );

    const [selectedSubjects, setSelectedSubjects] = useState(
        new Set(enrolledSubjectIds)
    );

    const toggleSubject = (id) => {
        setSelectedSubjects((prev) => {
            const updated = new Set(prev);
            updated.has(id) ? updated.delete(id) : updated.add(id);
            return updated;
        });
    };

    const handleSync = async () => {
        const confirmResult = await Swal.fire({
            title: "Sync Subjects?",
            text: "Are you sure you want to sync subjects?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!confirmResult.isConfirmed) return;

        Swal.fire({
            title: "Syncing...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await xios.post(
                route(`${firstRole?.name}.subjects.sync`, student.student.id),
                { subjects: Array.from(selectedSubjects) }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                router.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            Swal.close();
        }
    };

    return (
        <Row>
            <Col
                md={12}
                className="d-flex justify-content-between align-items-center"
            >
                <h5 className="mb-0">
                    Subjects Enrolled ({selectedSubjects.size})
                </h5>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleSync}
                    >
                        <FaSync className="me-2" />
                        Update Changes
                    </Button>
                </ButtonGroup>
            </Col>

            <Col md={12}>
                <hr className="dashed-hr" />
                <ListGroup variant="flush">
                    {subjects.map((subject) => {
                        const isChecked = selectedSubjects.has(subject.id);

                        return (
                            <ListGroup.Item
                                key={subject.id}
                                className={`d-flex w-100 justify-content-between align-items-center ${
                                    isChecked ? "bg-success" : "bg-danger"
                                } bg-opacity-10`}
                            >
                                <div className="d-flex w-100 align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        id={`subject-${subject.id}`}
                                        checked={isChecked}
                                        onChange={() =>
                                            toggleSubject(subject.id)
                                        }
                                    />
                                    <span className="ms-3">
                                        <h6 className="m-0">
                                            {subject.code} {subject.name}
                                        </h6>
                                        <small className="text-muted">
                                            {subject.subject_group?.name}
                                        </small>
                                    </span>
                                </div>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Col>
        </Row>
    );
};

export default SubjectsTab;
