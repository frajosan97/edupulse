import { Head, Link } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Badge,
    Tab,
    Button,
    Stack,
    ButtonGroup,
    Tabs,
    Table,
    ProgressBar,
    Alert,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBirthdayCake,
    FaVenusMars,
    FaMapMarkerAlt,
    FaChalkboardTeacher,
    FaUserTie,
    FaEdit,
    FaFileAlt,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaComment,
    FaIdCard,
    FaBook,
    FaGraduationCap,
    FaUsers,
    FaCalendarCheck,
    FaCalendarTimes,
    FaDollarSign,
    FaFileInvoiceDollar,
    FaClock,
    FaChartLine,
} from "react-icons/fa";
import AuthenticatedLayout from "@/Layouts/PortalLayout";
import { formatDate, formatCurrency } from "@/Utils/helpers";
import StatusBadge from "@/Components/Settings/StatusBadge";
import EmptyState from "@/Components/Common/EmptyState";

export default function StaffShow({ staff, auth }) {
    // Animation variants
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    };

    // Mock data for teaching - in real app, this would come from props
    const teachingData = {
        currentSubjects: [
            { id: 1, name: "Mathematics", class: "Grade 10A", hours: 15 },
            { id: 2, name: "Physics", class: "Grade 11B", hours: 12 },
            { id: 3, name: "Advanced Calculus", class: "Grade 12A", hours: 10 },
        ],
        totalStudents: 120,
        averageRating: 4.7,
        upcomingClasses: [
            {
                id: 1,
                subject: "Mathematics",
                time: "10:00 AM",
                classroom: "Room 101",
            },
            { id: 2, subject: "Physics", time: "2:00 PM", classroom: "Lab 3" },
        ],
    };

    // Mock data for payroll
    const payrollData = {
        basicSalary: 45000,
        allowances: 12000,
        deductions: 5000,
        netSalary: 52000,
        currency: "USD",
        paymentMethod: "Bank Transfer",
        bankAccount: "**** **** **** 1234",
        nextPayDate: "2024-01-15",
        recentPayments: [
            {
                month: "December 2023",
                amount: 52000,
                status: "Paid",
                date: "2023-12-15",
            },
            {
                month: "November 2023",
                amount: 52000,
                status: "Paid",
                date: "2023-11-15",
            },
            {
                month: "October 2023",
                amount: 52000,
                status: "Paid",
                date: "2023-10-15",
            },
        ],
    };

    // Mock data for leaves
    const leavesData = {
        annualLeave: { total: 30, used: 15, remaining: 15 },
        sickLeave: { total: 15, used: 3, remaining: 12 },
        casualLeave: { total: 10, used: 5, remaining: 5 },
        upcomingLeaves: [
            {
                id: 1,
                type: "Annual",
                from: "2024-01-20",
                to: "2024-01-25",
                days: 5,
                status: "Approved",
            },
            {
                id: 2,
                type: "Sick",
                from: "2024-02-01",
                to: "2024-02-02",
                days: 2,
                status: "Pending",
            },
        ],
        recentLeaves: [
            {
                id: 1,
                type: "Casual",
                from: "2023-12-10",
                to: "2023-12-10",
                days: 1,
                status: "Approved",
            },
            {
                id: 2,
                type: "Annual",
                from: "2023-11-20",
                to: "2023-11-24",
                days: 5,
                status: "Approved",
            },
        ],
    };

    // Mock data for documents
    const documents = [
        {
            id: 1,
            name: "Employment Contract.pdf",
            type: "Contract",
            date: "2023-01-15",
        },
        {
            id: 2,
            name: "Academic Certificates.zip",
            type: "Certificates",
            date: "2023-01-10",
        },
        {
            id: 3,
            name: "ID Proof.jpg",
            type: "Identification",
            date: "2023-01-05",
        },
    ];

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Staff Details - ${staff?.full_name}`} />

            <Row className="mb-4">
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center"
                >
                    <div>
                        <h2 className="m-0 text-capitalize">
                            {staff?.full_name}
                        </h2>
                        <small className="text-muted">
                            Staff ID: {staff.id || staff.teacher?.id || "N/A"}
                        </small>
                    </div>
                    <ButtonGroup className="gap-2">
                        <Button
                            as={Link}
                            href={route("admin.staff.edit", staff.id)}
                            variant="primary"
                            className="d-flex align-items-center"
                        >
                            <FaEdit className="me-2" /> Edit Profile
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="d-flex align-items-center"
                        >
                            <FaFileAlt className="me-2" /> Reports
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr" />

            <Row className="g-3">
                {/* Left Column - Profile & Contact */}
                <Col lg={4}>
                    <motion.div {...fadeIn}>
                        {/* Profile Card */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="text-center p-4">
                                <div className="mb-3">
                                    <img
                                        src={`/storage/${
                                            staff.profile_image ??
                                            "images/landlord/profiles/avatar.png"
                                        }`}
                                        alt={staff?.full_name}
                                        className="rounded-circle shadow"
                                        width={140}
                                        height={140}
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                <h4 className="mb-2 text-capitalize">
                                    {staff?.full_name}
                                </h4>

                                <div className="mb-3">
                                    <StatusBadge
                                        active={staff.is_active}
                                        className="fs-6"
                                    />
                                </div>

                                <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
                                    <Badge
                                        bg="info"
                                        className="text-capitalize fs-6 px-2 py-1"
                                    >
                                        {staff.role}
                                    </Badge>

                                    {staff.department && (
                                        <Badge
                                            bg="primary"
                                            className="fs-6 px-2 py-1"
                                        >
                                            {staff.department.name}
                                        </Badge>
                                    )}
                                </div>

                                <Stack gap={2} className="mt-3">
                                    <Button
                                        variant="outline-primary"
                                        className="d-flex align-items-center justify-content-center"
                                        as={Link}
                                        href=""
                                        // href={route("admin.messages.compose", { recipient_id: staff.id })}
                                    >
                                        <FaComment className="me-2" /> Send
                                        Message
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        className="d-flex align-items-center justify-content-center"
                                        onClick={() =>
                                            document
                                                .getElementById("documents-tab")
                                                .click()
                                        }
                                    >
                                        <FaFileAlt className="me-2" /> View
                                        Documents
                                    </Button>
                                </Stack>
                            </Card.Body>
                        </Card>

                        {/* Contact Information Card */}
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light border-0">
                                <h6 className="mb-0 fw-bold">
                                    <FaIdCard className="me-2" /> Contact
                                    Information
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Stack gap={3}>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-3">
                                            <FaEnvelope className="text-primary" />
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">
                                                Email
                                            </small>
                                            <span>{staff.email}</span>
                                        </div>
                                    </div>

                                    {staff.phone && (
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaPhone className="text-primary" />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Phone
                                                </small>
                                                <span>{staff.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    {staff.date_of_birth && (
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaBirthdayCake className="text-primary" />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Date of Birth
                                                </small>
                                                <span>
                                                    {formatDate(
                                                        staff.date_of_birth,
                                                        "MMMM D, YYYY"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {staff.gender && (
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaVenusMars className="text-primary" />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Gender
                                                </small>
                                                <span className="text-capitalize">
                                                    {staff.gender}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {staff.address && (
                                        <div className="d-flex align-items-start">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaMapMarkerAlt className="text-primary mt-1" />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Address
                                                </small>
                                                <span>{staff.address}</span>
                                            </div>
                                        </div>
                                    )}

                                    {staff.joined_date && (
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3">
                                                <FaCalendarCheck className="text-primary" />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Joined Date
                                                </small>
                                                <span>
                                                    {formatDate(
                                                        staff.joined_date
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </Stack>
                            </Card.Body>
                        </Card>

                        {/* Quick Stats Card */}
                        {staff.teacherProfile && (
                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0 fw-bold">
                                        <FaChartLine className="me-2" />{" "}
                                        Teaching Stats
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <Stack gap={3}>
                                        <div>
                                            <small className="text-muted d-block mb-1">
                                                Total Students
                                            </small>
                                            <div className="d-flex align-items-center">
                                                <FaUsers className="text-primary me-2" />
                                                <h5 className="mb-0">
                                                    {teachingData.totalStudents}
                                                </h5>
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block mb-1">
                                                Teaching Hours/Week
                                            </small>
                                            <div className="d-flex align-items-center">
                                                <FaClock className="text-primary me-2" />
                                                <h5 className="mb-0">
                                                    {teachingData.currentSubjects.reduce(
                                                        (sum, subject) =>
                                                            sum + subject.hours,
                                                        0
                                                    )}{" "}
                                                    hrs
                                                </h5>
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block mb-1">
                                                Average Rating
                                            </small>
                                            <div className="d-flex align-items-center">
                                                <FaGraduationCap className="text-primary me-2" />
                                                <h5 className="mb-0">
                                                    {teachingData.averageRating}
                                                    /5.0
                                                </h5>
                                            </div>
                                        </div>
                                    </Stack>
                                </Card.Body>
                            </Card>
                        )}
                    </motion.div>
                </Col>

                {/* Right Column - Detailed Info */}
                <Col lg={8}>
                    <motion.div {...fadeIn}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-0">
                                <Tabs
                                    defaultActiveKey="profile"
                                    id="staff-details-tabs"
                                    className="mb-3 pb-0"
                                >
                                    {/* Profile Tab */}
                                    <Tab
                                        eventKey="profile"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <FaUser className="me-2" />
                                                Profile
                                            </span>
                                        }
                                        className="px-4 py-2"
                                    >
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Full Name
                                                </label>
                                                <p className="mb-0 fs-6 text-capitalize">
                                                    {staff?.full_name}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Email
                                                </label>
                                                <p className="mb-0 fs-6">
                                                    {staff.email}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Phone
                                                </label>
                                                <p className="mb-0 fs-6">
                                                    {staff.phone ||
                                                        "Not provided"}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Date of Birth
                                                </label>
                                                <p className="mb-0 fs-6">
                                                    {staff.date_of_birth
                                                        ? formatDate(
                                                              staff.date_of_birth
                                                          )
                                                        : "Not provided"}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Gender
                                                </label>
                                                <p className="mb-0 fs-6 text-capitalize">
                                                    {staff.gender ||
                                                        "Not provided"}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Status
                                                </label>
                                                <p className="mb-0">
                                                    <StatusBadge
                                                        active={staff.is_active}
                                                    />
                                                </p>
                                            </Col>
                                        </Row>

                                        {staff.address && (
                                            <Row>
                                                <Col md={12} className="mb-3">
                                                    <label className="form-label text-muted small mb-1">
                                                        Address
                                                    </label>
                                                    <p className="mb-0 fs-6">
                                                        {staff.address}
                                                    </p>
                                                </Col>
                                            </Row>
                                        )}

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Bio
                                                </label>
                                                <div className="border rounded p-3 bg-light">
                                                    <p className="mb-0 fs-6">
                                                        {staff.bio ||
                                                            "No bio provided"}
                                                    </p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Tab>

                                    {/* Professional Tab */}
                                    <Tab
                                        eventKey="professional"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <FaUserTie className="me-2" />
                                                Professional
                                            </span>
                                        }
                                        className="px-4 py-2"
                                    >
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Role
                                                </label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {staff.roles?.length > 0 ? (
                                                        staff.roles.map(
                                                            (role, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    bg="primary"
                                                                    className="fs-6 px-2 py-1"
                                                                >
                                                                    {role.name}
                                                                </Badge>
                                                            )
                                                        )
                                                    ) : (
                                                        <Badge
                                                            bg="secondary"
                                                            className="fs-6 px-2 py-1"
                                                        >
                                                            {staff.role ||
                                                                "Not assigned"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Department
                                                </label>
                                                <p className="mb-0 fs-6">
                                                    {staff.department?.name ||
                                                        "Not assigned"}
                                                    {staff.department && (
                                                        <span className="text-muted ms-2">
                                                            (
                                                            {
                                                                staff.department
                                                                    .code
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </p>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Employment Type
                                                </label>
                                                <p className="mb-0 fs-6 text-capitalize">
                                                    {staff.employment_type ||
                                                        "Not specified"}
                                                </p>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <label className="form-label text-muted small mb-1">
                                                    Designation
                                                </label>
                                                <p className="mb-0 fs-6">
                                                    {staff.designation ||
                                                        "Not specified"}
                                                </p>
                                            </Col>
                                        </Row>

                                        {staff.teacherProfile && (
                                            <>
                                                <hr className="my-4" />
                                                <h6 className="mb-3 fw-bold">
                                                    Teacher Details
                                                </h6>

                                                <Row>
                                                    <Col
                                                        md={6}
                                                        className="mb-3"
                                                    >
                                                        <label className="form-label text-muted small mb-1">
                                                            Teacher ID
                                                        </label>
                                                        <p className="mb-0 fs-6">
                                                            {
                                                                staff
                                                                    .teacherProfile
                                                                    .teacher_id
                                                            }
                                                        </p>
                                                    </Col>
                                                    <Col
                                                        md={6}
                                                        className="mb-3"
                                                    >
                                                        <label className="form-label text-muted small mb-1">
                                                            Joining Date
                                                        </label>
                                                        <p className="mb-0 fs-6">
                                                            {formatDate(
                                                                staff
                                                                    .teacherProfile
                                                                    .joining_date
                                                            )}
                                                        </p>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col
                                                        md={6}
                                                        className="mb-3"
                                                    >
                                                        <label className="form-label text-muted small mb-1">
                                                            Specialization
                                                        </label>
                                                        <p className="mb-0 fs-6">
                                                            {staff
                                                                .teacherProfile
                                                                .specialization ||
                                                                "Not specified"}
                                                        </p>
                                                    </Col>
                                                    <Col
                                                        md={6}
                                                        className="mb-3"
                                                    >
                                                        <label className="form-label text-muted small mb-1">
                                                            Qualifications
                                                        </label>
                                                        <div className="border rounded p-3 bg-light">
                                                            <p className="mb-0 fs-6">
                                                                {staff
                                                                    .teacherProfile
                                                                    .qualifications ||
                                                                    "Not specified"}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col
                                                        md={12}
                                                        className="mb-3"
                                                    >
                                                        <label className="form-label text-muted small mb-1">
                                                            Experience (Years)
                                                        </label>
                                                        <p className="mb-0 fs-6">
                                                            {staff
                                                                .teacherProfile
                                                                .experience ||
                                                                "Not specified"}
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                    </Tab>

                                    {/* Teaching Tab (Only for teachers) */}
                                    {staff.teacherProfile && (
                                        <Tab
                                            eventKey="teaching"
                                            title={
                                                <span className="d-flex align-items-center">
                                                    <FaChalkboardTeacher className="me-2" />
                                                    Teaching
                                                </span>
                                            }
                                            className="px-4 py-2"
                                        >
                                            <h5 className="mb-4">
                                                Current Subjects
                                            </h5>
                                            <Table
                                                hover
                                                responsive
                                                className="mb-4"
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Class</th>
                                                        <th>Hours/Week</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {teachingData.currentSubjects.map(
                                                        (subject) => (
                                                            <tr
                                                                key={subject.id}
                                                            >
                                                                <td>
                                                                    <FaBook className="me-2 text-primary" />
                                                                    {
                                                                        subject.name
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        subject.class
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <Badge bg="info">
                                                                        {
                                                                            subject.hours
                                                                        }{" "}
                                                                        hrs
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-primary"
                                                                    >
                                                                        View
                                                                        Details
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </Table>

                                            <Row className="mb-4">
                                                <Col md={6}>
                                                    <Card className="border-0 shadow-sm">
                                                        <Card.Body>
                                                            <h6 className="mb-3">
                                                                Upcoming Classes
                                                            </h6>
                                                            <Stack gap={2}>
                                                                {teachingData.upcomingClasses.map(
                                                                    (
                                                                        classItem
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                classItem.id
                                                                            }
                                                                            className="d-flex justify-content-between align-items-center p-2 border rounded"
                                                                        >
                                                                            <div>
                                                                                <strong>
                                                                                    {
                                                                                        classItem.subject
                                                                                    }
                                                                                </strong>
                                                                                <div className="text-muted small">
                                                                                    {
                                                                                        classItem.time
                                                                                    }{" "}
                                                                                    •{" "}
                                                                                    {
                                                                                        classItem.classroom
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <Badge bg="warning">
                                                                                Upcoming
                                                                            </Badge>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                <Col md={6}>
                                                    <Card className="border-0 shadow-sm">
                                                        <Card.Body>
                                                            <h6 className="mb-3">
                                                                Performance
                                                                Summary
                                                            </h6>
                                                            <div className="text-center">
                                                                <h1 className="display-4 text-primary">
                                                                    {
                                                                        teachingData.averageRating
                                                                    }
                                                                </h1>
                                                                <p className="text-muted">
                                                                    Average
                                                                    Rating (out
                                                                    of 5)
                                                                </p>
                                                                <ProgressBar
                                                                    now={
                                                                        teachingData.averageRating *
                                                                        20
                                                                    }
                                                                    className="mb-3"
                                                                />
                                                                <small className="text-muted">
                                                                    Based on
                                                                    student
                                                                    feedback
                                                                </small>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </Tab>
                                    )}

                                    {/* Payroll Tab */}
                                    <Tab
                                        eventKey="payroll"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <FaMoneyBillWave className="me-2" />
                                                Payroll
                                            </span>
                                        }
                                        className="px-4 py-2"
                                    >
                                        <Row className="mb-4">
                                            <Col md={12}>
                                                <h5 className="mb-4">
                                                    Salary Breakdown
                                                </h5>
                                                <Row>
                                                    <Col
                                                        md={3}
                                                        className="mb-3"
                                                    >
                                                        <Card className="border-0 shadow-sm text-center">
                                                            <Card.Body>
                                                                <small className="text-muted d-block mb-1">
                                                                    Basic Salary
                                                                </small>
                                                                <h4 className="text-primary">
                                                                    {formatCurrency(
                                                                        payrollData.basicSalary,
                                                                        payrollData.currency
                                                                    )}
                                                                </h4>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col
                                                        md={3}
                                                        className="mb-3"
                                                    >
                                                        <Card className="border-0 shadow-sm text-center">
                                                            <Card.Body>
                                                                <small className="text-muted d-block mb-1">
                                                                    Allowances
                                                                </small>
                                                                <h4 className="text-success">
                                                                    +
                                                                    {formatCurrency(
                                                                        payrollData.allowances,
                                                                        payrollData.currency
                                                                    )}
                                                                </h4>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col
                                                        md={3}
                                                        className="mb-3"
                                                    >
                                                        <Card className="border-0 shadow-sm text-center">
                                                            <Card.Body>
                                                                <small className="text-muted d-block mb-1">
                                                                    Deductions
                                                                </small>
                                                                <h4 className="text-danger">
                                                                    -
                                                                    {formatCurrency(
                                                                        payrollData.deductions,
                                                                        payrollData.currency
                                                                    )}
                                                                </h4>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                    <Col
                                                        md={3}
                                                        className="mb-3"
                                                    >
                                                        <Card className="border-0 shadow-sm text-center bg-primary text-white">
                                                            <Card.Body>
                                                                <small className="d-block mb-1">
                                                                    Net Salary
                                                                </small>
                                                                <h4>
                                                                    {formatCurrency(
                                                                        payrollData.netSalary,
                                                                        payrollData.currency
                                                                    )}
                                                                </h4>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row className="mb-4">
                                            <Col md={6}>
                                                <Card className="border-0 shadow-sm">
                                                    <Card.Body>
                                                        <h6 className="mb-3">
                                                            Payment Information
                                                        </h6>
                                                        <Stack gap={2}>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">
                                                                    Payment
                                                                    Method:
                                                                </span>
                                                                <strong>
                                                                    {
                                                                        payrollData.paymentMethod
                                                                    }
                                                                </strong>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">
                                                                    Bank
                                                                    Account:
                                                                </span>
                                                                <strong>
                                                                    {
                                                                        payrollData.bankAccount
                                                                    }
                                                                </strong>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">
                                                                    Next
                                                                    Payment:
                                                                </span>
                                                                <strong className="text-primary">
                                                                    {formatDate(
                                                                        payrollData.nextPayDate
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </Stack>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={6}>
                                                <Card className="border-0 shadow-sm">
                                                    <Card.Body>
                                                        <h6 className="mb-3">
                                                            Recent Payments
                                                        </h6>
                                                        <Table hover size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>
                                                                        Month
                                                                    </th>
                                                                    <th>
                                                                        Amount
                                                                    </th>
                                                                    <th>
                                                                        Status
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {payrollData.recentPayments.map(
                                                                    (
                                                                        payment,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <td>
                                                                                {
                                                                                    payment.month
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {formatCurrency(
                                                                                    payment.amount,
                                                                                    payrollData.currency
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                <Badge bg="success">
                                                                                    {
                                                                                        payment.status
                                                                                    }
                                                                                </Badge>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </Table>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="outline-primary"
                                                className="d-flex align-items-center"
                                            >
                                                <FaFileInvoiceDollar className="me-2" />
                                                Generate Payslip
                                            </Button>
                                        </div>
                                    </Tab>

                                    {/* Leaves Tab */}
                                    <Tab
                                        eventKey="leaves"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <FaCalendarAlt className="me-2" />
                                                Leaves
                                                {leavesData.upcomingLeaves
                                                    .length > 0 && (
                                                    <Badge
                                                        bg="warning"
                                                        className="ms-2"
                                                    >
                                                        {
                                                            leavesData
                                                                .upcomingLeaves
                                                                .length
                                                        }
                                                    </Badge>
                                                )}
                                            </span>
                                        }
                                        className="px-4 py-2"
                                    >
                                        <h5 className="mb-4">Leave Balance</h5>
                                        <Row className="mb-4">
                                            {Object.entries(leavesData)
                                                .slice(0, 3)
                                                .map(([key, data]) => (
                                                    <Col
                                                        md={4}
                                                        key={key}
                                                        className="mb-3"
                                                    >
                                                        <Card className="border-0 shadow-sm">
                                                            <Card.Body>
                                                                <h6 className="text-capitalize mb-3">
                                                                    {key.replace(
                                                                        "Leave",
                                                                        ""
                                                                    )}{" "}
                                                                    Leave
                                                                </h6>
                                                                <div className="text-center mb-3">
                                                                    <h2 className="text-primary">
                                                                        {
                                                                            data.remaining
                                                                        }
                                                                    </h2>
                                                                    <small className="text-muted">
                                                                        Days
                                                                        Remaining
                                                                    </small>
                                                                </div>
                                                                <ProgressBar>
                                                                    <ProgressBar
                                                                        variant="success"
                                                                        now={
                                                                            (data.used /
                                                                                data.total) *
                                                                            100
                                                                        }
                                                                        label={`${data.used}/${data.total}`}
                                                                    />
                                                                </ProgressBar>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                        </Row>

                                        <Row className="mb-4">
                                            <Col md={6}>
                                                <Card className="border-0 shadow-sm">
                                                    <Card.Body>
                                                        <h6 className="mb-3">
                                                            Upcoming Leaves
                                                        </h6>
                                                        {leavesData
                                                            .upcomingLeaves
                                                            .length > 0 ? (
                                                            <Stack gap={2}>
                                                                {leavesData.upcomingLeaves.map(
                                                                    (leave) => (
                                                                        <div
                                                                            key={
                                                                                leave.id
                                                                            }
                                                                            className="d-flex justify-content-between align-items-center p-2 border rounded"
                                                                        >
                                                                            <div>
                                                                                <strong>
                                                                                    {
                                                                                        leave.type
                                                                                    }{" "}
                                                                                    Leave
                                                                                </strong>
                                                                                <div className="text-muted small">
                                                                                    {formatDate(
                                                                                        leave.from
                                                                                    )}{" "}
                                                                                    -{" "}
                                                                                    {formatDate(
                                                                                        leave.to
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-end">
                                                                                <Badge
                                                                                    bg={getStatusVariant(
                                                                                        leave.status
                                                                                    )}
                                                                                    className="mb-1"
                                                                                >
                                                                                    {
                                                                                        leave.status
                                                                                    }
                                                                                </Badge>
                                                                                <div className="text-muted small">
                                                                                    {
                                                                                        leave.days
                                                                                    }{" "}
                                                                                    day(s)
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        ) : (
                                                            <Alert variant="info">
                                                                No upcoming
                                                                leaves scheduled
                                                            </Alert>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={6}>
                                                <Card className="border-0 shadow-sm">
                                                    <Card.Body>
                                                        <h6 className="mb-3">
                                                            Recent Leave History
                                                        </h6>
                                                        <Table hover size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>
                                                                        Type
                                                                    </th>
                                                                    <th>
                                                                        Period
                                                                    </th>
                                                                    <th>
                                                                        Days
                                                                    </th>
                                                                    <th>
                                                                        Status
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {leavesData.recentLeaves.map(
                                                                    (leave) => (
                                                                        <tr
                                                                            key={
                                                                                leave.id
                                                                            }
                                                                        >
                                                                            <td>
                                                                                {
                                                                                    leave.type
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {formatDate(
                                                                                    leave.from,
                                                                                    "MMM D"
                                                                                )}{" "}
                                                                                -{" "}
                                                                                {formatDate(
                                                                                    leave.to,
                                                                                    "MMM D"
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    leave.days
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <Badge
                                                                                    bg={getStatusVariant(
                                                                                        leave.status
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        leave.status
                                                                                    }
                                                                                </Badge>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </Table>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="primary"
                                                className="d-flex align-items-center"
                                            >
                                                <FaCalendarCheck className="me-2" />
                                                Apply for Leave
                                            </Button>
                                        </div>
                                    </Tab>

                                    {/* Documents Tab */}
                                    <Tab
                                        eventKey="documents"
                                        title={
                                            <span className="d-flex align-items-center">
                                                <FaFileAlt className="me-2" />
                                                Documents
                                            </span>
                                        }
                                        id="documents-tab"
                                        className="px-4 py-2"
                                    >
                                        <h5 className="mb-4">
                                            Staff Documents
                                        </h5>
                                        {documents.length > 0 ? (
                                            <Table hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Document Name</th>
                                                        <th>Type</th>
                                                        <th>Upload Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {documents.map((doc) => (
                                                        <tr key={doc.id}>
                                                            <td>
                                                                <FaFileAlt className="me-2 text-primary" />
                                                                {doc.name}
                                                            </td>
                                                            <td>
                                                                <Badge bg="secondary">
                                                                    {doc.type}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {formatDate(
                                                                    doc.date
                                                                )}
                                                            </td>
                                                            <td>
                                                                <ButtonGroup
                                                                    className="gap-2"
                                                                    size="sm"
                                                                >
                                                                    <Button variant="outline-primary">
                                                                        View
                                                                    </Button>
                                                                    <Button variant="outline-secondary">
                                                                        Download
                                                                    </Button>
                                                                </ButtonGroup>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        ) : (
                                            <EmptyState
                                                icon={FaFileAlt}
                                                title="No Documents"
                                                message="No documents have been uploaded for this staff member."
                                                action={
                                                    <Button variant="primary">
                                                        <FaFileAlt className="me-2" />
                                                        Upload Document
                                                    </Button>
                                                }
                                            />
                                        )}

                                        <div className="d-flex justify-content-between mt-4">
                                            <small className="text-muted">
                                                Total Documents:{" "}
                                                {documents.length}
                                            </small>
                                            <Button
                                                variant="primary"
                                                className="d-flex align-items-center"
                                            >
                                                <FaFileAlt className="me-2" />
                                                Upload New Document
                                            </Button>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>

                        {/* Additional Information Section */}
                        <Card className="border-0 shadow-sm mt-4">
                            <Card.Header className="bg-light border-0">
                                <h6 className="mb-0 fw-bold">
                                    Additional Information
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <small className="text-muted d-block mb-1">
                                            Last Login
                                        </small>
                                        <p className="mb-0">
                                            {staff.last_login_at
                                                ? formatDate(
                                                      staff.last_login_at,
                                                      "MMMM D, YYYY [at] h:mm A"
                                                  )
                                                : "Never logged in"}
                                        </p>
                                    </Col>
                                    <Col md={6}>
                                        <small className="text-muted d-block mb-1">
                                            Account Created
                                        </small>
                                        <p className="mb-0">
                                            {formatDate(
                                                staff.created_at,
                                                "MMMM D, YYYY"
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                                {staff.notes && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-1">
                                            Admin Notes
                                        </small>
                                        <div className="border rounded p-3 bg-light">
                                            <p className="mb-0">
                                                {staff.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </AuthenticatedLayout>
    );
}
