import { Head } from "@inertiajs/react";
import {
    Card,
    Tab,
    Row,
    Col,
    ButtonGroup,
    Button,
    Tabs,
} from "react-bootstrap";
import { activeBadge } from "@/Utils/helpers";

import PortalLayout from "@/Layouts/PortalLayout";
import StreamsTab from "@/Components/Partials/ClassShow/StreamsTab";
import StudentsTab from "@/Components/Partials/ClassShow/StudentsTab";

export default function ClassShow({ classData, streams = [], teachers = [] }) {
    const { name, is_active, class_teacher, assistant_teacher } = classData;

    return (
        <PortalLayout>
            <Head title={`Class ${name} Details`} />

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 text-capitalize mb-0">
                    <i className="bi bi-mortarboard-fill me-2"></i>
                    {name} Management
                </h1>
                <ButtonGroup>
                    <Button
                        variant="outline-primary"
                        className="rounded"
                        onClick={() => window.history.back()}
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back
                    </Button>
                </ButtonGroup>
            </div>

            <hr className="dashed-hr" />

            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Tabs
                                defaultActiveKey="classInfo"
                                transition={false}
                                id="class-details-tabs"
                                className="mb-3 p-1 pb-0"
                            >
                                {/* CLASS INFO TAB */}
                                <Tab
                                    eventKey="classInfo"
                                    title={
                                        <>
                                            <i className="bi bi-info-circle me-1"></i>
                                            Class Information
                                        </>
                                    }
                                >
                                    <Row className="g-3 mt-2">
                                        <Col md={6}>
                                            <div className="border rounded p-3 bg-light">
                                                <p className="text-muted small mb-1">
                                                    Class Name
                                                </p>
                                                <h5>
                                                    <i className="bi bi-building me-2"></i>
                                                    {name}
                                                </h5>
                                            </div>
                                        </Col>

                                        <Col md={6}>
                                            <div className="border rounded p-3 bg-light">
                                                <p className="text-muted small mb-1">
                                                    Status
                                                </p>
                                                {activeBadge(is_active)}
                                            </div>
                                        </Col>

                                        <Col md={6}>
                                            <div className="border rounded p-3 bg-light">
                                                <p className="text-muted small mb-1">
                                                    <i className="bi bi-person-badge me-1"></i>
                                                    Class Teacher
                                                </p>
                                                <h5>
                                                    {class_teacher?.full_name ||
                                                        "Not assigned"}
                                                </h5>
                                            </div>
                                        </Col>

                                        <Col md={6}>
                                            <div className="border rounded p-3 bg-light">
                                                <p className="text-muted small mb-1">
                                                    <i className="bi bi-person me-1"></i>
                                                    Assistant Teacher
                                                </p>
                                                <h5>
                                                    {assistant_teacher?.full_name ||
                                                        "Not assigned"}
                                                </h5>
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab>

                                {/* STREAMS TAB */}
                                <Tab
                                    eventKey="streams"
                                    title={
                                        <>
                                            <i className="bi bi-diagram-3 me-1"></i>
                                            Streams
                                        </>
                                    }
                                >
                                    <StreamsTab
                                        classData={classData}
                                        streams={streams}
                                        teachers={teachers}
                                    />
                                </Tab>

                                {/* STUDENTS TAB */}
                                <Tab
                                    eventKey="students"
                                    title={
                                        <>
                                            <i className="bi bi-people-fill me-1"></i>
                                            Students
                                        </>
                                    }
                                >
                                    <StudentsTab classData={classData} />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </PortalLayout>
    );
}
