import { formatDate } from "@/Utils/helpers";
import { Row, Col, Card, Badge, ProgressBar, Button } from "react-bootstrap";
import {
    Person,
    Telephone,
    Envelope,
    Calendar,
    GenderAmbiguous,
    CardHeading,
    PersonBadge,
} from "react-bootstrap-icons";

const PersonalInfoTab = ({ student }) => {
    // Calculate age from date of birth if available
    const calculateAge = (birthDate) => {
        if (!birthDate) return "N/A";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        return age;
    };

    return (
        <Row>
            <Col md={4}>
                <Card className="mb-4">
                    <Card.Body className="text-center">
                        <div className="mb-3">
                            <img
                                src={`/storage/${
                                    student.profile_image ??
                                    "images/landlord/profiles/avatar.png"
                                }`}
                                alt={student?.full_name}
                                className="rounded-circle shadow"
                                width={140}
                                height={140}
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        <h4>{student.full_name}</h4>
                        <p className="text-muted">
                            {student.student?.student_id}
                        </p>
                        <Badge bg={student.is_active ? "success" : "secondary"}>
                            {student.is_active ? "Active" : "Inactive"}
                        </Badge>

                        <div className="mt-3">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                            >
                                <Telephone className="me-1" /> Call
                            </Button>
                            <Button variant="outline-primary" size="sm">
                                <Envelope className="me-1" /> Email
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Attendance</span>
                            <strong>92%</strong>
                        </div>
                        <ProgressBar
                            now={92}
                            variant="success"
                            className="mb-3"
                        />

                        <div className="d-flex justify-content-between mb-2">
                            <span>Performance</span>
                            <strong>85%</strong>
                        </div>
                        <ProgressBar now={85} variant="info" className="mb-3" />

                        <div className="d-flex justify-content-between mb-2">
                            <span>Assignment Completion</span>
                            <strong>78%</strong>
                        </div>
                        <ProgressBar now={78} />
                    </Card.Body>
                </Card>
            </Col>

            <Col md={8}>
                <Card className="mb-4">
                    <Card.Header className="bg-transparent">
                        <h5 className="mb-0">Personal Details</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <Person size={30} className="me-2" />
                                <div>
                                    <strong>Full Name</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.full_name}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <CardHeading size={30} className="me-2" />
                                <div>
                                    <strong>Student ID</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.student?.student_id}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <GenderAmbiguous size={30} className="me-2" />
                                <div>
                                    <strong>Gender</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.gender}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <Calendar size={30} className="me-2" />
                                <div>
                                    <strong>Date of Birth</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.dob
                                            ? new Date(
                                                  student.dob
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <PersonBadge size={30} className="me-2" />
                                <div>
                                    <strong>Age</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.dob
                                            ? `${calculateAge(
                                                  student.dob
                                              )} years`
                                            : "N/A"}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <Envelope size={30} className="me-2" />
                                <div>
                                    <strong>Email</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {student.email}
                                    </p>
                                </div>
                            </Col>

                            <Col
                                sm={6}
                                className="d-flex justify-content-start align-items-center mb-2"
                            >
                                <Calendar size={30} className="me-2" />
                                <div>
                                    <strong>Admission Date</strong>
                                    <p className="p-0 m-0 text-muted">
                                        {formatDate(
                                            student.student.admission_date
                                        )}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default PersonalInfoTab;
