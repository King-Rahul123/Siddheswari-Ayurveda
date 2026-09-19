import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";
import { subscribeSales } from "../services/saleService";
import { API_BASE_URL } from "../api/config";
import { apiFetch } from "../api/apiClient";

export default function Sales() {

    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnedBillNumbers, setReturnedBillNumbers] = useState(new Set());

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedSaleForPreview, setSelectedSaleForPreview] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isClosingPreview, setIsClosingPreview] = useState(false);

    const openBillPreview = (sale) => {
        setSelectedSaleForPreview(sale);
        setShowPreviewModal(true);
        setIsClosingPreview(false);
        setTimeout(() => {
            setIsPreviewVisible(true);
        }, 15);
    };

    const closeBillPreview = () => {
        setIsClosingPreview(true);
        setIsPreviewVisible(false);
        setTimeout(() => {
            setShowPreviewModal(false);
            setSelectedSaleForPreview(null);
            setIsClosingPreview(false);
        }, 250);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && showPreviewModal) {
                closeBillPreview();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showPreviewModal]);

    useEffect(() => {
        const unsubscribe = subscribeSales((data) => {
            setSalesData(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchReturnedBills = async () => {
            try {
                const res = await apiFetch("/sales/returns");
                if (res.ok) {
                    const data = await res.json();
                    const returns = Array.isArray(data)
                        ? data
                        : data.returns || data.salesReturns || [];
                    const billSet = new Set();
                    returns.forEach((ret) => {
                        if (ret.billNumber) billSet.add(String(ret.billNumber).trim().toLowerCase());
                        if (ret.saleId) billSet.add(String(ret.saleId).trim().toLowerCase());
                        if (ret.invoiceNumber) billSet.add(String(ret.invoiceNumber).trim().toLowerCase());
                        if (ret.returnId) billSet.add(String(ret.returnId).trim().toLowerCase());
                    });
                    setReturnedBillNumbers(billSet);
                }
            } catch (err) {
                console.error("Error fetching sales returns in Sales:", err);
            }
        };

        fetchReturnedBills();
    }, []);

    const isBillReturned = (sale) => {
        if (!sale) return false;
        const keys = [
            sale.saleId,
            sale.billNumber,
            sale.billnumber,
            sale.invoiceNumber,
            sale.id,
            sale._id
        ].filter(Boolean);

        return keys.some((k) => returnedBillNumbers.has(String(k).trim().toLowerCase()));
    };

    const handleEditClick = (e, sale) => {
        e.preventDefault();
        if (isBillReturned(sale)) {
            toast.warning("This bill cannot be edited because it is present in Expiry & Return (Original Return).");
            return;
        }
        navigate("/dashboard/sales/sale-invoice", { state: { sale } });
    };

    const handleReturnRedirect = (sale) => {
        const targetBill = sale.saleId || sale.billNumber || sale.id || "";
        navigate("/dashboard/expiry-return", {
            state: {
                tab: "sales",
                search: targetBill,
                billNumber: targetBill
            }
        });
    };

    const filteredSales = salesData.filter((sale) => {
        const query = search.toLowerCase();
        const matchesSearch =
            (sale.customerName || "").toLowerCase().includes(query) ||
            (sale.saleId || "").toLowerCase().includes(query) ||
            (sale.billNumber || "").toLowerCase().includes(query);

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
                            <input type="text" placeholder="Search customer or bill..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                    <th className="action-header">Action</th>
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
                                    filteredSales.map((sale) => {
                                        const hasReturn = isBillReturned(sale);

                                        return (
                                            <tr key={sale.saleId}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="bill-number-link"
                                                        onClick={() => openBillPreview(sale)}
                                                    >
                                                        {sale.saleId}
                                                    </button>
                                                </td>
                                                <td>{sale.date}</td>
                                                <td>{sale.customerName}</td>
                                                <td>₹{Number(sale.totalAmount || sale.total || 0).toFixed(2)}</td>
                                                <td>₹{Number(sale.netAmount || sale.grandTotal || sale.totalAmount || 0).toFixed(2)}</td>
                                                <td className="action-cell">
                                                    <div className="action-buttons-group">
                                                        {hasReturn ? (
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn edit-btn locked"
                                                                title="This bill cannot be edited because items have been returned (Bill is locked)"
                                                                disabled
                                                                tabIndex="-1"
                                                                aria-disabled="true"
                                                            >
                                                                <i className="bi bi-lock-fill"></i>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn edit-btn"
                                                                title="Open Sale Bill"
                                                                onClick={(e) => handleEditClick(e, sale)}
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                            </button>
                                                        )}

                                                        {hasReturn ? (
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn view-btn locked"
                                                                title="PDF invoice cannot be opened because this bill is locked"
                                                                disabled
                                                                tabIndex="-1"
                                                                aria-disabled="true"
                                                            >
                                                                <i className="bi bi-file-earmark-pdf"></i>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn view-btn"
                                                                title="View / Download PDF Invoice"
                                                                onClick={() => {
                                                                    const token = localStorage.getItem("token");
                                                                    window.open(`${API_BASE_URL}/sales/pdf/${encodeURIComponent(sale.saleId)}?token=${encodeURIComponent(token || "")}`, "_blank");
                                                                }}
                                                            >
                                                                <i className="bi bi-file-earmark-pdf"></i>
                                                            </button>
                                                        )}

                                                        {hasReturn && (
                                                            <button
                                                                type="button"
                                                                className="action-icon-btn return-btn"
                                                                title="View Sales Return in Expiry & Return"
                                                                onClick={() => handleReturnRedirect(sale)}
                                                            >
                                                                <i className="bi bi-arrow-return-left"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Bill Preview Modal */}
            {showPreviewModal && selectedSaleForPreview && (
                <div
                    className={`sale-preview-modal-overlay ${isPreviewVisible && !isClosingPreview ? "overlay-active" : "overlay-closing"}`}
                    onClick={closeBillPreview}
                >
                    <div
                        className={`sale-preview-modal ${isPreviewVisible && !isClosingPreview ? "modal-active" : "modal-closing"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="preview-modal-header">
                            <div className="flex items-center gap-3">
                                <div className="preview-header-icon">
                                    <i className="bi bi-receipt-cutoff"></i>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-emerald-900 font-bold text-lg m-0">
                                        Sale Invoice Preview
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 font-medium">
                                            Bill No: <strong className="text-emerald-800 font-mono font-bold text-sm">{selectedSaleForPreview.saleId || "N/A"}</strong>
                                        </span>
                                        <span className={`status-pill status-${(selectedSaleForPreview.status || (Number(selectedSaleForPreview.dueAmount || 0) <= 0 ? "paid" : "due")).toLowerCase()}`}>
                                            {selectedSaleForPreview.status || (Number(selectedSaleForPreview.dueAmount || 0) <= 0 ? "Paid" : "Due")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="preview-close-btn"
                                onClick={closeBillPreview}
                                title="Close Preview (Esc)"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {/* Top Meta Information */}
                        <div className="preview-body space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 p-4 rounded-xl border border-emerald-100 text-sm shadow-xs">
                                <div className="preview-creator-card">
                                    <span className="text-gray-500 text-xs block font-medium">
                                        <i className="bi bi-person-badge-fill text-emerald-700 mr-1"></i> Billed By (User ID)
                                    </span>
                                    <div className="mt-1">
                                        <span className="creator-id-badge">
                                            <i className="bi bi-person-check-fill text-emerald-600 mr-1"></i>
                                            {selectedSaleForPreview.createdBy || "Admin"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block font-medium">Invoice Date</span>
                                    <strong className="text-gray-800 font-semibold mt-1 block">
                                        {selectedSaleForPreview.date || (selectedSaleForPreview.createdAt ? new Date(selectedSaleForPreview.createdAt).toISOString().split("T")[0] : "-")}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block font-medium">Customer</span>
                                    <strong className="text-gray-800 font-semibold mt-1 block">
                                        {selectedSaleForPreview.customerName || "Walk-in Customer"}
                                    </strong>
                                    {selectedSaleForPreview.customerPhone && (
                                        <span className="text-gray-500 text-xs block mt-0.5">
                                            <i className="bi bi-telephone text-emerald-600 mr-1"></i>
                                            {selectedSaleForPreview.customerPhone}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block font-medium">Payment Mode</span>
                                    <strong className="text-gray-800 font-semibold mt-1 block">
                                        {selectedSaleForPreview.paymentMethod || "Cash"}
                                    </strong>
                                    <span className="text-gray-500 text-xs block mt-0.5">
                                        Paid: ₹{Number(selectedSaleForPreview.paidAmount || selectedSaleForPreview.netAmount || selectedSaleForPreview.grandTotal || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="preview-table-container">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th className="text-center" style={{ width: "4%" }}>#</th>
                                            <th className="text-left" style={{ width: "26%" }}>Product Name</th>
                                            <th className="text-center" style={{ width: "10%" }}>HSN</th>
                                            <th className="text-center" style={{ width: "10%" }}>Batch</th>
                                            <th className="text-center" style={{ width: "9%" }}>Expiry</th>
                                            <th className="text-center" style={{ width: "7%" }}>Qty</th>
                                            <th className="text-right" style={{ width: "10%" }}>MRP (₹)</th>
                                            <th className="text-right" style={{ width: "8%" }}>Disc %</th>
                                            <th className="text-center" style={{ width: "7%" }}>GST %</th>
                                            <th className="text-right" style={{ width: "11%" }}>Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedSaleForPreview.items || selectedSaleForPreview.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-8 text-gray-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <i className="bi bi-inbox text-3xl text-gray-400"></i>
                                                        <span className="font-medium text-sm">No items recorded in this bill.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedSaleForPreview.items.map((item, idx) => {
                                                const qty = Number(item.qty || 0);
                                                const mrp = Number(item.mrp || item.rate || 0);
                                                const amount = item.amount !== undefined && item.amount !== null
                                                    ? Number(item.amount)
                                                    : qty * mrp;

                                                return (
                                                    <tr key={idx}>
                                                        <td className="text-center text-slate-500 font-mono font-medium">{idx + 1}</td>
                                                        <td className="text-left font-semibold text-slate-800">
                                                            {item.productName || item.product || "-"}
                                                            {item.itemCode && (
                                                                <span className="block text-xs font-mono text-gray-400 font-normal">
                                                                    Code: {item.itemCode}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="text-center font-mono text-slate-700">
                                                            {item.hsn || item.hsnCode || "-"}
                                                        </td>
                                                        <td className="text-center font-mono text-slate-700">
                                                            {item.batch || "-"}
                                                        </td>
                                                        <td className="text-center font-mono text-slate-700">
                                                            {item.expiry || "-"}
                                                        </td>
                                                        <td className="text-center font-bold text-slate-800">
                                                            {qty}
                                                        </td>
                                                        <td className="text-right text-slate-700 font-mono whitespace-nowrap">
                                                            ₹{mrp.toFixed(2)}
                                                        </td>
                                                        <td className="text-right text-slate-600 font-mono">
                                                            {item.discount ? `${item.discount}%` : "-"}
                                                        </td>
                                                        <td className="text-center font-medium text-slate-700">
                                                            {item.gst || 0}%
                                                        </td>
                                                        <td className="text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                                                            ₹{amount.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Breakdown Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                                <div>
                                    <span className="text-xs text-gray-500 block font-medium">Total Items</span>
                                    <span className="font-bold text-gray-800 text-base">
                                        {selectedSaleForPreview.items?.length || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block font-medium">Total Qty</span>
                                    <span className="font-bold text-gray-800 text-base">
                                        {selectedSaleForPreview.totalQty || selectedSaleForPreview.items?.reduce((s, i) => s + Number(i.qty || 0), 0) || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-800 text-base">
                                        ₹{Number(selectedSaleForPreview.totalAmount || selectedSaleForPreview.total || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block font-medium">Discount Total</span>
                                    <span className="font-bold text-amber-700 text-base">
                                        ₹{Number(selectedSaleForPreview.discountTotal || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block font-medium">GST Amount</span>
                                    <span className="font-bold text-gray-800 text-base">
                                        ₹{Number(selectedSaleForPreview.gstTotal || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="net-amount-highlight">
                                    <span className="text-xs text-emerald-800 block font-bold">Net Payable</span>
                                    <span className="font-bold text-emerald-700 text-lg">
                                        ₹{Number(selectedSaleForPreview.netAmount || selectedSaleForPreview.grandTotal || selectedSaleForPreview.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="preview-modal-footer">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    <i className="bi bi-info-circle mr-1"></i>
                                    Created by: <strong className="text-emerald-800">{selectedSaleForPreview.createdBy || "Admin"}</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="preview-action-btn print"
                                    onClick={() => {
                                        const token = localStorage.getItem("token");
                                        window.open(`${API_BASE_URL}/sales/pdf/${encodeURIComponent(selectedSaleForPreview.saleId)}?token=${encodeURIComponent(token || "")}`, "_blank");
                                    }}
                                >
                                    <i className="bi bi-file-earmark-pdf"></i> View / Print PDF
                                </button>
                                {!isBillReturned(selectedSaleForPreview) && (
                                    <button
                                        type="button"
                                        className="preview-action-btn edit"
                                        onClick={(e) => {
                                            closeBillPreview();
                                            handleEditClick(e, selectedSaleForPreview);
                                        }}
                                    >
                                        <i className="bi bi-pencil-square"></i> Edit Bill
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="preview-action-btn close"
                                    onClick={closeBillPreview}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}