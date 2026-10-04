import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../api/config";

export default function SBillPreview({
    sale,
    isVisible,
    isClosing,
    onClose,
    onEdit,
    isBillReturned,
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        if (!sale) return undefined;

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
    }, [onClose, sale]);

    if (!sale) return null;

    return (
        <div
            className={`sale-preview-modal-overlay ${isVisible && !isClosing ? "overlay-active" : "overlay-closing"}`}
            onClick={onClose}
        >
            <div
                className={`sale-preview-modal ${isVisible && !isClosing ? "modal-active" : "modal-closing"}`}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
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
                                    Bill No: <strong className="text-emerald-800 font-mono font-bold text-sm">{sale.saleId || "N/A"}</strong>
                                </span>
                                <span className={`status-pill status-${(sale.status || (Number(sale.dueAmount || 0) <= 0 ? "paid" : "due")).toLowerCase()}`}>
                                    {sale.status || (Number(sale.dueAmount || 0) <= 0 ? "Paid" : "Due")}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="preview-close-btn" onClick={onClose} title="Close Preview (Esc)">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="preview-body space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-linear-to-r from-emerald-50/90 to-teal-50/50 p-4 rounded-xl border border-emerald-100 text-sm shadow-xs">
                        <div className="preview-creator-card">
                            <span className="text-gray-500 text-xs block font-medium">
                                <i className="bi bi-person-badge-fill text-emerald-700 mr-1"></i> Billed By (User ID)
                            </span>
                            <div className="mt-1">
                                <span className="creator-id-badge">
                                    <i className="bi bi-person-check-fill text-emerald-600 mr-1"></i>
                                    {sale.createdBy || "Admin"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block font-medium">Invoice Date</span>
                            <strong className="text-gray-800 font-semibold mt-1 block">
                                {sale.date || (sale.createdAt ? new Date(sale.createdAt).toISOString().split("T")[0] : "-")}
                            </strong>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block font-medium">Customer</span>
                            <strong className="text-gray-800 font-semibold mt-1 block">
                                {sale.customerName || "Walk-in Customer"}
                            </strong>
                            {sale.customerPhone && (
                                <span className="text-gray-500 text-xs block mt-0.5">
                                    <i className="bi bi-telephone text-emerald-600 mr-1"></i>
                                    {sale.customerPhone}
                                </span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block font-medium">Payment Mode</span>
                            <strong className="text-gray-800 font-semibold mt-1 block">
                                {sale.paymentMethod || "Cash"}
                            </strong>
                            <span className="text-gray-500 text-xs block mt-0.5">
                                Paid: ₹{Number(sale.paidAmount || sale.netAmount || sale.grandTotal || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

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
                                {!sale.items || sale.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-8 text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <i className="bi bi-inbox text-3xl text-gray-400"></i>
                                                <span className="font-medium text-sm">No items recorded in this bill.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sale.items.map((item, idx) => {
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
                                                <td className="text-center font-mono text-slate-700">{item.hsn || item.hsnCode || "-"}</td>
                                                <td className="text-center font-mono text-slate-700">{item.batch || "-"}</td>
                                                <td className="text-center font-mono text-slate-700">{item.expiry || "-"}</td>
                                                <td className="text-center font-bold text-slate-800">{qty}</td>
                                                <td className="text-right text-slate-700 font-mono whitespace-nowrap">₹{mrp.toFixed(2)}</td>
                                                <td className="text-right text-slate-600 font-mono">{item.discount ? `${item.discount}%` : "-"}</td>
                                                <td className="text-center font-medium text-slate-700">{item.gst || 0}%</td>
                                                <td className="text-right font-bold text-slate-900 font-mono whitespace-nowrap">₹{amount.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 block font-medium">Total Items</span>
                            <span className="font-bold text-gray-800 text-base">{sale.items?.length || 0}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block font-medium">Total Qty</span>
                            <span className="font-bold text-gray-800 text-base">{sale.totalQty || sale.items?.reduce((s, i) => s + Number(i.qty || 0), 0) || 0}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block font-medium">Subtotal</span>
                            <span className="font-bold text-gray-800 text-base">₹{Number(sale.totalAmount || sale.total || 0).toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block font-medium">Discount Total</span>
                            <span className="font-bold text-amber-700 text-base">₹{Number(sale.discountTotal || 0).toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block font-medium">GST Amount</span>
                            <span className="font-bold text-gray-800 text-base">₹{Number(sale.gstTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="net-amount-highlight">
                            <span className="text-xs text-emerald-800 block font-bold">Net Payable</span>
                            <span className="font-bold text-emerald-700 text-lg">₹{Number(sale.netAmount || sale.grandTotal || sale.totalAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="preview-modal-footer">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            <i className="bi bi-info-circle mr-1"></i>
                            Created by: <strong className="text-emerald-800">{sale.createdBy || "Admin"}</strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="preview-action-btn print"
                            onClick={() => {
                                const token = localStorage.getItem("token");
                                window.open(`${API_BASE_URL}/sales/pdf/${encodeURIComponent(sale.saleId)}?token=${encodeURIComponent(token || "")}`, "_blank");
                            }}
                        >
                            <i className="bi bi-file-earmark-pdf"></i> View / Print PDF
                        </button>
                        {!isBillReturned(sale) && (
                            <button
                                type="button"
                                className="preview-action-btn edit"
                                onClick={(e) => {
                                    onClose();
                                    onEdit(e, sale);
                                }}
                            >
                                <i className="bi bi-pencil-square"></i> Edit Bill
                            </button>
                        )}
                        <button type="button" className="preview-action-btn close" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
