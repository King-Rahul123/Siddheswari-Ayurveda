import { useState } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Stock.css";

export default function Stock() {
    const [search, setSearch] = useState("");

    const stockData = [
        {
        id: 1,
        code: "P001",
        product: "Paracetamol 500",
        brand: "Cipla",
        category: "Tablet",
        batch: "BT1001",
        stock: 150,
        minStock: 20,
        mrp: 25,
        expiry: "12/2027",
        },
        {
        id: 2,
        code: "P002",
        product: "Dolo 650",
        brand: "Micro Labs",
        category: "Tablet",
        batch: "BT1002",
        stock: 8,
        minStock: 20,
        mrp: 32,
        expiry: "09/2026",
        },
        {
        id: 3,
        code: "P003",
        product: "Vitamin C",
        brand: "Himalaya",
        category: "Syrup",
        batch: "BT1003",
        stock: 0,
        minStock: 15,
        mrp: 120,
        expiry: "05/2026",
        },
        {
        id: 4,
        code: "P004",
        product: "Liv-52",
        brand: "Himalaya",
        category: "Tablet",
        batch: "BT1004",
        stock: 65,
        minStock: 15,
        mrp: 180,
        expiry: "01/2028",
        },
        {
        id: 5,
        code: "P005",
        product: "Ashwagandha",
        brand: "Baidyanath",
        category: "Capsule",
        batch: "BT1005",
        stock: 12,
        minStock: 25,
        mrp: 250,
        expiry: "08/2027",
        },
    ];

    const filteredStock = stockData.filter((item) =>
        item.product.toLowerCase().includes(search.toLowerCase())
    );

    const totalProducts = stockData.length;
    const inStock = stockData.filter((x) => x.stock > x.minStock).length;
    const lowStock = stockData.filter(
        (x) => x.stock > 0 && x.stock <= x.minStock
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
                                {filteredStock.length > 0 ? ( filteredStock.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.product}</td>
                                        <td>{item.code}</td>
                                        <td>{item.batch}</td>
                                        <td>₹{item.mrp}</td>
                                        <td
                                            className={
                                            item.stock === 0
                                                ? "text-red-600 fw-bold"
                                                : item.stock <= item.minStock
                                                ? "text-warning fw-bold"
                                                : "text-success fw-bold"
                                            }
                                        >
                                            {item.stock}
                                        </td>

                                        <td>{item.expiry}</td>
                                    </tr>
                                ))
                                ) : (
                                <tr>
                                    <td colSpan="12" className="empty-state">
                                    <i className="bi bi-box-seam"></i>
                                    <p>No products found.</p>
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