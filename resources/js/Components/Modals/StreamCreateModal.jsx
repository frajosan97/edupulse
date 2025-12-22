import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { FaStream, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

/* -------------------------------------------------
 | Helpers
 -------------------------------------------------*/
const getInitialForm = (stream = null) => ({
    name: stream?.name ?? "",
    active: stream?.active ?? true,
});

/* -------------------------------------------------
 | Component
 -------------------------------------------------*/
export default function StreamCreateModal({
    stream = null,
    show,
    handleClose,
}) {
    const isEditing = Boolean(stream);
    const { showErrorToast } = useErrorToast();

    const { data, setData, processing, reset, errors } = useForm(
        getInitialForm(stream)
    );

    /* -------------------------------------------------
     | Sync form when modal opens or editing
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;
        setData(getInitialForm(isEditing ? stream : null));
    }, [show, isEditing, stream, setData]);

    /* -------------------------------------------------
     | Handle form changes
     -------------------------------------------------*/
    const handleChange = ({ target }) => {
        const { name, value, type, checked } = target;
        setData(name, type === "checkbox" ? checked : value);
    };

    /* -------------------------------------------------
     | Submit handler
     -------------------------------------------------*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Stream`,
                text: `Confirm to ${action.toLowerCase()} this stream.`,
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
                ? route("admin.stream.update", stream.id)
                : route("admin.stream.store");

            const response = isEditing
                ? await xios.put(url, data)
                : await xios.post(url, data);

            if (response?.data?.success !== false) {
                toast.success(
                    response?.data?.message ||
                        `Stream ${action.toLowerCase()}d successfully!`
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

    /* -------------------------------------------------
     | Render
     -------------------------------------------------*/
    return (
        <Modal show={show} onHide={handleClose} size="md" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaStream className="me-2" />
                        {isEditing ? "Update Stream" : "Create Stream"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Stream Name</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaStream />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Enter stream name"
                                value={data.name}
                                onChange={handleChange}
                                isInvalid={!!errors.name}
                                name="name"
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="active"
                            label="Active"
                            checked={data.active}
                            onChange={handleChange}
                            name="active"
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
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
                        <FaCheckCircle className="me-2" />
                        {isEditing ? "Update Stream" : "Create Stream"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
