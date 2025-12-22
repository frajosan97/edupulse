import { useCallback, useEffect, useState } from "react";
import { Modal, Button, Table, ButtonGroup } from "react-bootstrap";
import { BiEditAlt, BiTrashAlt } from "react-icons/bi";
import { FaPlusSquare, FaLayerGroup } from "react-icons/fa";
import { toast } from "react-toastify";
import { activeBadge } from "@/Utils/helpers";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import SubjectGroupCreateModal from "./SubjectGroupCreateModal";
import { router } from "@inertiajs/react";

export default function SubjectGroupListModal({
    show,
    onHide,
    subjectGroups = [],
    gradingSystems = [],
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState(null);
    const { showErrorToast } = useErrorToast();

    // Initialize DataTable when modal is shown
    useEffect(() => {
        if (!show) return;

        const tableId = "#subjectGroupsTable";

        const timer = setTimeout(() => {
            if ($.fn.DataTable.isDataTable(tableId)) {
                $(tableId).DataTable().clear().destroy();
            }

            $(tableId).DataTable({
                responsive: true,
                pageLength: 5,
                lengthMenu: [5, 10, 25, 50],
                order: [[0, "asc"]],
                autoWidth: false,
                columnDefs: [
                    { orderable: false, targets: [4] },
                    { width: "20%", targets: 4 },
                ],
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [show, subjectGroups]);

    // Open create modal
    const handleCreateGroup = useCallback(() => {
        setGroupToEdit(null);
        setShowCreateModal(true);
    }, []);

    // Open edit modal
    const handleEditGroup = useCallback((group) => {
        setGroupToEdit(group);
        setShowCreateModal(true);
    }, []);

    // Delete group with confirmation
    const handleDeleteGroup = useCallback(async (groupId) => {
        try {
            const result = await Swal.fire({
                title: "Delete Subject Group?",
                text: "Are you sure you want to delete this subject group?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            Swal.fire({
                title: "Deleting...",
                text: "Please wait",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await xios.delete(
                route("admin.subject-group.destroy", groupId)
            );

            if (response.status === 200) {
                toast.success("Subject group deleted successfully!");
                router.reload();
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    }, []);

    // Close create/edit modal & refresh list
    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
        Inertia.reload({ only: ["subjectGroups"] });
    }, []);

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaLayerGroup className="me-1" />
                        Subject Groups
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="m-0">
                            Total Groups: {subjectGroups.length}
                        </h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleCreateGroup}
                        >
                            <FaPlusSquare className="me-1" />
                            New Group
                        </Button>
                    </div>

                    <Table
                        striped
                        bordered
                        hover
                        responsive
                        className="mb-0"
                        id="subjectGroupsTable"
                    >
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectGroups.map((group, index) => (
                                <tr key={group.id}>
                                    <td>{index + 1}</td>
                                    <td>{group.code}</td>
                                    <td>{group.name}</td>
                                    <td>{activeBadge(group.is_active)}</td>
                                    <td>
                                        <ButtonGroup className="gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    handleEditGroup(group)
                                                }
                                            >
                                                <BiEditAlt className="me-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteGroup(group.id)
                                                }
                                            >
                                                <BiTrashAlt className="me-1" />
                                                Delete
                                            </Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            <SubjectGroupCreateModal
                show={showCreateModal}
                handleClose={handleCloseCreateModal}
                group={groupToEdit}
                gradingSystems={gradingSystems}
            />
        </>
    );
}
