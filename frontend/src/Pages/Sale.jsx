import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";
import { subscribeSales } from "../services/saleService";
import { API_BASE_URL } from "../api/config";

export default function Sales() {

    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeSales((data) => {
            setSalesData(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Auto-close maintenance popup after 5 seconds
    useEffect(() => {
        if (!showMaintenancePopup) return;
        const timer = setTimeout(() => {
            setShowMaintenancePopup(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [showMaintenancePopup]);

    const handleEditClick = (e) => {
        e.preventDefault();
        setShowMaintenancePopup(true);
    };

    const filteredSales = salesData.filter((sale) => {
        const matchesSearch = (sale.customerName || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesDate =
            selectedDate === "" || sale.date === selectedDate;

        return matchesSearch && matchesDate;
    });

    const totalRevenue = salesData.reduce(
        (sum, sale) => sum + Number(sale.netAmount || sale.grandTotal || sale.totalAmount || sale.total || 0),
        0
    );

    const totalOrders = salesData.length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todaySales = salesData
        .filter((sale) => {
            const saleDateStr = sale.date || (sale.createdAt ? new Date(sale.createdAt).toISOString().split("T")[0] : "");
            return saleDateStr === todayStr;
        })
        .reduce(
            (sum, sale) => sum + Number(sale.netAmount || sale.grandTotal || sale.totalAmount || sale.total || 0),
            0
        );

    const activeCustomers = new Set(
        salesData.map((s) => s.customerCode || s.customerName).filter(Boolean)
    ).size;

    return (
        <div className="dashboard">
        <Sidebar />
            <div className="dashboard-wrapper">
            <Header />
                <main className="dashboard-content">
                    <div className="sales-header">
                        <div>
                            <h2>Sales Management</h2>
                            <p className="text-gray-600 text-sm">Track all medicine sales and revenue</p>
                        </div>
                        <button className="add-sale-btn" onClick={() => navigate("/dashboard/sales/sale-invoice")} ><i className="bi bi-plus-circle"></i>Add Sale</button>
                    </div>

                    <div className="sales-stats">
                        <div className="sales-card">
                            <i className="bi bi-currency-rupee"></i>
                            <h4>₹{totalRevenue.toLocaleString("en-IN")}</h4>
                            <p>Total revenue</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-bag-check-fill"></i>
                            <h4>{totalOrders}</h4>
                            <p>Total orders</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-graph-up-arrow"></i>
                            <h4>₹{todaySales.toLocaleString("en-IN")}</h4>
                            <p>Today's sales</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-people-fill"></i>
                            <h4>{activeCustomers}</h4>
                            <p>Active customers</p>
                        </div>
                    </div>

                    <div className="sales-toolbar">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input type="text" placeholder="Search customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-gray-300 border-2 p-2 h-9 rounded-xl" />
                        <p className="text-gray-500 text-sm">Total Bills: {filteredSales.length}</p>
                    </div>

                    <div className="sales-table-card">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Bill Number</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Total Amount</th>
                                    <th>Net Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-3">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-3">
                                            <i className="bi bi-search text-gray-500 text-2xl"></i>
                                            <p>No Sales Found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <tr key={sale.saleId}>
                                            <td>{sale.saleId}</td>
                                            <td>{sale.date}</td>
                                            <td>{sale.customerName}</td>
                                            <td>₹{Number(sale.totalAmount || sale.total || 0).toFixed(2)}</td>
                                            <td>₹{Number(sale.netAmount || sale.grandTotal || sale.totalAmount || 0).toFixed(2)}</td>
                                            <td className="gap-2 flex justify-center">
                                                <button
                                                    className="edit-btn"
                                                    title="Edit Sale (Under Maintenance)"
                                                    onClick={handleEditClick}
                                                >
                                                    <i className="bi bi-pencil-square text-gray-500"></i>
                                                </button>
                                                <button
                                                    className="view-btn"
                                                    title="View / Download PDF Invoice"
                                                    onClick={() => {
                                                        const token = localStorage.getItem("token");
                                                        window.open(`${API_BASE_URL}/sales/pdf/${encodeURIComponent(sale.saleId)}?token=${encodeURIComponent(token || "")}`, "_blank");
                                                    }}
                                                >
                                                    <i className="bi bi-file-earmark-pdf text-blue-500 text-base"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Maintenance Popup Modal (Auto Closes in 5 Seconds) */}
            {showMaintenancePopup && (
                <div className="maintenance-popup-overlay" onClick={() => setShowMaintenancePopup(false)}>
                    <div className="maintenance-popup-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="maintenance-close-btn"
                            onClick={() => setShowMaintenancePopup(false)}
                            title="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className="maintenance-icon">
                            <i className="bi bi-tools"></i>
                        </div>
                        <h4 className="maintenance-title">Notice</h4>
                        <p className="maintenance-message">
                            This feature is currently under maintenance. We’ll be back shortly with an enhanced experience. Thank you for your patience!
                        </p>
                        <div className="maintenance-timer-bar">
                            <div className="maintenance-timer-progress"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}