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
    ComposedChart,
    Line
} from "recharts";

import { apiFetch } from "../api/apiClient";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Analytics.css";

const colors = ["#2e7d32", "#4caf50", "#81c784"];

// Custom Tooltip component for Performance Modal Graph
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-chart-tooltip">
                <p className="tooltip-title">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="tooltip-row">
                        <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
                        <span className="tooltip-name">{entry.name}:</span>
                        <span className="tooltip-value">₹{Number(entry.value || 0).toLocaleString("en-IN")}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        activeProducts: 0,
        netPurchase: 0,
        totalPurchase: 0,
        grossSale: 0,
        revenue: 0,
        todaySales: 0,
        customers: 0,
        products: 0,
        stockAmount: 0,
        closingStock: 0,
        profit: 0,
        performance: 0,
        appointments: 0,
        lowStock: 0,
        inStock: 0,
        outOfStock: 0,
    });

    const [timeframe, setTimeframe] = useState("monthly");
    const [salesData, setSalesData] = useState([]);
    const [monthlySalesData, setMonthlySalesData] = useState([]);
    const [weeklySalesData, setWeeklySalesData] = useState([]);
    const [yearlySalesData, setYearlySalesData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    
    // State for Performance Popup Modal
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [modalTimeframe, setModalTimeframe] = useState("monthly");
    const [graphType, setGraphType] = useState("combination"); // "combination" | "clustered"

    const loadAnalytics = async (tf = timeframe) => {
        try {
            const res = await apiFetch(`/analytics/overview?timeframe=${tf}`);
            if (res.ok) {
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.salesData) setSalesData(data.salesData);
                if (data.monthlySalesData) setMonthlySalesData(data.monthlySalesData);
                if (data.weeklySalesData) setWeeklySalesData(data.weeklySalesData);
                if (data.yearlySalesData) setYearlySalesData(data.yearlySalesData);
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
        loadAnalytics(timeframe);
    }, [timeframe]);

    const activeChartData = timeframe === "weekly" 
        ? (weeklySalesData.length > 0 ? weeklySalesData : salesData)
        : timeframe === "yearly"
        ? (yearlySalesData.length > 0 ? yearlySalesData : salesData)
        : (monthlySalesData.length > 0 ? monthlySalesData : salesData);

    const modalChartData = modalTimeframe === "weekly"
        ? (weeklySalesData.length > 0 ? weeklySalesData : salesData)
        : modalTimeframe === "yearly"
        ? (yearlySalesData.length > 0 ? yearlySalesData : salesData)
        : (monthlySalesData.length > 0 ? monthlySalesData : salesData);

    // Use Profit Margin data stored continuously in the backend response list
    const performanceGraphData = modalChartData.map((d) => ({
        label: d.label,
        sales: Number(d.sales || 0),
        purchases: Number(d.purchases || 0),
        profit: Number(d.profit || 0)
    }));

    const performanceScore = Number(stats.performance || 0);
    const netProfitVal = Number(stats.profit || 0);

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
                            <i className="bi bi-cart-check-fill"></i>
                            <h3>₹{Number(stats.netPurchase || 0).toLocaleString("en-IN")}</h3>
                            <p>Net Purchase (PTS)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-cart-plus-fill"></i>
                            <h3>₹{Number(stats.totalPurchase || 0).toLocaleString("en-IN")}</h3>
                            <p>Total Purchase (MRP)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-wallet2"></i>
                            <h3>₹{Number(stats.grossSale || 0).toLocaleString("en-IN")}</h3>
                            <p>Gross Sale (PTS)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-currency-rupee"></i>
                            <h3>₹{Number(stats.revenue || 0).toLocaleString("en-IN")}</h3>
                            <p>Total Sale (MRP)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-cash-stack"></i>
                            <h3>₹{Number(stats.todaySales || 0).toLocaleString("en-IN")}</h3>
                            <p>Today's Sale (MRP)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-bank"></i>
                            <h3>₹{Number(stats.stockAmount || 0).toLocaleString("en-IN")}</h3>
                            <p>Stock Amount (MRP)</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-archive-fill"></i>
                            <h3>₹{Number(stats.closingStock || 0).toLocaleString("en-IN")}</h3>
                            <p>Closing Stock (PTS)</p>
                        </div>

                        {/* Performance Card - Behaves as interactive button */}
                        <div 
                            className="analytics-card performance-card-btn"
                            onClick={() => setShowPerformanceModal(true)}
                            title="Click to open performance graph modal"
                        >
                            <i className="bi bi-graph-up-arrow"></i>
                            <h3>{stats.performance}%</h3>
                            <p>Performance</p>
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
                            <i className="bi bi-calendar-check"></i>
                            <h3>{stats.appointments}</h3>
                            <p>Appointments</p>
                        </div>

                        <div className="analytics-card">
                            <i className="bi bi-exclamation-circle"></i>
                            <h3>{stats.lowStock}</h3>
                            <p>Low Stock</p>
                        </div>
                    </div>  
        
                    <div className="analytics-grid">
                        <div className="chart-card large">
                            <div className="chart-header flex justify-between items-center mb-4">
                                <h3 className="m-0 text-emerald-800 font-bold text-lg">
                                    {timeframe === "weekly" ? "Weekly" : timeframe === "yearly" ? "Yearly" : "Monthly"} Sales & Purchases
                                </h3>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        View By:
                                    </label>
                                    <select
                                        value={timeframe}
                                        onChange={(e) => setTimeframe(e.target.value)}
                                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={activeChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    name="Sales (₹)"
                                    dataKey="sales"
                                    stroke="#2e7d32"
                                    fill="#81c784"
                                />
                                <Area
                                    type="monotone"
                                    name="Purchases (₹)"
                                    dataKey="purchases"
                                    stroke="#0284c7"
                                    fill="#7dd3fc"
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
                                                    {sale.dateFormatted || "-"}
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

            {/* Performance Popup Modal */}
            {showPerformanceModal && (
                <div className="performance-modal-backdrop" onClick={() => setShowPerformanceModal(false)}>
                    <div className="performance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="performance-modal-header">
                            <div className="modal-header-title">
                                <div className="modal-header-icon">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <div>
                                    <h3>Performance Analytics Visualization</h3>
                                    <p>Siddheswari Ayurveda Business Intelligence</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowPerformanceModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="performance-modal-body">
                            {/* KPI Cards Grid */}
                            <div className="perf-kpi-grid">
                                <div className="perf-kpi-card score">
                                    <small>Performance Score</small>
                                    <div className="val">{performanceScore}%</div>
                                </div>
                                <div className="perf-kpi-card sales">
                                    <small>Total Sales (Revenue)</small>
                                    <div className="val">₹{stats.grossSale.toLocaleString("en-IN")}</div>
                                </div>
                                <div className="perf-kpi-card purchases">
                                    <small>Total Purchases</small>
                                    <div className="val">₹{stats.netPurchase.toLocaleString("en-IN")}</div>
                                </div>
                                <div className="perf-kpi-card margin">
                                    <small>Profit Margin</small>
                                    <div className="val">₹{netProfitVal.toLocaleString("en-IN")}</div>
                                </div>
                            </div>

                            {/* Control Bar (Timeframe & Graph Visualization Type) */}
                            <div className="perf-control-bar">
                                <div className="flex items-center gap-2">
                                    <span className="control-group-label">Timeframe:</span>
                                    <div className="toggle-button-group">
                                        <button 
                                            className={`toggle-btn ${modalTimeframe === "weekly" ? "active green" : ""}`}
                                            onClick={() => setModalTimeframe("weekly")}
                                        >
                                            Weekly
                                        </button>
                                        <button 
                                            className={`toggle-btn ${modalTimeframe === "monthly" ? "active green" : ""}`}
                                            onClick={() => setModalTimeframe("monthly")}
                                        >
                                            Monthly
                                        </button>
                                        <button 
                                            className={`toggle-btn ${modalTimeframe === "yearly" ? "active green" : ""}`}
                                            onClick={() => setModalTimeframe("yearly")}
                                        >
                                            Yearly
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="control-group-label">Graph Visualization:</span>
                                    <div className="toggle-button-group">
                                        <button 
                                            className={`toggle-btn ${graphType === "combination" ? "active" : ""}`}
                                            onClick={() => setGraphType("combination")}
                                        >
                                            <i className="bi bi-bar-chart-line"></i> Combination (Line & Bar)
                                        </button>
                                        <button 
                                            className={`toggle-btn ${graphType === "clustered" ? "active" : ""}`}
                                            onClick={() => setGraphType("clustered")}
                                        >
                                            <i className="bi bi-bar-chart-steps"></i> Clustered Column
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Graph Display Area */}
                            <div className="perf-graph-container">
                                <ResponsiveContainer width="100%" height={340}>
                                    {graphType === "combination" ? (
                                        <ComposedChart data={performanceGraphData} margin={{ top: 20, right: 30, left: 15, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 500 }} />
                                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Bar name="Sales (Revenue)" dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                            <Bar name="Purchases" dataKey="purchases" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                            <Line name="Profit Margin" type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3.5} dot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 7 }} />
                                        </ComposedChart>
                                    ) : (
                                        <BarChart data={performanceGraphData} margin={{ top: 20, right: 30, left: 15, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 500 }} />
                                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Bar name="Sales (Revenue)" dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                            <Bar name="Purchases" dataKey="purchases" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                            <Bar name="Profit Margin" dataKey="profit" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}