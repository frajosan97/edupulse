import { Row, Col, Card, Badge, Button, ListGroup } from "react-bootstrap";
import { CashCoin } from "react-bootstrap-icons";

const FinancialInfoTab = ({ student }) => {
    return (
        <Row>
            <Col lg={6}>
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Fee Structure</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Tuition Fee</h6>
                                    <small className="text-muted">
                                        Per term
                                    </small>
                                </div>
                                <span>Ksh 1,200.00</span>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Development Fee</h6>
                                    <small className="text-muted">
                                        One-time
                                    </small>
                                </div>
                                <span>Ksh 300.00</span>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Library Fee</h6>
                                    <small className="text-muted">
                                        Per term
                                    </small>
                                </div>
                                <span>Ksh 50.00</span>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Sports Fee</h6>
                                    <small className="text-muted">
                                        Per term
                                    </small>
                                </div>
                                <span>Ksh 75.00</span>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Laboratory Fee</h6>
                                    <small className="text-muted">
                                        Per term
                                    </small>
                                </div>
                                <span>Ksh 100.00</span>
                            </ListGroup.Item>
                        </ListGroup>

                        <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                            <h5>Total</h5>
                            <h5>Ksh 1,725.00</h5>
                        </div>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Payment Methods</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="mb-3">
                            <h6>Bank Transfer</h6>
                            <p className="mb-1">Account Name: School Account</p>
                            <p className="mb-1">Account Number: 1234567890</p>
                            <p className="mb-1">Bank Name: Example Bank</p>
                            <p>
                                Reference: Student ID -{" "}
                                {student.student?.student_id}
                            </p>
                        </div>

                        <div>
                            <h6>Mobile Payment</h6>
                            <p className="mb-1">
                                Provider: Example Mobile Money
                            </p>
                            <p className="mb-1">Number: 0123456789</p>
                            <p>
                                Reference: Student ID -{" "}
                                {student.student?.student_id}
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={6}>
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">Payment History</h5>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Term 3 Payment</h6>
                                    <small className="text-muted">
                                        September 15, 2023
                                    </small>
                                </div>
                                <Badge bg="success">Ksh 1,725.00</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Term 2 Payment</h6>
                                    <small className="text-muted">
                                        April 10, 2023
                                    </small>
                                </div>
                                <Badge bg="success">Ksh 1,725.00</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Term 1 Payment</h6>
                                    <small className="text-muted">
                                        January 5, 2023
                                    </small>
                                </div>
                                <Badge bg="success">Ksh 1,725.00</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Development Fee</h6>
                                    <small className="text-muted">
                                        December 15, 2022
                                    </small>
                                </div>
                                <Badge bg="success">Ksh 300.00</Badge>
                            </ListGroup.Item>

                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">
                                        Term 3 Payment (2022)
                                    </h6>
                                    <small className="text-muted">
                                        September 10, 2022
                                    </small>
                                </div>
                                <Badge bg="success">Ksh 1,600.00</Badge>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Outstanding Balance</h5>
                        <Badge bg="success">Paid in Full</Badge>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center py-4">
                            <CashCoin size={48} className="text-success mb-3" />
                            <h3 className="text-success">Ksh 0.00</h3>
                            <p className="text-muted">No outstanding fees</p>
                        </div>

                        <Button variant="outline-primary" className="w-100">
                            Generate Payment Receipt
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default FinancialInfoTab;
