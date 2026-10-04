import { useEffect, useRef, useState } from "react";
import "../CSS/PopupList.css";

export default function CustomerLedger({ customer, bills, loading, onClose, onSelectBill, isPreviewOpen }) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef(null);
    const rowRefs = useRef([]);

    const filteredBills = (bills || []).filter((bill) => {
        const query = search.toLowerCase();
        return [bill.saleId, bill.billNumber, bill.date, bill.customerName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
    });

    useEffect(() => {
        if (!customer || isPreviewOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 100);

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape, true);
        return () => {
            window.clearTimeout(focusTimer);
            window.removeEventListener("keydown", handleEscape, true);
            document.body.style.overflow = previousOverflow;
        };
    }, [customer, isPreviewOpen, onClose]);

    useEffect(() => {
        rowRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [selectedIndex]);

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
            return;
        }

        if (!filteredBills.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((previous) => Math.min(previous + 1, filteredBills.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((previous) => Math.max(previous - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            onSelectBill(filteredBills[selectedIndex]);
        }
    };

    const downloadBills = () => {
        const escapeCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const rows = [
            ["Bill Number", "Date", "Customer", "Amount", "Status"],
            ...filteredBills.map((bill) => [
                bill.saleId || bill.billNumber || "",
                bill.date || "",
                bill.customerName || customer.name || customer.customerName || "",
                Number(bill.netAmount || bill.grandTotal || bill.totalAmount || bill.total || 0).toFixed(2),
                bill.status || bill.paymentStatus || "-",
            ]),
        ];
        const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        link.download = `${customer.customerCode || "customer"}-ledger.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    if (!customer) return null;

    const totalAmount = filteredBills.reduce(
        (sum, bill) => sum + Number(bill.netAmount || bill.grandTotal || bill.totalAmount || bill.total || 0),
        0
    );

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="customer-popup" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="popup-header">
                    <div>
                        <h4>Ledger of {customer.name || customer.customerName || "Customer"}</h4>
                        <small>Customer ID: {customer.customerCode}, Phone: {customer.phone}, Add: {customer.address}</small>
                    </div>
                    <button type="button" className="popup-close" onClick={onClose} aria-label="Close">
                      &times;
                    </button>
                </div>

                <div className="popup-body py-2">
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                        <input
                            ref={searchRef}
                            type="text"
                            className="form-control"
                            placeholder="🔍Search Bill Number or Date..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <button type="button" className="btn btn-outline-primary text-nowrap" onClick={downloadBills}>
                            <i className="bi bi-download"></i> Download
                        </button>
                    </div>

                    <div className="d-flex justify-between gap-3 mb-2 text-xs">
                        <span><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</span>
                        <span><strong>Total Bills:</strong> {filteredBills.length}</span>
                    </div>

                    <div className="table-responsive customer-table-wrapper">
                        <table className="table table-hover table-bordered mb-0">
                            <thead className="table-success sticky-top">
                                <tr>
                                    <th>Bill Number</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="text-center text-muted py-4">Loading Bills...</td></tr>
                                ) : filteredBills.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center text-muted py-4">No Bills Found</td></tr>
                                ) : (
                                    filteredBills.map((bill, index) => (
                                        <tr
                                            ref={(element) => { rowRefs.current[index] = element; }}
                                            key={bill.saleId || bill.billNumber || bill._id || bill.id}
                                            className={index === selectedIndex ? "table-primary" : ""}
                                            onClick={() => {
                                                setSelectedIndex(index);
                                                onSelectBill(bill);
                                            }}
                                        >
                                            <td>{bill.saleId || bill.billNumber || "-"}</td>
                                            <td>{bill.date || "-"}</td>
                                            <td>₹{Number(bill.netAmount || bill.grandTotal || bill.totalAmount || bill.total || 0).toFixed(2)}</td>
                                            <td>{bill.status || bill.paymentStatus || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
