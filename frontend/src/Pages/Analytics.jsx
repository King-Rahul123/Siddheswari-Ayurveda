import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

import { API_BASE_URL } from "../api/config";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Analytics.css";

const colors = ["#2e7d32", "#4caf50", "#81c784"];

export default function Analytics() {
    const [stats, setStats] = useState({
        revenue: 0,
        todaySales: 0,
        customers: 0,
        products: 0,
        lowStock: 0,
        inStock: 0,
        outOfStock: 0,
    });

    const [salesData, setSalesData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    
    const loadAnalytics = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/overview`);
            if (res.ok) {
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.salesData) setSalesData(data.salesData);
                if (data.paymentData) setPaymentData(data.paymentData);
                if (data.topProducts) setTopProducts(data.topProducts);
                if (data.activities) setActivities(data.activities);
                if (data.lowStockProducts) setLowStockProducts(data.lowStockProducts);
            }
        } catch (error) {
            console.error("Failed to load analytics:", error);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    // const average = salesData.reduce((sum, item) => sum + item.sales, 0) / (salesData.length || 1);

    // const predictedNextMonth = Math.round(average * 1.08);

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-wrapper">
                <Header />
                <main className="analytics-page">
                    <div className="analytics-header">
                        <div>
                            <h2>Business Analytics</h2>
                            <p>New Siddheswari Distributors</p>
                        </div>
                    </div>

                    <div className="analytics-cards">
                        <div className="analytics-card">
                            <i className="bi bi-currency-rupee"></i>
                            <h3>₹{stats.revenue.toLocaleString("en-IN")}</h3>
                            <p>Total Revenue</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-graph-up-arrow"></i>
                            <h3>₹{stats.todaySales.toLocaleString("en-IN")}</h3>
                            <p>Today's Sale</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-box-seam"></i>
                            <h3>{stats.products}</h3>
                            <p>Total Products</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-people"></i>
                            <h3>{stats.customers}</h3>
                            <p>Customers</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-exclamation-circle"></i>
                            <h3>{stats.lowStock}</h3>
                            <p>Low Stock</p>
                        </div>
                    </div>  
        
                    <div className="analytics-grid">
                        <div className="chart-card large">
                            <h3>Monthly Sales</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    dataKey="sales"
                                    stroke="#2e7d32"
                                    fill="#81c784"
                                />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3>Payment Methods</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                <Pie
                                    data={paymentData}
                                    dataKey="value"
                                    outerRadius={90}
                                    label
                                >
                                    {paymentData.map((item, i) => (
                                        <Cell
                                            key={i}
                                            fill={colors[i % colors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">

                            <h3>Top Selling Products</h3>

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="qty" fill="#2e7d32" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3>Inventory Overview</h3>

                            <div className="inventory-grid">
                                <div className="inventory-box">
                                    <h2>{stats.products}</h2>
                                    <span>Total Products</span>
                                </div>

                                <div className="inventory-box">
                                    <h2>{stats.inStock}</h2>
                                    <span>In Stock</span>
                                </div>

                                <div className="inventory-box">
                                    <h2>{stats.lowStock}</h2>
                                    <span>Low Stock</span>
                                </div>

                                <div className="inventory-box">
                                    <h2>{stats.outOfStock}</h2>
                                    <span>Out Of Stock</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-bottom">
                        <div className="table-card">
                            <h3>Recent Activities</h3>
                            <table>
                                <tbody>
                                    {activities.length === 0 ? (
                                        <tr>
                                            <td colSpan="3">No Recent Activity</td>
                                        </tr>
                                    ) : (
                                        activities.map((sale, index) => (
                                            <tr key={index}>
                                                <td>{sale.invoiceNo || "Sale"}</td>
                                                <td>
                                                    ₹{Number(
                                                        sale.grandTotal || sale.total || 0
                                                    ).toLocaleString("en-IN")}
                                                </td>
                                                <td>
                                                    {sale.createdAt?.toDate
                                                        ? sale.createdAt
                                                            .toDate()
                                                            .toLocaleDateString("en-IN")
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-card">
                            <h3>Low Stock Products</h3>
                            <table>
                                <tbody>
                                    {lowStockProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="2">No Low Stock Products</td>
                                        </tr>
                                    ) : (
                                        lowStockProducts.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.productName || item.name}</td>
                                                <td>{item.stock}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}