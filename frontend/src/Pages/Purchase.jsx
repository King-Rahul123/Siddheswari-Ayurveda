import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";
import "../CSS/Purchase.css";
import * as XLSX from "xlsx";

import { subscribePurchases } from "../services/purchaseService";

export default function Purchase() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [selectedPurchaseForExport, setSelectedPurchaseForExport] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedPurchaseForPreview, setSelectedPurchaseForPreview] = useState(null);

    const [purchaseData, setPurchaseData] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribePurchases(setPurchaseData);
        return () => unsubscribe();
    }, []);

    const handleAddProduct = () => {
        navigate("/dashboard/purchase/purchase-entry");
    };

    const getNormalizedDateStr = (dateVal) => {
        if (!dateVal) return "";
        if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
            return dateVal.trim();
        }
        try {
            const d = typeof dateVal.toDate === "function" ? dateVal.toDate() : new Date(dateVal);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch(e) {}
        return String(dateVal).split("T")[0];
    };

    const filteredPurchase = purchaseData.filter((purchase) => {
        const supplierName = purchase.companyName || purchase.supplier || "";
        const invNo = purchase.invoiceNo || "";
        const pId = purchase.purchaseId || "";
        const query = search.toLowerCase();

        const matchesSearch =
            supplierName.toLowerCase().includes(query) ||
            invNo.toLowerCase().includes(query) ||
            pId.toLowerCase().includes(query);

        const pDateStr = getNormalizedDateStr(purchase.invoiceDate || purchase.date || purchase.createdAt);

        const matchesFrom = !fromDate || (pDateStr && pDateStr >= fromDate);
        const matchesTo = !toDate || (pDateStr && pDateStr <= toDate);

        return matchesSearch && matchesFrom && matchesTo;
    });

    const formatPurchaseDate = (dateVal) => {
        if (!dateVal) return "-";
        try {
            const d = typeof dateVal.toDate === "function" ? dateVal.toDate() : new Date(dateVal);
            return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch(e) { return String(dateVal); }
    };

    const exportFilteredPurchasesToExcel = () => {
        const exportData = filteredPurchase.map((purchase, idx) => ({
            "S.No": idx + 1,
            "Purchase No": purchase.purchaseId || "-",
            "Invoice No": purchase.invoiceNo || "-",
            "Company Name": purchase.companyName || purchase.supplier || "-",
            "Date": formatPurchaseDate(purchase.invoiceDate || purchase.date || purchase.createdAt),
            "Total Items": purchase.totalItems || (purchase.items?.length || 0),
            "Total Qty": purchase.totalQty || 0,
            "Total Amount (₹)": Number(purchase.totalAmount || purchase.totalamount || 0).toFixed(2),
            "Net Amount (₹)": Number(purchase.netAmount || purchase.grandTotal || purchase.totalAmount || 0).toFixed(2),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Purchases Summary"
        );

        let dateRangeText = "All";
        if (fromDate && toDate) {
            dateRangeText = `${fromDate}_to_${toDate}`;
        } else if (fromDate) {
            dateRangeText = `from_${fromDate}`;
        } else if (toDate) {
            dateRangeText = `to_${toDate}`;
        }

        const fileName = `Purchase_Report_${dateRangeText}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const exportToExcel = () => {
        if (!selectedPurchaseForExport) return;

        const items = selectedPurchaseForExport.items && selectedPurchaseForExport.items.length > 0
            ? selectedPurchaseForExport.items
            : null;

        let exportData = [];

        if (items) {
            exportData = items.map((item, index) => {
                const qty = Number(item.qty || 0);
                const rate = Number(item.rate || item.mrp || 0);
                const amount = item.amount !== undefined && item.amount !== null
                    ? Number(item.amount)
                    : qty * rate;

                return {
                    "S.No": index + 1,
                    "Purchase ID": selectedPurchaseForExport.purchaseId || "-",
                    "Invoice No": selectedPurchaseForExport.invoiceNo || "-",
                    "Supplier": selectedPurchaseForExport.companyName || selectedPurchaseForExport.supplier || "-",
                    "Invoice Date": formatPurchaseDate(selectedPurchaseForExport.invoiceDate || selectedPurchaseForExport.date),
                    "Item Code": item.itemCode || item.productId || "-",
                    "Product Name": item.productName || "-",
                    "Batch": item.batch || "-",
                    "Expiry": item.expiry || item.expiryDate || "-",
                    "Qty": qty,
                    "Free": Number(item.free || 0),
                    "MRP (₹)": Number(item.mrp || 0),
                    "Rate (₹)": rate,
                    "HSN": item.hsn || item.hsnCode || "-",
                    "GST (%)": Number(item.gst || 0),
                    "Amount (₹)": amount,
                };
            });
        } else {
            exportData = [{
                "Purchase ID": selectedPurchaseForExport.purchaseId || "-",
                "Invoice No": selectedPurchaseForExport.invoiceNo || "-",
                "Supplier": selectedPurchaseForExport.companyName || selectedPurchaseForExport.supplier || "-",
                "Invoice Date": formatPurchaseDate(selectedPurchaseForExport.invoiceDate || selectedPurchaseForExport.date),
                "Total Items": selectedPurchaseForExport.totalItems || 0,
                "Total Qty": selectedPurchaseForExport.totalQty || 0,
                "Total Amount (₹)": Number(selectedPurchaseForExport.totalAmount || 0),
                "Net Amount (₹)": Number(selectedPurchaseForExport.netAmount || selectedPurchaseForExport.grandTotal || selectedPurchaseForExport.totalAmount || 0),
            }];
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Purchase Invoice"
        );

        const fileName = `Purchase_Invoice_${selectedPurchaseForExport.purchaseId || selectedPurchaseForExport.invoiceNo || "Report"}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        setShowExportPopup(false);
        setSelectedPurchaseForExport(null);
    };

    const exportToCSV = () => {
        if (!selectedPurchaseForExport) return;

        const items = selectedPurchaseForExport.items && selectedPurchaseForExport.items.length > 0
            ? selectedPurchaseForExport.items
            : null;

        let exportData = [];

        if (items) {
            exportData = items.map((item, index) => {
                const qty = Number(item.qty || 0);
                const rate = Number(item.rate || item.mrp || 0);
                const amount = item.amount !== undefined && item.amount !== null
                    ? Number(item.amount)
                    : qty * rate;

                return {
                    "S.No": index + 1,
                    "Purchase ID": selectedPurchaseForExport.purchaseId || "-",
                    "Invoice No": selectedPurchaseForExport.invoiceNo || "-",
                    "Supplier": selectedPurchaseForExport.companyName || selectedPurchaseForExport.supplier || "-",
                    "Invoice Date": formatPurchaseDate(selectedPurchaseForExport.invoiceDate || selectedPurchaseForExport.date),
                    "Item Code": item.itemCode || item.productId || "-",
                    "Product Name": item.productName || "-",
                    "Batch": item.batch || "-",
                    "Expiry": item.expiry || item.expiryDate || "-",
                    "Qty": qty,
                    "Free": Number(item.free || 0),
                    "MRP": Number(item.mrp || 0),
                    "Rate": rate,
                    "HSN": item.hsn || item.hsnCode || "-",
                    "GST (%)": Number(item.gst || 0),
                    "Amount": amount,
                };
            });
        } else {
            exportData = [{
                "Purchase ID": selectedPurchaseForExport.purchaseId || "-",
                "Invoice No": selectedPurchaseForExport.invoiceNo || "-",
                "Supplier": selectedPurchaseForExport.companyName || selectedPurchaseForExport.supplier || "-",
                "Invoice Date": formatPurchaseDate(selectedPurchaseForExport.invoiceDate || selectedPurchaseForExport.date),
                "Total Items": selectedPurchaseForExport.totalItems || 0,
                "Total Qty": selectedPurchaseForExport.totalQty || 0,
                "Total Amount": Number(selectedPurchaseForExport.totalAmount || 0),
                "Net Amount": Number(selectedPurchaseForExport.netAmount || selectedPurchaseForExport.grandTotal || selectedPurchaseForExport.totalAmount || 0),
            }];
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        const fileName = `Purchase_Invoice_${selectedPurchaseForExport.purchaseId || selectedPurchaseForExport.invoiceNo || "Report"}.csv`;
        link.download = fileName;
        link.click();

        setShowExportPopup(false);
        setSelectedPurchaseForExport(null);
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-wrapper">
                <Header />
                <main className="dashboard-content">
                    <div className="sales-header">
                        <div>
                            <h2>Purchase Management</h2>
                            <p className="text-gray-600 text-sm">Manage Ayurvedic product purchases</p>
                        </div>
                        <button
                            className="add-stock-btn"
                            onClick={handleAddProduct}
                        >
                            <i className="bi bi-plus-circle"></i> Add Product
                        </button>
                    </div>

                    <div className="sales-toolbar flex-wrap">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search Supplier / Invoice..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <button
                            className="add-stock-btn flex items-center gap-2"
                            title="Download Excel report for filtered purchase entries"
                            onClick={exportFilteredPurchasesToExcel}
                        >
                            <i className="bi bi-file-earmark-arrow-down"></i>
                            Export
                        </button>

                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-300 shadow-sm text-sm">
                            <span className="font-semibold text-gray-700">From:</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border-gray-200 border p-1 rounded-lg focus:outline-none"
                            />
                            <span className="font-semibold text-gray-700 ml-1">To:</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border-gray-200 border p-1 rounded-lg focus:outline-none"
                            />
                            {(fromDate || toDate) && (
                                <button
                                    type="button"
                                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition ml-1"
                                    onClick={() => {
                                        setFromDate("");
                                        setToDate("");
                                    }}
                                    title="Clear date filter"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <p className="text-gray-500 text-sm">Total Purchases : {filteredPurchase.length}</p>
                    </div>

                    <div className="sales-table-card">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Purchase No.</th>
                                    <th>Company Name</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPurchase.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-5">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <i className="bi bi-search text-3xl mb-2"></i>
                                                <h6 className="m-0">No Bill Available</h6>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                filteredPurchase.map((purchase) => (
                                    <tr key={purchase.purchaseId || purchase._id}>
                                        <td>{purchase.purchaseId || "-"}</td>
                                        <td className="font-bold">{purchase.companyName || purchase.supplier || "-"}</td>
                                        <td>{formatPurchaseDate(purchase.invoiceDate || purchase.date || purchase.createdAt)}</td>
                                        <td>₹{Number(purchase.totalAmount || purchase.totalamount || 0).toFixed(2)}</td>

                                        <td className="gap-2 flex justify-center">
                                            <button
                                                className="download-btn"
                                                title="Download Invoice (Excel / CSV)"
                                                onClick={() => {
                                                    setSelectedPurchaseForExport(purchase);
                                                    setShowExportPopup(true);
                                                }}
                                            >
                                                <i className="bi bi-download"></i>
                                            </button>

                                            <button
                                                className="view-btn"
                                                title="Preview Invoice Details"
                                                onClick={() => {
                                                    setSelectedPurchaseForPreview(purchase);
                                                    setShowPreviewModal(true);
                                                }}
                                            >
                                                <i className="bi bi-eye text-blue-500 text-base"></i>
                                            </button>

                                            <button
                                                className="edit-btn"
                                                title="Edit Invoice Details"
                                                onClick={() => {
                                                    const billId = purchase.invoiceNo || purchase.purchaseId || purchase.id || "INV";
                                                    navigate(`/dashboard/sales/edit/${billId}`, { state: purchase });
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {showExportPopup && (
                        <div
                            className="purchase-export-modal-overlay"
                            onClick={() => {
                                setShowExportPopup(false);
                                setSelectedPurchaseForExport(null);
                            }}
                        >
                            <div className="purchase-export-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="download-header">
                                    <h4>
                                        <i className="bi bi-download"></i>
                                        Export Purchase Invoice
                                    </h4>
                                    <button
                                        className="close-btn"
                                        onClick={() => {
                                            setShowExportPopup(false);
                                            setSelectedPurchaseForExport(null);
                                        }}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>

                                {selectedPurchaseForExport && (
                                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mb-2">
                                        <strong>Invoice:</strong> {selectedPurchaseForExport.purchaseId || selectedPurchaseForExport.invoiceNo || "N/A"} | {selectedPurchaseForExport.companyName || selectedPurchaseForExport.supplier || "Supplier"}
                                    </div>
                                )}

                                <p className="download-text">
                                    Choose a file format to export product details for this purchase invoice.
                                </p>

                                <div className="export-options">
                                    <button className="export-option excel" onClick={exportToExcel}>
                                        <i className="bi bi-file-earmark-excel-fill"></i>
                                        <div>
                                            <strong>Excel</strong>
                                            <small>.xlsx</small>
                                        </div>
                                    </button>

                                    <button className="export-option csv" onClick={exportToCSV}>
                                        <i className="bi bi-filetype-csv"></i>
                                        <div>
                                            <strong>CSV</strong>
                                            <small>.csv</small>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPreviewModal && selectedPurchaseForPreview && (
                        <div
                            className="purchase-export-modal-overlay"
                            onClick={() => {
                                setShowPreviewModal(false);
                                setSelectedPurchaseForPreview(null);
                            }}
                        >
                            <div className="purchase-preview-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="download-header border-b pb-3 mb-4">
                                    <h4 className="flex items-center gap-2 text-emerald-800 font-bold text-xl m-0">
                                        <i className="bi bi-eye-fill text-emerald-600"></i>
                                        Purchase Invoice Preview
                                    </h4>
                                    <button
                                        className="close-btn"
                                        onClick={() => {
                                            setShowPreviewModal(false);
                                            setSelectedPurchaseForPreview(null);
                                        }}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>

                                <div className="preview-body space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Purchase ID</span>
                                            <strong className="text-emerald-900 font-semibold">{selectedPurchaseForPreview.purchaseId || "-"}</strong>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Invoice No</span>
                                            <strong className="text-gray-800 font-semibold">{selectedPurchaseForPreview.invoiceNo || "-"}</strong>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Company / Supplier</span>
                                            <strong className="text-gray-800 font-semibold">{selectedPurchaseForPreview.companyName || selectedPurchaseForPreview.supplier || "-"}</strong>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Invoice Date</span>
                                            <strong className="text-gray-800 font-semibold">{formatPurchaseDate(selectedPurchaseForPreview.invoiceDate || selectedPurchaseForPreview.date)}</strong>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                                        <table className="w-full text-left text-xs md:text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-emerald-700 text-white font-semibold">
                                                    <th className="p-2.5 border-b">#</th>
                                                    <th className="p-2.5 border-b">Item Code</th>
                                                    <th className="p-2.5 border-b">Product Name</th>
                                                    <th className="p-2.5 border-b">Batch</th>
                                                    <th className="p-2.5 border-b text-center">Expiry</th>
                                                    <th className="p-2.5 border-b text-right">Qty</th>
                                                    <th className="p-2.5 border-b text-right">Free</th>
                                                    <th className="p-2.5 border-b text-right">MRP (₹)</th>
                                                    <th className="p-2.5 border-b text-right">Rate (₹)</th>
                                                    <th className="p-2.5 border-b text-right">GST %</th>
                                                    <th className="p-2.5 border-b text-right">Amount (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {!selectedPurchaseForPreview.items || selectedPurchaseForPreview.items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={11} className="text-center py-6 text-gray-500">
                                                            No product item details recorded for this purchase entry.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    selectedPurchaseForPreview.items.map((item, idx) => {
                                                        const qty = Number(item.qty || 0);
                                                        const rate = Number(item.rate || item.mrp || 0);
                                                        const amount = item.amount !== undefined && item.amount !== null
                                                            ? Number(item.amount)
                                                            : qty * rate;
                                                        return (
                                                            <tr key={idx} className="border-b hover:bg-gray-50 transition">
                                                                <td className="p-2.5 text-gray-500">{idx + 1}</td>
                                                                <td className="p-2.5 font-mono text-gray-600">{item.itemCode || item.productId || "-"}</td>
                                                                <td className="p-2.5 font-bold text-gray-800">{item.productName || "-"}</td>
                                                                <td className="p-2.5 text-gray-700">{item.batch || "-"}</td>
                                                                <td className="p-2.5 text-center text-gray-700">{item.expiry || item.expiryDate || "-"}</td>
                                                                <td className="p-2.5 text-right font-medium">{qty}</td>
                                                                <td className="p-2.5 text-right text-gray-500">{item.free || 0}</td>
                                                                <td className="p-2.5 text-right text-gray-600">₹{Number(item.mrp || 0).toFixed(2)}</td>
                                                                <td className="p-2.5 text-right font-medium">₹{rate.toFixed(2)}</td>
                                                                <td className="p-2.5 text-right text-gray-600">{item.gst || 0}%</td>
                                                                <td className="p-2.5 text-right font-bold text-emerald-800">
                                                                    ₹{amount.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border text-sm">
                                        <div>
                                            <span className="text-xs text-gray-500 block">Total Items</span>
                                            <span className="font-bold text-gray-800">{selectedPurchaseForPreview.totalItems || (selectedPurchaseForPreview.items?.length || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Total Qty</span>
                                            <span className="font-bold text-gray-800">{selectedPurchaseForPreview.totalQty || 0}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Total Amount</span>
                                            <span className="font-bold text-gray-800">₹{Number(selectedPurchaseForPreview.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Net Amount</span>
                                            <span className="font-bold text-emerald-700 text-base">
                                                ₹{Number(selectedPurchaseForPreview.netAmount || selectedPurchaseForPreview.grandTotal || selectedPurchaseForPreview.totalAmount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="preview-footer flex justify-end gap-3 pt-4 border-t mt-4">
                                    <button
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition flex items-center gap-2"
                                        onClick={() => window.print()}
                                    >
                                        <i className="bi bi-printer-fill"></i> Print
                                    </button>
                                    <button
                                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium text-sm transition"
                                        onClick={() => {
                                            setShowPreviewModal(false);
                                            setSelectedPurchaseForPreview(null);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}