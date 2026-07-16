import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import AddProduct from "../Popup/AddProduct";
import AddCompany from "../Popup/AddCompany";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import "../CSS/Dashboard.css";
import "../CSS/PurchaseEntry.css";
import "../CSS/Card.css";

import { addcompanies, getNextcompaniesCode, subscribecompanies } from "../services/companyService";
import { addProduct, getNextProductCode, subscribeProducts } from "../services/productService";
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

    const [showSearch,setShowSearch]=useState(false);
    const [searchText,setSearchText]=useState("");
    const [currentRow,setCurrentRow]=useState(0);
    const [selectedIndex,setSelectedIndex]=useState(0);

    const [products, setProducts] = useState([]);
    
    const [showAddProductPopup, setShowAddProductPopup] = useState(false);
    const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);

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

    useEffect(() => {
        const unsubscribe = subscribeProducts(setProducts);
        return () => unsubscribe();
    }, []);

    const filteredProducts = useMemo(() => {
        if (searchText === "") {
            return products;
        }

        return products.filter((p) =>
            p.productName.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [products, searchText]);

    const columns = [
        "productName",
        "batch",
        "qty",
        "expiry",
        "mrp",
        "discount",
        "gst",
        "hsn",
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
                if (col === 0) {
                    if (showSearch && filteredProducts.length > 0) {
                        chooseProduct(filteredProducts[selectedIndex]);
                    } else {
                        moveNext(row, col);
                    }
                    return;
                }
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
                if (row < rows.length - 1)
                    tableRefs.current[row + 1]?.[col]?.focus();
                break;

            case "ArrowUp":
                e.preventDefault();
                if (row > 0)
                    tableRefs.current[row - 1]?.[col]?.focus();
                break;

            default:
                break;
        }

    };

    const chooseProduct = useCallback((product) => {
        updateCell(currentRow, "productName", product.productName);
        updateCell(currentRow, "gst", product.gst);
        updateCell(currentRow, "hsn", product.hsn);
        setShowSearch(false);
        tableRefs.current[currentRow]?.[1]?.focus();
    }, [currentRow]);

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

    const saveNewProduct = async () => {
        try {
            if (!newProduct.productName.trim()) {
                toast.error("Product Name is required");
                return;
            }
            const itemCode = await getNextProductCode();
            const productData = {
                ...newProduct,
                itemCode,
            };
            await addProduct(productData);
            toast.success("Product Added");
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
            setShowAddProductPopup(false);
        } catch (err) {
            console.log(err);
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

    const companyNamePopupRef = useRef(null);
    const mobileRef = useRef(null);
    const emailRef = useRef(null);
    const gstNoRef = useRef(null);

    const [companies, setCompanies] = useState([]);
    const [showCompanySearch, setShowCompanySearch] = useState(false);
    const [companySearchText, setCompanySearchText] = useState("");
    const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);

    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");

    const filteredCompanies = useMemo(() => {
        if (!companySearchText.trim()) return companies;

        return companies.filter((c) =>
            c.companyName
                .toLowerCase()
                .includes(companySearchText.toLowerCase())
        );
    }, [companies, companySearchText]);

    const chooseCompany = (company) => {
        setCompanySearchText(company.companyName);
        invoiceRef.current?.focus();
        setShowCompanySearch(false);
    };

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
                    setShowAddCompanyPopup(true);
                    return;
                }

                if (activeField === "product") {
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
                    setShowAddProductPopup(false);
                    return;
                }
                // Close Add Company Popup
                if (showAddCompanyPopup) {
                    setShowAddCompanyPopup(false);
                    return;
                }
                // Close Product Search popup
                if (showSearch) {
                    setShowSearch(false);
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
    }, [clearForm, handleSubmit, navigate, showAddProductPopup, showAddCompanyPopup, showSearch, activeField]);

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

            setShowAddCompanyPopup(false);
            companyRef.current?.focus();

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
                            <div className="text-xs flex gap-4">
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
                                        onFocus={() => setActiveField("company")}
                                        onChange={(e) => {
                                            setCompanySearchText(e.target.value);
                                            setShowCompanySearch(true);
                                            // setCompanyTarget("main");
                                            setSelectedCompanyIndex(0);
                                        }}
                                        onKeyDown={(e) => {
                                            if(showCompanySearch){
                                                if(e.key==="ArrowDown"){
                                                    e.preventDefault();
                                                    setSelectedCompanyIndex((prev)=>
                                                        Math.min(prev+1, filteredCompanies.length-1)
                                                    );
                                                    return;
                                                }
                                                if(e.key==="ArrowUp"){
                                                    e.preventDefault();
                                                    setSelectedCompanyIndex((prev)=>
                                                        Math.max(prev-1,0)
                                                    );
                                                    return;
                                                }
                                                if(e.key==="Enter"){
                                                    e.preventDefault();
                                                    chooseCompany(filteredCompanies[selectedCompanyIndex]);
                                                    return;
                                                }
                                            }
                                            if(e.key==="Enter"){
                                                e.preventDefault();
                                                invoiceRef.current?.focus();
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
                                            <th>Batch</th>
                                            <th>Qty</th>
                                            <th>Expiry</th>
                                            <th>MRP</th>
                                            <th>Dis %</th>
                                            <th>GST</th>
                                            <th>HSN</th>
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

                                                            onFocus={() => {
                                                                if (column === "productName") {
                                                                    setActiveField("product");
                                                                    setCurrentRow(rowIndex);
                                                                }
                                                            }}

                                                            onChange={(e) => {
                                                                updateCell(rowIndex, column, e.target.value);

                                                                if (column === "productName") {
                                                                    setCurrentRow(rowIndex);
                                                                    setSearchText(e.target.value);
                                                                    setShowSearch(true);
                                                                    setSelectedIndex(0);
                                                                }
                                                            }}

                                                            onKeyDown={(e) => {
                                                                if (column === "productName" && showSearch) {
                                                                    if (e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                        setSelectedIndex((prev) =>
                                                                            Math.min(prev + 1, filteredProducts.length - 1)
                                                                        );
                                                                        return;
                                                                    }

                                                                    if (e.key === "ArrowUp") {
                                                                        e.preventDefault();
                                                                        setSelectedIndex((prev) =>
                                                                            Math.max(prev - 1, 0)
                                                                        );
                                                                        return;
                                                                    }
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

                    {showSearch && (
                        <div className="product-search-popup">
                            <table>
                                <tbody>
                                    {filteredProducts.map((item, index) => (
                                        <tr
                                            key={item.productId}
                                            className={selectedIndex === index ? "active" : ""}
                                            onClick={() => chooseProduct(item)}
                                        >
                                            <td>{item.productName}</td>
                                            <td>{item.company}</td>
                                            <td>{item.batch}</td>
                                            <td>{item.mrp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AddProduct
                        isOpen={showAddProductPopup}
                        onClose={() => setShowAddProductPopup(false)}
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
                        onClose={() => setShowAddCompanyPopup(false)}
                        newCompany={newCompany}
                        onChange={handleCompanyChange}
                        onSave={saveCompany}
                        companyNameRef={companyNamePopupRef}
                        mobileRef={mobileRef}
                        emailRef={emailRef}
                        gstRef={gstNoRef}
                        onFieldKeyDown={handleCompanyPopupKey}
                    />
                </main>
            </div>
        </div>
    );
}