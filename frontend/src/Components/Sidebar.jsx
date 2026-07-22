import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export default function Sidebar() {
  const navigate = useNavigate();
  const [saleOpen, setSaleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const handleSaleToggle = () => {
    setSaleOpen((prev) => {
      const newState = !prev;

      // If opening Sale, close Report
      if (newState) {
        setReportOpen(false);
      }

      return newState;
    });
  };

  const handleLogout = async () => {
    try {
        await logout();
        navigate("/", { replace: true });
    } catch (error) {
        console.error(error);
    }
  };

  const handleReportToggle = () => {
    setReportOpen((prev) => {
      const newState = !prev;

      // If opening Report, close Sale
      if (newState) {
        setSaleOpen(false);
      }

      return newState;
    });
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <img
            src="/Logo.jpg"
            alt="Logo"
            className="w-16 h-16 rounded-full"
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

          {/* Sale Menu */}
          <li className="menu-parent" onClick={handleSaleToggle}>
            <div className="menu-item">
              <div>
                <i className="bi bi-cash-stack"></i>
                <span>Sale & Purchase</span>
              </div>
              <i className={`bi ${ saleOpen ? "bi-chevron-up" : "bi-chevron-down" }`}></i>
            </div>
          </li>

          {saleOpen && (
            <ul className="submenu">
              <li className={ window.location.pathname === "/dashboard/sales" ? "active" : "" } onClick={() => navigate("/dashboard/sales")} >
                <i className="bi bi-tag"></i>
                Sale invoice
              </li>

              <li className={ window.location.pathname === "/dashboard/purchase" ? "active" : "" } onClick={() => navigate("/dashboard/purchase")} >
                <i className="bi bi-cart-check"></i>
                Purchase invoice
              </li>
            </ul>
          )}


          {/* Report Menu */}
          <li className="menu-parent" onClick={handleReportToggle}>
            <div className="menu-item">
              <div>
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
                <span>Report</span>
              </div>
              <i className={`bi ${ reportOpen ? "bi-chevron-up" : "bi-chevron-down" }`}></i>
            </div>
          </li>

          {reportOpen && (
            <ul className="submenu">
              <li className={ window.location.pathname === "/dashboard/analytics" ? "active" : "" } onClick={() => navigate("/dashboard/analytics")} >
                <i className="bi bi-graph-up"></i>
                Analytics
              </li>

              <li className={ window.location.pathname === "/dashboard/stock-report" ? "active" : "" } onClick={() => navigate("/dashboard/stock-report")} >
                <i className="bi bi-box-seam"></i>
                Stock Report
              </li>

              <li className={ window.location.pathname === "/dashboard/sale-report" ? "active" : "" } onClick={() => navigate("/dashboard/sale-report")} >
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
                Sale Report
              </li>

              <li className={ window.location.pathname === "/dashboard/purchase-report" ? "active" : "" } onClick={() => navigate("/dashboard/purchase-report")} >
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
                Purchase Report
              </li>

              {loggedInUser?.role?.toLowerCase() === "admin" && (
                <li className={
                    window.location.pathname === "/dashboard/staff-report"
                      ? "active"
                      : ""
                  }
                  onClick={() => navigate("/dashboard/staff-report")}
                >
                  <i className="bi bi-people-fill"></i>
                  Staff Report
                </li>
              )}
            </ul>
          )}
        </ul>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right"></i>
        Logout
      </button>
    </aside>
  );
}