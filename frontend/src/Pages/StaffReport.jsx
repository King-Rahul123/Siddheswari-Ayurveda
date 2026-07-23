import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import AddStaff from "../Popup/AddStaff";
import ViewStaff from "../Popup/ViewStaff";
import "../CSS/Sale.css";
import "../CSS/Staff.css";
import "../CSS/Card.css";

import { getStaffList, addStaff, updateStaff, deleteStaff } from "../services/authService";

export default function StaffReport() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const [activeTab, setActiveTab] = useState("staff");

    const [showAddStaff, setShowAddStaff] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showViewStaff, setShowViewStaff] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    
    const [editMode, setEditMode] = useState(false);
    
    useEffect(() => {
        let isMounted = true;
        const fetchStaff = async () => {
            try {
                const data = await getStaffList();
                if (isMounted) {
                    setStaffList(data.map(item => ({ id: item.username || item._id, ...item })));
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                if (isMounted) setLoading(false);
            }
        };

        fetchStaff();
        const interval = setInterval(fetchStaff, 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const filteredStaff = useMemo(() => {
        const keyword = search.toLowerCase();

        return staffList.filter((staff) => (
            (staff.username || "").toLowerCase().includes(keyword) ||
            (staff.name || "").toLowerCase().includes(keyword) ||
            (staff.phone || "").toLowerCase().includes(keyword) ||
            (staff.email || "").toLowerCase().includes(keyword) ||
            (staff.role || "").toLowerCase().includes(keyword)
        ));
    }, [staffList, search]);

    // ✅ Put the admin check AFTER all hooks
    if (!loggedInUser || loggedInUser.role?.toLowerCase() !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    const handleUpdateStaff = async (updatedStaff) => {
        try {
            await updateStaff(updatedStaff);

            toast.success("Staff updated successfully", { className: "ayurveda-toast" });

            setSelectedStaff(updatedStaff);
            setEditMode(false);
            setShowViewStaff(false);

            // No need to manually update the table.
            // onSnapshot() will refresh it automatically.
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update staff", { className: "ayurveda-toast error" });
        }
    };

    const handleDeleteStaff = async (staff) => {
        try {
            await deleteStaff(staff.username);

            toast.success("Staff deleted successfully", { className: "ayurveda-toast error" });

            setShowViewStaff(false);
            setEditMode(false);
            setSelectedStaff(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to delete staff", { className: "ayurveda-toast error" });
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <div className="dashboard-wrapper">
                <Header />

                <main className="dashboard-content">

                    {/* Header */}
                    <div className="sales-header">
                        <div>
                            <h2>Staff Report</h2>
                            <p className="text-gray-600 text-sm">
                                Manage all registered staff members
                            </p>
                        </div>

                        <button className="add-sale-btn" onClick={() => setShowAddStaff(true)}>
                            <i className="bi bi-people-fill"></i>
                            Add Staff
                        </button>
                    </div>

                    {/* Cards */}
                    <div className="sales-stats">
                        <div
                            className={`sales-card ${activeTab === "staff" ? "active-card" : ""}`}
                            onClick={() => setActiveTab("staff")}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="bi bi-people-fill"></i>
                            <h4>{staffList.length}</h4>
                            <p>Total Staff</p>
                        </div>

                        <div
                            className={`sales-card ${activeTab === "attendance" ? "active-card" : ""}`}
                            onClick={() => setActiveTab("attendance")}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="bi bi-calendar-check-fill"></i>
                            <h4>{staffList.length}</h4>
                            <p>Staff Attendance</p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="sales-toolbar">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <p className="text-gray-500 text-sm">
                            Total Staff : {filteredStaff.length}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="sales-table-card">
                        {activeTab === "staff" ? (
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Created On</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : filteredStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-3">
                                                No Staff Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStaff.map((staff, index) => (
                                            <tr key={staff.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className="staff-link" onClick={() => {
                                                        setSelectedStaff({ ...staff });
                                                        setEditMode(false);
                                                        setShowViewStaff(true);
                                                    }}
                                                    >
                                                        {staff.username}
                                                    </span>
                                                </td>
                                                <td>{staff.name}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            staff.role?.toLowerCase() === "admin"
                                                                ? "role-admin"
                                                                : "role-staff"
                                                        }
                                                    >
                                                        {staff.role}
                                                    </span>
                                                </td>
                                                <td>{staff.email}</td>
                                                <td>{staff.phone}</td>
                                                <td>
                                                    {staff.createdAt?.toDate?.().toLocaleDateString("en-IN") || "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {staffList.map((staff, index) => (
                                        <tr key={staff.id}>
                                            <td>{index + 1}</td>
                                            <td>{staff.username}</td>
                                            <td>{staff.name}</td>
                                            <td>
                                                <span className="badge bg-success">
                                                    Present
                                                </span>
                                            </td>
                                            <td>09:00 AM</td>
                                            <td>06:00 PM</td>
                                            <td>{new Date().toLocaleDateString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>

                <AddStaff
                    show={showAddStaff}
                    onClose={() => setShowAddStaff(false)}
                    onSave={addStaff}
                />

                <ViewStaff
                    key={selectedStaff?.id}
                    show={showViewStaff}
                    staff={selectedStaff}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    onClose={() => {
                        setShowViewStaff(false);
                        setEditMode(false);
                    }}
                    onEdit={() => setEditMode(true)}
                    onSave={handleUpdateStaff}
                    onDelete={handleDeleteStaff}
                />
            </div>
        </div>
    );
}