import {
    Modal,
    Button,
    Row,
    Col,
    Badge,
    Card,
    Tooltip,
    OverlayTrigger,
    ButtonGroup,
} from "react-bootstrap";
import {
    FaEdit,
    FaExternalLinkAlt,
    FaCalendarAlt,
    FaSortNumericDown,
    FaImage,
    FaToggleOn,
    FaToggleOff,
    FaLink,
    FaInfoCircle,
} from "react-icons/fa";
import { MdPreview } from "react-icons/md";
import { useState, useMemo } from "react";

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "Not set";

const STATUS = {
    upcoming: { color: "warning", icon: <FaCalendarAlt /> },
    active: { color: "success", icon: <FaToggleOn /> },
    expired: { color: "danger", icon: <FaToggleOff /> },
    neutral: { color: "secondary", icon: <FaCalendarAlt /> },
};

export default function SlideViewModal({ show, onHide, slide, onEdit }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const dateStatus = useMemo(() => {
        if (!slide?.start_date || !slide?.end_date) return "neutral";

        const now = new Date();
        if (now < new Date(slide.start_date)) return "upcoming";
        if (now > new Date(slide.end_date)) return "expired";
        return "active";
    }, [slide]);

    // ✅ Guard AFTER hooks
    if (!slide) return null;

    const { color, icon } = STATUS[dateStatus];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            {/* Header */}
            <Modal.Header className="border-0 pb-0 position-relative">
                <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                            <MdPreview className="text-primary fs-4" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold">{slide.title}</h5>
                            <small className="text-muted">Slide Preview</small>
                        </div>
                    </div>

                    <Badge
                        bg={slide.is_active ? "success" : "danger"}
                        className="px-3 py-2"
                    >
                        {slide.is_active ? "Active" : "Inactive"}
                    </Badge>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-4">
                {/* Image */}
                <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                    {!imageLoaded && (
                        <div className="placeholder-glow">
                            <div
                                className="placeholder w-100"
                                style={{ height: 280 }}
                            />
                        </div>
                    )}

                    <img
                        src={`/storage/${slide.image_path}`}
                        alt={slide.title}
                        className={`w-100 ${imageLoaded ? "" : "d-none"}`}
                        style={{ height: 280, objectFit: "cover" }}
                        onLoad={() => setImageLoaded(true)}
                    />

                    <Badge
                        bg="dark"
                        className="position-absolute top-0 end-0 m-3"
                    >
                        <FaImage className="me-1" /> Image
                    </Badge>
                </Card>

                <Row className="g-4">
                    {/* Description */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center">
                                    <FaInfoCircle className="text-primary me-2" />
                                    Description
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
                                                Slide content description
                                            </Tooltip>
                                        }
                                    >
                                        <span className="ms-2 text-muted">
                                            <FaInfoCircle size={13} />
                                        </span>
                                    </OverlayTrigger>
                                </Card.Title>

                                <p className="lead">
                                    {slide.description || (
                                        <span className="text-muted fst-italic">
                                            No description provided
                                        </span>
                                    )}
                                </p>

                                {slide.link_url && (
                                    <div className="p-3 bg-primary bg-opacity-5 rounded d-flex align-items-center">
                                        <FaLink className="text-primary me-3 fs-5" />
                                        <div className="flex-grow-1">
                                            <small className="text-muted d-block">
                                                Slide Link
                                            </small>
                                            <a
                                                href={slide.link_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="fw-bold text-decoration-none"
                                            >
                                                {slide.link_text ||
                                                    slide.link_url}
                                            </a>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            href={slide.link_url}
                                            target="_blank"
                                        >
                                            <FaExternalLinkAlt />
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Info */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <h6 className="text-uppercase text-muted mb-3">
                                    Slide Info
                                </h6>

                                <div className="d-flex align-items-center mb-4">
                                    <FaSortNumericDown className="text-primary me-3 fs-5" />
                                    <div>
                                        <small className="text-muted">
                                            Order
                                        </small>
                                        <h4 className="fw-bold mb-0">
                                            {slide.display_order}
                                        </h4>
                                    </div>
                                </div>

                                <div
                                    className={`p-3 rounded bg-${color}-subtle`}
                                >
                                    <div className="d-flex justify-content-between">
                                        <span>Start</span>
                                        <span>
                                            {formatDate(slide.start_date)}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>End</span>
                                        <span>
                                            {formatDate(slide.end_date)}
                                        </span>
                                    </div>
                                    <Badge bg={color} className="w-100 mt-2">
                                        {icon} {dateStatus.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="mt-3 d-flex justify-content-between align-items-center p-2 rounded bg-info bg-opacity-10">
                                    <span>
                                        {slide.is_currently_active ? (
                                            <FaToggleOn className="me-2 text-info" />
                                        ) : (
                                            <FaToggleOff className="me-2 text-secondary" />
                                        )}
                                        Currently Active
                                    </span>
                                    <Badge
                                        bg={
                                            slide.is_currently_active
                                                ? "info"
                                                : "secondary"
                                        }
                                    >
                                        {slide.is_currently_active
                                            ? "Yes"
                                            : "No"}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="border-0">
                <div className="d-flex justify-content-between w-100">
                    <small>Updated: {new Date().toLocaleDateString()}</small>
                    <ButtonGroup className="gap-2">
                        <Button
                            variant="outline-secondary"
                            className="rounded"
                            onClick={onHide}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            className="rounded"
                            onClick={() => {
                                onEdit(slide);
                                onHide();
                            }}
                        >
                            <FaEdit className="me-2" /> Edit
                        </Button>
                    </ButtonGroup>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
