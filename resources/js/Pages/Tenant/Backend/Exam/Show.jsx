import PortalLayout from "@/Layouts/PortalLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Badge,
    Button,
    Card,
    Col,
    Row,
    Table,
    Alert,
    Container,
} from "react-bootstrap";

export default function ExamShow({ exam }) {
    const hasResults = exam?.results?.length > 0;
    const totalClasses = exam?.class_data?.length || 0;
    const publishedClasses =
        exam?.class_data?.filter((c) => c.unpublished_count === 0)?.length || 0;
    const publicationProgress =
        totalClasses > 0 ? (publishedClasses / totalClasses) * 100 : 0;

    return (
        <PortalLayout>
            <Head title={`${exam?.name} - Results Overview`} />

            <Container fluid>
                {/* Header Section */}
                <Row className="align-items-center mb-4">
                    <Col>
                        <div className="d-flex align-items-center mb-2">
                            <div className="">
                                <h1 className="h3 mb-1 fw-bold text-dark">
                                    {exam?.name}
                                </h1>
                                <p className="text-muted mb-0">
                                    Exam Results Overview
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col xs="auto">
                        <Card className="border-0">
                            <Card.Body className="py-2">
                                <Row className="g-4 text-center">
                                    <Col>
                                        <div className="h4 mb-0 fw-bold text-primary">
                                            {totalClasses}
                                        </div>
                                        <small className="text-muted">
                                            Classes
                                        </small>
                                    </Col>
                                    <Col>
                                        <div className="h4 mb-0 fw-bold text-success">
                                            {publishedClasses}
                                        </div>
                                        <small className="text-muted">
                                            Published
                                        </small>
                                    </Col>
                                    <Col>
                                        <div className="h4 mb-0 fw-bold text-warning">
                                            {totalClasses - publishedClasses}
                                        </div>
                                        <small className="text-muted">
                                            Pending
                                        </small>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <hr className="dashed-hr" />

                {/* Results Section */}
                <Row>
                    <Col>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                {hasResults ? (
                                    <Table
                                        responsive
                                        hover
                                        striped
                                        borderless
                                        className="border mb-0"
                                    >
                                        <tbody>
                                            {exam.class_data?.map(
                                                (c, index) => (
                                                    <tr key={c.class?.id}>
                                                        <td className="ps-4 py-3">
                                                            <div>
                                                                <h6 className="mb-1 fw-semibold text-capitalize">
                                                                    <i className="bi bi-building me-2 text-muted"></i>
                                                                    {
                                                                        c.class
                                                                            ?.name
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    Class ID:{" "}
                                                                    {
                                                                        c.class
                                                                            ?.id
                                                                    }
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <i className="bi bi-people me-2 text-muted"></i>
                                                                <span className="fw-medium">
                                                                    {
                                                                        c.students_count
                                                                    }
                                                                </span>
                                                                <small className="text-muted ms-1">
                                                                    students
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            {c.unpublished_count >
                                                            0 ? (
                                                                <Badge
                                                                    bg="warning"
                                                                    className="px-3 py-2"
                                                                >
                                                                    <i className="bi bi-x-circle me-1"></i>
                                                                    {
                                                                        c.unpublished_count
                                                                    }{" "}
                                                                    Unpublished
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    bg="success"
                                                                    className="px-3 py-2"
                                                                >
                                                                    <i className="bi bi-check-circle me-1"></i>
                                                                    Published
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="pe-4 py-3 text-end">
                                                            <Button
                                                                as={Link}
                                                                href={route(
                                                                    "admin.result.analyze",
                                                                    {
                                                                        exam: exam.id,
                                                                        class: c
                                                                            .class
                                                                            ?.id,
                                                                    }
                                                                )}
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="me-2"
                                                            >
                                                                <i className="bi bi-graph-up me-2"></i>
                                                                Analyze
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-inbox display-1 text-muted opacity-50 mb-3"></i>
                                        <h5 className="text-muted mb-2">
                                            No Results Found
                                        </h5>
                                        <p
                                            className="text-muted mb-4 mx-auto"
                                            style={{ maxWidth: "400px" }}
                                        >
                                            No exam results have been recorded
                                            yet. Start by entering students'
                                            results for this exam.
                                        </p>
                                        <Button
                                            as={Link}
                                            href={route("admin.result.create")}
                                            variant="primary"
                                            size="lg"
                                            className="me-3"
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Enter Results
                                        </Button>
                                        <Button
                                            as={Link}
                                            href="#"
                                            variant="outline-secondary"
                                            size="lg"
                                        >
                                            <i className="bi bi-upload me-2"></i>
                                            Bulk Upload
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Empty State Guidance */}
                {!hasResults && (
                    <Row className="mt-4">
                        <Col>
                            <Alert
                                variant="info"
                                className="border-0 shadow-sm"
                            >
                                <Alert.Heading className="d-flex align-items-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Getting Started with Exam Results
                                </Alert.Heading>
                                <Row>
                                    <Col md={6}>
                                        <ul className="mb-0">
                                            <li>
                                                Ensure all students are properly
                                                enrolled in their respective
                                                classes
                                            </li>
                                            <li>
                                                Use the bulk upload feature for
                                                faster result entry
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col md={6}>
                                        <ul className="mb-0">
                                            <li>
                                                Review results before publishing
                                                to parents and students
                                            </li>
                                            <li>
                                                Set up automatic notifications
                                                for result publication
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Alert>
                        </Col>
                    </Row>
                )}
            </Container>
        </PortalLayout>
    );
}
