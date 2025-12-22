import { useEffect } from "react";
import { Badge, Table } from "react-bootstrap";

const StudentsTab = ({ classData }) => {
    useEffect(() => {
        const initDataTables = () => {
            // Initialize Students table
            if ($.fn.DataTable.isDataTable("#studentsTable")) {
                $("#studentsTable").DataTable().destroy();
            }
            $("#studentsTable").DataTable({
                responsive: true,
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50],
                order: [[0, "asc"]],
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search students...",
                },
            });
        };

        // Initialize after a short delay to ensure DOM is fully rendered
        const timer = setTimeout(initDataTables, 100);

        // Cleanup function to destroy DataTables when component unmounts
        return () => {
            clearTimeout(timer);
            $(".data-table").DataTable().destroy();
        };
    }, [classData]); // Re-run when classData changes

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h5>Students in {classData.name}</h5>
                <Badge bg="primary">
                    {classData.students?.length || 0} Students
                </Badge>
            </div>

            <hr className="dashed-hr" />

            <Table
                id="studentsTable"
                responsive
                bordered
                hover
                className="data-table"
            >
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Adm</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classData.students?.map((student, index) => (
                        <tr key={student.id}>
                            <td>{index + 1}</td>
                            <td>{student.student?.adm}</td>
                            <td>{student.name}</td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
};

export default StudentsTab;
