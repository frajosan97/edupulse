import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

/* -------------------------------------------------
 | Helpers
 -------------------------------------------------*/
const getInitialForm = (navbar = null) => ({
    name: navbar?.name ?? "",
    slug: navbar?.slug ?? "",
    description: navbar?.description ?? "",
    is_active: navbar?.is_active ?? true,
});

/* -------------------------------------------------
 | Component
 -------------------------------------------------*/
export default function NavbarModal({
    show,
    onHide,
    navbar = null,
    onSuccess,
}) {
    const isEditing = Boolean(navbar);
    const { showErrorToast } = useErrorToast();

    const [form, setForm] = useState(getInitialForm());

    /* -------------------------------------------------
     | Sync form on open / edit
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;
        setForm(getInitialForm(isEditing ? navbar : null));
    }, [show, isEditing, navbar]);

    /* -------------------------------------------------
     | Handlers
     -------------------------------------------------*/
    const handleChange = ({ target }) => {
        const { name, value, type, checked } = target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = isEditing ? "Update" : "Create";

        try {
            const confirm = await Swal.fire({
                title: `${action} Navbar`,
                text: `Confirm to ${action.toLowerCase()} this navbar.`,
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
                ? route("admin.navbar.update", navbar.id)
                : route("admin.navbar.store");

            const response = isEditing
                ? await xios.put(url, form)
                : await xios.post(url, form);

            if (response?.data?.success !== false) {
                toast.success(
                    response?.data?.message ||
                        `Navbar ${action.toLowerCase()}d successfully`
                );
                onSuccess?.();
                onHide();
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
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Navbar" : "New Navbar"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Active"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        {isEditing ? "Update" : "Save"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
