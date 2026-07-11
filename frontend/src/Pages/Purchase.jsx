import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Sale.css";
import "../CSS/Purchase.css";
import * as XLSX from "xlsx";


export default function Purchase() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [showExportPopup, setShowExportPopup] = useState(false);

    const purchaseData = [
        {
            billnumber: "PUR001",
            supplier: "Dabur India Ltd.",
            totalamount: 12450,
            netamount: 12100,
            date: "2026-07-10",
        },
        {
            billnumber: "PUR002",
            supplier: "Baidyanath",
            totalamount: 8450,
            netamount: 8300,
            date: "2026-07-09",
        },
        {
            billnumber: "PUR003",
            supplier: "Patanjali Ayurveda",
            totalamount: 16980,
            netamount: 16500,
            date: "2026-07-08",
        },
    ];

    const filteredPurchase = purchaseData.filter((purchase) => {

        const matchesSearch = purchase.supplier
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesDate =
            selectedDate === "" ||
            purchase.date === selectedDate;

        return matchesSearch && matchesDate;

    });

    const exportToExcel = () => {
        const exportData = filteredPurchase.map((purchase) => ({
            "Purchase No": purchase.billnumber,
            "Supplier": purchase.supplier,
            "Date": purchase.date,
            "Total Amount": purchase.totalamount,
            "Net Amount": purchase.netamount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Purchases"
        );

        XLSX.writeFile(workbook, "Purchase_Report.xlsx");

        setShowExportPopup(false);
    };

    const exportToCSV = () => {
        const exportData = filteredPurchase.map((purchase) => ({
            "Purchase No": purchase.billnumber,
            "Supplier": purchase.supplier,
            "Date": purchase.date,
            "Total Amount": purchase.totalamount,
            "Net Amount": purchase.netamount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = "Purchase_Report.csv";

        link.click();

        setShowExportPopup(false);
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
                            className="add-sale-btn"
                            onClick={() =>
                                navigate("/dashboard/purchase/new")
                            }
                        >
                            <i className="bi bi-plus-circle"></i>
                            New Purchase
                        </button>
                    </div>

                    <div className="sales-toolbar">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search Supplier..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                            className="border-gray-300 border-2 p-2 h-9 rounded-xl"
                        />
                        <p className="text-gray-500 text-sm">Total Purchases : {filteredPurchase.length}</p>
                    </div>

                    <div className="sales-table-card">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Purchase No.</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Net Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPurchase.map((purchase) => (
                                    <tr key={purchase.billnumber}>
                                        <td>{purchase.billnumber}</td>
                                        <td>
                                            {new Date(
                                                purchase.date
                                            ).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )}
                                        </td>
                                        <td>₹{purchase.totalamount}</td>
                                        <td>₹{purchase.netamount}</td>

                                        <td className="gap-2 flex justify-center">
                                            <button className="download-btn" onClick={() => setShowExportPopup(true)}>
                                                <i className="bi bi-download"></i>
                                            </button>

                                            <button className="view-btn">
                                                <i className="bi bi-printer text-blue-500 text-base"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {showExportPopup && (
                        <div className="export-modal-overlay" onClick={() => setShowExportPopup(false)}>
                            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="download-header">
                                    <h4>
                                        <i className="bi bi-download"></i>
                                        Export Purchase Report
                                    </h4>
                                    <button className="close-btn" onClick={() => setShowExportPopup(false)}>
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>

                                <p className="download-text">
                                    Choose a file format to export your purchase records.
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
                </main>
            </div>
        </div>
    );
}