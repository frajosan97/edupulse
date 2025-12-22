import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Card, Button, Table } from "react-bootstrap";
import { FaPlus, FaSort } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import SlideCreateEditModal from "@/Components/Modals/Setting/SlideCreateEditModal";
import SlideViewModal from "@/Components/Modals/Setting/SlideViewModal";
import PortalLayout from "@/Layouts/PortalLayout";

export default function SlidesManagement() {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [viewingSlide, setViewingSlide] = useState(null);
    const [dataTable, setDataTable] = useState(null);

    useEffect(() => {
        const table = initDataTable();
        setDataTable(table);
        return () => table?.destroy();
    }, []);

    const initDataTable = () => {
        return $("#slidesTable").DataTable({
            processing: true,
            serverSide: true,
            ajax: route("admin.school-slide.index"),
            columns: [
                {
                    data: "image_preview",
                    title: "Image",
                    className: "text-center",
                    orderable: false,
                },
                {
                    data: "display_order",
                    title: "Order",
                    className: "text-center",
                },
                {
                    data: "status",
                    title: "Status",
                    className: "text-center",
                    orderable: false,
                },
                {
                    data: "current_status",
                    title: "Current",
                    className: "text-center",
                    orderable: false,
                },
                {
                    data: "start_date",
                    title: "Start Date",
                    className: "text-center",
                },
                {
                    data: "end_date",
                    title: "End Date",
                    className: "text-center",
                },
                {
                    data: "action",
                    title: "Actions",
                    className: "text-center",
                    orderable: false,
                },
            ],
            order: [[3, "asc"]],
            responsive: true,
        });
    };

    // Event handlers setup
    useEffect(() => {
        if (!dataTable) return;

        const handleView = (e) => {
            const slideId = $(e.currentTarget).data("id");
            fetchSlideDetails(slideId, "view");
        };

        const handleEdit = (e) => {
            const slideId = $(e.currentTarget).data("id");
            fetchSlideDetails(slideId, "edit");
        };

        const handleToggle = (e) => {
            const slideId = $(e.currentTarget).data("id");
            const isActive = $(e.currentTarget).data("active") === "true";
            toggleSlideStatus(slideId, isActive);
        };

        const handleDelete = (e) => {
            const slideId = $(e.currentTarget).data("id");
            confirmDelete(slideId);
        };

        // Attach event listeners using jQuery delegation
        $(document).on("click", ".btn-view", handleView);
        $(document).on("click", ".btn-edit", handleEdit);
        $(document).on("click", ".btn-toggle", handleToggle);
        $(document).on("click", ".btn-delete", handleDelete);

        return () => {
            $(document).off("click", ".btn-view", handleView);
            $(document).off("click", ".btn-edit", handleEdit);
            $(document).off("click", ".btn-toggle", handleToggle);
            $(document).off("click", ".btn-delete", handleDelete);
        };
    }, [dataTable]);

    // Fetch slide details for view/edit
    const fetchSlideDetails = async (slideId, action) => {
        try {
            const response = await xios.get(
                route("admin.school-slide.show", slideId)
            );
            const slide = response.data;

            if (action === "view") {
                setViewingSlide(slide);
                setShowViewModal(true);
            } else if (action === "edit") {
                setEditingSlide(slide);
                setShowModal(true);
            }
        } catch (error) {
            toast.error("Failed to fetch slide details");
        }
    };

    // Toggle slide status
    const toggleSlideStatus = async (slideId, currentStatus) => {
        try {
            const response = await xios.patch(
                route("admin.school-slide.toggle-status", slideId),
                { is_active: !currentStatus }
            );

            if (response.data.success) {
                toast.success(
                    `Slide ${
                        !currentStatus ? "activated" : "deactivated"
                    } successfully`
                );
                dataTable.ajax.reload(null, false);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update status"
            );
        }
    };

    // Delete slide confirmation
    const confirmDelete = async (slideId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This slide will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            deleteSlide(slideId);
        }
    };

    // Delete slide function
    const deleteSlide = async (slideId) => {
        try {
            const response = await xios.delete(
                route("admin.school-slide.destroy", slideId)
            );

            if (response.data.success) {
                toast.success("Slide deleted successfully");
                dataTable.ajax.reload(null, false);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to delete slide"
            );
        }
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSlide(null);
        dataTable?.ajax.reload();
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setViewingSlide(null);
    };

    const handleEditSlide = (slide) => {
        setEditingSlide(slide);
        setShowModal(true);
    };

    return (
        <PortalLayout user={auth.user}>
            <Head title="Slides Management" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Slides Management</h1>
                    <p className="text-muted mb-0">Manage homepage slides</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> Add New Slide
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">All Slides</h5>
                        <small className="text-muted">
                            Drag <FaSort /> to reorder
                        </small>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table id="slidesTable" className="w-100" responsive />
                </Card.Body>
            </Card>

            {/* Create/Edit Modal */}
            <SlideCreateEditModal
                show={showModal}
                onHide={handleCloseModal}
                slide={editingSlide}
            />

            {/* View Modal */}
            <SlideViewModal
                show={showViewModal}
                onHide={handleCloseViewModal}
                slide={viewingSlide}
                onEdit={handleEditSlide}
            />
        </PortalLayout>
    );
}
