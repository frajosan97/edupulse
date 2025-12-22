import {
    Row,
    Col,
    Card,
    Button,
    ListGroup,
    ButtonGroup,
} from "react-bootstrap";
import { Telephone } from "react-bootstrap-icons";
import { MessageSquare } from "react-feather";

const ParentInfoTab = ({ student }) => {
    return (
        <Row className="g-3">
            <Col lg={8}>
                <Card className="h-100">
                    <Card.Header className="bg-transparent">
                        <h5 className="mb-0">Parents/Guardians</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {student.student?.parents &&
                            student.student.parents.length > 0 ? (
                                student.student.parents.map((parent, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        className="d-flex w-100 justify-content-between align-items-center"
                                    >
                                        <div className="d-flex w-100 justify-content-start align-items-center">
                                            <img
                                                src={`/storage/${
                                                    parent.profile_image ??
                                                    "images/landlord/profiles/avatar.png"
                                                }`}
                                                alt={parent?.full_name}
                                                className="rounded-circle shadow me-3"
                                                width={50}
                                                height={50}
                                                style={{ objectFit: "cover" }}
                                            />

                                            <div className="">
                                                <strong className="text-capitalize">
                                                    {parent.full_name}
                                                </strong>
                                                <p
                                                    className="m-0 p-0"
                                                    as="a"
                                                    href={`tel:${parent.phone}`}
                                                >
                                                    {parent.phone || "N/A"}
                                                </p>
                                                <p
                                                    className="m-0 p-0"
                                                    as="a"
                                                    href={`mailto:${parent.email}`}
                                                >
                                                    {parent.email || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <ButtonGroup className="d-grid gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="text-nowrap"
                                                as="a"
                                                href={`sms:${parent.phone}`}
                                            >
                                                <MessageSquare className="me-1" />{" "}
                                                SMS
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="text-nowrap"
                                                as="a"
                                                href={`tel:${parent.phone}`}
                                            >
                                                <Telephone className="me-1" />{" "}
                                                Call
                                            </Button>
                                        </ButtonGroup>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item>
                                    No parents/guardians found.
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={4}>
                <Card className="h-100">
                    <Card.Header className="bg-transparent">
                        <h5 className="mb-0">Contact History</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="text-center py-5">
                                No history available
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ParentInfoTab;
