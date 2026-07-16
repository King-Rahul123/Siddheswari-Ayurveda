import { useEffect, useRef, useState } from "react";
import { subscribeCustomers } from "../services/customerService";
import "../CSS/CustomerList.css";

export default function CustomerList({ show, onClose, onSelect }) {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        if (!show) return;

        const unsubscribe = subscribeCustomers(setCustomers);

        setTimeout(() => {
            searchRef.current?.focus();
        }, 100);

        return () => unsubscribe();
    }, [show]);

    const filteredCustomers = (customers || []).filter((customer) => {
        const text = search.toLowerCase();

        return (
            (customer.name || "").toLowerCase().includes(text) ||
            (customer.customerCode || "").toLowerCase().includes(text) ||
            (customer.phone || "").includes(search)
        );
    });

    useEffect(() => {
        rowRefs.current[selectedIndex]?.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }, [selectedIndex]);

    const handleKeyDown = (e) => {
        if (!filteredCustomers.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    Math.min(prev + 1, filteredCustomers.length - 1)
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;

            case "Enter":
                e.preventDefault();
                onSelect(filteredCustomers[selectedIndex]);
                onClose();
                break;

            case "Escape":
                onClose();
                break;

            default:
                break;
        }
    };

  if (!show) return null;

    return (
        <div className="popup-overlay">
            <div className="customer-popup">
                <div className="popup-header">
                    <h4>Select Customer</h4>
                    <button className="btn-close" onClick={onClose}></button>
                </div>

                <div className="popup-body">
                    <input
                        ref={searchRef}
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search Customer..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                    />

                    <div className="table-responsive customer-table-wrapper">
                        <table className="table table-hover table-bordered mb-0">
                            <thead className="table-success sticky-top">
                                <tr>
                                    <th style={{ width: "140px" }}>Customer ID</th>
                                    <th>Name</th>
                                    <th style={{ width: "160px" }}>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted py-4">
                                        No Customer Found
                                        </td>
                                    </tr>
                                ) : (
                                filteredCustomers.map((customer, index) => (
                                    <tr
                                        ref={(el) => (rowRefs.current[index] = el)}
                                        key={customer.customerCode}
                                        className={
                                            index === selectedIndex
                                            ? "table-primary"
                                            : ""
                                        }
                                        onClick={() => {
                                            setSelectedIndex(index);
                                            onSelect(customer);
                                            onClose();
                                        }}
                                    >
                                        <td>{customer.customerCode}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.phone}</td>
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