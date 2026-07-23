import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";
import { subscribeSales } from "../services/saleService";

export default function Sales() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeSales((data) => {
            setSalesData(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredSales = salesData.filter((sale) => {
        const matchesSearch = (sale.customerName || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesDate =
            selectedDate === "" || sale.date === selectedDate;

        return matchesSearch && matchesDate;
    });

    const totalRevenue = salesData.reduce(
        (sum, sale) => sum + Number(sale.grandTotal || sale.netAmount || sale.totalAmount || sale.total || 0),
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
            (sum, sale) => sum + Number(sale.grandTotal || sale.netAmount || sale.totalAmount || sale.total || 0),
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
                                            <td>₹{Number(sale.grandTotal || sale.netAmount || sale.totalAmount || 0).toFixed(2)}</td>
                                            <td className="gap-2 flex justify-center">
                                                <button className="edit-btn" onClick={() =>navigate(`/dashboard/sales/edit/${sale.saleId}`)}><i className="bi bi-pencil-square text-gray-500"></i></button>
                                                <button className="view-btn"><i className="bi bi-printer text-blue-500 text-base"></i></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}