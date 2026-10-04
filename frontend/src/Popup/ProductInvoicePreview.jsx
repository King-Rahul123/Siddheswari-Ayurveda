import { useEffect } from "react";

export default function ProductInvoicePreview({ entry, product, onClose }) {
    useEffect(() => {
        if (!entry) return undefined;

        const handleEscape = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            onClose();
        };

        window.addEventListener("keydown", handleEscape, true);
        return () => window.removeEventListener("keydown", handleEscape, true);
    }, [entry, onClose]);

    if (!entry) return null;

    const isInward = entry.type === "inward";
    const item = entry.item || {};
    const record = entry.record || {};
    const invoiceNumber = entry.billNumber || "-";
    const partyLabel = isInward ? "Supplier" : "Customer";
    const party = entry.party || "-";

    return (
        <div className="product-ledger-overlay product-invoice-overlay" onClick={onClose}>
            <section
                className="product-invoice-popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-invoice-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="product-ledger-header">
                    <div>
                        <h3 id="product-invoice-title">{isInward ? "Purchase Invoice" : "Sales Invoice"}</h3>
                        <p>{product.product} <span>({product.code})</span></p>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} title="Close invoice preview">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="product-invoice-content">
                    <div className="product-invoice-meta">
                        <div><span>Invoice No.</span><strong>{invoiceNumber}</strong></div>
                        <div><span>Date</span><strong>{entry.date || "-"}</strong></div>
                        <div><span>{partyLabel}</span><strong>{party}</strong></div>
                    </div>

                    <table className="table table-bordered mb-0">
                        <thead className="table-success">
                            <tr>
                                <th>Product</th>
                                <th>Batch</th>
                                <th>Qty</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{item.productName || item.product || product.product}</td>
                                <td>{entry.batch || item.batch || "-"}</td>
                                <td>{entry.quantity}</td>
                                <td>₹{Number(item.rate || item.mrp || 0).toFixed(2)}</td>
                                <td>₹{Number(entry.quantity * Number(item.rate || item.mrp || 0)).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="product-invoice-total">
                        <span>{isInward ? "Purchase" : "Sale"} Total</span>
                        <strong>₹{Number(record.netAmount || record.grandTotal || entry.quantity * Number(item.rate || item.mrp || 0) || 0).toFixed(2)}</strong>
                    </div>
                </div>
            </section>
        </div>
    );
}
