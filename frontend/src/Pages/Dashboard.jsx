import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../CSS/Dashboard.css"; 
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import AddPatient from "../Popup/TakeAppointment";
import AddDoctor from "../Popup/AddDoctor";
import AddStaff from "../Popup/AddStaff";
import AddCustomer from "../Popup/AddCustomer";
import { changePassword, addStaff } from "../services/authService";
import { subscribeCustomers } from "../services/customerService";
import { subscribePatients } from "../services/patientService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [showDoctorPopup, setShowDoctorPopup] = useState(false);
  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  useEffect(() => {
    const unsubscribeCustomers = subscribeCustomers((customers) => {
      setCustomerCount(customers.length);
    });

    const unsubscribePatients = subscribePatients((patients) => {
      // Sort by appointment date (latest first)
      const sorted = [...patients].sort(
        (a, b) => new Date(b.appointDate) - new Date(a.appointDate)
      );

      setAppointments(sorted);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribePatients();
    };
  }, []);

  if (!loggedInUser) {
    return <Navigate to="/" replace />;
  }

  const shortcuts = [
    {
      title: "Take Appointment",
      icon: "bi-person-plus-fill",
      color: "#2e7d32",
      action: () => setShowAppointmentPopup(true),
    },
    {
      title: "Add Staff",
      icon: "bi-box-seam-fill",
      color: "#1976d2",
      action: () => setShowStaffPopup(true),
    },
    {
      title: "Add Customer",
      icon: "bi-people-fill",
      color: "#8e24aa",
      action: () => setShowCustomerPopup(true),
    },
    {
      title: "Add Doctor",
      icon: "bi-person-badge-fill",
      color: "#ef6c00",
      action: () => setShowDoctorPopup(true),
    },
  ];

  const stats = [
    {
      title: "Total Customers",
      value: customerCount,
      icon: "bi-people-fill",
      route: "/dashboard/customer",
    },
    {
      title: "Appointments",
      value: "0",
      icon: "bi-calendar-check-fill",
      route: "/dashboard/appointments",
    },
    {
      title: "Stock Amount",
      value: "₹0",
      icon: "bi-box-seam-fill",
      route: "/dashboard/stock-report",
    },
    {
      title: "Performance",
      value: "0%",
      icon: "bi-graph-up-arrow",
      route: "/dashboard/analytics",
    },
  ];

  const handleChangePassword = async () => {
    // Current password required
    if (!passwordForm.currentPassword.trim()) {
      toast.warning("Enter current password");
      return;
    }

    // New password required
    if (!passwordForm.newPassword.trim()) {
      toast.warning("Enter new password");
      return;
    }

    // Confirm password required
    if (!passwordForm.confirmPassword.trim()) {
      toast.warning("Confirm your new password");
      return;
    }

    // New & confirm password check
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      await changePassword(
        loggedInUser.username,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      toast.success("Password changed successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowChangePassword(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="dashboard-wrapper">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Stats Section */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((item, index) => (
              <div key={index} className="stat-box" onClick={() => { navigate(item.route) }} >
                <i
                  className={`bi ${item.icon}`}
                  style={{
                    fontSize: "2rem",
                    color: "#2e7d32",
                  }}
                ></i>

                <h3>{item.title}</h3>
                <p>{item.value}</p>
              </div>
            ))}
          </section>

          {/* Appointments & Notifications */}
          <section className="dashboard-grid">
            {/* Appointments */}
            <div className="card">
              <h5>Appointments</h5>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th className="text-center">Patient Name</th>
                      <th className="text-center">Date</th>
                      <th className="text-center">Problem</th>
                      <th className="text-center">Doctor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.length > 0 ? (
                      appointments.map((appointment, index) => (
                        <tr key={index} className="text-center">
                          <td>{appointment.name}</td>
                          <td>{appointment.appointDate}</td>
                          <td>{appointment.problem}</td>
                          <td>{appointment.doctor}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-data">
                          <i className="bi bi-calendar-x"></i>
                          <p>No appointments found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-title">
                  <div>
                      <h5>Quick Actions</h5>
                      <small>Frequently used actions</small>
                  </div>

                  <i className="bi bi-lightning-charge-fill"></i>
              </div>

              <div className="shortcut-grid">
                  {shortcuts.filter(
                      (item) =>
                        loggedInUser.role === "admin" ||
                        (item.title !== "Add Staff" && item.title !== "Add Doctor")
                    )
                    .map((item, index) => (
                      <div
                          key={index}
                          className="shortcut-card"
                          onClick={item.action}
                      >
                          {/* Icon */}
                          <div
                              className="shortcut-icon-box"
                              style={{ backgroundColor: item.color }}
                          >
                              <i className={`bi ${item.icon}`}></i>
                          </div>

                          {/* Title */}
                          <div className="shortcut-content">
                              <span className="shortcut-title">
                                  {item.title}
                              </span>
                          </div>

                          {/* Arrow */}
                          <i className="bi bi-arrow-right shortcut-arrow"></i>
                      </div>
                  ))}
              </div>
            </div>
          </section>

          <section className="d-flex justify-content-center align-items-center">
            <button className="btn btn-outline-danger" onClick={() => setShowChangePassword(true)}>
              <i className="bi bi-key-fill me-2"></i>
              Change Password
            </button>
          </section>
        </main>

        {showChangePassword && (
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Change Password</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowChangePassword(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowChangePassword(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleChangePassword}>Update Password</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddPatient
          show={showAppointmentPopup}
          onClose={() => setShowAppointmentPopup(false)}
        />
        <AddDoctor
          show={showDoctorPopup}
          onClose={() => setShowDoctorPopup(false)}
        />

        <AddStaff
          show={showStaffPopup}
          onClose={() => setShowStaffPopup(false)}
          onSave={addStaff}
        />

        <AddCustomer
          show={showCustomerPopup}
          onClose={() => setShowCustomerPopup(false)}
        />
      </div>
    </div>
  );
}