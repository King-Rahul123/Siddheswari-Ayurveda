import { useEffect, useRef } from "react";

export default function PBillPreview({ purchase, isVisible, isClosing, onClose }) {
    const modalRef = useRef(null);

    useEffect(() => {
        if (!purchase) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimer = window.setTimeout(() => {
            modalRef.current?.querySelector("button")?.focus();
        }, 0);

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key === "Tab" && modalRef.current) {
                const focusableElements = [...modalRef.current.querySelectorAll("button:not([disabled])")];
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.clearTimeout(focusTimer);
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose, purchase]);

    if (!purchase) return null;

    const formatPurchaseDate = (dateVal) => {
        if (!dateVal) return "-";
        try {
            const date = typeof dateVal.toDate === "function" ? dateVal.toDate() : new Date(dateVal);
            return isNaN(date.getTime()) ? String(dateVal) : date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (error) {
            return String(dateVal);
        }
    };

    return (
        <div
            className={`purchase-export-modal-overlay ${isVisible && !isClosing ? "overlay-active" : "overlay-closing"}`}
            onClick={onClose}
        >
            <div
                className={`purchase-preview-modal ${isVisible && !isClosing ? "modal-active" : "modal-closing"}`}
                ref={modalRef}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="preview-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-xs">
                            <i className="bi bi-file-earmark-text-fill"></i>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-emerald-900 font-bold text-lg m-0">
                                Purchase Invoice Preview
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <span>Invoice: <strong className="text-emerald-800 font-mono">{purchase.purchaseId || purchase.invoiceNo || "N/A"}</strong></span>
                                <span className="text-gray-300">|</span>
                                <span>Created By: <strong className="text-emerald-900 font-mono">{purchase.createdBy || "Admin"}</strong></span>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} title="Close Preview (Esc)">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="preview-body space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-2 bg-linear-to-r from-emerald-50/90 to-teal-50/50 px-4 py-2 rounded-xl border border-emerald-100 text-sm shadow-xs">
                        <div>
                            <span className="text-gray-500 text-xs block font-medium">Purchase ID</span>
                            <strong className="text-emerald-900 font-semibold font-mono text-base">{purchase.purchaseId || "-"}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block font-medium"><i className="bi bi-person-badge-fill text-emerald-700 mr-1"></i> Billed By (User ID)</span>
                            <div className="mt-1">
                                <span className="inline-flex items-center gap-1.5 px-2 bg-white text-emerald-900 border border-emerald-300 py-1 rounded-lg font-mono font-bold text-xs shadow-xs">
                                    <i className="bi bi-person-check-fill text-emerald-600"></i>
                                    {purchase.createdBy || "Admin"}
                                </span>
                            </div>
                        </div>
                        <div><span className="text-gray-500 text-xs block font-medium">Supplier Invoice No</span><strong className="text-gray-800 font-semibold font-mono">{purchase.invoiceNo || "-"}</strong></div>
                        <div><span className="text-gray-500 text-xs block font-medium">Company / Supplier</span><strong className="text-gray-800 font-semibold">{purchase.companyName || purchase.supplier || "-"}</strong></div>
                        <div><span className="text-gray-500 text-xs block font-medium">Invoice Date</span><strong className="text-gray-800 font-semibold">{formatPurchaseDate(purchase.invoiceDate || purchase.date)}</strong></div>
                    </div>

                    <div className="preview-table-container mb-2">
                        <table className="preview-table">
                            <thead><tr>
                                <th className="text-center" style={{ width: "4%" }}>#</th>
                                <th className="text-center" style={{ width: "9%" }}>Item Code</th>
                                <th className="text-left" style={{ width: "25%" }}>Product Name</th>
                                <th className="text-center" style={{ width: "9%" }}>Batch</th>
                                <th className="text-center" style={{ width: "8%" }}>Expiry</th>
                                <th className="text-center" style={{ width: "6%" }}>Qty</th>
                                <th className="text-center" style={{ width: "6%" }}>Free</th>
                                <th className="text-right" style={{ width: "9%" }}>MRP (₹)</th>
                                <th className="text-right" style={{ width: "9%" }}>Rate (₹)</th>
                                <th className="text-center" style={{ width: "6%" }}>GST %</th>
                                <th className="text-right" style={{ width: "9%" }}>Amount (₹)</th>
                            </tr></thead>
                            <tbody>
                                {!purchase.items || purchase.items.length === 0 ? (
                                    <tr><td colSpan={11} className="text-center py-10 text-gray-500"><div className="flex flex-col items-center justify-center gap-2"><i className="bi bi-inbox text-3xl text-gray-400"></i><span className="font-medium text-sm">No product item details recorded for this purchase entry.</span></div></td></tr>
                                ) : purchase.items.map((item, index) => {
                                    const qty = Number(item.qty || 0);
                                    const rate = Number(item.rate || item.mrp || 0);
                                    const amount = item.amount !== undefined && item.amount !== null ? Number(item.amount) : qty * rate;
                                    return <tr key={index}>
                                        <td className="text-center text-slate-500 font-mono font-medium">{index + 1}</td>
                                        <td className="text-center font-mono text-slate-700">{item.itemCode || item.productId || "-"}</td>
                                        <td className="text-left font-semibold text-slate-800">{item.productName || "-"}</td>
                                        <td className="text-center font-mono text-slate-700">{item.batch || "-"}</td>
                                        <td className="text-center font-mono text-slate-700">{item.expiry || item.expiryDate || "-"}</td>
                                        <td className="text-center font-semibold text-slate-800">{qty}</td>
                                        <td className="text-center text-slate-600 font-mono">{item.free || 0}</td>
                                        <td className="text-right text-slate-700 font-mono whitespace-nowrap">₹{Number(item.mrp || 0).toFixed(2)}</td>
                                        <td className="text-right text-slate-800 font-mono font-medium whitespace-nowrap">₹{rate.toFixed(2)}</td>
                                        <td className="text-center font-medium text-slate-700">{item.gst || 0}%</td>
                                        <td className="text-right font-bold text-slate-900 font-mono whitespace-nowrap">₹{amount.toFixed(2)}</td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-sm">
                        <div><span className="text-xs text-gray-500 block font-medium">Total Items</span><span className="font-bold text-gray-800 text-base">{purchase.totalItems || purchase.items?.length || 0}</span></div>
                        <div><span className="text-xs text-gray-500 block font-medium">Total Quantity</span><span className="font-bold text-gray-800 text-base">{purchase.totalQty || 0}</span></div>
                        <div><span className="text-xs text-gray-500 block font-medium">Total Amount</span><span className="font-bold text-gray-800 text-base">₹{Number(purchase.totalAmount || 0).toFixed(2)}</span></div>
                        <div><span className="text-xs text-gray-500 block font-medium">Net Amount</span><span className="font-bold text-emerald-700 text-lg">₹{Number(purchase.netAmount || purchase.grandTotal || purchase.totalAmount || 0).toFixed(2)}</span></div>
                    </div>
                </div>

                <div className="preview-footer flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-gray-200 mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <i className="bi bi-shield-check text-emerald-600 text-sm"></i>
                        <span>Created At:</span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-md font-mono font-bold text-xs shadow-xs">
                            {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer" onClick={() => window.print()}><i className="bi bi-printer-fill"></i> Print Invoice</button>
                        <button type="button" className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-sm transition cursor-pointer" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}