import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <img
            src="/Logo.jpg"
            alt="Logo"
            className="w-18 h-18 rounded-full"
          />
          <h2>Siddheswari Ayurveda</h2>
          <span>Healing Naturally</span>
        </div>

        <ul className="menu">
          <li className={ window.location.pathname === "/dashboard" ? "active" : "" } onClick={() => navigate("/dashboard")} >
            <i className="bi bi-grid-fill"></i>
            Dashboard
          </li>

          <li className={ window.location.pathname === "/dashboard/customer" ? "active" : "" } onClick={() => navigate("/dashboard/customer")} >
            <i className="bi bi-people-fill"></i>
            Customer
          </li>

          <li className={ window.location.pathname === "/dashboard/appointments" ? "active" : "" } onClick={() => navigate("/dashboard/appointments")} >
            <i className="bi bi-calendar-check-fill"></i>
            Appointments
          </li>

          <li className={ window.location.pathname === "/dashboard/billing" ? "active" : "" } onClick={() => navigate("/dashboard/billing")} >
            <i className="bi bi-cash-stack"></i>
            Sell
          </li>

          {/* Report Menu */}
          <li className="menu-parent" onClick={() => setReportOpen(!reportOpen)}>
            <div className="menu-item">
              <div>
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
                <span>Report</span>
              </div>
              <i className={`bi ${ reportOpen ? "bi-chevron-up" : "bi-chevron-down" }`}
              ></i>
            </div>
          </li>

          {reportOpen && (
            <ul className="submenu">
              <li
                className={
                  window.location.pathname === "/dashboard/analytics"
                    ? "active"
                    : ""
                }
                onClick={() => navigate("/dashboard/analytics")}
              >
                Analytics
              </li>

              <li
                className={
                  window.location.pathname === "/dashboard/product-report"
                    ? "active"
                    : ""
                }
                onClick={() => navigate("/dashboard/product-report")}
              >
                Product Report
              </li>

              <li
                className={
                  window.location.pathname === "/dashboard/sale-report"
                    ? "active"
                    : ""
                }
                onClick={() => navigate("/dashboard/sale-report")}
              >
                Sale Report
              </li>
            </ul>
          )}
        </ul>
      </div>

      <button className="logout-btn">
        <i className="bi bi-box-arrow-right"></i>
        Logout
      </button>
    </aside>
  );
}