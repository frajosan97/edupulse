import PortalLayout from "@/Layouts/PortalLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Tabs,
    Tab,
    Badge,
} from "react-bootstrap";
import { Trash2, Edit2, Plus, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import xios from "@/Utils/xios";
import ContactModal from "@/Components/Modals/Setting/ContactModal";
import ImageModal from "@/Components/Modals/Setting/ImageModal";
import ThemeModal from "@/Components/Modals/Setting/ThemeModal";
import { useErrorToast } from "@/Hooks/useErrorToast";

export default function Manage({ settingData }) {
    const [activeTab, setActiveTab] = useState("contacts");
    const [showContactModal, setShowContactModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    const { showErrorToast } = useErrorToast();

    // Contact Form
    const {
        data: contactData,
        setData: setContactData,
        processing: contactProcessing,
        errors: contactErrors,
        reset: resetContact,
    } = useForm({
        contact_type: "phone",
        value: "",
        display_order: 0,
        is_active: true,
    });

    // Image Form
    const {
        data: imageData,
        setData: setImageData,
        processing: imageProcessing,
        errors: imageErrors,
        reset: resetImage,
    } = useForm({
        image_type: "logo",
        image_path: "",
        alt_text: "",
        caption: "",
        display_order: 0,
        is_active: true,
        image_file: null,
    });

    // Theme Form
    const {
        data: themeData,
        setData: setThemeData,
        processing: themeProcessing,
        errors: themeErrors,
        reset: resetTheme,
    } = useForm({
        name: "",
        primary_color: "#3498db",
        secondary_color: "#2ecc71",
        accent_color: "#e74c3c",
        text_color: "#333333",
        background_color: "#ffffff",
        is_default: false,
    });

    // Initialize form with theme data if editing
    useEffect(() => {
        if (settingData.themes) {
            setThemeData({
                ...settingData.themes,
                _method: "put",
            });
        }
    }, [settingData.themes]);

    // Contact Handlers
    const handleShowContactModal = (contact = null) => {
        if (contact) {
            setEditingContact(contact);
            setContactData({
                ...contact,
                _method: "put",
            });
        } else {
            setEditingContact(null);
            resetContact();
        }
        setShowContactModal(true);
    };

    const handleSubmitContact = async (e, isEdit) => {
        e.preventDefault();

        const url = isEdit
            ? route("admin.school-contact.update", editingContact.id)
            : route("admin.school-contact.store");

        Swal.fire({
            title: isEdit ? "Updating Contact..." : "Adding Contact...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const method = isEdit ? "put" : "post";
            const formData = new FormData();

            // Append all contact data to FormData
            Object.keys(contactData).forEach((key) => {
                if (key !== "_method") {
                    formData.append(key, contactData[key]);
                }
            });

            if (isEdit) {
                formData.append("_method", "put");
            }

            const response = await xios({
                method: "post",
                url: url,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.close();
            setShowContactModal(false);
            resetContact();
            setEditingContact(null);

            toast.success(
                isEdit
                    ? "Contact updated successfully!"
                    : "Contact added successfully!"
            );

            // Refresh the page to get updated data
            router.reload(route("admin.settings.manage"));
        } catch (error) {
            Swal.close();
            showErrorToast(error);
        }
    };

    // Image Handlers
    const handleShowImageModal = (image = null) => {
        if (image) {
            setEditingImage(image);
            setImageData({
                ...image,
                image_file: null,
                _method: "put",
            });
        } else {
            setEditingImage(null);
            resetImage();
        }
        setShowImageModal(true);
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }

            // Validate file type
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!validTypes.includes(file.type)) {
                toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
                return;
            }

            setImageData("image_file", file);

            // Preview the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageData("image_path", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitImage = async (e, isEdit) => {
        e.preventDefault();

        const url = isEdit
            ? route("admin.school-image.update", editingImage.id)
            : route("admin.school-image.store");

        Swal.fire({
            title: isEdit ? "Updating Image..." : "Adding Image...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const formData = new FormData();

            // Append all image data to FormData
            Object.keys(imageData).forEach((key) => {
                if (imageData[key] !== null && key !== "_method") {
                    if (
                        key === "image_file" &&
                        imageData[key] instanceof File
                    ) {
                        formData.append(key, imageData[key]);
                    } else {
                        formData.append(key, imageData[key]);
                    }
                }
            });

            if (isEdit) {
                formData.append("_method", "put");
            }

            const response = await xios({
                method: "post",
                url: url,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.close();
            setShowImageModal(false);
            resetImage();
            setEditingImage(null);

            toast.success(
                isEdit
                    ? "Image updated successfully!"
                    : "Image added successfully!"
            );

            // Refresh the page to get updated data
            router.reload(route("admin.settings.manage"));
        } catch (error) {
            Swal.close();
            showErrorToast(error);
        }
    };

    // Theme Handlers
    const handleShowThemeModal = () => {
        setShowThemeModal(true);
    };

    const handleSubmitTheme = async (e, isEdit) => {
        e.preventDefault();

        const url = isEdit
            ? route("admin.school-theme.update", settingData.themes.id)
            : route("admin.school-theme.store");

        Swal.fire({
            title: isEdit ? "Updating Theme..." : "Creating Theme...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const method = isEdit ? "put" : "post";
            const formData = new FormData();

            // Append all theme data to FormData
            Object.keys(themeData).forEach((key) => {
                if (key !== "_method") {
                    formData.append(key, themeData[key]);
                }
            });

            if (isEdit) {
                formData.append("_method", "put");
            }

            const response = await xios({
                method: "post",
                url: url,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.close();
            setShowThemeModal(false);

            toast.success(
                isEdit
                    ? "Theme updated successfully!"
                    : "Theme created successfully!"
            );

            // Refresh the page to get updated data
            router.reload(route("admin.settings.manage"));
        } catch (error) {
            Swal.close();
            showErrorToast(error);
        }
    };

    // Delete Handler
    const handleDelete = async (item, type) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete this ${type}. This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            backdrop: true,
            allowOutsideClick: () => !Swal.isLoading(),
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Deleting...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            let routeName, param;
            switch (type) {
                case "contact":
                    routeName = "admin.school-contact.destroy";
                    param = item.id;
                    break;
                case "image":
                    routeName = "admin.school-image.destroy";
                    param = item.id;
                    break;
                default:
                    return;
            }

            const response = await xios.delete(route(routeName, param));

            Swal.close();
            toast.success(
                `${
                    type.charAt(0).toUpperCase() + type.slice(1)
                } deleted successfully!`
            );
            router.reload(route("admin.settings.manage"));
        } catch (error) {
            Swal.close();
            showErrorToast(error);
        }
    };

    const handleSetDefaultTheme = async (theme) => {
        const result = await Swal.fire({
            title: "Set as Default Theme?",
            text: "This theme will be applied as the default theme for your school.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, set as default",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Setting Default...",
            text: "Please wait",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await xios.post(route("admin.school-theme.set-default", theme.id));
            Swal.close();
            toast.success("Theme set as default successfully!");
            router.reload(route("admin.settings.manage"));
        } catch (error) {
            Swal.close();
            showErrorToast(error);
        }
    };

    // Get contact type badge color
    const getContactTypeColor = (type) => {
        switch (type) {
            case "phone":
                return "primary";
            case "email":
                return "success";
            case "address":
                return "warning";
            case "social":
                return "info";
            default:
                return "secondary";
        }
    };

    // Get image type badge color
    const getImageTypeColor = (type) => {
        switch (type) {
            case "logo":
                return "primary";
            case "banner":
                return "success";
            case "background":
                return "warning";
            case "gallery":
                return "info";
            case "stamp":
                return "dark";
            case "signature":
                return "secondary";
            default:
                return "light";
        }
    };

    return (
        <PortalLayout>
            <Head title="General Settings" />

            <Container fluid>
                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="contacts" title="Contacts">
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">School Contacts</h5>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleShowContactModal()}
                                >
                                    <Plus size={16} /> Add Contact
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                <Table striped hover>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Value</th>
                                            <th>Order</th>
                                            <th>Status</th>
                                            <th className="text-end">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {settingData.contacts &&
                                        settingData.contacts.length > 0 ? (
                                            settingData.contacts.map(
                                                (contact) => (
                                                    <tr key={contact.id}>
                                                        <td>
                                                            <Badge
                                                                bg={getContactTypeColor(
                                                                    contact.contact_type
                                                                )}
                                                                className="text-capitalize"
                                                            >
                                                                {
                                                                    contact.contact_type
                                                                }
                                                            </Badge>
                                                        </td>
                                                        <td>{contact.value}</td>
                                                        <td>
                                                            {
                                                                contact.display_order
                                                            }
                                                        </td>
                                                        <td>
                                                            {contact.is_active ? (
                                                                <Badge bg="success">
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="secondary">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() =>
                                                                    handleShowContactModal(
                                                                        contact
                                                                    )
                                                                }
                                                            >
                                                                <Edit2
                                                                    size={14}
                                                                />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        contact,
                                                                        "contact"
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center text-muted py-4"
                                                >
                                                    No contacts found. Add your
                                                    first contact!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="images" title="Images">
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">School Images</h5>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleShowImageModal()}
                                >
                                    <Plus size={16} /> Add Image
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    {settingData.images &&
                                    settingData.images.length > 0 ? (
                                        settingData.images.map((image) => (
                                            <Col
                                                md={4}
                                                lg={3}
                                                className="mb-4"
                                                key={image.id}
                                            >
                                                <Card>
                                                    <Card.Img
                                                        variant="top"
                                                        src={`/storage/${image.image_path}`}
                                                        alt={image.alt_text}
                                                        style={{
                                                            height: "150px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <Badge
                                                                bg={getImageTypeColor(
                                                                    image.image_type
                                                                )}
                                                            >
                                                                {
                                                                    image.image_type
                                                                }
                                                            </Badge>
                                                            {image.is_active ? (
                                                                <Badge bg="success">
                                                                    <Check
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="secondary">
                                                                    <X
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Card.Title className="h6 mb-1">
                                                            {image.caption ||
                                                                "No caption"}
                                                        </Card.Title>
                                                        <Card.Text className="text-muted small">
                                                            {image.alt_text ||
                                                                "No alt text"}
                                                        </Card.Text>
                                                        <div className="d-flex justify-content-between">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleShowImageModal(
                                                                        image
                                                                    )
                                                                }
                                                            >
                                                                <Edit2
                                                                    size={12}
                                                                />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        image,
                                                                        "image"
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={12}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col>
                                            <div className="text-center text-muted py-4">
                                                No images found. Add your first
                                                image!
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="themes" title="Themes">
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">School Theme</h5>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleShowThemeModal}
                                >
                                    <Edit2 size={16} />
                                    {settingData.themes
                                        ? "Edit"
                                        : "Create"}{" "}
                                    Theme
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {settingData.themes ? (
                                    <Row>
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <h6 className="mb-0">
                                                        Current Theme
                                                    </h6>
                                                </Card.Header>
                                                <Card.Body>
                                                    <h5>
                                                        {
                                                            settingData.themes
                                                                .name
                                                        }
                                                    </h5>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <strong className="me-3">
                                                            Default:
                                                        </strong>
                                                        {settingData.themes
                                                            .is_default ? (
                                                            <Badge bg="success">
                                                                Yes
                                                            </Badge>
                                                        ) : (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleSetDefaultTheme(
                                                                        settingData.themes
                                                                    )
                                                                }
                                                            >
                                                                Set as Default
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="theme-colors mb-3">
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <div
                                                                className="color-box"
                                                                style={{
                                                                    backgroundColor:
                                                                        settingData
                                                                            .themes
                                                                            .primary_color,
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    border: "1px solid #dee2e6",
                                                                }}
                                                                title={`Primary: ${settingData.themes.primary_color}`}
                                                            />
                                                            <div
                                                                className="color-box"
                                                                style={{
                                                                    backgroundColor:
                                                                        settingData
                                                                            .themes
                                                                            .secondary_color,
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    border: "1px solid #dee2e6",
                                                                }}
                                                                title={`Secondary: ${settingData.themes.secondary_color}`}
                                                            />
                                                            <div
                                                                className="color-box"
                                                                style={{
                                                                    backgroundColor:
                                                                        settingData
                                                                            .themes
                                                                            .accent_color,
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    border: "1px solid #dee2e6",
                                                                }}
                                                                title={`Accent: ${settingData.themes.accent_color}`}
                                                            />
                                                            <div
                                                                className="color-box"
                                                                style={{
                                                                    backgroundColor:
                                                                        settingData
                                                                            .themes
                                                                            .text_color,
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    border: "1px solid #dee2e6",
                                                                }}
                                                                title={`Text: ${settingData.themes.text_color}`}
                                                            />
                                                            <div
                                                                className="color-box"
                                                                style={{
                                                                    backgroundColor:
                                                                        settingData
                                                                            .themes
                                                                            .background_color,
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    border: "1px solid #dee2e6",
                                                                }}
                                                                title={`Background: ${settingData.themes.background_color}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <h6 className="mb-0">
                                                        Preview
                                                    </h6>
                                                </Card.Header>
                                                <Card.Body>
                                                    <div
                                                        style={{
                                                            backgroundColor:
                                                                settingData
                                                                    .themes
                                                                    .background_color,
                                                            color: settingData
                                                                .themes
                                                                .text_color,
                                                            padding: "20px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #dee2e6",
                                                        }}
                                                    >
                                                        <h4
                                                            style={{
                                                                color: settingData
                                                                    .themes
                                                                    .primary_color,
                                                            }}
                                                        >
                                                            School Heading
                                                        </h4>
                                                        <p>
                                                            This is how text
                                                            will appear with
                                                            your theme.
                                                        </p>
                                                        <Button
                                                            style={{
                                                                backgroundColor:
                                                                    settingData
                                                                        .themes
                                                                        .secondary_color,
                                                                borderColor:
                                                                    settingData
                                                                        .themes
                                                                        .secondary_color,
                                                            }}
                                                            className="me-2"
                                                        >
                                                            Secondary Button
                                                        </Button>
                                                        <Button
                                                            style={{
                                                                backgroundColor:
                                                                    settingData
                                                                        .themes
                                                                        .accent_color,
                                                                borderColor:
                                                                    settingData
                                                                        .themes
                                                                        .accent_color,
                                                            }}
                                                        >
                                                            Accent Button
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <p>No theme configured yet.</p>
                                        <Button
                                            variant="primary"
                                            onClick={handleShowThemeModal}
                                        >
                                            Create Theme
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* Contact Modal */}
            <ContactModal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                editingContact={editingContact}
                contactData={contactData}
                setContactData={setContactData}
                contactErrors={contactErrors}
                contactProcessing={contactProcessing}
                onSubmit={handleSubmitContact}
            />

            {/* Image Modal */}
            <ImageModal
                show={showImageModal}
                onHide={() => setShowImageModal(false)}
                editingImage={editingImage}
                imageData={imageData}
                setImageData={setImageData}
                imageErrors={imageErrors}
                imageProcessing={imageProcessing}
                onSubmit={handleSubmitImage}
                onFileChange={handleImageFileChange}
            />

            {/* Theme Modal */}
            <ThemeModal
                show={showThemeModal}
                onHide={() => setShowThemeModal(false)}
                themes={settingData.themes}
                themeData={themeData}
                setThemeData={setThemeData}
                themeErrors={themeErrors}
                themeProcessing={themeProcessing}
                onSubmit={handleSubmitTheme}
            />
        </PortalLayout>
    );
}
