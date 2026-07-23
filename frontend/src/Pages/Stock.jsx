import { useState, useEffect } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Stock.css";
import { subscribeStock } from "../services/stockService";
import { subscribeProducts } from "../services/productService";

export default function Stock() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubProd = subscribeProducts((data) => {
            setProducts(data || []);
            setLoading(false);
        });
        const unsubStock = subscribeStock((data) => {
            setStockItems(data || []);
        });
        return () => {
            unsubProd();
            unsubStock();
        };
    }, []);

    // Consolidate database products and stock records
    const aggregatedMap = new Map();

    // 1. Load all products from Product database collection
    (products || []).forEach((p) => {
        const code = p.itemCode || p.code || p._id || "";
        const name = p.productName || p.name || "Unnamed Product";
        const key = (code || name).toString().toLowerCase();

        aggregatedMap.set(key, {
            id: p._id || code,
            code: code,
            product: name,
            batch: p.batch || "-",
            stock: Number(p.stock || 0),
            minStock: Number(p.minStock || 0),
            mrp: Number(p.mrp || p.price || 0),
            expiry: p.expiry || p.expiryDate || "-"
        });
    });

    // 2. Merge/Update from Stock database collection
    (stockItems || []).forEach((s, idx) => {
        const code = s.itemCode || s.code || "";
        const name = s.productName || s.product || "";
        const batch = s.batch || "";
        const key = (code || name).toString().toLowerCase();

        const sQty = Number(s.qty ?? s.stock ?? 0);
        const sMrp = Number(s.mrp || s.rate || 0);

        if (key && aggregatedMap.has(key)) {
            const existing = aggregatedMap.get(key);
            if (existing.stock < sQty) {
                existing.stock = sQty;
            }
            if (batch && batch !== "-") existing.batch = batch;
            if (sMrp > 0) existing.mrp = sMrp;
            if (s.expiryDate || s.expiry) existing.expiry = s.expiryDate || s.expiry;
        } else if (key) {
            aggregatedMap.set(key, {
                id: s.stockId || s._id || `stock_${idx}`,
                code: code || `STK${idx + 1}`,
                product: name || "Unnamed Product",
                batch: batch || "-",
                stock: sQty,
                minStock: Number(s.minStock || 0),
                mrp: sMrp,
                expiry: s.expiryDate || s.expiry || "-"
            });
        }
    });

    const stockData = Array.from(aggregatedMap.values());

    const filteredStock = stockData.filter((item) =>
        (item.product || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.batch || "").toLowerCase().includes(search.toLowerCase())
    );

    const getMinStockThreshold = (item) => {
        const val = Number(item.minStock || 0);
        return val > 0 ? val : 5;
    };

    const totalProducts = stockData.length;
    const inStock = stockData.filter((x) => x.stock > getMinStockThreshold(x)).length;
    const lowStock = stockData.filter(
        (x) => x.stock > 0 && x.stock <= getMinStockThreshold(x)
    ).length;
    const outOfStock = stockData.filter((x) => x.stock === 0).length;

    return (
        <div className="dashboard">
            <Sidebar />

            <div className="dashboard-wrapper">
                <Header />

                <main className="dashboard-content">
                    <div className="stock-header">
                        <h2>Stock Management</h2>
                    </div>

                    <div className="stock-cards">
                        <div className="stock-card">
                            <i className="bi bi-box-seam-fill"></i>
                            <h3>{totalProducts}</h3>
                            <p>Total Products</p>
                        </div>

                        <div className="stock-card green">
                            <i className="bi bi-check-circle-fill"></i>
                            <h3>{inStock}</h3>
                            <p>In Stock</p>
                        </div>

                        <div className="stock-card yellow">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <h3>{lowStock}</h3>
                            <p>Low Stock</p>
                        </div>

                        <div className="stock-card red">
                            <i className="bi bi-x-circle-fill"></i>
                            <h3>{outOfStock}</h3>
                            <p>Out of Stock</p>
                        </div>
                    </div>

                    <div className="stock-toolbar">
                        <div className="search-box">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                placeholder="Search Product..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button className="export-btn"><i className="bi bi-download"></i>Export</button>

                    </div>
                    <div className="stock-table-card">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th className="text-center">Sl</th>
                                    <th className="text-center">Product</th>
                                    <th className="text-center">Code</th>
                                    <th className="text-center">Batch</th>
                                    <th className="text-center">MRP</th>
                                    <th className="text-center">Stock</th>
                                    <th className="text-center">Expiry</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            Loading stock data...
                                        </td>
                                    </tr>
                                ) : filteredStock.length > 0 ? (
                                    filteredStock.map((item, index) => {
                                        const threshold = getMinStockThreshold(item);
                                        const isOutOfStock = item.stock === 0;
                                        const isLowStock = item.stock > 0 && item.stock <= threshold;
                                        const isInStock = item.stock > threshold;

                                        return (
                                            <tr key={item.id || index}>
                                                <td>{index + 1}</td>
                                                <td>{item.product}</td>
                                                <td>{item.code}</td>
                                                <td>{item.batch}</td>
                                                <td>₹{Number(item.mrp || 0).toFixed(2)}</td>
                                                <td
                                                    className={
                                                        isOutOfStock
                                                            ? "text-red-600 fw-bold"
                                                            : isLowStock
                                                            ? "text-warning fw-bold text-yellow-600"
                                                            : "text-emerald-600 fw-bold text-success"
                                                    }
                                                >
                                                    {item.stock}
                                                </td>

                                                <td>{item.expiry}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            <i className="bi bi-box-seam"></i>
                                            <p>No stock records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}