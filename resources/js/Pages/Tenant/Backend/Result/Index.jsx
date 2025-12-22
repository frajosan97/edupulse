import { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Badge,
    Tabs,
    Tab,
    ButtonGroup,
    Dropdown,
    ListGroup,
} from "react-bootstrap";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
    LabelList,
} from "recharts";
import {
    PeopleFill,
    AwardFill,
    BarChartFill,
    StarFill,
    GraphUp,
    Download,
} from "react-bootstrap-icons";
import Select from "react-select";
import PortalLayout from "@/Layouts/PortalLayout";

/* =================== TOOLTIP =================== */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="custom-tooltip p-3 bg-white border shadow-sm rounded">
                <p className="fw-bold mb-1">{label}</p>
                <p className="mb-0 text-primary">
                    Count: <span className="fw-bold">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

/* =================== STAT CARD =================== */
const StatCard = ({ icon: Icon, color, title, value, subtitle }) => (
    <Card className="h-100 shadow-sm border-0">
        <Card.Body className="d-flex align-items-center p-3">
            <div
                className={`bg-${color} bg-opacity-10 rounded-circle p-3 me-3`}
            >
                <Icon size={24} className={`text-${color}`} />
            </div>
            <div>
                <h4 className="mb-0 fw-bold">{value ?? "-"}</h4>
                <small className="text-muted">{title}</small>
                {subtitle && (
                    <div className="text-xs text-muted mt-1">{subtitle}</div>
                )}
            </div>
        </Card.Body>
    </Card>
);

/* =================== MERIT LIST TABLE ROW =================== */
const MeritRow = ({ student, subjects }) => {
    const getSubjectMark = (subjectId) => {
        const match = student.subjects.find(
            (sub) => sub.subject_id === subjectId
        );
        return match ? match.full_marks : "--";
    };

    return (
        <tr>
            <td>{student.admission_number}</td>
            <td>{student.name}</td>
            <td>{student.class}</td>
            {subjects.map((subject) => (
                <td key={subject.subjectInfo.id}>
                    {getSubjectMark(subject.subjectInfo.id)}
                </td>
            ))}
            <td className="fw-semibold">{student.total_marks?.toFixed(2)}</td>
            <td className="fw-semibold">{student.avg_marks?.toFixed(2)}</td>
            <td className="fw-semibold">{student.avg_points?.toFixed(2)}</td>
            <td className="fw-semibold">{student.avg_grade}</td>
            <td className="fw-semibold">{student.class_rank}</td>
        </tr>
    );
};

/* =================== GRADE BADGE =================== */
const GradeBadge = ({ grade, color, count }) => (
    <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
        <div className="d-flex align-items-center">
            <span
                className="badge me-2"
                style={{
                    backgroundColor: color,
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                }}
            />
            Grade {grade}
        </div>
        <Badge bg="light" text="dark">
            {count} students
        </Badge>
    </ListGroup.Item>
);

