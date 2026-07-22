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

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

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
        const salesSnap = await getDocs(collection(db, "sales"));
        const customerSnap = await getDocs(collection(db, "customer"));
        const productSnap = await getDocs(collection(db, "product"));
        
        const sales = salesSnap.docs.map(doc => doc.data());
        const customers = customerSnap.docs.length;
        const products = productSnap.docs.map(doc => doc.data());
        
        let revenue = 0;
        let todaySales = 0;
        
        const monthly = {};
        const payment = {};
        const top = {};
        
        const today = new Date().toDateString();
        
        sales.forEach((sale) => {
            const amount = Number(sale.grandTotal || sale.total || 0);
            
            revenue += amount;
            
            let date;
            
            if (sale.createdAt?.toDate) {
                date = sale.createdAt.toDate();
            } else if (sale.date) {
                date = new Date(sale.date);
            } else {
                date = new Date();
            }
            
            if (date.toDateString() === today) {
                todaySales += amount;
            }
            
            const month = date.toLocaleString("default", {
                month: "short",
            });
            
            monthly[month] = (monthly[month] || 0) + amount;

            payment[sale.paymentMethod || "Cash"] =
            (payment[sale.paymentMethod || "Cash"] || 0) + amount;
            
            if (Array.isArray(sale.items)) {
                sale.items.forEach((item) => {
                    const name = item.productName || item.name || "Unknown";
                    top[name] = (top[name] || 0) + Number(item.quantity || 0);
                });
            }
        });
        
        const lowStock = products.filter(
            (p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 10
        ).length;

        const outOfStock = products.filter(
            (p) => Number(p.stock || 0) === 0
        ).length;
        
        const inStock = products.filter(
            (p) => Number(p.stock || 0) > 10
        ).length;
        
        setLowStockProducts(
            products
                .filter((p) => Number(p.stock || 0) <= 10)
                .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
        );

        setStats({
            revenue,
            todaySales,
            customers,
            products: products.length,
            lowStock,
            inStock,
            outOfStock
        });
        
        const monthOrder = [
            "Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"
        ];
        
        setSalesData(
            monthOrder
            .filter((m) => monthly[m])
            .map((m) => ({
                month: m,
                sales: monthly[m],
            }))
        );
        
        setPaymentData(
            Object.keys(payment).map((k) => ({
                name: k,
                value: payment[k],
            }))
        );
        
        setTopProducts(
            Object.entries(top)
            .map(([name, qty]) => ({
                name,
                qty,
            }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)
        );

        const recent = await getDocs(
            query(
                collection(db, "sales"),
                orderBy("createdAt", "desc"),
                limit(5)
            )
        );
        
        setActivities(
            recent.docs.map((doc) => doc.data())
        );
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