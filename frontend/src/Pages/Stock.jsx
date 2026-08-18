import { useState, useEffect } from "react";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Stock.css";
import { subscribeStock } from "../services/stockService";
import { subscribeProducts } from "../services/productService";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function Stock() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "inStock" | "lowStock" | "outOfStock"

    useEffect(() => {
        let isMounted = true;
        const unsubStock = subscribeStock((data) => {
            if (isMounted) {
                setStockItems(Array.isArray(data) ? data : []);
                setLoading(false);
            }
        });
        const unsubProd = subscribeProducts((data) => {
            if (isMounted) {
                setProducts(Array.isArray(data) ? data : []);
            }
        });
        return () => {
            isMounted = false;
            unsubStock();
            unsubProd();
        };
    }, []);

    // Safely format batch value (handles string, array, object, null, undefined)
    const formatBatch = (batchVal) => {
        if (Array.isArray(batchVal)) {
            const filtered = batchVal.filter(b => b && String(b).trim() !== "" && String(b).trim() !== "-" && String(b).trim() !== "—");
            return filtered.length > 0 ? filtered.join(", ") : "-";
        }
        if (batchVal && typeof batchVal === "object") {
            return "-";
        }
        const str = String(batchVal || "").trim();
        return (str === "" || str === "—") ? "-" : str;
    };

    // Helper to check if item has a valid batch number
    const hasValidBatch = (batchVal) => {
        const formatted = formatBatch(batchVal);
        return formatted !== "-" && formatted !== "" && formatted !== "—" && formatted.toLowerCase() !== "n/a";
    };

    // Create a minStock map from products
    const prodMinStockMap = new Map();
    (products || []).forEach((p) => {
        const code = String(p.itemCode || "").toLowerCase().trim();
        if (code) prodMinStockMap.set(code, Number(p.minStock || 0));
    });

    // Map items from stocks database collection
    const stockData = (stockItems || []).map((s, idx) => {
        const code = String(s.itemCode || s.code || "").trim();
        const name = String(s.productName || s.product || "Unnamed Product").trim();
        const minStock = prodMinStockMap.get(code.toLowerCase()) || Number(s.minStock || 0);
        const batchFormatted = formatBatch(s.batch);

        return {
            id: s.stockId || s._id || `stock_${idx}`,
            code: code || "-",
            product: name,
            batch: batchFormatted,
            stock: Number(s.qty ?? s.stock ?? 0),
            minStock: minStock,
            mrp: Number(s.mrp || s.rate || 0),
            expiry: String(s.expiryDate || s.expiry || "-").trim() || "-"
        };
    });

    // Include any product from products collection not yet present in stocks collection
    const stockCodeSet = new Set((stockItems || []).map(s => String(s.itemCode || "").toLowerCase().trim()).filter(Boolean));
    (products || []).forEach((p, idx) => {
        const code = String(p.itemCode || "").trim();
        if (code && !stockCodeSet.has(code.toLowerCase())) {
            const batchFormatted = formatBatch(p.batch);
            stockData.push({
                id: p._id || p.itemCode || `prod_${idx}`,
                code: code || "-",
                product: String(p.productName || "Unnamed Product").trim(),
                batch: batchFormatted,
                stock: Number(p.stock || 0),
                minStock: Number(p.minStock || 0),
                mrp: Number(p.mrp || 0),
                expiry: String(p.expiry || "-").trim() || "-"
            });
        }
    });

    const getMinStockThreshold = (item) => {
        const val = Number(item.minStock || 0);
        return val > 0 ? val : 5;
    };

    const filteredStock = stockData.filter((item) => {
        const searchLower = (search || "").toLowerCase();
        const matchesSearch = (
            (item.product || "").toLowerCase().includes(searchLower) ||
            (item.code || "").toLowerCase().includes(searchLower) ||
            (item.batch || "").toLowerCase().includes(searchLower)
        );

        const threshold = getMinStockThreshold(item);
        let matchesStatus = true;

        if (statusFilter === "inStock") {
            matchesStatus = item.stock > threshold;
        } else if (statusFilter === "lowStock") {
            matchesStatus = item.stock > 0 && item.stock <= threshold;
        } else if (statusFilter === "outOfStock") {
            matchesStatus = item.stock === 0 && hasValidBatch(item.batch);
        }

        return matchesSearch && matchesStatus;
    });

    const totalProducts = stockData.length;

    const productsWithoutBatch = stockData.filter(
        (item) => !hasValidBatch(item.batch)
    ).length;

    const productsWithBatch = totalProducts - productsWithoutBatch;

    const inStock = stockData.filter((x) => x.stock > getMinStockThreshold(x)).length;
    const lowStock = stockData.filter(
        (x) => x.stock > 0 && x.stock <= getMinStockThreshold(x)
    ).length;
    const outOfStock = stockData.filter(
        (x) => x.stock === 0 && hasValidBatch(x.batch)
    ).length;

    // Filter items with valid batch numbers for export
    const getBatchItemsForExport = () => {
        return stockData.filter(item => hasValidBatch(item.batch));
    };

    const handleExportExcel = () => {
        const dataToExport = getBatchItemsForExport();
        if (dataToExport.length === 0) {
            toast.warning("No products with valid batch numbers found to export.");
            return;
        }

        const exportRows = dataToExport.map((item, index) => ({
            "Sl No": index + 1,
            "Product Name": item.product,
            "Item Code": item.code,
            "Batch No": item.batch,
            "MRP (₹)": Number(item.mrp || 0).toFixed(2),
            "Stock Qty": item.stock,
            "Stock Amount (₹)": (Number(item.stock || 0) * Number(item.mrp || 0)).toFixed(2),
            "Expiry Date": item.expiry
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock_Batch_Report");

        worksheet["!cols"] = [
            { wch: 8 },
            { wch: 30 },
            { wch: 16 },
            { wch: 18 },
            { wch: 14 },
            { wch: 12 },
            { wch: 18 },
            { wch: 16 }
        ];

        const dateStr = new Date().toISOString().split("T")[0];
        XLSX.writeFile(workbook, `Stock_Batch_Report_${dateStr}.xlsx`);
        toast.success(`Exported ${dataToExport.length} batch items to Excel successfully!`);
        setShowExportModal(false);
    };

    const handleExportPDF = () => {
        const dataToExport = getBatchItemsForExport();
        if (dataToExport.length === 0) {
            toast.warning("No products with valid batch numbers found to export.");
            return;
        }

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Pop-up blocked! Please enable pop-ups to export PDF.");
            return;
        }

        const dateStr = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        // Calculate total stock amount for exported batch items
        const totalStockAmount = dataToExport.reduce((acc, item) => {
            return acc + (Number(item.stock || 0) * Number(item.mrp || 0));
        }, 0);

        const logoUrl = `${window.location.origin}/logo.png`;

        const rowsHtml = dataToExport.map((item, idx) => `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td style="font-weight: 600; text-align: left;">${item.product}</td>
                <td style="text-align: center;">${item.code}</td>
                <td style="text-align: center; font-weight: 600; color: #166534;">${item.batch}</td>
                <td style="text-align: right;">₹${Number(item.mrp || 0).toFixed(2)}</td>
                <td style="text-align: center; font-weight: 600;">${item.stock}</td>
                <td style="text-align: center;">${item.expiry}</td>
            </tr>
        `).join("");

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Batch Report - Siddheswari Ayurveda</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 30px;
                        color: #1e293b;
                        background: #ffffff;
                        position: relative;
                        min-height: 100vh;
                    }
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 380px;
                        max-width: 75%;
                        opacity: 0.1;
                        z-index: -1;
                        pointer-events: none;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #16a34a;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                    }
                    .header-logo {
                        width: 55px;
                        height: 55px;
                        border-radius: 50%;
                        object-fit: cover;
                    }
                    .header-title h1 {
                        margin: 0 0 4px;
                        color: #0b3528;
                        font-size: 24px;
                        font-weight: 700;
                    }
                    .header-title p {
                        margin: 0;
                        color: #64748b;
                        font-size: 13px;
                    }
                    .meta {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        margin-bottom: 20px;
                        font-size: 13px;
                        background: #f0fdf4;
                        padding: 12px 18px;
                        border-radius: 10px;
                        border: 1px solid #bbf7d0;
                        color: #166534;
                        text-align: center;
                    }
                    .meta-item strong {
                        display: block;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #15803d;
                        margin-bottom: 3px;
                    }
                    .meta-item span {
                        font-size: 15px;
                        font-weight: 700;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        font-size: 13px;
                        background: rgba(255, 255, 255, 0.85);
                    }
                    th {
                        background: #0b3528 !important;
                        color: #ffffff !important;
                        padding: 10px 8px;
                        text-align: center;
                        font-weight: 600;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    td {
                        padding: 9px 8px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    tr:nth-child(even) {
                        background: rgba(248, 250, 252, 0.85);
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 11px;
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 10px;
                    }
                    @media print {
                        body { padding: 0; }
                        @page { size: auto; margin: 12mm; }
                        .watermark {
                            opacity: 0.2 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <img src="${logoUrl}" class="watermark" alt="Siddheswari Ayurveda Logo" />

                <div class="header">
                    <img src="${logoUrl}" class="header-logo" alt="Logo" />
                    <div class="header-title">
                        <h1>Siddheswari Ayurveda</h1>
                        <p>Stock Inventory Report (Products with Batch Numbers)</p>
                    </div>
                </div>

                <div class="meta">
                    <div class="meta-item">
                        <strong>Generated Date</strong>
                        <span>${dateStr}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Total Batch Products</strong>
                        <span>${dataToExport.length}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Total Stock Amount</strong>
                        <span>₹${totalStockAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">Sl</th>
                            <th style="text-align: left;">Product Name</th>
                            <th>Code</th>
                            <th>Batch No</th>
                            <th style="text-align: right;">MRP</th>
                            <th>Stock</th>
                            <th>Expiry</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Report generated automatically by Siddheswari Ayurveda Management System</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        toast.success(`Preparing PDF with Stock Amount & Brand Watermark...`);
        setShowExportModal(false);
    };

    const eligibleBatchCount = getBatchItemsForExport().length;

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
                        <div
                            className={`stock-card ${statusFilter === "all" ? "active" : ""}`}
                            onClick={() => setStatusFilter("all")}
                            title="Click to view all products"
                        >
                            <i className="bi bi-box-seam-fill"></i>
                            <h3>{productsWithBatch}</h3>
                            <p>Total Products</p>
                        </div>

                        <div
                            className={`stock-card green ${statusFilter === "inStock" ? "active" : ""}`}
                            onClick={() => setStatusFilter(prev => prev === "inStock" ? "all" : "inStock")}
                            title="Click to filter In Stock products"
                        >
                            <i className="bi bi-check-circle-fill"></i>
                            <h3>{inStock}</h3>
                            <p>In Stock</p>
                        </div>

                        <div
                            className={`stock-card yellow ${statusFilter === "lowStock" ? "active" : ""}`}
                            onClick={() => setStatusFilter(prev => prev === "lowStock" ? "all" : "lowStock")}
                            title="Click to filter Low Stock products"
                        >
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <h3>{lowStock}</h3>
                            <p>Low Stock</p>
                        </div>

                        <div
                            className={`stock-card red ${statusFilter === "outOfStock" ? "active" : ""}`}
                            onClick={() => setStatusFilter(prev => prev === "outOfStock" ? "all" : "outOfStock")}
                            title="Click to filter Out of Stock products"
                        >
                            <i className="bi bi-x-circle-fill"></i>
                            <h3>{outOfStock}</h3>
                            <p>Out of Stock</p>
                        </div>
                    </div>

                    <div className="stock-toolbar">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    placeholder="Search Product..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {statusFilter !== "all" && (
                                <button className="clear-filter-btn" onClick={() => setStatusFilter("all")}>
                                    <i className="bi bi-funnel-fill"></i>
                                    <span>
                                        Filter: {statusFilter === "inStock" ? "In Stock" : statusFilter === "lowStock" ? "Low Stock" : "Out of Stock"}
                                    </span>
                                    <i className="bi bi-x-lg ms-1"></i>
                                </button>
                            )}
                        </div>

                        <button className="export-btn" onClick={() => setShowExportModal(true)}>
                            <i className="bi bi-download"></i>Export
                        </button>
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
                                            <p>No stock records match the selected filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Modern Export Modal Popup */}
            {showExportModal && (
                <div className="export-modal-backdrop" onClick={() => setShowExportModal(false)}>
                    <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="export-modal-header">
                            <h3><i className="bi bi-box-arrow-up-right"></i> Export Stock Report</h3>
                            <button className="close-btn" onClick={() => setShowExportModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="export-modal-body">
                            <div className="export-info-box">
                                <i className="bi bi-info-circle-fill text-xl"></i>
                                <div>
                                    <strong>{eligibleBatchCount} Products with Batch Numbers</strong>
                                    <p className="m-0 text-xs text-emerald-800">Only products containing valid batch numbers will be included in the exported report.</p>
                                </div>
                            </div>

                            <div className="export-options-grid">
                                <div className="export-card pdf" onClick={handleExportPDF}>
                                    <i className="bi bi-file-earmark-pdf-fill"></i>
                                    <h4>PDF Document</h4>
                                    <p>Print or save clean PDF report with batch details</p>
                                    <button className="export-card-btn">
                                        <i className="bi bi-download me-1"></i> Export PDF
                                    </button>
                                </div>

                                <div className="export-card excel" onClick={handleExportExcel}>
                                    <i className="bi bi-file-earmark-excel-fill"></i>
                                    <h4>Excel Spreadsheet</h4>
                                    <p>Download structured .xlsx file for spreadsheet analysis</p>
                                    <button className="export-card-btn">
                                        <i className="bi bi-download me-1"></i> Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}