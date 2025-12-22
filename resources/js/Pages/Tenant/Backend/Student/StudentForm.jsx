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
    FaUserPlus,
    FaSave,
    FaArrowLeft,
    FaImage,
    FaCheckCircle,
    FaChevronRight,
    FaChevronLeft,
    FaUsers,
    FaChalkboardTeacher,
    FaPhone,
    FaEnvelope,
    FaCalendarAlt,
    FaVenusMars,
    FaIdCard,
    FaUserTag,
    FaUserFriends,
} from "react-icons/fa";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import { useErrorToast } from "@/Hooks/useErrorToast";

// Tabs configuration - similar to staff form
const TABS = [
    {
        key: "student",
        label: "Student Details",
        icon: <FaUser />,
        color: "#4f46e5",
    },
    {
        key: "parents",
        label: "Parents/Guardians",
        icon: <FaUsers />,
        color: "#7c3aed",
    },
    {
        key: "academic",
        label: "Academic Info",
        icon: <FaChalkboardTeacher />,
        color: "#0ea5e9",
    },
];

// Default form data
const DEFAULT_STUDENT_DATA = {
    first_name: "",
    last_name: "",
    other_name: "",
    admission_number: "",
    date_of_birth: "",
    gender: "",
    profile_image: null,
    is_active: true,
    class_id: null,
    stream_id: null,
    parents: [{ name: "", email: "", phone: "", relationship: "parent" }],
};

// Validation schema using Yup
const validationSchema = Yup.object({
    first_name: Yup.string()
        .required("First name is required")
        .min(2, "Minimum 2 characters"),
    last_name: Yup.string()
        .required("Last name is required")
        .min(2, "Minimum 2 characters"),
    admission_number: Yup.string()
        .required("Admission number is required")
        .min(3, "Minimum 3 characters"),
    date_of_birth: Yup.date()
        .nullable()
        .max(new Date(), "Date of birth cannot be in the future"),
    gender: Yup.string().oneOf(
        ["male", "female", "other"],
        "Invalid gender selection"
    ),
    class_id: Yup.string().required("Class is required"),
    parents: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Parent name is required"),
            email: Yup.string().email("Invalid email address").nullable(),
            phone: Yup.string().required("Phone number is required"),
            relationship: Yup.string().required("Relationship is required"),
        })
    ),
});

// Relationship options
const RELATIONSHIP_OPTIONS = [
    { value: "parent", label: "Parent" },
    { value: "guardian", label: "Guardian" },
    { value: "sibling", label: "Sibling" },
    { value: "other", label: "Other" },
];

// Gender options
const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

