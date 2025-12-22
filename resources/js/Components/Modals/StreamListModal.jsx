import { useCallback, useState, useEffect } from "react";
import { Modal, Button, Table, ButtonGroup } from "react-bootstrap";
import { FaPlusSquare, FaStream } from "react-icons/fa";
import { BiEditAlt, BiTrashAlt } from "react-icons/bi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";
import { useErrorToast } from "@/Hooks/useErrorToast";
import { activeBadge } from "@/Utils/helpers";
import { router } from "@inertiajs/react";

import StreamCreateModal from "./StreamCreateModal";

export default function StreamListModal({ show, onHide, streams = [] }) {
    const [showStreamModal, setShowStreamModal] = useState(false);
    const [streamToEdit, setStreamToEdit] = useState(null);
    const { showErrorToast } = useErrorToast();

    /* -------------------------------------------------
     | Handlers
     -------------------------------------------------*/
    const handleCreate = useCallback(() => {
        setStreamToEdit(null);
        setShowStreamModal(true);
    }, []);

    const handleEdit = useCallback((stream) => {
        setStreamToEdit(stream);
        setShowStreamModal(true);
    }, []);

    const handleDelete = useCallback(
        async (streamId) => {
            try {
                const confirm = await Swal.fire({
                    title: "Delete stream?",
                    text: "Are you sure you want to delete this stream?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "Cancel",
                    reverseButtons: true,
                });

                if (!confirm.isConfirmed) return;

                Swal.fire({
                    title: "Deleting...",
                    text: "Please wait",
                    icon: "info",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => Swal.showLoading(),
                });

                const response = await xios.delete(
                    route("admin.stream.destroy", streamId)
                );

                if (response.status === 200) {
                    toast.success("Stream deleted successfully!");
                    router.reload({ only: ["streams"] });
                }
            } catch (error) {
                showErrorToast(error);
            } finally {
                Swal.close();
            }
        },
        [showErrorToast]
    );

    const handleStreamModalClose = useCallback(() => {
        setShowStreamModal(false);
        router.reload({ only: ["streams"] });
    }, []);

    /* -------------------------------------------------
     | DataTable (Optional)
     -------------------------------------------------*/
    useEffect(() => {
        if (!show) return;

        const tableId = "#streamsTable";

        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
            responsive: true,
            pageLength: 5,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, "asc"]],
            autoWidth: false,
            columnDefs: [
                { orderable: false, targets: [2, 3] },
                { width: "20%", targets: 3 },
            ],
        });
    }, [show, streams]);

    /* -------------------------------------------------
     | Render
     -------------------------------------------------*/
    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaStream className="me-1" /> Streams List
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="m-0">Total Streams: {streams.length}</h5>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded text-nowrap"
                            onClick={handleCreate}
                        >
                            <FaPlusSquare className="me-1" /> New Stream
                        </Button>
                    </div>

                    <hr className="dashed-hr" />

                    <Table striped bordered hover responsive id="streamsTable">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Stream Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streams.map((stream, index) => (
                                <tr key={stream.id}>
                                    <td>{index + 1}</td>
                                    <td>{stream.name}</td>
                                    <td>{activeBadge(stream.is_active)}</td>
                                    <td>
                                        <ButtonGroup className="gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(stream)
                                                }
                                            >
                                                <BiEditAlt className="me-1" />{" "}
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(stream.id)
                                                }
                                            >
                                                <BiTrashAlt className="me-1" />{" "}
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

            {/* Stream Create/Edit Modal */}
            <StreamCreateModal
                stream={streamToEdit}
                show={showStreamModal}
                handleClose={handleStreamModalClose}
            />
        </>
    );
}