export default function ResultsAnalyze({ examInfo }) {
    const analysis = examInfo?.analysis || {};
    const {
        overviewStats = {},
        gradeDistribution = {},
        subjectPerformance = {},
        meritList = [],
    } = analysis;

    // Extract general grade distribution
    const generalGradeDist = gradeDistribution.general || {};
    const streamGradeDist = gradeDistribution.streams || {};

    // Default subject: first subject from performance data
    const subjectKeys = Object.keys(subjectPerformance);
    const [selectedSubject, setSelectedSubject] = useState(
        subjectKeys[0] || ""
    );
    const [activeTab, setActiveTab] = useState("overview");

    /* ====== Data transforms ====== */

    // Grade distribution for general (overall)
    const gradeDistData = useMemo(() => {
        if (!generalGradeDist.grades) return [];

        return Object.entries(generalGradeDist.grades).map(([grade, data]) => ({
            grade,
            count: data.count,
            color: data.color,
        }));
    }, [generalGradeDist]);

    // Stream analysis data for pie chart
    const streamData = useMemo(() => {
        return Object.entries(streamGradeDist).map(([name, data]) => ({
            name,
            grade: data.grade,
            value: data.mean,
            fill: data.color,
        }));
    }, [streamGradeDist]);

    // Subject performance data (avg only for bar chart)
    const subjectPerfData = useMemo(() => {
        return Object.entries(subjectPerformance).map(([subject, data]) => ({
            subject,
            avg: data.general?.avg || 0,
        }));
    }, [subjectPerformance]);

    // Subject dropdown options
    const subjectOptions = useMemo(() => {
        return Object.keys(subjectPerformance).map((subject) => ({
            value: subject,
            label: subject,
        }));
    }, [subjectPerformance]);

    // Get grades for currently selected subject
    const selectedSubjectGrades = useMemo(() => {
        const subjectData = subjectPerformance[selectedSubject];
        return subjectData?.general?.grades || [];
    }, [subjectPerformance, selectedSubject]);

    // Extract subjects array for merit list
    const subjectsArray = useMemo(() => {
        return Object.values(subjectPerformance).map((item) => item.general);
    }, [subjectPerformance]);

    // Sort merit list by class rank
    const sortedMeritList = useMemo(() => {
        return [...meritList].sort(
            (a, b) => (a.class_rank || 0) - (b.class_rank || 0)
        );
    }, [meritList]);

    if (!examInfo) {
        return (
            <PortalLayout>
                <Container fluid>
                    <div className="text-center py-5">
                        <h3>No exam data available</h3>
                    </div>
                </Container>
            </PortalLayout>
        );
    }

    return (
        <PortalLayout>
            <Head title="Results Analysis" />

            <Container fluid>
                {/* =================== HEADER =================== */}
                <Row className="mb-2">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 className="h3 fw-bold text-dark mb-1 text-capitalize">
                                    Form {examInfo?.classInfo?.name} –{" "}
                                    {examInfo?.name}
                                </h1>
                                <p className="text-muted mb-0">
                                    Comprehensive analysis of examination
                                    results and performance metrics
                                </p>
                            </div>
                            <ButtonGroup>
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="outline-primary"
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <Download size={18} /> Reports
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="border-0 shadow">
                                        <Dropdown.Header className="fw-bold text-primary">
                                            Merit List
                                        </Dropdown.Header>
                                        <Dropdown.Item
                                            href={route("analysis.pdf", [
                                                examInfo?.id,
                                                examInfo?.class_info?.id,
                                            ])}
                                            target="_blank"
                                        >
                                            PDF Report
                                        </Dropdown.Item>
                                        <Dropdown.Header className="fw-bold text-primary">
                                            Report Forms
                                        </Dropdown.Header>
                                        <Dropdown.Item
                                            href={route("report-forms.pdf", [
                                                examInfo?.id,
                                                examInfo?.class_info?.id,
                                            ])}
                                            target="_blank"
                                        >
                                            Report Forms
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </ButtonGroup>
                        </div>
                    </Col>
                </Row>

                <hr className="dashed-hr" />

                {/* =================== QUICK STATS =================== */}
                <Row className="g-3 mb-3">
                    <Col md={3} sm={6}>
                        <StatCard
                            icon={PeopleFill}
                            color="primary"
                            title="Students"
                            value={overviewStats.students}
                        />
                    </Col>
                    <Col md={3} sm={6}>
                        <StatCard
                            icon={AwardFill}
                            color="success"
                            title="Mean Marks"
                            value={overviewStats.avgMarks}
                        />
                    </Col>
                    <Col md={3} sm={6}>
                        <StatCard
                            icon={StarFill}
                            color="warning"
                            title="Mean Points"
                            value={overviewStats.avgPoints}
                        />
                    </Col>
                    <Col md={3} sm={6}>
                        <StatCard
                            icon={GraphUp}
                            color="info"
                            title="Mean Grade"
                            value={overviewStats.avgGrade}
                        />
                    </Col>
                </Row>

                {/* =================== MAIN TABS =================== */}
                <Tabs
                    activeKey={activeTab}
                    onSelect={setActiveTab}
                    className="mb-3 p-1 pb-0"
                >
                    {/* ========== OVERVIEW TAB ========== */}
                    <Tab
                        eventKey="overview"
                        title={
                            <>
                                <BarChartFill className="me-2" size={16} />
                                Overview
                            </>
                        }
                    >
                        <Row className="g-4">
                            {/* --- Stream Analysis --- */}
                            <Col lg={6}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Header className="bg-white border-0 py-3">
                                        <h5 className="mb-0 fw-bold">
                                            Stream Distribution
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {streamData.length > 0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={streamData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        innerRadius={60}
                                                        label={({
                                                            name,
                                                            value,
                                                            grade,
                                                        }) =>
                                                            `${name}: ${value} (${grade})`
                                                        }
                                                        labelLine={false}
                                                    >
                                                        {streamData.map(
                                                            (entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        entry.fill
                                                                    }
                                                                    stroke="#fff"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => [
                                                            `${value}`,
                                                            "Mean Mark",
                                                        ]}
                                                        labelFormatter={(
                                                            name
                                                        ) => `Stream: ${name}`}
                                                    />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={36}
                                                        wrapperStyle={{
                                                            fontSize: "12px",
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No stream data available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* --- Grade Distribution --- */}
                            <Col lg={6}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Header className="bg-white border-0 py-3">
                                        <h5 className="mb-0 fw-bold">
                                            Grade Distribution
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {gradeDistData.length > 0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <BarChart data={gradeDistData}>
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis dataKey="grade" />
                                                    <YAxis />
                                                    <Tooltip
                                                        content={
                                                            <CustomTooltip />
                                                        }
                                                    />
                                                    <Bar
                                                        dataKey="count"
                                                        radius={[4, 4, 0, 0]}
                                                    >
                                                        {gradeDistData.map(
                                                            (entry, index) => (
                                                                <Cell
                                                                    key={index}
                                                                    fill={
                                                                        entry.color
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                        <LabelList
                                                            dataKey="count"
                                                            position="top"
                                                            fill="#495057"
                                                            fontSize={12}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No grade distribution data
                                                available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    {/* ========== SUBJECTS TAB ========== */}
                    <Tab
                        eventKey="subjects"
                        title={
                            <>
                                <GraphUp className="me-2" size={16} />
                                Subjects Analysis
                            </>
                        }
                    >
                        <Row className="g-4">
                            {/* --- Subject Performance --- */}
                            <Col lg={8}>
                                <Card className="shadow-sm border-0">
                                    <Card.Header className="bg-white border-0 py-3">
                                        <h5 className="mb-0 fw-bold">
                                            Subject Performance Overview
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {subjectPerfData.length > 0 ? (
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <BarChart
                                                    data={subjectPerfData}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="subject"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                        interval={0}
                                                        fontSize={12}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="avg"
                                                        radius={[4, 4, 0, 0]}
                                                        fill="#0d6efd"
                                                    >
                                                        <LabelList
                                                            dataKey="avg"
                                                            position="top"
                                                            fill="#495057"
                                                            fontSize={11}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                No subject performance data
                                                available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* --- Subject Grades --- */}
                            <Col lg={4}>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <Select
                                            value={{
                                                value: selectedSubject,
                                                label: selectedSubject,
                                            }}
                                            options={subjectOptions}
                                            onChange={(option) =>
                                                setSelectedSubject(
                                                    option?.value || ""
                                                )
                                            }
                                            isDisabled={
                                                subjectOptions.length === 0
                                            }
                                        />
                                        <hr className="dashed-hr" />
                                        <ListGroup variant="flush">
                                            {selectedSubjectGrades.length >
                                            0 ? (
                                                selectedSubjectGrades.map(
                                                    (item) => (
                                                        <GradeBadge
                                                            key={item.grade}
                                                            grade={item.grade}
                                                            color={item.color}
                                                            count={item.count}
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-3 text-muted">
                                                    No grade data for selected
                                                    subject
                                                </div>
                                            )}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>

                    {/* ========== MERIT LIST TAB ========== */}
                    <Tab
                        eventKey="merit"
                        title={
                            <>
                                <AwardFill className="me-2" size={16} />
                                Merit List
                            </>
                        }
                    >
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-0">
                                {sortedMeritList.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table
                                            hover
                                            responsive
                                            borderless
                                            striped
                                            className="mb-0 text-capitalize"
                                        >
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Adm</th>
                                                    <th>Name</th>
                                                    <th>Class</th>
                                                    {subjectsArray.map(
                                                        (subject) => (
                                                            <th
                                                                key={
                                                                    subject
                                                                        .subjectInfo
                                                                        .id
                                                                }
                                                            >
                                                                {
                                                                    subject
                                                                        .subjectInfo
                                                                        .short_name
                                                                }
                                                            </th>
                                                        )
                                                    )}
                                                    <th>Marks</th>
                                                    <th>Mean</th>
                                                    <th>Points</th>
                                                    <th>Grade</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedMeritList.map(
                                                    (student) => (
                                                        <MeritRow
                                                            key={
                                                                student.student_id
                                                            }
                                                            student={student}
                                                            subjects={
                                                                subjectsArray
                                                            }
                                                        />
                                                    )
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        No merit list data available
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>
        </PortalLayout>
    );
}
