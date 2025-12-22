import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
    Container,
    Card,
    Tab,
    Button,
    Tabs,
    Row,
    Col,
    ButtonGroup,
} from "react-bootstrap";
import {
    ClipboardCheck,
    GraphUp,
    PersonCircle,
    BookHalf,
    Mortarboard,
    CashStack,
    PeopleFill,
} from "react-bootstrap-icons";

import AcademicInfoTab from "@/Components/Partials/StudentShow/AcademicInfoTab";
import FinancialInfoTab from "@/Components/Partials/StudentShow/FinancialInfoTab";
import ParentInfoTab from "@/Components/Partials/StudentShow/ParentInfoTab";
import PersonalInfoTab from "@/Components/Partials/StudentShow/PersonalInfoTab";
import SubjectsTab from "@/Components/Partials/StudentShow/SubjectsTab";
import PortalLayout from "@/Layouts/PortalLayout";

const ShowStudent = ({ student = null, subjects = [] }) => {
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <PortalLayout>
            <Head title={student.full_name} />

            <Row>
                <Col
                    md={12}
                    className="d-flex justify-content-between align-items-center"
                >
                    <h2 className="m-0 text-capitalize">{student.full_name}</h2>
                    <ButtonGroup>
                        <Button variant="outline-secondary" className="me-2">
                            <ClipboardCheck className="me-1" /> Reports
                        </Button>
                        <Button variant="primary">
                            <GraphUp className="me-1" /> Performance
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr" />

            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-3 p-1 pb-0"
                            >
                                <Tab
                                    eventKey="personal"
                                    title={
                                        <>
                                            <PersonCircle className="me-1" />
                                            Personal
                                        </>
                                    }
                                >
                                    <PersonalInfoTab student={student} />
                                </Tab>

                                <Tab
                                    eventKey="subjects"
                                    title={
                                        <>
                                            <BookHalf className="me-1" />
                                            Subjects
                                        </>
                                    }
                                >
                                    <SubjectsTab
                                        student={student}
                                        subjects={subjects}
                                    />
                                </Tab>

                                {/* <Tab
                                    eventKey="academic"
                                    title={
                                        <>
                                            <Mortarboard className="me-1" />
                                            Academic
                                        </>
                                    }
                                >
                                    <AcademicInfoTab student={student} />
                                </Tab>

                                <Tab
                                    eventKey="financial"
                                    title={
                                        <>
                                            <CashStack className="me-1" />
                                            Financial
                                        </>
                                    }
                                >
                                    <FinancialInfoTab student={student} />
                                </Tab> */}

                                <Tab
                                    eventKey="parents"
                                    title={
                                        <>
                                            <PeopleFill className="me-1" />
                                            Parents
                                        </>
                                    }
                                >
                                    <ParentInfoTab student={student} />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </PortalLayout>
    );
};

export default ShowStudent;
