import { useEffect, useState } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";

/* -------------------------------------------------
 | Helpers
 -------------------------------------------------*/
const getInitialForm = (item = null) => ({
    parent_id: item?.parent_id ?? "",
    icon: item?.icon ?? "",
    label: item?.label ?? "",
    path: item?.path ?? "",
    route_name: item?.route_name ?? "",
    route_parameters: JSON.stringify(item?.route_parameters ?? {}),
    order: item?.order ?? 0,
    is_active: item?.is_active ?? true,
});

/* -------------------------------------------------
 | Component
 -------------------------------------------------*/
export default function NavbarItemModal({
    show,
    onHide,
    item = null,
    navbarId,
    onSuccess,
}) {
    const isEditing = Boolean(item);
    const { showErrorToast } = useErrorToast();

    const [form, setForm] = useState(getInitialForm());
    const [parents, setParents] = useState([]);

    /* -------------------------------------------------
     | Load parent items
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;

        const fetchParents = async () => {
            try {
                const res = await xios.get(
                    route("admin.navbar-items.parents", {
                        navbar: navbarId,
                    })
                );
                setParents(res.data || []);
            } catch {
                setParents([]);
            }
        };

        fetchParents();
    }, [show, navbarId]);

    /* -------------------------------------------------
     | Sync form on open / edit
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;
        setForm(getInitialForm(isEditing ? item : null));
    }, [show, isEditing, item]);

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
                title: `${action} Navbar Item`,
                text: `Confirm to ${action.toLowerCase()} this navbar item.`,
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

            const payload = {
                ...form,
                navbar_id: navbarId,
            };

            const url = isEditing
                ? route("admin.navbar-items.update", item.id)
                : route("admin.navbar-items.store");

            const response = isEditing
                ? await xios.put(url, payload)
                : await xios.post(url, payload);

            if (response?.data?.success !== false) {
                toast.success(
                    response?.data?.message ||
                        `Item ${action.toLowerCase()}d successfully`
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
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Edit Navbar Item" : "New Navbar Item"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Parent Item</Form.Label>
                                <Form.Select
                                    name="parent_id"
                                    value={form.parent_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- None --</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Label</Form.Label>
                                <Form.Control
                                    name="label"
                                    value={form.label}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Icon (class)</Form.Label>
                                <Form.Control
                                    name="icon"
                                    value={form.icon}
                                    onChange={handleChange}
                                    placeholder="e.g. bi bi-house"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Path</Form.Label>
                                <Form.Control
                                    name="path"
                                    value={form.path}
                                    onChange={handleChange}
                                    placeholder="/dashboard"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Route Name</Form.Label>
                                <Form.Control
                                    name="route_name"
                                    value={form.route_name}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Route Parameters (JSON)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="route_parameters"
                                    value={form.route_parameters}
                                    onChange={handleChange}
                                    placeholder='{"id":1}'
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Order</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="order"
                                    value={form.order}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mt-4">
                                <Form.Check
                                    type="checkbox"
                                    label="Active"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
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
