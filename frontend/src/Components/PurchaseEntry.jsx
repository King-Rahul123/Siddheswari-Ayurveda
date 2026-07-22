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
    const [rows,setRows]=useState(createRows);

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
    const [selectedRow, setSelectedRow] = useState(0);

    const [activeField, setActiveField] = useState("");
    
    const [newProduct, setNewProduct] = useState({
        companyName: "",
        productName: "",
        itemCode: "",
        hsn: "",
        gst: "",
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

        // Save current data
        const product = { ...newProduct };

        // Close popup immediately
        closeAddProduct();

        // Clear form
        setNewProduct({
            companyName: "",
            productName: "",
            itemCode: "",
            hsn: "",
            gst: "",
            unit: "",
            minStock: "",
            discount: "",
        });

        try {
            const itemCode = await getNextProductCode();

            await addProduct({
                ...product,
                itemCode,
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

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        try {
            const purchaseId = await getNextPurchaseId();
            const items = rows.filter((r) => r.productName !== "");
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
                companyCode: "",
                invoiceNo,
                invoiceDate,
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
                    mrp: item.mrp,
                    purchaseRate: item.purchaseRate,
                    saleRate: item.saleRate,
                    qty: Number(item.qty) + Number(item.freeQty || 0),
                    freeQty: item.freeQty || 0,
                    gst: item.gst,
                    hsn: item.hsn,
                });
            }

            toast.success("Purchase Saved");
            clearForm();
        } catch (err) {
            console.log(err);
            toast.error("Failed to save purchase");
        }
    }, [rows, companySearchText, invoiceNo, invoiceDate, clearForm, loggedInUser]);

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
                handleSubmit();
            }

            if (e.key === "Escape") {
                e.preventDefault();
                // Close Add Product popup first
                if (showAddProductPopup) {
                    closeAddProduct();
                    return;
                }
                // Close Add Company Popup
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
                // Close Product Search popup
                if (showProductPopup) {
                    setShowProductPopup(false);
                    requestAnimationFrame(() => {
                        lastFocusedCell.current?.focus();
                    });
                    return;
                }
                // Otherwise go back
                navigate(-1);
            }
        };

        window.addEventListener("keydown", shortcuts);

        return () => {
            window.removeEventListener("keydown", shortcuts);
        };
    }, [clearForm, 
        handleSubmit, 
        navigate, 
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
                                <span><strong>F2:</strong> New Product</span>
                                <span><strong>End:</strong> Save</span>
                                <span><strong>Esc:</strong> Exit</span>
                            </div>
                        </div>

                        <form>
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

                                                lastFocusedCell.current = e.target;
                                                setShowCompanySearch(true);
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
                                        onKeyDown={(e)=>{
                                            if(e.key==="Enter"){
                                                e.preventDefault();
                                                dateRef.current.focus();
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
                                        onKeyDown={(e)=>{
                                            if(e.key==="Enter"){
                                                e.preventDefault();
                                                // If empty, automatically set today's date
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
                                            <th>Expiry</th>
                                            <th>MRP</th>
                                            <th>GST</th>
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
                                                                    // Only numbers
                                                                    value = value.replace(/\D/g, "");
                                                                    // Maximum 4 digits (MMYY)
                                                                    value = value.slice(0, 4);
                                                                    // Validate month
                                                                    if (value.length >= 2) {
                                                                        let month = parseInt(value.substring(0, 2), 10);
                                                                        if (month > 12) {
                                                                            month = 12;
                                                                        }
                                                                        if (month < 1 && value.length === 2) {
                                                                            month = 1;
                                                                        }
                                                                        value =
                                                                            month.toString().padStart(2, "0") +
                                                                            value.substring(2);
                                                                    }
                                                                    // Add '/'
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
                        onClose={(closeAddCompany)}
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
                            updateCell(selectedRow, "gst", product.gst);
                            updateCell(selectedRow, "hsn", product.hsn);
                            setShowProductPopup(false);
                            setTimeout(() => {
                                tableRefs.current[selectedRow]?.[2]?.focus(); // Batch
                            }, 100);
                        }}
                    />
                </main>
            </div>
        </div>
    );
}