import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import AddProduct from "../Popup/AddProduct";
import AddCompany from "../Popup/AddCompany";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import "../CSS/Dashboard.css";
import "../CSS/PurchaseEntry.css";
import "../CSS/Card.css";
import CompanyList from "../Popup/CompanyList";
import ProductList from "../Popup/ProductList";

import { addcompanies, getNextcompaniesCode, subscribecompanies } from "../services/companyService";
import { addProduct, getNextProductCode } from "../services/productService";
import { addPurchase, getNextPurchaseId } from "../services/purchaseService";
import { addStock, getNextStockId } from "../services/stockService";

const createEmptyRow = () => ({
    productId: "",
    productName: "",
    batch: "",
    qty: "",
    expiry: "",
    mrp: "",
    discount: "",
    gst: "",
    hsn: "",
});

const createRows = () =>
    Array.from({ length: 70 }, (_, i) => ({
        id: i + 1,
        ...createEmptyRow(),
    }));

export default function PurchaseEntry() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    const tableRefs = useRef([]);
    const [rows, setRows] = useState(createRows);

    const popupCompanyRef = useRef(null);
    const companyRef = useRef(null);
    const productNameRef = useRef(null);
    const itemCodeRef = useRef(null);
    const hsnRef = useRef(null);
    const gstRef = useRef(null);
    const unitRef = useRef(null);
    const minStockRef = useRef(null);
    const discountRef = useRef(null);
    const lastFocusedCell = useRef(null);

    const [showAddProductPopup, setShowAddProductPopup] = useState(false);
    const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
    const [showProductPopup, setShowProductPopup] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);

    const [activeField, setActiveField] = useState("");
    
    const [newProduct, setNewProduct] = useState({
        companyName: "",
        productName: "",
        itemCode: "",
        hsn: "",
        gst: "",
        mrp: "",
        unit: "",
        minStock: "",
        discount: "",
    });

    const columns = [
        "productName",
        "hsn",
        "batch",
        "qty",
        "expiry",
        "mrp",
        "gst",
        "discount",
    ];

    const updateCell = (row, field, value) => {
        setRows((prev) => {
            const temp = [...prev];
            temp[row] = {
                ...temp[row],
                [field]: value,
            };
            return temp;
        });
    };

    const moveNext = (row, col) => {
        if (col < columns.length - 1) {
            tableRefs.current[row]?.[col + 1]?.focus();
        } else if (row < rows.length - 1) {
            tableRefs.current[row + 1]?.[0]?.focus();
        }
    };

    const movePrevious = (row, col) => {
        if (col > 0) {
            tableRefs.current[row]?.[col - 1]?.focus();
        } else if (row > 0) {
            tableRefs.current[row - 1]?.[columns.length - 1]?.focus();
        }
    };

    const handleTableKey = (e, row, col) => {
        switch (e.key) {
            case "Enter":
                e.preventDefault();
                moveNext(row, col);
                break;

            case "ArrowRight":
                e.preventDefault();
                moveNext(row, col);
                break;

            case "ArrowLeft":
                e.preventDefault();
                movePrevious(row, col);
                break;

            case "ArrowDown":
                e.preventDefault();
                if (row < rows.length - 1) {
                    tableRefs.current[row + 1]?.[col]?.focus();
                }
                break;

            case "ArrowUp":
                e.preventDefault();
                if (row > 0) {
                    tableRefs.current[row - 1]?.[col]?.focus();
                }
                break;

            default:
                break;
        }
    };

    const clearForm = useCallback(() => {
        setRows(createRows());
        tableRefs.current[0]?.[0]?.focus();
    }, []);

    const handlePopupKeyDown = (event, nextRef, isLastField = false) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (isLastField) {
            saveNewProduct();
            return;
        }
        nextRef?.current?.focus();
    };

    useEffect(() => {
        if (showAddProductPopup) {
            popupCompanyRef.current?.focus();
        }
    }, [showAddProductPopup]);

    useEffect(() => {
        if (showAddCompanyPopup) {
            companyNamePopupRef.current?.focus();
        }
    }, [showAddCompanyPopup]);

    const handleNewProductChange = (e) => {
        setNewProduct({
            ...newProduct,
            [e.target.name]: e.target.value,
        });
    };

    const closeAddProduct = useCallback(() => {
        setShowAddProductPopup(false);

        requestAnimationFrame(() => {
            lastFocusedCell.current?.focus();
        });
    }, []);

    const saveNewProduct = async () => {
        if (!newProduct.productName.trim()) {
            toast.error("Product Name is required");
            return;
        }

        const product = { ...newProduct };
        closeAddProduct();

        setNewProduct({
            companyName: "",
            productName: "",
            itemCode: "",
            hsn: "",
            gst: "",
            mrp: "",
            unit: "",
            minStock: "",
            discount: "",
        });

        try {
            const itemCode = product.itemCode?.trim() || await getNextProductCode();

            await addProduct({
                productName: product.productName,
                itemCode,
                hsnCode: product.hsn || "",
                gstRate: Number(product.gst || 0),
                mrp: Number(product.mrp || 0),
                minStock: Number(product.minStock || 0),
                discount: Number(product.discount || 0)
            });

            toast.success("Product Added");
        } catch (err) {
            console.error(err);
            toast.error("Unable to save product");
        }
    };

    const invoiceRef = useRef(null);
    const dateRef = useRef(null);

    const [newCompany, setNewCompany] = useState({
        companyName: "",
        mobile: "",
        email: "",
        gst: "",
    });

    const getToday = () => {
        return new Date().toISOString().split("T")[0];
    };

    const companyNamePopupRef = useRef(null);
    const mobileRef = useRef(null);
    const emailRef = useRef(null);
    const gstNoRef = useRef(null);

    const [companies, setCompanies] = useState([]);
    const [showCompanySearch, setShowCompanySearch] = useState(false);
    const [companySearchText, setCompanySearchText] = useState("");

    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(getToday());

    const closeAddCompany = useCallback(() => {
        setShowAddCompanyPopup(false);

        requestAnimationFrame(() => {
            lastFocusedCell.current?.focus();
        });
    }, []);

    const triggerSaveFlow = useCallback(() => {
        const validItems = rows.filter((r) => r.productName && r.productName.trim() !== "");
        if (validItems.length === 0) {
            toast.error("Please add at least one product before saving.");
            return;
        }
        setShowConfirmModal(true);
    }, [rows]);

    const executeSavePurchase = useCallback(async () => {
        try {
            const purchaseId = await getNextPurchaseId();
            const items = rows
                .filter((r) => r.productName && r.productName.trim() !== "")
                .map((r) => {
                    const code = r.itemCode || r.productId || "";
                    return {
                        ...r,
                        itemCode: code,
                        productId: code,
                        productName: r.productName.trim(),
                        qty: Number(r.qty || 0),
                        expiryDate: r.expiry,
                        amount: Number(r.qty || 0) * Number(r.mrp || 0)
                    };
                });

            const totalQty = items.reduce(
                (sum, item) => sum + Number(item.qty || 0),
                0
            );
            const totalAmount = items.reduce(
                (sum, item) =>
                    sum + Number(item.qty || 0) * Number(item.mrp || 0),
                0
            );

            const purchase = {
                purchaseId,
                companyName: companySearchText,
                supplier: companySearchText,
                invoiceNo,
                invoiceDate,
                date: invoiceDate,
                totalItems: items.length,
                totalQty,
                totalAmount,
                createdBy: loggedInUser?.username || "",
            };

            await addPurchase(purchase, items);

            for (const item of items) {
                const stockId = await getNextStockId();
                await addStock({
                    stockId,
                    itemCode: item.itemCode,
                    productName: item.productName,
                    companyCode: purchase.companyCode,
                    purchaseId: purchase.purchaseId,
                    batch: item.batch,
                    expiry: item.expiry,
                    expiryDate: item.expiry,
                    mrp: item.mrp,
                    qty: Number(item.qty || 0),
                    gst: item.gst,
                    hsn: item.hsn,
                });
            }

            toast.success("Purchase Saved Successfully!");
            setShowConfirmModal(false);
            setShowPreviewModal(false);
            clearForm();
            navigate("/dashboard/purchase");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save purchase");
        }
    }, [rows, companySearchText, invoiceNo, invoiceDate, clearForm, loggedInUser, navigate]);

    useEffect(() => {
        const shortcuts = (e) => {
            if (e.key === "F2") {
                e.preventDefault();

                if (activeField === "company") {
                    lastFocusedCell.current = document.activeElement;
                    setShowAddCompanyPopup(true);
                    return;
                }

                if (activeField === "product") {
                    lastFocusedCell.current = document.activeElement;
                    setShowAddProductPopup(true);
                    return;
                }
            }

            if (e.key === "End") {
                e.preventDefault();
                triggerSaveFlow();
            }

            if (e.key === "Escape") {
                e.preventDefault();
                if (showConfirmModal) {
                    setShowConfirmModal(false);
                    return;
                }
                if (showPreviewModal) {
                    setShowPreviewModal(false);
                    return;
                }
                if (showAddProductPopup) {
                    closeAddProduct();
                    return;
                }
                if (showAddCompanyPopup) {
                    closeAddCompany();
                    return;
                }
                if (showCompanySearch) {
                    setShowCompanySearch(false);
                    requestAnimationFrame(() => {
                        companyRef.current?.focus();
                    });
                    return;
                }
                if (showProductPopup) {
                    setShowProductPopup(false);
                    requestAnimationFrame(() => {
                        lastFocusedCell.current?.focus();
                    });
                    return;
                }
                navigate(-1);
            }
        };

        window.addEventListener("keydown", shortcuts);

        return () => {
            window.removeEventListener("keydown", shortcuts);
        };
    }, [
        triggerSaveFlow,
        navigate, 
        showConfirmModal,
        showPreviewModal,
        showAddProductPopup, 
        showAddCompanyPopup, 
        activeField, 
        closeAddProduct, 
        closeAddCompany,
        showCompanySearch,
        showProductPopup
    ]);

    useEffect(() => {
        const unsubscribe = subscribecompanies(setCompanies);
        return () => unsubscribe();
    }, []);

    const handleCompanyChange = (e) => {
        setNewCompany((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const saveCompany = async () => {
        try {
            if (!newCompany.companyName.trim()) {
                toast.error("Company name is required");
                return;
            }

            const companiesCode = await getNextcompaniesCode();

            const companyData = {
                companiesCode,
                companyName: newCompany.companyName,
                mobile: newCompany.mobile,
                email: newCompany.email,
                gst: newCompany.gst,
            };

            await addcompanies(companyData);

            setNewCompany({
                companyName: "",
                mobile: "",
                email: "",
                gst: "",
            });

            closeAddCompany();

            toast.success("Company added successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save company");
        }
    };

    const handleCompanyPopupKey = (e, nextRef, last = false) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        if (last) {
            saveCompany();
        } else {
            nextRef.current?.focus();
        }
    };

    const activeRowsCount = rows.filter((r) => r.productName && r.productName.trim() !== "").length;
    const activeTotalAmount = rows.filter((r) => r.productName && r.productName.trim() !== "").reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.mrp || 0), 0);

    return (
        <div className="dashboard">
            <Sidebar />

            <div className="dashboard-wrapper">
                <Header />

                <main className="dashboard-content">
                    <div className="product-page">
                        <div className="product-header flex justify-between">
                            <div className="text-lg font-bold">
                                <h2>Product Entry</h2>
                            </div>
                            <div className="text-xs md:flex gap-4 hidden">
                                <span><strong>Enter:</strong> Next Field</span>
                                <span><strong>F2:</strong> New Entry</span>
                                <span><strong>End:</strong> Save</span>
                                <span><strong>Esc:</strong> Exit</span>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); triggerSaveFlow(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        autoFocus
                                        ref={companyRef}
                                        value={companySearchText}
                                        placeholder="Enter company name"
                                        onFocus={() => {
                                            setActiveField("company");
                                        }}
                                        onChange={(e) => {
                                            setCompanySearchText(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                if (companySearchText.trim() === "") {
                                                    setShowCompanySearch(true);
                                                    return;
                                                }
                                                const match = companies.find(
                                                    (c) =>
                                                        c.companyName.toLowerCase() ===
                                                        companySearchText.toLowerCase()
                                                );

                                                if (match) {
                                                    setCompanySearchText(match.companyName);
                                                    invoiceRef.current?.focus();
                                                } else {
                                                    setShowCompanySearch(true);
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        ref={invoiceRef}
                                        type="text"
                                        placeholder="Enter invoice number"
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                dateRef.current?.focus();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Invoice Date</label>
                                    <input
                                        ref={dateRef}
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (!invoiceDate) {
                                                    setInvoiceDate(getToday());
                                                }
                                                tableRefs.current[0]?.[0]?.focus();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bulk-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>HSN</th>
                                            <th>Batch</th>
                                            <th>Qty</th>
                                            <th>Expiry (MM/YY)</th>
                                            <th>MRP</th>
                                            <th>GST %</th>
                                            <th>Dis %</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((row, rowIndex) => (
                                            <tr key={row.id}>
                                                <td>{row.id}</td>
                                                {columns.map((column, colIndex) => (
                                                    <td key={column}>
                                                        <input
                                                            ref={(el) => {
                                                                if (!tableRefs.current[rowIndex])
                                                                    tableRefs.current[rowIndex] = [];

                                                                tableRefs.current[rowIndex][colIndex] = el;
                                                            }}

                                                            value={row[column] || ""}
                                                            
                                                            readOnly={column === "hsn" || column === "gst"}

                                                            maxLength={column === "expiry" ? 5 : undefined}

                                                            onFocus={() => {
                                                                lastFocusedCell.current = tableRefs.current[rowIndex][colIndex];

                                                                if (column === "productName") {
                                                                    setActiveField("product");
                                                                    setSelectedRow(rowIndex);
                                                                }
                                                            }}

                                                            onChange={(e) => {
                                                                let value = e.target.value;

                                                                if (column === "expiry") {
                                                                    value = value.replace(/\D/g, "");
                                                                    value = value.slice(0, 4);
                                                                    if (value.length >= 2) {
                                                                        let month = parseInt(value.substring(0, 2), 10);
                                                                        if (month > 12) month = 12;
                                                                        if (month < 1 && value.length === 2) month = 1;
                                                                        value = month.toString().padStart(2, "0") + value.substring(2);
                                                                    }
                                                                    if (value.length > 2) {
                                                                        value = value.substring(0, 2) + "/" + value.substring(2);
                                                                    }
                                                                }
                                                                updateCell(rowIndex, column, value);
                                                                if (column === "productName") {
                                                                    setSelectedRow(rowIndex);
                                                                }
                                                            }}

                                                            onKeyDown={(e) => {
                                                                if (column === "productName" && e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();

                                                                    lastFocusedCell.current = e.target;
                                                                    setSelectedRow(rowIndex);
                                                                    setShowProductPopup(true);
                                                                    return;
                                                                }

                                                                handleTableKey(e, rowIndex, colIndex);
                                                            }}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center mt-4 p-3 bg-white rounded shadow">
                                <div className="text-sm font-semibold text-gray-700">
                                    Total Items: {activeRowsCount} | Net Total: ₹{activeTotalAmount.toFixed(2)}
                                </div>
                                <button
                                    type="button"
                                    className="save-btn bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-semibold transition"
                                    onClick={triggerSaveFlow}
                                >
                                    Save Purchase (End)
                                </button>
                            </div>
                        </form>
                    </div>

                    <AddProduct
                        isOpen={showAddProductPopup}
                        onClose={closeAddProduct}
                        newProduct={newProduct}
                        onChange={handleNewProductChange}
                        onSave={saveNewProduct}
                        popupCompanyRef={popupCompanyRef}
                        productNameRef={productNameRef}
                        itemCodeRef={itemCodeRef}
                        hsnRef={hsnRef}
                        gstRef={gstRef}
                        unitRef={unitRef}
                        minStockRef={minStockRef}
                        discountRef={discountRef}
                        companies={companies}
                        onFieldKeyDown={handlePopupKeyDown}
                    />

                    <AddCompany
                        isOpen={showAddCompanyPopup}
                        onClose={closeAddCompany}
                        newCompany={newCompany}
                        onChange={handleCompanyChange}
                        onSave={saveCompany}
                        companyNameRef={companyNamePopupRef}
                        mobileRef={mobileRef}
                        emailRef={emailRef}
                        gstRef={gstNoRef}
                        onFieldKeyDown={handleCompanyPopupKey}
                    />

                    <CompanyList
                        show={showCompanySearch}
                        companies={companies}
                        searchText={companySearchText}
                        onClose={() => {
                            setShowCompanySearch(false);
                            setTimeout(() => {
                                lastFocusedCell.current?.focus();
                            }, 50);
                        }}
                        onSelect={(company) => {
                            setCompanySearchText(company.companyName);
                            setShowCompanySearch(false);

                            setTimeout(() => {
                                invoiceRef.current?.focus();
                            }, 100);
                        }}
                    />

                    <ProductList
                        show={showProductPopup}
                        onClose={() => {
                            setShowProductPopup(false);

                            setTimeout(() => {
                                lastFocusedCell.current?.focus();
                            }, 50);
                        }}
                        onSelect={(product) => {
                            updateCell(selectedRow, "productId", product.itemCode);
                            updateCell(selectedRow, "productName", product.productName);
                            updateCell(selectedRow, "gst", product.gst || product.gstRate || "");
                            updateCell(selectedRow, "hsn", product.hsn || product.hsnCode || "");
                            if (product.batch) {
                                updateCell(selectedRow, "batch", product.batch);
                            }
                            if (product.expiry) {
                                updateCell(selectedRow, "expiry", product.expiry);
                            }
                            if (product.mrp || product.price) {
                                updateCell(selectedRow, "mrp", product.mrp || product.price);
                            }
                            if (product.discount) {
                                updateCell(selectedRow, "discount", product.discount);
                            }
                            setShowProductPopup(false);
                            setTimeout(() => {
                                tableRefs.current[selectedRow]?.[2]?.focus();
                            }, 100);
                        }}
                    />

                    {/* Confirmation Modal */}
                    {showConfirmModal && (
                        <div className="popup-overlay flex items-center justify-center bg-black/50 fixed inset-0 z-50">
                            <div className="popup-box max-w-md w-full bg-white rounded-lg shadow-2xl p-6 border">
                                <div className="popup-header flex justify-between items-center border-b pb-3 mb-4">
                                    <h4 className="text-lg font-bold text-gray-800 m-0">Confirm Purchase Entry</h4>
                                    <button
                                        type="button"
                                        className="btn-close text-gray-500 hover:text-gray-800 text-xl font-bold"
                                        onClick={() => setShowConfirmModal(false)}
                                    >&times;</button>
                                </div>
                                <div className="popup-body space-y-3 mb-6">
                                    <p className="text-gray-600 text-sm">
                                        Do you want to save this purchase entry or preview the details first?
                                    </p>
                                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1 border">
                                        <div><strong>Supplier:</strong> {companySearchText || "N/A"}</div>
                                        <div><strong>Invoice No:</strong> {invoiceNo || "N/A"}</div>
                                        <div><strong>Date:</strong> {invoiceDate}</div>
                                        <div><strong>Total Items:</strong> {activeRowsCount}</div>
                                        <div><strong>Total Amount:</strong> ₹{activeTotalAmount.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="popup-footer flex justify-end gap-3 pt-3 border-t">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium text-sm"
                                        onClick={() => setShowConfirmModal(false)}
                                    >
                                        Edit Entry
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
                                        onClick={() => {
                                            setShowConfirmModal(false);
                                            setShowPreviewModal(true);
                                        }}
                                    >
                                        Preview
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-sm"
                                        onClick={executeSavePurchase}
                                    >
                                        Continue & Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Modal */}
                    {showPreviewModal && (
                        <div className="popup-overlay flex items-center justify-center bg-black/50 fixed inset-0 z-50">
                            <div className="popup-box max-w-4xl w-full bg-white rounded-lg shadow-2xl p-6 border max-h-[90vh] overflow-y-auto">
                                <div className="popup-header flex justify-between items-center border-b pb-3 mb-4">
                                    <h4 className="text-xl font-bold text-gray-800 m-0">Purchase Entry Preview</h4>
                                    <button
                                        type="button"
                                        className="btn-close text-gray-500 hover:text-gray-800 text-xl font-bold"
                                        onClick={() => setShowPreviewModal(false)}
                                    >&times;</button>
                                </div>
                                <div className="popup-body space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded text-sm border">
                                        <div><strong>Supplier:</strong> {companySearchText || "-"}</div>
                                        <div><strong>Invoice No:</strong> {invoiceNo || "-"}</div>
                                        <div><strong>Invoice Date:</strong> {invoiceDate}</div>
                                        <div><strong>Created By:</strong> {loggedInUser?.username || "Admin"}</div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="w-full text-left text-sm border-collapse border">
                                            <thead>
                                                <tr className="bg-emerald-100 text-emerald-900 border-b">
                                                    <th className="p-2 border">#</th>
                                                    <th className="p-2 border">Product Name</th>
                                                    <th className="p-2 border">HSN</th>
                                                    <th className="p-2 border">Batch</th>
                                                    <th className="p-2 border">Expiry (MM/YY)</th>
                                                    <th className="p-2 border text-right">Qty</th>
                                                    <th className="p-2 border text-right">MRP (₹)</th>
                                                    <th className="p-2 border text-right">GST %</th>
                                                    <th className="p-2 border text-right">Total (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.filter(r => r.productName && r.productName.trim() !== "").map((item, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                                        <td className="p-2 border">{idx + 1}</td>
                                                        <td className="p-2 border font-semibold">{item.productName}</td>
                                                        <td className="p-2 border">{item.hsn || "-"}</td>
                                                        <td className="p-2 border">{item.batch || "-"}</td>
                                                        <td className="p-2 border">{item.expiry || "-"}</td>
                                                        <td className="p-2 border text-right">{item.qty || 0}</td>
                                                        <td className="p-2 border text-right">₹{Number(item.mrp || 0).toFixed(2)}</td>
                                                        <td className="p-2 border text-right">{item.gst || 0}%</td>
                                                        <td className="p-2 border text-right font-bold">
                                                            ₹{(Number(item.qty || 0) * Number(item.mrp || 0)).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded text-emerald-950 font-semibold border border-emerald-200">
                                        <div>Total Items: {rows.filter(r => r.productName && r.productName.trim() !== "").length}</div>
                                        <div>Total Quantity: {rows.filter(r => r.productName && r.productName.trim() !== "").reduce((sum, i) => sum + Number(i.qty || 0), 0)}</div>
                                        <div className="text-lg text-emerald-700">
                                            Grand Total: ₹{activeTotalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="popup-footer flex justify-end gap-3 pt-4 border-t mt-4">
                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium text-sm"
                                        onClick={() => setShowPreviewModal(false)}
                                    >
                                        Edit Entry
                                    </button>
                                    <button
                                        type="button"
                                        className="px-5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-sm"
                                        onClick={executeSavePurchase}
                                    >
                                        Confirm & Save Purchase
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