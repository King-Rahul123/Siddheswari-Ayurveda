/* eslint-disable react-hooks/refs */
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import "../CSS/Dashboard.css";
import "../CSS/PurchaseEntry.css";
import "../CSS/Card.css";
import "../CSS/PopupList.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { subscribeSales } from "../services/saleService";

const createEmptyRow = () => ({
    productId: "",
    productName: "",
    batch: "",
    qty: "",
    expiry: "",
    mrp: "",
    rate: "",
    discount: "",
    gst: "",
    hsn: "",
    isDeleted: false,
});

const createRows = () =>
    Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        ...createEmptyRow(),
    }));

const getProductKey = (product) => {
    const productId = product?.productId || product?.itemCode || "";
    const productName = product?.productName || product?.name || product?.product || "";
    const batch = product?.batch || product?.batchNumber || product?.batchNo || "";
    return `${String(productId).trim().toLowerCase()}|${String(productName).trim().toLowerCase()}|${String(batch).trim().toLowerCase()}`;
};

const calculatePrice = (mrp, discount) => {
    const mrpValue = Number(mrp || 0);
    const discountValue = Number(discount || 0);

    return mrpValue - (mrpValue * discountValue) / 100;
};

export default function SalesReturn() {
    const tableRefs = useRef([]);
    const productListRefs = useRef([]);
    const [rows, setRows] = useState(createRows);
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);

    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    const [showProductList, setShowProductList] = useState(false);
    const [productList, setProductList] = useState([]);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loadingBill, setLoadingBill] = useState(false);

    const [showCancelPopup, setShowCancelPopup] = useState(false);

    const invoiceRef = useRef(null);
    const dateRef = useRef(null);

    const columns = [
        "productName",
        "batch",
        "qty",
        "expiry",
        "mrp",
        "price",
        "gst",
        "amount",
    ];

    useEffect(() => {
        const unsubscribe = subscribeSales((data) => {
            setSales(Array.isArray(data) ? data : []);
        });

        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    const setTableRef = useCallback((el, rowIndex, colIndex) => {
        if (!tableRefs.current[rowIndex]) tableRefs.current[rowIndex] = [];
        tableRefs.current[rowIndex][colIndex] = el;
    }, []);

    const focusTableCell = useCallback((rowIndex, colIndex) => {
        setTimeout(() => {
            tableRefs.current[rowIndex]?.[colIndex]?.focus();
        }, 30);
    }, []);

    const updateCell = useCallback((rowIndex, field, value) => {
        setRows((prev) => {
            const next = [...prev];

            if (!next[rowIndex]) return prev;

            next[rowIndex] = {
                ...next[rowIndex],
                [field]: value,
            };

            return next;
        });
    }, []);

    const updateRow = useCallback((rowIndex, updatedValues) => {
        setRows((prev) => {
            const next = [...prev];

            if (!next[rowIndex]) return prev;

            next[rowIndex] = {
                ...next[rowIndex],
                ...updatedValues,
            };

            return next;
        });
    }, []);

    const getFirstEmptyRow = useCallback(() => {
        const index = rows.findIndex(
            (row) => !row.isDeleted && !String(row.productName || "").trim()
        );
        return index === -1 ? rows.length : index;
    }, [rows]);

    const addProductToTable = useCallback(
        (product) => {
            const rowIndex = selectedRow ?? getFirstEmptyRow();

            if (rowIndex >= rows.length) {
                toast.error("Table is full. Delete a row before adding another product.");
                return;
            }

            const mappedProduct = {
                id: rows[rowIndex].id,
                productId: product.productId || product.itemCode || "",
                itemCode: product.itemCode || product.productId || "",
                productName: product.productName || product.name || product.product || "",
                batch: product.batch || product.batchNumber || product.batchNo || "",
                qty: Number(product.qty || 0),
                free: Number(product.free || 0),
                expiry: product.expiry || product.expiryDate || "",
                mrp: product.mrp ?? "",
                discount: product.discount ?? "",
                price: calculatePrice( product.mrp, product.discount ),
                gst: product.gst ?? product.gstRate ?? "",
                hsn: product.hsn || product.hsnCode || "",
                isDeleted: false,
            };

            setRows((prev) => {
                const next = [...prev];
                next[rowIndex] = mappedProduct;
                return next;
            });

            // IMPORTANT:
            // Once a bill product is added to the return table, remove that
            // product from the popup so it cannot be selected twice.
            const selectedKey = getProductKey(product);
            setProductList((prev) =>
                prev.filter((item) => getProductKey(item) !== selectedKey)
            );

            setSelectedRow(null);
            setSelectedProductIndex(0);
            setShowProductList(false);
            toast.success(`${mappedProduct.productName} added to table.`);

            // After selecting a product, activate the Qty field (3rd column).
            focusTableCell(rowIndex, 2);
        },
        [getFirstEmptyRow, rows, focusTableCell, selectedRow]
    );

    const loadBillDetails = useCallback(() => {
        const value = String(invoiceNo || "").trim().toLowerCase();

        if (!value) {
            toast.error("Please enter a bill number.");
            return;
        }

        setLoadingBill(true);

        const match = sales.find((sale) => {
            const ids = [
                sale.saleId,
                sale.billNumber,
                sale.invoiceNumber,
                sale.billNo,
                sale.invoiceNo,
            ]
                .filter((id) => id !== undefined && id !== null)
                .map((id) => String(id).trim().toLowerCase());

            return ids.includes(value);
        });

        if (!match) {
            setSelectedSale(null);
            setCustomerName("");
            setCustomerPhone("");
            setInvoiceDate("");
            setRows(createRows());
            setLoadingBill(false);
            toast.error("Bill not found. Please enter a valid bill number.");
            return;
        }

        const saleItems = Array.isArray(match.items) ? match.items : [];

        if (saleItems.length === 0) {
            setSelectedSale(match);
            setCustomerName(match.customerName || match.customer || "Walk-in Customer");
            setCustomerPhone(
                match.customerPhone || match.phone || match.mobile || ""
            );
            setInvoiceDate(
                match.date ||
                    match.invoiceDate ||
                    match.billDate ||
                    (match.createdAt ? String(match.createdAt).slice(0, 10) : "")
            );
            setRows(createRows());
            setLoadingBill(false);
            toast.warning("Bill found, but no products are attached to this bill.");
            return;
        }

        setSelectedSale(match);
        setCustomerName(match.customerName || match.customer || "Walk-in Customer");
        setCustomerPhone(
            match.customerPhone || match.phone || match.mobile || ""
        );
        setInvoiceDate(
            match.date ||
                match.invoiceDate ||
                match.billDate ||
                (match.createdAt ? String(match.createdAt).slice(0, 10) : "")
        );

        // IMPORTANT:
        // Keep the bill products in the list, but do not open the popup automatically.
        // After the bill loads, focus the first empty table field and wait for Enter there.
        // Only products not already present in the return table are shown.
        setProductList(
            saleItems.filter((product) => {
                const key = getProductKey(product);
                return !rows.some(
                    (row) =>
                        !row.isDeleted &&
                        String(row.productName || "").trim() &&
                        getProductKey(row) === key
                );
            })
        );
        setSelectedProductIndex(0);
        setShowProductList(false);
        setLoadingBill(false);

        setTimeout(() => {
            focusTableCell(0, 0);
        }, 100);
    }, [invoiceNo, sales, focusTableCell, rows]);

    const moveTable = (row, col, direction) => {
        if (direction === "next") {
            // Next field in the same row
            if (col < columns.length - 1) {
                focusTableCell(row, col + 1);
                return;
            }

            // After Amount → next available row Product
            for (let nextRow = row + 1; nextRow < rows.length; nextRow++) {
                if (!rows[nextRow]?.isDeleted) {
                    focusTableCell(nextRow, 0);
                    return;
                }
            }

            return;
        }

        if (direction === "previous") {
            // Previous field in same row
            if (col > 0) {
                focusTableCell(row, col - 1);
                return;
            }

            // Previous available row → Amount
            for (let previousRow = row - 1; previousRow >= 0; previousRow--) {
                if (!rows[previousRow]?.isDeleted) {
                    focusTableCell(previousRow, columns.length - 1);
                    return;
                }
            }
        }
    };

    const markRowDeleted = (rowIndex) => {
        const row = rows[rowIndex];
        if (!row?.productName) return;

        // Keep the product details before clearing the row so the product
        // can become available in the bill-product popup again.
        const deletedProduct = {
            productId: row.productId || row.itemCode || "",
            itemCode: row.itemCode || row.productId || "",
            productName: row.productName || "",
            batch: row.batch || "",
            qty: row.qty || 0,
            free: row.free || 0,
            expiry: row.expiry || "",
            mrp: row.mrp ?? "",
            price: row.price ?? "",
            discount: row.discount ?? "",
            gst: row.gst ?? "",
            hsn: row.hsn || "",
        };

        setRows((prev) => {
            const next = [...prev];
            next[rowIndex] = {
                ...next[rowIndex],
                ...createEmptyRow(),
                id: row.id,
                isDeleted: true,
            };
            return next;
        });

        // Deleted products become selectable again.
        setProductList((prev) => {
            const key = getProductKey(deletedProduct);
            if (prev.some((item) => getProductKey(item) === key)) return prev;
            return [...prev, deletedProduct];
        });

        toast.info("Product removed from return table and restored to product list.");
    };

    const handleTableKey = (e, row, col) => {
        if (e.key === "Delete") {
            e.preventDefault();
            markRowDeleted(row);
            return;
        }

        if (e.key === "Enter" && col === 0) {
            e.preventDefault();

            const enteredProduct = String(
                rows[row]?.productName || ""
            ).trim().toLowerCase();

            if (!enteredProduct) {
                setSelectedRow(row);
                setSelectedProductIndex(0);
                setShowProductList(true);

                setTimeout(() => {
                    productListRefs.current[0]?.focus();
                }, 50);

                return;
            }

            // Find manually entered product in the original bill
            const billProduct = selectedSale?.items?.find((product) => {
                const productName = String(
                    product.productName ||
                    product.name ||
                    product.product ||
                    ""
                ).trim().toLowerCase();

                return productName === enteredProduct;
            });

            if (!billProduct) {
                toast.error(
                    `"${rows[row].productName}" is not available in this bill.`
                );

                updateCell(row, "productName", "");

                setTimeout(() => {
                    focusTableCell(row, 0);
                }, 50);

                return;
            }

            // Automatically take billing quantity
            const billingQty = Number(
                billProduct.qty || 0
            );

            updateRow(row, {
                productId:
                    billProduct.productId ||
                    billProduct.itemCode ||
                    "",

                itemCode:
                    billProduct.itemCode ||
                    billProduct.productId ||
                    "",

                productName:
                    billProduct.productName ||
                    billProduct.name ||
                    billProduct.product ||
                    "",

                batch:
                    billProduct.batch ||
                    billProduct.batchNumber ||
                    billProduct.batchNo ||
                    "",

                qty: billingQty,

                expiry:
                    billProduct.expiry ||
                    billProduct.expiryDate ||
                    "",

                mrp: billProduct.mrp ?? "",

                discount:
                    billProduct.discount ?? "",

                price: calculatePrice(
                    billProduct.mrp,
                    billProduct.discount
                ),

                gst:
                    billProduct.gst ??
                    billProduct.gstRate ??
                    "",

                hsn:
                    billProduct.hsn ||
                    billProduct.hsnCode ||
                    "",
            });

            toast.success(
                `${billProduct.productName || billProduct.name} found. Billing Qty: ${billingQty}`
            );

            // Move to Qty field
            setTimeout(() => {
                focusTableCell(row, 2);
            }, 100);

            return;
        }

        if (e.key === "Enter" || e.key === "ArrowRight") {
            e.preventDefault();
            moveTable(row, col, "next");
            return;
        }

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            moveTable(row, col, "previous");
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = rows.findIndex(
                (item, index) =>
                    index > row &&
                    !item.isDeleted &&
                    String(item.productName || "").trim()
            );
            if (next !== -1) focusTableCell(next, col);
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            for (let i = row - 1; i >= 0; i--) {
                if (!rows[i]?.isDeleted && String(rows[i]?.productName || "").trim()) {
                    focusTableCell(i, col);
                    break;
                }
            }
        }
    };

    const handleProductListKey = (e) => {
        if (!productList.length) return;

        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            addProductToTable(productList[selectedProductIndex]);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.min(selectedProductIndex + 1, productList.length - 1);
            setSelectedProductIndex(next);
            productListRefs.current[next]?.focus();
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            const next = Math.max(selectedProductIndex - 1, 0);
            setSelectedProductIndex(next);
            productListRefs.current[next]?.focus();
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            setShowProductList(false);
            invoiceRef.current?.focus();
        }
    };

    const validItems = rows.filter(
        (row) =>
            !row.isDeleted &&
            String(row.productName || "").trim() !== ""
    );

    const totalQty = validItems.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0
    );

    const subTotal = validItems.reduce(
        (sum, item) =>
            sum +
            Number(item.qty || 0) *
            Number(item.price || 0),
        0
    );

    const netAmount = Math.round(subTotal);
    const roundOff = Number((netAmount - subTotal).toFixed(2));

    const handleSave = (e) => {
        e.preventDefault();

        if (!selectedSale) {
            toast.error("Please enter a valid bill number first.");
            invoiceRef.current?.focus();
            return;
        }

        if (validItems.length === 0) {
            toast.error("Please select at least one product from the bill.");
            return;
        }

        console.log("Sales return:", {
            billNumber: invoiceNo,
            billingDate: invoiceDate,
            customerName,
            customerPhone,
            items: validItems,
        });

        toast.success("Return entry saved successfully.");
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
                                <h2>Return Product Entry</h2>
                            </div>

                            <div className="text-xs md:flex gap-4 hidden">
                                <span><strong>Enter:</strong> Add; Next Field</span>
                                <span><strong>Delete:</strong> Remove Row</span>
                            </div>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                <div className="form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        ref={invoiceRef}
                                        type="text"
                                        placeholder="Enter invoice number"
                                        value={invoiceNo}
                                        autoFocus
                                        onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                loadBillDetails();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        readOnly
                                        placeholder="Auto-filled from bill"
                                        tabIndex={-1}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={customerPhone}
                                        readOnly
                                        placeholder="Auto-filled from bill"
                                        tabIndex={-1}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Billing Date</label>
                                    <input
                                        ref={dateRef}
                                        type="date"
                                        value={invoiceDate}
                                        readOnly
                                        tabIndex={-1}
                                    />
                                </div>
                            </div>

                            {loadingBill && (
                                <div className="mb-2 text-sm text-blue-600 font-semibold">
                                    Loading bill details...
                                </div>
                            )}

                            <div className="bulk-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Batch</th>
                                            <th>Qty</th>
                                            <th>Expiry (MM/YY)</th>
                                            <th>MRP</th>
                                            <th>Price</th>
                                            <th>GST %</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((row, rowIndex) => (
                                            <tr
                                                key={row.id}
                                                className={row.isDeleted ? "deleted-row" : ""}
                                            >
                                                <td>{row.id}</td>

                                                {row.isDeleted ? (
                                                    <td
                                                        colSpan={columns.length}
                                                        className="deleted-cell"
                                                    >
                                                        <div className="flex items-center justify-between px-3 py-1 text-sm font-semibold">
                                                            <span className="text-gray-800 font-bold">
                                                                {row.productName}
                                                            </span>
                                                            <span className="text-red-600 font-bold tracking-wider">
                                                                ------DELETED------
                                                            </span>
                                                        </div>
                                                    </td>
                                                ) : (
                                                    columns.map((column, colIndex) => (
                                                        <td key={column}>
                                                            <input
                                                                ref={(el) =>
                                                                    setTableRef(
                                                                        el,
                                                                        rowIndex,
                                                                        colIndex
                                                                    )
                                                                }
                                                                value={
                                                                    column === "amount"
                                                                        ? (
                                                                            Number(row.price || 0) *
                                                                            Number(row.qty || 0)
                                                                        ).toFixed(2)
                                                                        : row[column] || ""
                                                                }
                                                                readOnly={
                                                                    column !== "productName" &&
                                                                    column !== "qty"
                                                                }
                                                                onFocus={() => {
                                                                    if (column === "productName") {
                                                                        setSelectedRow(rowIndex);
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    if (column === "qty") {
                                                                        const value = e.target.value;

                                                                        if (value === "" || /^\d+$/.test(value)) {
                                                                            const billQty = Number(
                                                                                selectedSale?.items?.find((item) => {
                                                                                    const itemName = String(
                                                                                        item.productName ||
                                                                                        item.name ||
                                                                                        item.product ||
                                                                                        ""
                                                                                    ).trim().toLowerCase();

                                                                                    return (
                                                                                        itemName ===
                                                                                        String(row.productName || "").trim().toLowerCase()
                                                                                    );
                                                                                })?.qty || 0
                                                                            );

                                                                            const enteredQty = Number(value || 0);

                                                                            if (enteredQty > billQty) {
                                                                                toast.error(`Return Qty cannot exceed Bill Qty (${billQty})`);
                                                                                updateCell(rowIndex, "qty", billQty);
                                                                                return;
                                                                            }

                                                                            updateCell(rowIndex, "qty", value);
                                                                        }
                                                                    }

                                                                    if (column === "productName") {
                                                                        updateCell(
                                                                            rowIndex,
                                                                            "productName",
                                                                            e.target.value
                                                                        );
                                                                    }
                                                                }}
                                                                onKeyDown={(e) =>
                                                                    handleTableKey(
                                                                        e,
                                                                        rowIndex,
                                                                        colIndex
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    ))
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="purchase-bottom-section flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-6">
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-semibold text-gray-700 bg-white p-3 rounded-lg border shadow-sm">
                                        Total Items:
                                        <span className="text-emerald-700 font-bold ml-1">
                                            {validItems.length}
                                        </span>
                                        {" | "}
                                        Total Qty:
                                        <span className="text-emerald-700 font-bold ml-1">
                                            {totalQty}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                    <div className="invoice-summary">
                                        <h4>
                                            Grand Total :
                                            <span>₹{subTotal.toFixed(2)}</span>
                                        </h4>

                                        <h4>
                                            Round Off :
                                            <span>
                                                {roundOff > 0
                                                    ? `+${roundOff.toFixed(2)}`
                                                    : roundOff.toFixed(2)}
                                            </span>
                                        </h4>

                                        <h3>
                                            Net Amount :
                                            <span>₹{netAmount.toFixed(2)}</span>
                                        </h3>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="px-3 py-1 font-bold transition text-base border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                            onClick={() => setShowCancelPopup(true)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="save-btn bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-1 font-bold transition text-base shadow-lg"
                                        >
                                            Save Return
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* BILL PRODUCT LIST */}
                    {showProductList && (
                        <div className="popup-overlay" aria-hidden={!showProductList}>
                            <div className="customer-popup" style={{ maxWidth: "750px" }} >
                                <div className="popup-header">
                                    <h4>Select Product Stock</h4>

                                    <button
                                        type="button"
                                        className="popup-close"
                                        onClick={() => {
                                            setShowProductList(false);
                                            invoiceRef.current?.focus();
                                        }}
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="popup-body py-2">

                                    <input
                                        className="form-control mb-3"
                                        placeholder="Products in Bill..."
                                        value=""
                                        readOnly
                                        tabIndex={-1}
                                    />

                                    <div className="table-responsive customer-table-wrapper">
                                        <table className="table table-hover table-bordered">
                                            <thead className="table-success sticky-top">
                                                <tr>
                                                    <th style={{ width: 50 }}>#</th>
                                                    <th>Product Name</th>
                                                    <th style={{ width: 100 }}>Batch</th>
                                                    <th style={{ width: 80 }} className="text-center">
                                                        Qty
                                                    </th>
                                                    <th style={{ width: 90 }} className="text-end">
                                                        MRP
                                                    </th>
                                                    <th style={{ width: 90 }} className="text-end">
                                                        Price
                                                    </th>
                                                    <th style={{ width: 90 }} className="text-center">
                                                        Disc %
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {productList.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            className="text-center py-4"
                                                        >
                                                            All products from this bill have
                                                            been added to the return table.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    productList.map((product, index) => {
                                                        const productName =
                                                            product.productName ||
                                                            product.name ||
                                                            product.product ||
                                                            "";

                                                        const batch =
                                                            product.batch ||
                                                            product.batchNumber ||
                                                            product.batchNo ||
                                                            "-";

                                                        const qty = Number(product.qty || 0);
                                                        const mrp = Number(product.mrp || 0);
                                                        const discount = Number(
                                                            product.discount || 0
                                                        );

                                                        const price = calculatePrice(
                                                            mrp,
                                                            discount
                                                        );

                                                        return (
                                                            <tr
                                                                key={`${productName}-${batch}-${index}`}
                                                                ref={(el) => {
                                                                    productListRefs.current[index] =
                                                                        el;
                                                                }}
                                                                tabIndex={0}
                                                                className={
                                                                    index === selectedProductIndex
                                                                        ? "table-primary"
                                                                        : ""
                                                                }
                                                                onClick={() => {
                                                                    setSelectedProductIndex(index);
                                                                    addProductToTable(product);
                                                                }}
                                                                onKeyDown={(e) =>
                                                                    handleProductListKey(e)
                                                                }
                                                                onMouseEnter={() =>
                                                                    setSelectedProductIndex(index)
                                                                }
                                                            >
                                                                <td>
                                                                    {index + 1}
                                                                </td>

                                                                <td className="fw-semibold">
                                                                    {productName}
                                                                </td>

                                                                <td>
                                                                    {batch}
                                                                </td>

                                                                <td className="text-center">
                                                                    {qty}
                                                                </td>

                                                                <td className="text-end">
                                                                    ₹{mrp.toFixed(2)}
                                                                </td>

                                                                <td className="text-end fw-semibold">
                                                                    ₹{price.toFixed(2)}
                                                                </td>

                                                                <td className="text-center">
                                                                    {discount.toFixed(2)}%
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showCancelPopup && (
                        <div className="popup-overlay">
                            <div className="customer-popup" style={{ maxWidth: "420px" }}>
                                <div className="popup-header">
                                    <h4>Cancel Return</h4>

                                    <button
                                        type="button"
                                        className="popup-close"
                                        onClick={() => setShowCancelPopup(false)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="popup-body text-center py-4">
                                    <p className="mb-4 font-semibold text-gray-700">
                                        Are you sure you want to cancel this return entry?
                                    </p>

                                    <div className="flex justify-center gap-3">
                                        <button
                                            type="button"
                                            className="px-5 py-1 font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                            onClick={() => setShowCancelPopup(false)}
                                        >
                                            No
                                        </button>

                                        <button
                                            type="button"
                                            className="px-5 py-1x font-bold bg-red-600 text-white hover:bg-red-700"
                                            onClick={() => {
                                                setShowCancelPopup(false);
                                                window.history.back();
                                            }}
                                        >
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
