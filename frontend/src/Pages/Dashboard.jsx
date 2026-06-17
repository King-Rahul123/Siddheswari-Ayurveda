import { useNavigate } from "react-router-dom";
import "../CSS/Dashboard.css"; 
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();

  const appointments = [
    {
      patient: "Rahul Adak",
      time: "09:00 AM",
      type: "Consultation",
      status: "Confirmed",
    },
    {
      patient: "Priya Sharma",
      time: "10:30 AM",
      type: "Therapy",
      status: "Pending",
    },
    {
      patient: "Amit Kumar",
      time: "12:00 PM",
      type: "Follow-up",
      status: "Completed",
    },
  ];

  const notifications = [
    "New patient registered",
    "Therapy session scheduled",
    "Payment received",
    "Follow-up reminder",
  ];

  const stats = [
    {
      title: "Total Customers",
      value: "0",
      icon: "bi-people-fill",
      route: "/dashboard/customer",
    },
    {
      title: "Appointments",
      value: "0",
      icon: "bi-calendar-check-fill",
      route: "/dashboard/ledger",
    },
    {
      title: "Stock Amount",
      value: "₹0",
      icon: "bi-box-seam-fill",
      route: "/dashboard/sales",
    },
    {
      title: "Performance",
      value: "0%",
      icon: "bi-graph-up-arrow",
      route: "/dashboard/analytics",
    },
  ];

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
              <div key={index} className="stat-box" onClick={() => navigate(item.route)} >
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
              <h5>Today's Appointments</h5>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr key={index}>
                        <td>{appointment.patient}</td>

                        <td>{appointment.time}</td>

                        <td>{appointment.type}</td>

                        <td>
                          <span
                            className={`status ${appointment.status.toLowerCase()}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h5>Notifications</h5>

              <div className="notification-list">
                {notifications.map((notification, index) => (
                  <div className="notification" key={index}>
                    <i className="bi bi-bell-fill"></i>
                    <span>{notification}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}