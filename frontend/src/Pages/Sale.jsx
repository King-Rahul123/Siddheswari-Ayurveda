import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";

export default function Sales() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const salesData = [
        {
            billnumber: "BILL001",
            customer: "Rahul Adak",
            amount: 560,
            date: "2026-06-17",
        },
        {
            billnumber: "BILL002",
            customer: "Priya Sharma",
            amount: 320,
            date: "2026-06-16",
        },
        {
            billnumber: "BILL003",
            customer: "Amit Kumar",
            amount: 840,
            date: "2026-06-15",
        },
    ];

    const filteredSales = salesData.filter((sale) => {
        const matchesSearch = sale.customer
        .toLowerCase()
        .includes(search.toLowerCase());

        const matchesDate =
            selectedDate === "" || sale.date === selectedDate;

        return matchesSearch && matchesDate;
    });

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
                            <h4>₹58,650</h4>
                            <p>Total revenue</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-bag-check-fill"></i>
                            <h4>245</h4>
                            <p>Total orders</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-graph-up-arrow"></i>
                            <h4>₹8,450</h4>
                            <p>Today's sales</p>
                        </div>

                        <div className="sales-card">
                            <i className="bi bi-people-fill"></i>
                            <h4>178</h4>
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
                                {filteredSales.map((sale) => (
                                <tr key={sale.billnumber}>
                                    <td>{sale.billnumber}</td>
                                    <td>
                                        {new Date(sale.date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td>{sale.customer}</td>
                                    <td>₹{sale.totalamount}</td>
                                    <td>₹{sale.netamount}</td>
                                    <td className="gap-2 flex justify-center">
                                        <button className="edit-btn"><i className="bi bi-pencil-square text-gray-500"></i></button>
                                        <button className="view-btn"><i className="bi bi-printer text-blue-500 text-base"></i></button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}