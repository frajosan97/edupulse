import { useState, useEffect } from "react";
import { ButtonGroup, Button, Table } from "react-bootstrap";
import ClassStreamModal from "@/Components/Modals/ClassStreamModal";
import { router } from "@inertiajs/react";

const StreamsTab = ({ classData, streams, teachers }) => {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStreamId, setCurrentStreamId] = useState(null);

    useEffect(() => {
        const initDataTables = () => {
            if ($.fn.DataTable.isDataTable("#streamsTable")) {
                $("#streamsTable").DataTable().destroy();
            }
            $("#streamsTable").DataTable({
                responsive: true,
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50],
                order: [[0, "asc"]],
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search streams...",
                },
            });
        };

        const timer = setTimeout(initDataTables, 100);

        return () => {
            clearTimeout(timer);
            if ($.fn.DataTable.isDataTable("#streamsTable")) {
                $("#streamsTable").DataTable().destroy();
            }
        };
    }, [classData]);

    const handleOpen = (edit = false, stream = null) => {
        setIsEditing(edit);
        setCurrentStreamId(stream?.id || null);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentStreamId(null);
        router.reload();
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will remove the stream from this class!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                xios.delete(route("classstreams.destroy", id))
                    .then(() => {
                        toast.success("Stream removed successfully!");
                        router.reload();
                    })
                    .catch((error) => {
                        toast.error(
                            error.response?.data?.message ||
                                "Failed to remove stream"
                        );
                    });
            }
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Streams in {classData.name}</h5>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpen(false)}
                >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Stream
                </Button>
            </div>

            <hr className="dashed-hr" />

            <Table
                id="streamsTable"
                responsive
                bordered
                hover
                className="data-table"
            >
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Stream Name</th>
                        <th>Class Teachers</th>
                        <th>Students</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classData.class_streams?.map((stream, index) => (
                        <tr key={stream.id}>
                            <td>{index + 1}</td>
                            <td>{stream?.stream?.name}</td>
                            <td>
                                {stream?.class_teacher && (
                                    <h6 className="mb-0">
                                        {stream.class_teacher.full_name}
                                    </h6>
                                )}
                                {stream?.assistant_teacher && (
                                    <p className="text-muted small mb-0">
                                        {stream.assistant_teacher.full_name}
                                    </p>
                                )}
                            </td>
                            <td>{stream?.students?.length || 0}</td>
                            <td>
                                <ButtonGroup className="gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleOpen(true, stream)}
                                    >
                                        <i className="bi bi-pencil-square me-1"></i>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(stream.id)}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Delete
                                    </Button>
                                </ButtonGroup>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ClassStreamModal
                show={showModal}
                handleClose={handleClose}
                isEditing={isEditing}
                currentStreamId={currentStreamId}
                teachers={teachers}
                streams={streams}
                classId={classData.id}
            />
        </>
    );
};

export default StreamsTab;
