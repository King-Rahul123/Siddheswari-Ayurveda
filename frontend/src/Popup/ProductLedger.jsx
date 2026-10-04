import { useEffect, useRef, useState } from "react";

export default function ProductLedger({ product, entries, onClose, onOpenInvoice, isInvoiceOpen }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const popupRef = useRef(null);

    useEffect(() => {
        if (!product || isInvoiceOpen) return undefined;

        const focusTimer = window.setTimeout(() => popupRef.current?.focus(), 0);
        return () => window.clearTimeout(focusTimer);
    }, [isInvoiceOpen, product]);

    useEffect(() => {
        if (!product || isInvoiceOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            onClose();
        };

        window.addEventListener("keydown", handleEscape, true);
        return () => window.removeEventListener("keydown", handleEscape, true);
    }, [isInvoiceOpen, onClose, product]);

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
        }

        if (!entries.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((index) => Math.min(index + 1, entries.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            onOpenInvoice(entries[selectedIndex]);
        }
    };

    if (!product) return null;

    const inwardQuantity = entries
        .filter((entry) => entry.type === "inward")
        .reduce((sum, entry) => sum + entry.quantity, 0);
    const outwardQuantity = entries
        .filter((entry) => entry.type === "outward")
        .reduce((sum, entry) => sum + entry.quantity, 0);
    const balanceQuantity = inwardQuantity - outwardQuantity;

    return (
        <div className="product-ledger-overlay" onClick={onClose}>
            <section
                className="product-ledger-popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-ledger-title"
                ref={popupRef}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="product-ledger-header">
                    <div>
                        <h3 id="product-ledger-title">Product Ledger</h3>
                        <p>{product.product} <span>({product.code})</span></p>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} title="Close product ledger">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="product-ledger-summary">
                    <span><strong>Inward:</strong> {inwardQuantity}</span>
                    <span><strong>Outward:</strong> {outwardQuantity}</span>
                    <span><strong>Entries:</strong> {entries.length}</span>
                    <span><strong>Balance:</strong> {balanceQuantity}</span>
                </div>

                <div className="product-ledger-content">
                    {entries.length === 0 ? (
                        <div className="product-ledger-empty">
                            <i className="bi bi-journal-x"></i>
                            <p>No inward or outward transactions found.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered mb-0">
                                <thead className="table-success sticky-top">
                                    <tr className="text-center">
                                        <th>Date</th>
                                        <th>Invoice No.</th>
                                        <th>Party / Company</th>
                                        <th>Batch</th>
                                        <th>Inward</th>
                                        <th>Outward</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, index) => (
                                        <tr
                                            key={entry.id}
                                            className={index === selectedIndex ? "table-primary" : ""}
                                            onClick={() => setSelectedIndex(index)}
                                        >
                                            <td>{entry.date || "-"}</td>
                                            <td>{entry.billNumber || "-"}</td>
                                            <td>{entry.party || "-"}</td>
                                            <td>{entry.batch || "-"}</td>
                                            <td className="font-semibold text-emerald-700 text-center">
                                                {entry.type === "inward" ? entry.quantity : "-"}
                                            </td>
                                            <td className="font-semibold text-orange-700 text-center">
                                                {entry.type === "outward" ? entry.quantity : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
