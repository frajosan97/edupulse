import PortalLayout from "@/Layouts/PortalLayout";
import { Head, Link } from "@inertiajs/react";
import { Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import {
    FaSchool,
    FaFileInvoiceDollar,
    FaEnvelope,
    FaCog,
    FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

// Create a mapping object for icons
const iconComponents = {
    FaSchool: <FaSchool size={24} />,
    FaFileInvoiceDollar: <FaFileInvoiceDollar size={24} />,
    FaEnvelope: <FaEnvelope size={24} />,
    FaUsers: <FaUsers size={24} />,
};

export default function Dashboard({ dashboardData }) {
    // Destructure the nested data
    const { stats, recentActivities, chartData } = dashboardData;

    // Map the icon strings to actual components
    const statsWithIcons = stats.map((stat) => ({
        ...stat,
        icon: iconComponents[stat.icon],
    }));

    return (
        <PortalLayout>
            <Head title="School Management Dashboard" />

            {/* Stats Cards */}
            <Row className="g-4 mb-3">
                {statsWithIcons.map((stat, index) => (
                    <Col key={index} xs={12} sm={6} lg={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                as={Link}
                                href={stat.link}
                                className={`stat-card stat-card-${stat.color}`}
                            >
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="stat-title">
                                                {stat.title}
                                            </h6>
                                            <h3 className="stat-value">
                                                {stat.value}
                                            </h3>
                                            <div
                                                className={`stat-trend trend-${stat.trendDirection}`}
                                            >
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <div className="stat-icon">
                                            {stat.icon}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            {/* Main Chart and Activity Feed */}
            <Row className="g-4 mb-3">
                <Col lg={8}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Schools Growth</h5>
                                <div className="chart-actions">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-2"
                                    >
                                        Monthly
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                    >
                                        Yearly
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="schools"
                                            stroke="#0d6efd"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>

                <Col lg={4}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0">
                                <h5 className="mb-0">Recent Activities</h5>
                            </Card.Header>
                            <Card.Body className="activity-feed">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-dot bg-primary"></div>
                                        <div className="activity-content">
                                            <div className="d-flex justify-content-between">
                                                <strong>
                                                    {activity.school}
                                                </strong>
                                                <small className="text-muted">
                                                    {activity.time}
                                                </small>
                                            </div>
                                            <p
                                                className={`activity-text text-${activity.status}`}
                                            >
                                                {activity.action}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="w-100 mt-3"
                                >
                                    View All Activities
                                </Button>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Pending & Status */}
            <Row className="g-4">
                {/* Pending Approvals */}
                <Col lg={6}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                <h5>Pending Approvals</h5>
                                <Badge bg="primary" pill>
                                    5 New
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                {[1, 2, 3].map((id) => (
                                    <div
                                        key={id}
                                        className="d-flex justify-content-between align-items-center py-3 border-bottom"
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="system-icon rounded-circle p-2 me-3">
                                                <FaSchool className="text-primary" />
                                            </div>
                                            <div>
                                                <h6 className="mb-1">
                                                    New School Registration #
                                                    {id}
                                                </h6>
                                                <small className="text-muted">
                                                    Submitted {id} day
                                                    {id !== 1 && "s"} ago
                                                </small>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-2"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="w-100 mt-3"
                                >
                                    View All Pending Approvals
                                </Button>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>

                {/* System Status */}
                <Col lg={6}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0">
                                <h5>System Status</h5>
                            </Card.Header>
                            <Card.Body>
                                {[
                                    {
                                        label: "Database Usage",
                                        value: 65,
                                        variant: "primary",
                                    },
                                    {
                                        label: "API Requests",
                                        value: 45,
                                        variant: "info",
                                        extra: "1,243/mo",
                                    },
                                    {
                                        label: "Storage",
                                        value: 78,
                                        variant: "warning",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>{item.label}</span>
                                            <span>
                                                {item.extra || `${item.value}%`}
                                            </span>
                                        </div>
                                        <ProgressBar
                                            now={item.value}
                                            variant={item.variant}
                                        />
                                    </div>
                                ))}
                                <div className="alert alert-light d-flex align-items-center mt-4">
                                    <FaCog className="me-2 text-primary" />
                                    <small>
                                        Last maintenance:{" "}
                                        {new Date().toLocaleDateString()}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </PortalLayout>
    );
}
