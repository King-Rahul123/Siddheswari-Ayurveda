import { useEffect, useRef, useState } from "react";
import "../CSS/PopupList.css";

export default function CompanyList({
    show,
    companies = [],
    onClose,
    onSelect,
}) {

    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        if (!show) return;

        setTimeout(() => {
            searchRef.current?.focus();
        }, 100);

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === "function") {
                    e.stopImmediatePropagation();
                }
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape, true);
        return () => {
            window.removeEventListener("keydown", handleEscape, true);
        };
    }, [show, onClose]);

    const filteredCompanies = (companies || []).filter((company) => {
        const text = search.toLowerCase();

        return (
            (company.companyName || "").toLowerCase().includes(text) ||
            (company.companiesCode || "").toLowerCase().includes(text) ||
            (company.mobile || "").toLowerCase().includes(text) ||
            (company.email || "").toLowerCase().includes(text)
        );
    });

    useEffect(() => {
        const row = rowRefs.current[selectedIndex];

        if (row) {
            row.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedIndex, filteredCompanies]);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") {
                e.stopImmediatePropagation();
            }
            onClose();
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!filteredCompanies.length) return;
                setSelectedIndex((prev) =>
                    Math.min(prev + 1, filteredCompanies.length - 1)
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                if (!filteredCompanies.length) return;
                setSelectedIndex((prev) =>
                    Math.max(prev - 1, 0)
                );
                break;

            case "Enter":
                e.preventDefault();
                if (filteredCompanies.length) {
                    onSelect(filteredCompanies[selectedIndex]);
                    onClose();
                }
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
                    <h4>Select Company</h4>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="popup-body">
                    <input
                        ref={searchRef}
                        className="form-control mb-3"
                        placeholder="Search Company..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                    />

                    <div className="table-responsive customer-table-wrapper">
                        <table className="table table-hover table-bordered">
                            <thead className="table-success sticky-top">
                                <tr>
                                    <th style={{ width: "120px" }}>Code</th>
                                    <th>Company Name</th>
                                    <th style={{ width: "150px" }}>Mobile</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCompanies.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center py-4"
                                        >
                                            No Company Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompanies.map((company, index) => (
                                        <tr
                                            key={company.companiesCode || index}
                                            ref={(el) => (rowRefs.current[index] = el)}
                                            className={
                                                index === selectedIndex
                                                    ? "table-primary"
                                                    : ""
                                            }
                                            onClick={() => {
                                                setSelectedIndex(index);
                                                onSelect(company);
                                                onClose();
                                            }}
                                        >
                                            <td>{company.companiesCode}</td>
                                            <td>{company.companyName}</td>
                                            <td>{company.mobile}</td>
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