import { Row, Col, Card, Badge, ProgressBar, ListGroup } from "react-bootstrap";
import { Person, Building, JournalBookmark } from "react-bootstrap-icons";

const AcademicInfoTab = ({ student }) => {
    return (
        <Row>
            <Col lg={6}>
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Current Class Information</h5>
                    </Card.Header>
                    <Card.Body>
                        {student.student?.class ? (
                            <>
                                <div className="d-flex align-items-center mb-3">
                                    <Building
                                        className="text-primary me-2"
                                        size={20}
                                    />
                                    <div>
                                        <h6 className="mb-0">
                                            {student.student.class.name}
                                        </h6>
                                        <small className="text-muted">
                                            Class
                                        </small>
                                    </div>
                                </div>

                                {student.student.classStream && (
                                    <div className="d-flex align-items-center mb-3">
                                        <JournalBookmark
                                            className="text-primary me-2"
                                            size={20}
                                        />
                                        <div>
                                            <h6 className="mb-0">
                                                {
                                                    student.student.classStream
                                                        .stream.name
                                                }
                                            </h6>
                                            <small className="text-muted">
                                                Stream
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {student.student.class.class_teacher && (
                                    <div className="d-flex align-items-center mb-3">
                                        <Person
                                            className="text-primary me-2"
                                            size={20}
                                        />
                                        <div>
                                            <h6 className="mb-0">
                                                {
                                                    student.student.class
                                                        .class_teacher.full_name
                                                }
                                            </h6>
                                            <small className="text-muted">
                                                Class Teacher
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {student.student.class.assistant_teacher && (
                                    <div className="d-flex align-items-center">
                                        <Person
                                            className="text-primary me-2"
                                            size={20}
                                        />
                                        <div>
                                            <h6 className="mb-0">
                                                {
                                                    student.student.class
                                                        .assistant_teacher
                                                        .full_name
                                                }
                                            </h6>
                                            <small className="text-muted">
                                                Assistant Teacher
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>No class information available.</p>
                        )}
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Academic Performance</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Mathematics</span>
                                <strong>85%</strong>
                            </div>
                            <ProgressBar
                                now={85}
                                variant="success"
                                className="mb-2"
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>English</span>
                                <strong>92%</strong>
                            </div>
                            <ProgressBar
                                now={92}
                                variant="success"
                                className="mb-2"
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Science</span>
                                <strong>78%</strong>
                            </div>
                            <ProgressBar
                                now={78}
                                variant="info"
                                className="mb-2"
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Social Studies</span>
                                <strong>82%</strong>
                            </div>
                            <ProgressBar
                                now={82}
                                variant="success"
                                className="mb-2"
                            />
                        </div>

                        <div>
                            <div className="d-flex justify-content-between">
                                <span>Arts</span>
                                <strong>88%</strong>
                            </div>
                            <ProgressBar now={88} variant="success" />
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={6}>
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Recent Assessments</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Mathematics Test</h6>
                                    <small className="text-muted">
                                        October 15, 2023
                                    </small>
                                </div>
                                <Badge bg="success">A</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">English Essay</h6>
                                    <small className="text-muted">
                                        October 10, 2023
                                    </small>
                                </div>
                                <Badge bg="success">A-</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Science Project</h6>
                                    <small className="text-muted">
                                        October 5, 2023
                                    </small>
                                </div>
                                <Badge bg="info">B+</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">History Exam</h6>
                                    <small className="text-muted">
                                        September 28, 2023
                                    </small>
                                </div>
                                <Badge bg="success">A</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Art Assignment</h6>
                                    <small className="text-muted">
                                        September 20, 2023
                                    </small>
                                </div>
                                <Badge bg="success">A+</Badge>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header>
                        <h5 className="mb-0">Attendance Summary</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center mb-3">
                            <h3 className="text-success">92%</h3>
                            <p className="text-muted">
                                Overall Attendance Rate
                            </p>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span>Present</span>
                            <strong>115 days</strong>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span>Absent</span>
                            <strong>10 days</strong>
                        </div>

                        <div className="d-flex justify-content-between">
                            <span>Late</span>
                            <strong>5 days</strong>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default AcademicInfoTab;
