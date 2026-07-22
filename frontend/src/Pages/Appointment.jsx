import { useState, useEffect } from "react";
import "../CSS/Dashboard.css";
import "../CSS/Appointment.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import TakeAppointment from "../Popup/TakeAppointment";

import { subscribePatients } from "../services/patientService";

export default function Appointment() {

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [todayOnly, setTodayOnly] = useState(false);

    const [showAppointmentForm, setShowAppointmentForm] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editMode, setEditMode] = useState(false);


    const [showExportPopup, setShowExportPopup] = useState(false);

    const exportToExcel = () => {
        console.log("Export Excel");
        setShowExportPopup(false);

    };

    const exportToCSV = () => {
        console.log("Export CSV");
        setShowExportPopup(false);

    };

    const filteredPatients = patients.filter((item) => {
        const keyword = searchTerm.toLowerCase();

        const matchesSearch =
            (item.name || "").toLowerCase().includes(keyword) ||
            (item.phone || "").includes(searchTerm) ||
            (item.doctor || "").toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "" ||
            (item.status || "Pending") === statusFilter;

        const matchesToday =
            !todayOnly || item.appointDate === today;

        return matchesSearch && matchesStatus && matchesToday;
    });

    useEffect(() => {

        const unsubscribe = subscribePatients((data) => {
            setPatients(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const today = new Date().toISOString().split("T")[0];

    const todayCount = patients.filter(
        a => a.appointDate === today
    ).length;

    const upcomingCount = patients.filter(
        a =>
            new Date(a.appointDate) > new Date(today) &&
            (a.status || "Pending") !== "Completed" &&
            (a.status || "Pending") !== "Cancelled"
    ).length;

    const completedCount = patients.filter(
        a => (a.status || "Pending") === "Completed"
    ).length;

    const cancelledCount = patients.filter(
        a => (a.status || "Pending") === "Cancelled"
    ).length;

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-wrapper">
                <Header />
                <main className="dashboard-content">
                    <div className="appointment-header">
                        <div>
                            <h2>Appointment Management</h2>

                            <p className="text-gray-600 text-sm">
                                Manage all customer appointments efficiently
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button className="add-doctor-btn"
                                onClick={() => {
                                    setSelectedPatient(null);
                                    setEditMode(false);
                                    setShowAppointmentForm(true);
                                }}
                            >
                                <i className="bi bi-plus-circle-fill"></i>
                                Add Doctor
                            </button>

                            <button
                                className="add-appointment-btn"
                                onClick={() => {
                                    setSelectedPatient(null);
                                    setEditMode(false);
                                    setShowAppointmentForm(true);
                                }}
                            >
                                <i className="bi bi-calendar-plus-fill"></i>
                                New Appointment
                            </button>
                        </div>
                    </div>

                    {showAppointmentForm ? (
                        <TakeAppointment
                            show={true}
                            patient={selectedPatient}
                            editMode={editMode}
                            viewMode={!editMode}
                            onClose={() => {
                                setShowAppointmentForm(false);
                                setEditMode(false);
                                setSelectedPatient(null);
                            }}
                        />
                    ) : (
                        <>
                        {/* Toolbar */}
                        <div className="appointment-toolbar">
                            <div className="search-box">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search by customer, phone or doctor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="toolbar-right">
                                <select className="appointment-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                <button className={`today-btn ${todayOnly ? "active" : ""}`} onClick={() => setTodayOnly(!todayOnly)}>
                                    <i className="bi bi-calendar-check"></i>
                                    Today
                                </button>

                                <button className="export-btn" onClick={() => setShowExportPopup(true)}>
                                    <i className="bi bi-download"></i>
                                    Export
                                </button>

                            </div>

                        </div>

                        {/* Summary Cards */}
                        <div className="appointment-summary">
                            <div className="summary-card today">
                                <div className="summary-icon">
                                    <i className="bi bi-calendar-day-fill"></i>
                                </div>
                                <div>
                                    <h5>Today's</h5>
                                    <h2 className="text-primary">{todayCount}</h2>
                                </div>
                            </div>

                            <div className="summary-card upcoming">
                                <div className="summary-icon">
                                    <i className="bi bi-calendar2-week-fill"></i>
                                </div>
                                <div>
                                    <h5>Upcoming</h5>
                                    <h2 className="text-warning">{upcomingCount}</h2>
                                </div>
                            </div>

                            <div className="summary-card completed">
                                <div className="summary-icon">
                                    <i className="bi bi-check-circle-fill"></i>
                                </div>
                                <div>
                                    <h5>Completed</h5>
                                    <h2 className="text-success">{completedCount}</h2>
                                </div>
                            </div>

                            <div className="summary-card cancelled">
                                <div className="summary-icon">
                                    <i className="bi bi-x-circle-fill"></i>
                                </div>
                                <div>
                                    <h5>Cancelled</h5>
                                    <h2 className="text-danger">{cancelledCount}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Table */}
                        <div className="appointment-table-card">
                            <p className="text-muted text-xs text-right mb-2">
                                <b>Total:</b> {filteredPatients.length}
                            </p>

                            <div className="table-responsive">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Sl.</th>
                                            <th className="text-center">Appointment ID</th>
                                            <th className="text-center">Date</th>
                                            <th className="text-center">Customer</th>
                                            <th className="text-center">Doctor</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-5">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <div
                                                            className="spinner-border spinner-border-sm text-success"
                                                            role="status"
                                                        ></div>
                                                        <span>Loading appointments...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredPatients.length > 0 ? (
                                            filteredPatients.map((appointment, index) => (
                                                <tr key={appointment.patientCode}>
                                                    <td className="text-center">
                                                        {index + 1}
                                                    </td>
                                                    
                                                    <td>{appointment.patientCode}</td>

                                                    <td>{appointment.appointDate}</td>

                                                    <td>{appointment.name}</td>

                                                    <td>{appointment.doctor}</td>

                                                    <td className="text-center">
                                                        <span className={`status-badge ${(appointment.status || "Pending").toLowerCase()}`}>
                                                            {appointment.status || "Pending"}
                                                        </span>
                                                    </td>

                                                    <td className="text-center">
                                                        <div className="action-group">
                                                            <button
                                                                className="action-btn view"
                                                                onClick={() => {
                                                                    setSelectedPatient(appointment);
                                                                    setEditMode(false);
                                                                    setShowAppointmentForm(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                            
                                                            <button
                                                                className="action-btn edit"
                                                                onClick={() => {
                                                                    setSelectedPatient(appointment);
                                                                    setEditMode(true);
                                                                    setShowAppointmentForm(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="empty-state">
                                                    <i className="bi bi-calendar-x"></i>
                                                    <h5>No appointments found</h5>
                                                    <p>
                                                        Click "New Appointment" to create your first appointment.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Export Popup */}
                        {showExportPopup && (
                            <div className="customer-export-modal-overlay" onClick={() => setShowExportPopup(false)}>
                                <div className="customer-export-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="export-header">
                                        <h5>Export Appointments</h5>
                                        <button
                                            className="close-btn"
                                            onClick={() => setShowExportPopup(false)}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                    <p>Select export format</p>
                                    <div className="export-options">
                                        <button
                                            className="export-option excel"
                                            onClick={exportToExcel}
                                        >
                                            <i className="bi bi-file-earmark-excel-fill"></i>
                                            Excel (.xlsx)
                                        </button>
                                        <button
                                            className="export-option csv"
                                            onClick={exportToCSV}
                                        >
                                            <i className="bi bi-filetype-csv"></i>
                                            CSV (.csv)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </main>

            </div>
        </div>
    );
}