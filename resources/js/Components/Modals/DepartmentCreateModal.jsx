import { useEffect } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { useForm } from "@inertiajs/react";
import { FaBuilding, FaCode } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function DepartmentCreateModal({
    show,
    onHide,
    department = null,
}) {
    const isEditing = Boolean(department);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset } = useForm({
        name: "",
        code: "",
        description: "",
        is_active: true,
    });

    /* --------------------------------------------------------------
     | Sync form when editing
     * -------------------------------------------------------------- */
    useEffect(() => {
        if (isEditing) {
            setData({
                name: department.name ?? "",
                code: department.code ?? "",
                description: department.description ?? "",
                is_active: department.is_active ?? true,
            });
        } else {
            reset();
        }
    }, [department, isEditing]);

    /* --------------------------------------------------------------
     | Submit handler
     * -------------------------------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Department`,
                text: `Confirm to ${action.toLowerCase()} this department.`,
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
                ? route("admin.department.update", department.id)
                : route("admin.department.store");

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
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Department" : "Create Department"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Department Name */}
                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FaBuilding />
                        </InputGroup.Text>

                        <Form.Control
                            placeholder="Department Name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                    </InputGroup>

                    {/* Department Code */}
                    <InputGroup className="mb-3">
                        <InputGroup.Text>
                            <FaCode />
                        </InputGroup.Text>

                        <Form.Control
                            placeholder="Code"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            required
                        />
                    </InputGroup>

                    {/* Description */}
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Description"
                        className="mb-3"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />

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
                        type="submit"
                        variant="primary"
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
