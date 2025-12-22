import { Head, Link, router } from "@inertiajs/react";
import PortalLayout from "@/Layouts/PortalLayout";
import {
    Button,
    Card,
    Col,
    Form,
    Row,
    Tab,
    Nav,
    Spinner,
    Badge,
    Image,
    Container,
    ButtonGroup,
} from "react-bootstrap";
import {
    FaUser,
    FaUserShield,
    FaSave,
    FaArrowLeft,
    FaImage,
    FaCheckCircle,
    FaChevronRight,
    FaChevronLeft,
    FaLock,
    FaSignature,
} from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import useTenantData from "@/Hooks/useTenantData";

const TABS = [
    {
        key: "personal",
        label: "Personal Details",
        icon: <FaUser />,
        color: "#4f46e5",
    },
    {
        key: "status",
        label: "Status",
        icon: <FaUserShield />,
        color: "#7c3aed",
    },
];

const DEFAULT_STAFF_DATA = {
    token: "",
    first_name: "",
    last_name: "",
    other_name: "",
    email: "",
    email_verified_at: "",
    profile_image: null,
    signature: null,
    phone: "",
    gender: "",
    is_active: true,
    password: "",
    password_confirmation: "",
    role: "",
    department_id: null,
};

const validationSchema = Yup.object({
    first_name: Yup.string()
        .required("First name is required")
        .min(3, "Minimum 3 characters"),
    last_name: Yup.string()
        .required("Last name is required")
        .min(3, "Minimum 3 characters"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .required("Phone number is required")
        .min(10, "Minimum 10 characters"),
    gender: Yup.string().oneOf(
        ["male", "female", "other"],
        "Invalid gender selection"
    ),
    role: Yup.string().required("Role is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .when("$isEdit", (isEdit, schema) =>
            isEdit ? schema : schema.required("Password is required")
        ),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .when("$isEdit", (isEdit, schema) =>
            isEdit ? schema : schema.required("Confirm password is required")
        ),
});

export default function StaffForm({ staff = null, departments = [] }) {
    const { roles } = useTenantData();
    const { showErrorToast } = useErrorToast();
    const isEdit = !!staff;
    const [activeKey, setActiveKey] = useState("personal");
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(
        staff?.profile_image_url || null
    );
    const [signaturePreview, setSignaturePreview] = useState(
        staff?.signature_url || null
    );

    const formik = useFormik({
        initialValues: isEdit
            ? {
                  ...DEFAULT_STAFF_DATA,
                  ...staff,
                  password: "",
                  password_confirmation: "",
              }
            : DEFAULT_STAFF_DATA,
        validationSchema: validationSchema,
        enableReinitialize: true,
        context: { isEdit },
        onSubmit: async (values) => {
            const action = isEdit ? "Update" : "Create";

            try {
                const confirm = await Swal.fire({
                    title: `${action} Staff`,
                    text: `Confirm to ${action.toLowerCase()} this staff.`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "Cancel",
                    reverseButtons: true,
                });

                if (!confirm.isConfirmed) return;

                // Show processing Swal
                Swal.fire({
                    title: "Please wait...",
                    text: `${action} in progress`,
                    icon: "info",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading(),
                });

                const formData = new FormData();
                for (const key in values) {
                    // if (key === "password_confirmation") continue;
                    if (values[key] !== null && values[key] !== undefined) {
                        formData.append(key, values[key]);
                    }
                }

                const url = isEdit
                    ? route("admin.staff.update", staff.id)
                    : route("admin.staff.store");

                const method = isEdit ? "post" : "post";
                if (isEdit) formData.append("_method", "PUT");

                const response = await axios[method](url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success(
                    isEdit
                        ? "Staff updated successfully!"
                        : "Staff created successfully!"
                );

                router.visit(route("admin.staff.index"));
            } catch (error) {
                showErrorToast(error);
            } finally {
                Swal.close();
            }
        },
    });

    const handlePhotoChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profile_image", file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("signature", file);
            setSignaturePreview(URL.createObjectURL(file));
        }
    };

    const isFirstTab = activeKey === TABS[0].key;
    const isLastTab = activeKey === TABS[TABS.length - 1].key;

    const handleNext = useCallback(() => {
        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index < TABS.length - 1) setActiveKey(TABS[index + 1].key);
    }, [activeKey]);

    const handlePrevious = useCallback(() => {
        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index > 0) setActiveKey(TABS[index - 1].key);
    }, [activeKey]);

    const renderStatusBadge = useCallback(
        () =>
            formik.values.is_active ? (
                <Badge bg="success" className="fs-6 px-3 py-2">
                    <FaCheckCircle className="me-1" />
                    Active
                </Badge>
            ) : (
                <Badge bg="secondary" className="fs-6 px-3 py-2">
                    Inactive
                </Badge>
            ),
        [formik.values.is_active]
    );

    const currentTab = TABS.find((tab) => tab.key === activeKey);
    const pageTitle = isEdit ? `Edit ${staff?.full_name}` : "Create New Staff";

    return (
        <PortalLayout>
            <Head title={pageTitle} />

            {/* Header */}
            <Container fluid className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="m-0 text-capitalize">{pageTitle}</h2>
                    <ButtonGroup>
                        <Link
                            href={route("admin.staff.index")}
                            className="btn btn-outline-primary"
                        >
                            <FaArrowLeft className="me-2" />
                            Back to Staff
                        </Link>
                    </ButtonGroup>
                </div>
                <hr className="dashed-hr mt-2" />
            </Container>

            <Container fluid>
                <Form
                    onSubmit={formik.handleSubmit}
                    encType="multipart/form-data"
                >
                    <Tab.Container
                        activeKey={activeKey}
                        onSelect={setActiveKey}
                    >
                        {/* Tabs Navigation at the Top */}
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white border-0 pb-0">
                                <Nav variant="tabs" className="border-0">
                                    {TABS.map(({ key, label, icon, color }) => (
                                        <Nav.Item key={key}>
                                            <Nav.Link
                                                eventKey={key}
                                                className={`px-4 py-3 rounded-0 border-0 ${
                                                    activeKey === key
                                                        ? "border-bottom-3"
                                                        : ""
                                                }`}
                                                style={{
                                                    color:
                                                        activeKey === key
                                                            ? color
                                                            : "#6b7280",
                                                    fontWeight:
                                                        activeKey === key
                                                            ? "600"
                                                            : "400",
                                                    borderBottom:
                                                        activeKey === key
                                                            ? `3px solid ${color}`
                                                            : "3px solid transparent",
                                                    backgroundColor:
                                                        "transparent",
                                                }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="me-2"
                                                        style={{
                                                            color:
                                                                activeKey ===
                                                                key
                                                                    ? color
                                                                    : "#9ca3af",
                                                        }}
                                                    >
                                                        {icon}
                                                    </div>
                                                    <span>{label}</span>
                                                </div>
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Card.Header>

                            <Card.Body>
                                <Tab.Content>
                                    {/* PERSONAL DETAILS */}
                                    <Tab.Pane eventKey="personal">
                                        <Row className="g-4">
                                            <Col md={4} lg={3}>
                                                <Card className="border-0 bg-light">
                                                    <Card.Body className="text-center p-4">
                                                        <div className="mb-3">
                                                            {photoPreview ? (
                                                                <Image
                                                                    src={
                                                                        photoPreview
                                                                    }
                                                                    roundedCircle
                                                                    fluid
                                                                    className="border shadow-sm"
                                                                    style={{
                                                                        width: 120,
                                                                        height: 120,
                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="border rounded-circle d-flex justify-content-center align-items-center bg-white mx-auto"
                                                                    style={{
                                                                        width: 120,
                                                                        height: 120,
                                                                    }}
                                                                >
                                                                    <FaImage
                                                                        size={
                                                                            50
                                                                        }
                                                                        className="text-muted"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Form.Group>
                                                            <Form.Label
                                                                className="btn btn-outline-primary btn-sm w-100 cursor-pointer mb-0"
                                                                htmlFor="profile_image"
                                                            >
                                                                <FaImage className="me-2" />
                                                                {photoPreview
                                                                    ? "Change Photo"
                                                                    : "Upload Photo"}
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="profile_image"
                                                                name="profile_image"
                                                                accept="image/*"
                                                                onChange={
                                                                    handlePhotoChange
                                                                }
                                                                className="d-none"
                                                            />
                                                        </Form.Group>
                                                        <div className="small text-muted mt-2">
                                                            JPG, PNG or GIF. Max
                                                            2MB.
                                                        </div>

                                                        <div className="mt-4">
                                                            {signaturePreview ? (
                                                                <Image
                                                                    src={
                                                                        signaturePreview
                                                                    }
                                                                    fluid
                                                                    className="border shadow-sm"
                                                                    style={{
                                                                        width: 150,
                                                                        height: 80,
                                                                        objectFit:
                                                                            "contain",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="border d-flex justify-content-center align-items-center bg-white mx-auto"
                                                                    style={{
                                                                        width: 150,
                                                                        height: 80,
                                                                    }}
                                                                >
                                                                    <FaSignature
                                                                        size={
                                                                            30
                                                                        }
                                                                        className="text-muted"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Form.Group className="mt-2">
                                                            <Form.Label
                                                                className="btn btn-outline-secondary btn-sm w-100 cursor-pointer mb-0"
                                                                htmlFor="signature"
                                                            >
                                                                <FaSignature className="me-2" />
                                                                {signaturePreview
                                                                    ? "Change Signature"
                                                                    : "Upload Signature"}
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="signature"
                                                                name="signature"
                                                                accept="image/*"
                                                                onChange={
                                                                    handleSignatureChange
                                                                }
                                                                className="d-none"
                                                            />
                                                        </Form.Group>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={8} lg={9}>
                                                <Row className="g-3">
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Surname *
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="last_name"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .last_name
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .last_name &&
                                                                    !!formik
                                                                        .errors
                                                                        .last_name
                                                                }
                                                                placeholder="Enter surname"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .last_name
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                First Name *
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="first_name"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .first_name
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .first_name &&
                                                                    !!formik
                                                                        .errors
                                                                        .first_name
                                                                }
                                                                placeholder="Enter first name"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .first_name
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Other Name
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="other_name"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .other_name
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .other_name &&
                                                                    !!formik
                                                                        .errors
                                                                        .other_name
                                                                }
                                                                placeholder="Enter other name"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .other_name
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Email Address *
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                name="email"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .email
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .email &&
                                                                    !!formik
                                                                        .errors
                                                                        .email
                                                                }
                                                                placeholder="staff@example.com"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .email
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Phone Number *
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="phone"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .phone
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .phone &&
                                                                    !!formik
                                                                        .errors
                                                                        .phone
                                                                }
                                                                placeholder="+254 XXX XXX XXX"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .phone
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Gender
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="gender"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .gender
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .gender &&
                                                                    !!formik
                                                                        .errors
                                                                        .gender
                                                                }
                                                                className="py-2"
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    Gender
                                                                </option>
                                                                <option value="male">
                                                                    Male
                                                                </option>
                                                                <option value="female">
                                                                    Female
                                                                </option>
                                                                <option value="other">
                                                                    Other
                                                                </option>
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .gender
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Department
                                                            </Form.Label>
                                                            <Select
                                                                name="department_id"
                                                                options={departments.map(
                                                                    (dept) => ({
                                                                        value: dept.id,
                                                                        label: dept.name,
                                                                    })
                                                                )}
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .department_id
                                                                        ? {
                                                                              value: formik
                                                                                  .values
                                                                                  .department_id,
                                                                              label: departments.find(
                                                                                  (
                                                                                      d
                                                                                  ) =>
                                                                                      d.id ===
                                                                                      formik
                                                                                          .values
                                                                                          .department_id
                                                                              )
                                                                                  ?.name,
                                                                          }
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    selected
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "department_id",
                                                                        selected?.value ||
                                                                            null
                                                                    )
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                placeholder="Select department"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                Role *
                                                            </Form.Label>
                                                            <Select
                                                                name="role"
                                                                options={roles.map(
                                                                    (role) => ({
                                                                        value: role.name,
                                                                        label: role.name,
                                                                    })
                                                                )}
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .role
                                                                        ? {
                                                                              value: formik
                                                                                  .values
                                                                                  .role,
                                                                              label: formik
                                                                                  .values
                                                                                  .role,
                                                                          }
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    selected
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "role",
                                                                        selected?.value ||
                                                                            ""
                                                                    )
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .role &&
                                                                    !!formik
                                                                        .errors
                                                                        .role
                                                                }
                                                                placeholder="Select staff role"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                            />
                                                            {formik.touched
                                                                .role &&
                                                                formik.errors
                                                                    .role && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .role
                                                                        }
                                                                    </div>
                                                                )}
                                                        </Form.Group>
                                                    </Col>

                                                    {/* Password fields moved here for new staff */}
                                                    {!isEdit && (
                                                        <>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Password
                                                                        *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="password"
                                                                        name="password"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .password
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .password &&
                                                                            !!formik
                                                                                .errors
                                                                                .password
                                                                        }
                                                                        placeholder="Enter password"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .password
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-semibold">
                                                                        Confirm
                                                                        Password
                                                                        *
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="password"
                                                                        name="password_confirmation"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .password_confirmation
                                                                        }
                                                                        onChange={
                                                                            formik.handleChange
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        isInvalid={
                                                                            formik
                                                                                .touched
                                                                                .password_confirmation &&
                                                                            !!formik
                                                                                .errors
                                                                                .password_confirmation
                                                                        }
                                                                        placeholder="Confirm password"
                                                                        className="py-2"
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .password_confirmation
                                                                        }
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                        </>
                                                    )}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    {/* STATUS */}
                                    <Tab.Pane eventKey="status">
                                        <Row className="g-4">
                                            <Col lg={8}>
                                                <Card className="border-0 bg-light">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold mb-3">
                                                            Staff Status
                                                        </h6>
                                                        <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3">
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Account
                                                                    Status
                                                                </div>
                                                                <small className="text-muted">
                                                                    {formik
                                                                        .values
                                                                        .is_active
                                                                        ? "This staff member is active and can access the system"
                                                                        : "This staff member is inactive and cannot access the system"}
                                                                </small>
                                                            </div>
                                                            <Form.Check
                                                                type="switch"
                                                                id="is_active"
                                                                name="is_active"
                                                                checked={
                                                                    formik
                                                                        .values
                                                                        .is_active
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                style={{
                                                                    transform:
                                                                        "scale(1.2)",
                                                                }}
                                                            />
                                                        </div>
                                                    </Card.Body>
                                                </Card>

                                                {/* Password update section for editing staff */}
                                                {isEdit && (
                                                    <Card className="border-0 bg-light mt-4">
                                                        <Card.Body className="p-4">
                                                            <h6 className="fw-bold text-warning mb-3">
                                                                <FaLock className="me-2" />
                                                                Password Update
                                                            </h6>
                                                            <p className="text-muted mb-3">
                                                                Leave password
                                                                fields blank to
                                                                keep current
                                                                password.
                                                            </p>
                                                            <Row className="g-3">
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label className="fw-semibold">
                                                                            New
                                                                            Password
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="password"
                                                                            name="password"
                                                                            value={
                                                                                formik
                                                                                    .values
                                                                                    .password
                                                                            }
                                                                            onChange={
                                                                                formik.handleChange
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            isInvalid={
                                                                                formik
                                                                                    .touched
                                                                                    .password &&
                                                                                !!formik
                                                                                    .errors
                                                                                    .password
                                                                            }
                                                                            placeholder="Enter new password"
                                                                            className="py-2"
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {
                                                                                formik
                                                                                    .errors
                                                                                    .password
                                                                            }
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group>
                                                                        <Form.Label className="fw-semibold">
                                                                            Confirm
                                                                            New
                                                                            Password
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="password"
                                                                            name="password_confirmation"
                                                                            value={
                                                                                formik
                                                                                    .values
                                                                                    .password_confirmation
                                                                            }
                                                                            onChange={
                                                                                formik.handleChange
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            isInvalid={
                                                                                formik
                                                                                    .touched
                                                                                    .password_confirmation &&
                                                                                !!formik
                                                                                    .errors
                                                                                    .password_confirmation
                                                                            }
                                                                            placeholder="Confirm new password"
                                                                            className="py-2"
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {
                                                                                formik
                                                                                    .errors
                                                                                    .password_confirmation
                                                                            }
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                )}
                                            </Col>
                                            <Col lg={4}>
                                                <Card className="border-0 bg-primary bg-opacity-10">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold text-primary mb-3">
                                                            <FaUserShield className="me-2" />
                                                            Status Overview
                                                        </h6>
                                                        <div className="mb-3">
                                                            <div className="small text-muted mb-1">
                                                                Current Status
                                                            </div>
                                                            {renderStatusBadge()}
                                                        </div>
                                                        <p className="small text-muted mb-0">
                                                            Active staff can log
                                                            in and perform their
                                                            assigned roles.
                                                            Inactive staff
                                                            cannot access the
                                                            system but their
                                                            data is preserved.
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>

                            {/* Navigation Footer */}
                            <Card.Footer className="bg-light border-0 py-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handlePrevious}
                                        disabled={isFirstTab || loading}
                                        className="px-4 py-2 d-flex align-items-center"
                                    >
                                        <FaChevronLeft
                                            className="me-2"
                                            size={18}
                                        />
                                        Previous
                                    </Button>

                                    <div className="d-flex align-items-center">
                                        <span className="text-muted me-3 small">
                                            Step{" "}
                                            {TABS.findIndex(
                                                (t) => t.key === activeKey
                                            ) + 1}{" "}
                                            of {TABS.length}
                                        </span>

                                        {isLastTab ? (
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={loading}
                                                className="px-4 py-2 d-flex align-items-center"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner
                                                            animation="border"
                                                            size="sm"
                                                            className="me-2"
                                                        />
                                                        {isEdit
                                                            ? "Updating..."
                                                            : "Creating..."}
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave
                                                            className="me-2"
                                                            size={18}
                                                        />
                                                        {isEdit
                                                            ? "Update Staff"
                                                            : "Create Staff"}
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                onClick={handleNext}
                                                className="px-4 py-2 d-flex align-items-center"
                                            >
                                                Next
                                                <FaChevronRight
                                                    className="ms-2"
                                                    size={18}
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Tab.Container>
                </Form>
            </Container>
        </PortalLayout>
    );
}