export default function StudentForm({ classes = [], student = null }) {
    const { showErrorToast } = useErrorToast();
    const isEdit = !!student;
    const [activeKey, setActiveKey] = useState("student");
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(
        student?.profile_image_url || null
    );
    const [availableStreams, setAvailableStreams] = useState([]);

    // Get parent data for edit mode
    const getParentData = (student) => {
        if (student?.student?.parents?.length > 0) {
            return student.student.parents.map((parent) => ({
                name: parent.full_name || "",
                email: parent.email || "",
                phone: parent.phone || "",
                relationship: parent.relationship || "parent",
            }));
        }
        return [{ name: "", email: "", phone: "", relationship: "parent" }];
    };

    // Formik initialization
    const formik = useFormik({
        initialValues: isEdit
            ? {
                  ...DEFAULT_STUDENT_DATA,
                  first_name: student.first_name || "",
                  last_name: student.last_name || "",
                  other_name: student.other_name || "",
                  admission_number: student.student?.admission_number || "",
                  date_of_birth: student.date_of_birth || "",
                  gender: student.gender || "",
                  is_active: student.is_active ?? true,
                  class_id: student.student?.class_id || null,
                  stream_id: student.student?.class_stream_id || null,
                  parents: getParentData(student),
              }
            : DEFAULT_STUDENT_DATA,
        validationSchema: validationSchema,
        enableReinitialize: true,
        context: { hasStreams: availableStreams.length > 0 },
        onSubmit: async (values) => {
            const action = isEdit ? "Update" : "Register";

            try {
                const confirm = await Swal.fire({
                    title: `${action} Student`,
                    text: `Confirm to ${action.toLowerCase()} this student.`,
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
                    if (key === "parents") {
                        // Handle parents array
                        values.parents.forEach((parent, index) => {
                            Object.keys(parent).forEach((parentKey) => {
                                formData.append(
                                    `parents[${index}][${parentKey}]`,
                                    parent[parentKey]
                                );
                            });
                        });
                    } else if (
                        values[key] !== null &&
                        values[key] !== undefined
                    ) {
                        formData.append(key, values[key]);
                    }
                }

                const url = isEdit
                    ? route("admin.student.update", student.id)
                    : route("admin.student.store");

                const method = isEdit ? "post" : "post";
                if (isEdit) formData.append("_method", "PUT");

                const response = await axios[method](url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success(
                    isEdit
                        ? "Student updated successfully!"
                        : "Student registered successfully!"
                );

                router.visit(route("admin.student.index"));
            } catch (error) {
                showErrorToast(error);
            } finally {
                Swal.close();
            }
        },
    });

    // Class options
    const classOptions = useMemo(
        () => classes.map((cls) => ({ value: cls.id, label: cls.name })),
        [classes]
    );

    // Stream options
    const streamOptions = useMemo(
        () =>
            availableStreams.map((s) => ({
                value: s.id,
                label: s.stream?.name || s.name,
            })),
        [availableStreams]
    );

    // Selected class
    const selectedClass = useMemo(
        () => classes.find((cls) => cls.id == formik.values.class_id),
        [classes, formik.values.class_id]
    );

    // Update available streams when class changes
    useEffect(() => {
        if (!selectedClass) {
            setAvailableStreams([]);
            formik.setFieldValue("stream_id", null);
            return;
        }

        const streams = selectedClass.class_streams || [];
        setAvailableStreams(streams);

        // Reset stream if not available in selected class
        if (
            formik.values.stream_id &&
            !streams.some((s) => s.id == formik.values.stream_id)
        ) {
            formik.setFieldValue("stream_id", null);
        }
    }, [selectedClass, formik.values.stream_id]);

    // Handle photo change
    const handlePhotoChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profile_image", file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // Handle parent changes
    const handleParentChange = (index, field, value) => {
        const updatedParents = [...formik.values.parents];
        updatedParents[index][field] = value;
        formik.setFieldValue("parents", updatedParents);
    };

    // Add new parent
    const addParent = () => {
        formik.setFieldValue("parents", [
            ...formik.values.parents,
            { name: "", email: "", phone: "", relationship: "parent" },
        ]);
    };

    // Remove parent
    const removeParent = (index) => {
        if (formik.values.parents.length <= 1) {
            toast.warning("At least one parent is required");
            return;
        }
        const updatedParents = [...formik.values.parents];
        updatedParents.splice(index, 1);
        formik.setFieldValue("parents", updatedParents);
    };

    // Navigation functions
    const isFirstTab = activeKey === TABS[0].key;
    const isLastTab = activeKey === TABS[TABS.length - 1].key;

    const handleNext = useCallback(() => {
        // Validate current tab before proceeding
        let errors = {};
        if (activeKey === "student") {
            const fields = [
                "first_name",
                "last_name",
                "admission_number",
                "gender",
                "class_id",
            ];
            fields.forEach((field) => {
                if (formik.errors[field]) errors[field] = formik.errors[field];
            });
        } else if (activeKey === "parents") {
            formik.values.parents.forEach((parent, index) => {
                if (!parent.name) errors[`parents.${index}.name`] = "Required";
                if (!parent.phone)
                    errors[`parents.${index}.phone`] = "Required";
            });
        }

        if (Object.keys(errors).length > 0) {
            formik.setErrors(errors);
            toast.error(
                "Please note that all fields marked with * are required!"
            );
            return;
        }

        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index < TABS.length - 1) setActiveKey(TABS[index + 1].key);
    }, [activeKey, formik]);

    const handlePrevious = useCallback(() => {
        const index = TABS.findIndex((t) => t.key === activeKey);
        if (index > 0) setActiveKey(TABS[index - 1].key);
    }, [activeKey]);

    // Render status badge
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
    const pageTitle = isEdit
        ? `Edit ${student.first_name} ${student.last_name}`
        : "Register New Student";

    return (
        <PortalLayout>
            <Head title={pageTitle} />

            {/* Header */}
            <Container fluid className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="m-0 text-capitalize">{pageTitle}</h2>
                    <ButtonGroup>
                        <Link
                            href={route("admin.student.index")}
                            className="btn btn-outline-primary"
                        >
                            <FaArrowLeft className="me-2" />
                            Back to Students
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
                                    {/* STUDENT DETAILS TAB */}
                                    <Tab.Pane eventKey="student">
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
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={8} lg={9}>
                                                <Row className="g-3">
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaUser className="me-2" />
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
                                                                <FaUser className="me-2" />
                                                                Last Name *
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
                                                                placeholder="Enter last name"
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
                                                                <FaUser className="me-2" />
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
                                                                placeholder="Enter other name"
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaIdCard className="me-2" />
                                                                Admission No. *
                                                            </Form.Label>
                                                            <Form.Control
                                                                name="admission_number"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .admission_number
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
                                                                        .admission_number &&
                                                                    !!formik
                                                                        .errors
                                                                        .admission_number
                                                                }
                                                                placeholder="e.g., ADM2023001"
                                                                className="py-2"
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    formik
                                                                        .errors
                                                                        .admission_number
                                                                }
                                                            </Form.Control.Feedback>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaCalendarAlt className="me-2" />
                                                                Date of Birth
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                name="date_of_birth"
                                                                value={
                                                                    formik
                                                                        .values
                                                                        .date_of_birth
                                                                }
                                                                onChange={
                                                                    formik.handleChange
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                className="py-2"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaVenusMars className="me-2" />
                                                                Gender
                                                            </Form.Label>
                                                            <Select
                                                                name="gender"
                                                                options={
                                                                    GENDER_OPTIONS
                                                                }
                                                                value={GENDER_OPTIONS.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        formik
                                                                            .values
                                                                            .gender
                                                                )}
                                                                onChange={(
                                                                    selected
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "gender",
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
                                                                        .gender &&
                                                                    !!formik
                                                                        .errors
                                                                        .gender
                                                                }
                                                                placeholder="Select gender"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                            />
                                                            {formik.touched
                                                                .gender &&
                                                                formik.errors
                                                                    .gender && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .gender
                                                                        }
                                                                    </div>
                                                                )}
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaChalkboardTeacher className="me-2" />
                                                                Class *
                                                            </Form.Label>
                                                            <Select
                                                                name="class_id"
                                                                options={
                                                                    classOptions
                                                                }
                                                                value={classOptions.find(
                                                                    (opt) =>
                                                                        opt.value ==
                                                                        formik
                                                                            .values
                                                                            .class_id
                                                                )}
                                                                onChange={(
                                                                    selected
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "class_id",
                                                                        selected?.value ||
                                                                            null
                                                                    )
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .class_id &&
                                                                    !!formik
                                                                        .errors
                                                                        .class_id
                                                                }
                                                                placeholder="Select class"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                            />
                                                            {formik.touched
                                                                .class_id &&
                                                                formik.errors
                                                                    .class_id && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .class_id
                                                                        }
                                                                    </div>
                                                                )}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">
                                                                <FaChalkboardTeacher className="me-2" />
                                                                Stream{" "}
                                                                {availableStreams.length >
                                                                    0 && "*"}
                                                            </Form.Label>
                                                            <Select
                                                                name="stream_id"
                                                                options={
                                                                    streamOptions
                                                                }
                                                                value={streamOptions.find(
                                                                    (opt) =>
                                                                        opt.value ==
                                                                        formik
                                                                            .values
                                                                            .stream_id
                                                                )}
                                                                onChange={(
                                                                    selected
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "stream_id",
                                                                        selected?.value ||
                                                                            null
                                                                    )
                                                                }
                                                                onBlur={
                                                                    formik.handleBlur
                                                                }
                                                                isInvalid={
                                                                    formik
                                                                        .touched
                                                                        .stream_id &&
                                                                    !!formik
                                                                        .errors
                                                                        .stream_id
                                                                }
                                                                placeholder={
                                                                    availableStreams.length >
                                                                    0
                                                                        ? "Select stream"
                                                                        : "No streams available"
                                                                }
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                isDisabled={
                                                                    availableStreams.length ===
                                                                    0
                                                                }
                                                            />
                                                            {formik.touched
                                                                .stream_id &&
                                                                formik.errors
                                                                    .stream_id && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .stream_id
                                                                        }
                                                                    </div>
                                                                )}
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    {/* PARENTS/GUARDIANS TAB */}
                                    <Tab.Pane eventKey="parents">
                                        <Row className="g-4">
                                            <Col lg={12}>
                                                <Card className="border-0 bg-light">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                            <FaUsers className="me-2" />
                                                            Parent/Guardian
                                                            Information
                                                        </h6>

                                                        {formik.values.parents.map(
                                                            (parent, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="mb-4 p-3 border rounded bg-white"
                                                                >
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className="mb-0">
                                                                            Parent/Guardian
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </h6>
                                                                        {index >
                                                                            0 && (
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    removeParent(
                                                                                        index
                                                                                    )
                                                                                }
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>

                                                                    <Row>
                                                                        <Col
                                                                            md={
                                                                                6
                                                                            }
                                                                        >
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">
                                                                                    <FaUserTag className="me-2" />
                                                                                    Full
                                                                                    Name
                                                                                    *
                                                                                </Form.Label>
                                                                                <Form.Control
                                                                                    name={`parents.${index}.name`}
                                                                                    value={
                                                                                        parent.name
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleParentChange(
                                                                                            index,
                                                                                            "name",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    onBlur={
                                                                                        formik.handleBlur
                                                                                    }
                                                                                    isInvalid={
                                                                                        formik
                                                                                            .touched
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.name &&
                                                                                        !!formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.name
                                                                                    }
                                                                                    placeholder="Parent's full name"
                                                                                    className="py-2"
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.name
                                                                                    }
                                                                                </Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col
                                                                            md={
                                                                                6
                                                                            }
                                                                        >
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">
                                                                                    <FaUserFriends className="me-2" />
                                                                                    Relationship
                                                                                </Form.Label>
                                                                                <Select
                                                                                    options={
                                                                                        RELATIONSHIP_OPTIONS
                                                                                    }
                                                                                    value={RELATIONSHIP_OPTIONS.find(
                                                                                        (
                                                                                            opt
                                                                                        ) =>
                                                                                            opt.value ===
                                                                                            parent.relationship
                                                                                    )}
                                                                                    onChange={(
                                                                                        selected
                                                                                    ) =>
                                                                                        handleParentChange(
                                                                                            index,
                                                                                            "relationship",
                                                                                            selected?.value ||
                                                                                                "parent"
                                                                                        )
                                                                                    }
                                                                                    placeholder="Select relationship"
                                                                                    className="react-select-container"
                                                                                    classNamePrefix="react-select"
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className="mt-3">
                                                                        <Col
                                                                            md={
                                                                                6
                                                                            }
                                                                        >
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">
                                                                                    <FaEnvelope className="me-2" />
                                                                                    Email
                                                                                </Form.Label>
                                                                                <Form.Control
                                                                                    type="email"
                                                                                    name={`parents.${index}.email`}
                                                                                    value={
                                                                                        parent.email
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleParentChange(
                                                                                            index,
                                                                                            "email",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    onBlur={
                                                                                        formik.handleBlur
                                                                                    }
                                                                                    isInvalid={
                                                                                        formik
                                                                                            .touched
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.email &&
                                                                                        !!formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.email
                                                                                    }
                                                                                    placeholder="parent@example.com"
                                                                                    className="py-2"
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.email
                                                                                    }
                                                                                </Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col
                                                                            md={
                                                                                6
                                                                            }
                                                                        >
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">
                                                                                    <FaPhone className="me-2" />
                                                                                    Phone
                                                                                    *
                                                                                </Form.Label>
                                                                                <Form.Control
                                                                                    name={`parents.${index}.phone`}
                                                                                    value={
                                                                                        parent.phone
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleParentChange(
                                                                                            index,
                                                                                            "phone",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    onBlur={
                                                                                        formik.handleBlur
                                                                                    }
                                                                                    isInvalid={
                                                                                        formik
                                                                                            .touched
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.phone &&
                                                                                        !!formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.phone
                                                                                    }
                                                                                    placeholder="+2547XXXXXXXX"
                                                                                    className="py-2"
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .parents?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.phone
                                                                                    }
                                                                                </Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>
                                                                </div>
                                                            )
                                                        )}

                                                        <div className="mb-4">
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={
                                                                    addParent
                                                                }
                                                            >
                                                                <FaUserPlus className="me-1" />
                                                                Add Another
                                                                Parent/Guardian
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    {/* ACADEMIC INFO TAB */}
                                    <Tab.Pane eventKey="academic">
                                        <Row className="g-4">
                                            <Col lg={8}>
                                                <Card className="border-0 bg-light">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold mb-3">
                                                            Student Status
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
                                                                        ? "This student is active and can access the system"
                                                                        : "This student is inactive and cannot access the system"}
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

                                                <Card className="border-0 bg-light mt-4">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold text-primary mb-3">
                                                            <FaChalkboardTeacher className="me-2" />
                                                            Academic Summary
                                                        </h6>
                                                        <Row>
                                                            <Col md={6}>
                                                                <div className="mb-3">
                                                                    <div className="small text-muted mb-1">
                                                                        Selected
                                                                        Class
                                                                    </div>
                                                                    <div className="fw-semibold">
                                                                        {selectedClass?.name ||
                                                                            "Not selected"}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md={6}>
                                                                <div className="mb-3">
                                                                    <div className="small text-muted mb-1">
                                                                        Stream
                                                                    </div>
                                                                    <div className="fw-semibold">
                                                                        {streamOptions.find(
                                                                            (
                                                                                opt
                                                                            ) =>
                                                                                opt.value ==
                                                                                formik
                                                                                    .values
                                                                                    .stream_id
                                                                        )
                                                                            ?.label ||
                                                                            "Not selected"}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={4}>
                                                <Card className="border-0 bg-primary bg-opacity-10">
                                                    <Card.Body className="p-4">
                                                        <h6 className="fw-bold text-primary mb-3">
                                                            <FaUser className="me-2" />
                                                            Overview
                                                        </h6>
                                                        <div className="mb-3">
                                                            <div className="small text-muted mb-1">
                                                                Current Status
                                                            </div>
                                                            {renderStatusBadge()}
                                                        </div>
                                                        <div className="mb-3">
                                                            <div className="small text-muted mb-1">
                                                                Number of
                                                                Parents/Guardians
                                                            </div>
                                                            <div className="fw-semibold">
                                                                {
                                                                    formik
                                                                        .values
                                                                        .parents
                                                                        .length
                                                                }
                                                            </div>
                                                        </div>
                                                        <p className="small text-muted mb-0">
                                                            Active students can
                                                            access the school
                                                            portal. Inactive
                                                            students are
                                                            archived but their
                                                            data is preserved.
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>

                            {/* Navigation Footer - Exactly like staff form */}
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
                                                            : "Registering..."}
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave
                                                            className="me-2"
                                                            size={18}
                                                        />
                                                        {isEdit
                                                            ? "Update Student"
                                                            : "Register Student"}
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
