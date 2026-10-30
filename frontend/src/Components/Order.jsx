import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
// import "bootstrap-icons/font/bootstrap-icons.css";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import "../CSS/Dashboard.css";
import "../CSS/Order.css";
import "../CSS/PurchaseEntry.css";

import { subscribecompanies } from "../services/companyService";
import { subscribeProducts } from "../services/productService";
import { subscribeStock } from "../services/stockService";
import { subscribeSales } from "../services/saleService";

const getMrp = (product) => {
    const value = Array.isArray(product?.mrp)
        ? product.mrp[product.mrp.length - 1]
        : product?.mrp;

    return Number(value || product?.price || product?.rate || 0);
};

const getProductCode = (item) =>
    String(item?.itemCode || item?.productId || item?.code || "").trim().toLowerCase();

const getProductName = (item) =>
    String(item?.productName || item?.product || item?.name || "").trim().toLowerCase();

const normalize = (value) => String(value || "").trim().toLowerCase();

const getCompanyName = (item) =>
    normalize(item?.companyName || item?.company || item?.manufacturer || item?.supplier);

const getCompanyCode = (item) =>
    normalize(item?.companyCode || item?.companiesCode || item?.manufacturerCode);

const getSaleItems = (sale) => {
    if (Array.isArray(sale?.items)) return sale.items;
    if (Array.isArray(sale?.products)) return sale.products;
    return [];
};

export default function Order() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

    const [companies, setCompanies] = useState([]);
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [sales, setSales] = useState([]);

    const [selectedCompany, setSelectedCompany] = useState("");
    const [searchText, setSearchText] = useState("");
    const [orderQty, setOrderQty] = useState({});
    const [saving, setSaving] = useState(false);
    const [orderDate, setOrderDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const quantityInputRefs = useRef([]);
    const orderSequenceRef = useRef(0);
    const [showOrderActions, setShowOrderActions] = useState(false);

    // Load company, product, stock and sales data in real time.
    useEffect(() => {
        const unsubscribers = [
            subscribecompanies((data) => setCompanies(Array.isArray(data) ? data : [])),
            subscribeProducts((data) => setProducts(Array.isArray(data) ? data : [])),
            subscribeStock((data) => setStocks(Array.isArray(data) ? data : [])),
            subscribeSales((data) => setSales(Array.isArray(data) ? data : [])),
        ];

        return () => unsubscribers.forEach((unsubscribe) => {
            if (typeof unsubscribe === "function") unsubscribe();
        });
    }, []);

    // Match stock records to product master records using itemCode first,
    // then product name as a fallback. Multiple batches are added together.
    const stockByProduct = useMemo(() => {
        const map = new Map();

        stocks.forEach((stock) => {
            const code = getProductCode(stock);
            const name = getProductName(stock);
            const key = code || name;
            if (!key) return;

            map.set(key, (map.get(key) || 0) + Number(stock.qty ?? stock.stock ?? 0));
        });

        return map;
    }, [stocks]);

    // Calculate total sold quantity from saved sales.
    const soldByProduct = useMemo(() => {
        const map = new Map();

        sales.forEach((sale) => {
            getSaleItems(sale).forEach((item) => {
                const code = getProductCode(item);
                const name = getProductName(item);
                const key = code || name;
                if (!key) return;

                map.set(key, (map.get(key) || 0) + Number(item.qty || 0));
            });
        });

        return map;
    }, [sales]);

    // Filter the product master list by the selected company.
    const companyProducts = useMemo(() => {
        if (!selectedCompany) return [];

        const selected = companies.find(
            (company) => getCompanyName(company) === normalize(selectedCompany)
        );

        const selectedCode = getCompanyCode(selected);
        const selectedName = normalize(selectedCompany);
        const productsWithCompanyMetadata = products.some((product) =>
            getCompanyName(product) || getCompanyCode(product)
        );

        const visibleProducts = products
            .filter((product) => {
                if (!productsWithCompanyMetadata) return true;

                const productCompanyName = getCompanyName(product);
                const productCompanyCode = getCompanyCode(product);

                return productCompanyName === selectedName ||
                    (selectedCode && productCompanyCode === selectedCode);
            })
            .map((product) => {
                const code = getProductCode(product);
                const name = getProductName(product);
                const key = code || name;

                // Prefer live stock collection quantity; fall back to product.stock.
                const stockQty = stockByProduct.has(key)
                    ? stockByProduct.get(key)
                    : Number(product.stock || 0);

                const sellingQty = soldByProduct.get(key) || 0;

                // Sell-through percentage = sold quantity / (current stock + sold quantity).
                const totalAvailableForPeriod = stockQty + sellingQty;
                const sellingPercentage = totalAvailableForPeriod > 0
                    ? (sellingQty / totalAvailableForPeriod) * 100
                    : 0;

                return {
                    ...product,
                    itemCode: product.itemCode || product.code || product.docId || "",
                    productName: product.productName || product.product || product.name || "Unnamed Product",
                    mrpValue: getMrp(product),
                    stockQty,
                    sellingQty,
                    sellingPercentage,
                };
            })
            .filter((product) => {
                const search = normalize(searchText);
                return product.productName.toLowerCase().includes(search) ||
                    String(product.itemCode).toLowerCase().includes(search);
            })
            .sort((a, b) => a.productName.localeCompare(b.productName));

        return visibleProducts;
    }, [products, companies, selectedCompany, stockByProduct, soldByProduct, searchText]);

    const selectedProducts = useMemo(
        () => companyProducts.filter((product) => Number(orderQty[product.itemCode] || 0) > 0),
        [companyProducts, orderQty]
    );

    const totalOrderQty = selectedProducts.reduce(
        (sum, product) => sum + Number(orderQty[product.itemCode] || 0),
        0
    );

    const estimatedTotal = selectedProducts.reduce(
        (sum, product) =>
            sum + Number(orderQty[product.itemCode] || 0) * Number(product.rate || 0),
        0
    );

    const updateOrderQty = (itemCode, value) => {
        const cleaned = String(value).replace(/[^0-9]/g, "");
        setOrderQty((previous) => ({
            ...previous,
            [itemCode]: cleaned,
        }));
    };

    const focusQuantityInput = (index) => {
        const nextInput = quantityInputRefs.current[index];
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    };

    const handleQuantityKeyDown = (event, index) => {
        if (event.key === "ArrowDown" || event.key === "Enter") {
            event.preventDefault();
            focusQuantityInput(Math.min(index + 1, companyProducts.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            focusQuantityInput(Math.max(index - 1, 0));
        } else if (event.key === "End") {
            event.preventDefault();
            setShowOrderActions(true);
        } else if (event.key === "Escape") {
            event.preventDefault();
            updateOrderQty(companyProducts[index].itemCode, "");
            event.currentTarget.blur();
        }
    };

    useEffect(() => {
        if (!selectedCompany || companyProducts.length === 0) return;

        const timer = window.setTimeout(() => focusQuantityInput(0), 0);
        return () => window.clearTimeout(timer);
    }, [selectedCompany, companyProducts.length]);

    const handleCompanyChange = (event) => {
        setSelectedCompany(event.target.value);
        setSearchText("");
        setOrderQty({});
    };

    const buildOrder = (purchaseId, items) => ({
        purchaseId,
        companyName: selectedCompany,
        supplier: selectedCompany,
        orderDate,
        invoiceDate: orderDate,
        date: orderDate,
        totalItems: items.length,
        totalQty: totalOrderQty,
        totalAmount: estimatedTotal,
        grandTotal: estimatedTotal,
        netAmount: Math.round(estimatedTotal),
        roundOff: Number((Math.round(estimatedTotal) - estimatedTotal).toFixed(2)),
        gstTotal: 0,
        discountTotal: 0,
        orderStatus: "Pending",
        entryType: "Order",
        createdBy: loggedInUser?.username || "Admin",
        items,
    });

    const getOrderItems = () => selectedProducts.map((product) => {
        const qty = Number(orderQty[product.itemCode] || 0);

        return {
            itemCode: product.itemCode,
            productId: product.itemCode,
            productName: product.productName,
            mrp: Number(product.mrpValue || 0),
            rate: Number(product.rate || product.mrpValue || 0),
            qty,
            orderQty: qty,
            stockQty: Number(product.stockQty || 0),
            sellingQty: Number(product.sellingQty || 0),
            sellingPercentage: Number(product.sellingPercentage || 0),
            amount: qty * Number(product.rate || product.mrpValue || 0),
            hsn: product.hsnCode || product.hsn || "",
            gst: Number(product.gstRate ?? product.gst ?? 0),
        };
    });

    const createOrder = async () => {
        if (!selectedCompany) {
            toast.warning("Please select a company first.");
            return null;
        }

        if (selectedProducts.length === 0) {
            toast.warning("Enter an order quantity for at least one product.");
            return null;
        }

        const items = getOrderItems();

        orderSequenceRef.current += 1;
        const orderId = `ORD-${orderDate.replaceAll("-", "")}-${String(orderSequenceRef.current).padStart(3, "0")}`;
        return buildOrder(orderId, items);
    };

    const getExportRows = (order) => order.items.map((item, index) => ({
        "S.No": index + 1,
        "Company": order.companyName,
        "Order Date": order.orderDate,
        "Item Code": item.itemCode || "-",
        "Product Name": item.productName,
        "Qty": item.qty,
        "MRP (₹)": item.mrp,
        "Rate (₹)": item.rate,
        "Amount (₹)": item.amount,
    }));

    const downloadExcel = (order) => {
        const worksheet = XLSX.utils.json_to_sheet(getExportRows(order));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Order");
        XLSX.writeFile(workbook, `New Order.xlsx`);
    };

    const downloadCsv = (order) => {
        const rows = getExportRows(order);
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(","),
            ...rows.map((row) => headers.map((header) =>
                `"${String(row[header] ?? "").replaceAll('"', '""')}"`
            ).join(",")),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `New Order.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const printOrder = (order) => {
        const rows = getExportRows(order);
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Allow pop-ups to print the order.");
            return;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>New Order</title>
                <style>
                    body{
                        font-family:Arial,sans-serif;
                        padding:32px;
                        color:#18352a;
                    }
                    h1{
                        color:#145b39;
                        margin-bottom:4px;
                    }
                    p{
                        margin:4px 0 18px;
                    }
                    table{
                        width:100%;
                        border-collapse:collapse;
                        margin-top:20px;
                    }
                    th,td{
                        border:1px solid #ccdacf;
                        padding:8px;
                        text-align:left;
                    }
                    th{
                        background:#eaf4ed;
                        color:#145b39;
                    }
                    .total{
                        margin-top:20px;
                        font-weight:bold;
                        text-align:right;
                    }
                </style>
            </head>
            <body>
                <h1>Siddheswari Ayurveda</h1>
                <p><strong>Company:</strong> ${order.companyName}</p>
                <p><strong>Date:</strong> ${order.orderDate}</p>
                <table>
                    <thead>
                        <tr>${Object.keys(rows[0]).map((header) => `<th>${header}</th>`).join("")}</tr>
                    </thead>
                    <tbody>${rows.map((row) => `<tr>${Object.values(row).map((value) => `<td>${value}</td>`).join("")}</tr>`).join("")}</tbody>
                </table>
                <div class="total">Total Qty: ${order.totalQty} &nbsp; | &nbsp; Net Amount: ₹${order.totalAmount.toFixed(2)}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const saveAndSharePdf = async (order) => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const fileName = `Order_${order.companyName.replace(/[^a-z0-9]/gi, "_")}_${order.orderDate}.pdf`;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(19);
        doc.setTextColor(20, 91, 57);
        doc.text("Siddheswari Ayurveda", 105, 18, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);

        doc.text(`Company: ${order.companyName}`, 14, 36);
        doc.text(`Order Date: ${order.orderDate}`, 14, 43);

        // Divider
        doc.setDrawColor(20, 91, 57);
        doc.line(14, 47, 196, 47);

        // Product table
        autoTable(doc, {
            startY: 52,
            margin: { left: 15, right: 15 },
            tableWidth: 180,

            head: [[
                "Sl",
                "Code",
                "Product Name",
                "MRP",
                "Rate",
                "Qty",
                "Amount",
            ]],

            body: order.items.map((item, index) => [
                index + 1,
                item.itemCode || "-",
                item.productName,
                Number(item.mrp).toFixed(2),
                Number(item.rate).toFixed(2),
                item.qty,
                Number(item.amount).toFixed(2),
            ]),

            theme: "grid",

            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 2.5,
                overflow: "linebreak",
                valign: "middle",
                lineColor: [210, 220, 213],
                lineWidth: 0.2,
            },

            headStyles: {
                fillColor: [20, 91, 57],
                textColor: 255,
                fontSize: 9,
                fontStyle: "bold",
                halign: "center",
            },

            columnStyles: {
                0: { cellWidth: 10, halign: "center" },
                1: { cellWidth: 22, halign: "center" },
                2: { cellWidth: 60 },
                3: { cellWidth: 20, halign: "center" },
                4: { cellWidth: 20, halign: "center" },
                5: { cellWidth: 18, halign: "center" },
                6: { cellWidth: 30, halign: "center" },
            },

            didDrawPage: () => {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.height;

                doc.setFontSize(9);
                doc.setTextColor(120, 120, 120);

                doc.text(
                    `Siddheswari Ayurveda | Page ${doc.internal.getNumberOfPages()}`,
                    pageWidth / 2,
                    pageHeight - 8,
                    { align: "center" }
                );
            },
        });

        // Summary
        let finalY = doc.lastAutoTable.finalY + 10;

        if (finalY > 255) {
            doc.addPage();
            finalY = 25;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 91, 57);

        doc.text(`Total Products: ${order.items.length}`, 14, finalY);
        doc.text(`Total Order Quantity: ${order.totalQty}`, 14, finalY + 8);

        doc.text(`Net Amount: Rs. ${Number(order.totalAmount).toFixed(2)}`, 14,finalY + 16);

        // Generate PDF
        const pdfBlob = doc.output("blob");

        const pdfFile = new File(
            [pdfBlob],
            fileName,
            { type: "application/pdf" }
        );

        // Download PDF
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

        // Share PDF
        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [pdfFile] })
        ) {
            try {
                await navigator.share({
                    title: "Siddheswari Ayurveda Order",
                    text: `Order for ${order.companyName}`,
                    files: [pdfFile],
                });

                return "shared";
            } catch (error) {
                if (error.name === "AbortError") return "cancelled";
                throw error;
            }
        }

        // WhatsApp fallback
        const message = [
            `Company: ${order.companyName}`,
            `Order Date: ${order.orderDate}`,
            `Total Qty: ${order.totalQty}`,
            `Net Amount: Rs. ${order.totalAmount.toFixed(2)}`,
            "Please find the attached order PDF.",
        ].join("\n");

        window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        return "downloaded";
    };

    const handleOrderAction = async (action) => {
        setSaving(true);

        try {
            const order = await createOrder();
            if (!order) return;

            if (action === "excel") downloadExcel(order);
            if (action === "csv") downloadCsv(order);
            if (action === "print") printOrder(order);

            if (action === "save&send") {
                const result = await saveAndSharePdf(order);

                if (result === "cancelled") return;

                toast.success(
                    result === "shared"
                        ? "PDF downloaded and shared successfully!"
                        : "PDF downloaded. Attach it in WhatsApp to send."
                );
            } else {
                toast.success("Order downloaded successfully.");
            }

            setOrderQty({});
            setShowOrderActions(false);

            // Reload page after successful action
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error("Order export failed:", error);
            toast.error(error.message || "Unable to generate order PDF.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <div className="dashboard-wrapper">
                <Header />

                <main className="dashboard-content">
                    <div className="order-page">
                        <div className="order-page-header">
                            <div>
                                <h2>Place Company Order</h2>
                                <p>Select a company to view its products and prepare your order.</p>
                            </div>

                            <div className="order-keyboard-hint">
                                <span><strong>Enter / ↓</strong> Next</span>
                                <span><strong>↑</strong> Previous</span>
                                <button type="button" className="order-end-button" onClick={() => setShowOrderActions(true)}>
                                    <strong>End</strong> Save
                                </button>
                                <span><strong>Esc</strong> Clear</span>
                            </div>
                        </div>

                        <section className="order-filter-panel">
                            <div className="order-company-field">
                                {/* <label htmlFor="order-company">Select Company</label> */}
                                <select
                                    id="order-company"
                                    value={selectedCompany}
                                    onChange={handleCompanyChange}
                                >
                                    <option value="">Choose a company...</option>
                                    {companies
                                        .slice()
                                        .sort((a, b) =>
                                            String(a.companyName || "").localeCompare(String(b.companyName || ""))
                                        )
                                        .map((company) => (
                                            <option
                                                key={company.companiesCode || company.companyCode || company.companyName}
                                                value={company.companyName || ""}
                                            >
                                                {company.companyName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            
                            <div className="order-date-field">
                                {/* <label htmlFor="order-date">Order Date</label> */}
                                <input
                                    id="order-date"
                                    type="date"
                                    value={orderDate}
                                    onChange={(event) => setOrderDate(event.target.value)}
                                />
                            </div>
                        </section>

                        {!selectedCompany ? (
                            <section className="order-empty-state">
                                <div className="order-empty-icon">
                                    <i className="bi bi-building"></i>
                                </div>
                                <h3>Select a company to get started</h3>
                                <p>Products will appear here after you choose a company.</p>
                            </section>
                        ) : (
                            <>
                                <div className="order-products-heading">
                                    <div>
                                        <h3>{selectedCompany}</h3>
                                        <p>{companyProducts.length} product(s) available</p>
                                    </div>
                                    <span className="order-live-label">
                                        <span></span> Live product & stock data
                                    </span>
                                </div>

                                <div className="order-column-heading">
                                    <span>Product Name</span>
                                    <span>MRP</span>
                                    <span>Rate</span>
                                    <span>Stock Qty</span>
                                    <span>Selling Qty</span>
                                    <span>Selling %</span>
                                    <span>Order Qty</span>
                                </div>

                                <div className="order-product-list">
                                    {companyProducts.length === 0 ? (
                                        <div className="order-no-products">
                                            <i className="bi bi-box-seam"></i>
                                            <strong>No products found for this company</strong>
                                            <span>Check that the product records contain the selected company name or company code.</span>
                                        </div>
                                    ) : (
                                        companyProducts.map((product, index) => (
                                            <article className="order-product-card" key={product.itemCode || product.docId || product.productName}>
                                                <div className="order-product-name">
                                                    <strong>{product.productName}</strong>
                                                </div>

                                                <div className="order-product-value">
                                                    <small className="mobile-field-label">MRP</small>
                                                    <strong>₹{product.mrpValue.toFixed(2)}</strong>
                                                </div>

                                                <div className="order-product-value">
                                                    <small className="mobile-field-label">Rate</small>
                                                    <strong>₹{Number(product.rate || product.mrpValue || 0).toFixed(2)}</strong>
                                                </div>

                                                <div className="order-product-value">
                                                    <small className="mobile-field-label">Stock Qty</small>
                                                    <strong>{product.stockQty}</strong>
                                                </div>

                                                <div className="order-product-value">
                                                    <small className="mobile-field-label">Selling Qty</small>
                                                    <strong>{product.sellingQty}</strong>
                                                </div>

                                                <div className="order-selling-cell">
                                                    <div className="order-selling-top">
                                                        <strong>{product.sellingPercentage.toFixed(1)}%</strong>
                                                    </div>
                                                    <div className="order-selling-track">
                                                        <span style={{ width: `${Math.min(product.sellingPercentage, 100)}%` }}></span>
                                                    </div>
                                                </div>

                                                <div className="order-qty-cell">
                                                    <input
                                                        ref={(element) => {
                                                            quantityInputRefs.current[index] = element;
                                                        }}
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={orderQty[product.itemCode] || ""}
                                                        onChange={(event) => updateOrderQty(product.itemCode, event.target.value)}
                                                        onKeyDown={(event) => handleQuantityKeyDown(event, index)}
                                                        placeholder="0"
                                                        aria-label={`Order quantity for ${product.productName}`}
                                                    />
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {selectedCompany && (
                            <div className="order-summary">
                                <div className="order-summary-stats">
                                    <div>
                                        <span>Selected Products</span>
                                        <strong>{selectedProducts.length}</strong>
                                    </div>
                                    <div>
                                        <span>Total Order Qty</span>
                                        <strong>{totalOrderQty}</strong>
                                    </div>
                                    <div>
                                        <span>Estimated Order Value (MRP)</span>
                                        <strong>₹{estimatedTotal.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={saving || selectedProducts.length === 0}
                                    onClick={() => setShowOrderActions(true)}
                                >
                                    <i className="bi bi-box-arrow-up-right"></i> End / Save
                                </button>
                            </div>
                        )}

                        {showOrderActions && (
                            <div className="order-actions-overlay" onClick={() => !saving && setShowOrderActions(false)}>
                                <section
                                    className="order-actions-modal"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="order-actions-title"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="order-actions-header">
                                        <div>
                                            <span className="order-modal-eyebrow">ORDER COMPLETE</span>
                                            <h3 id="order-actions-title">Download or send order</h3>
                                            <p>{selectedCompany} · {selectedProducts.length} selected product(s)</p>
                                        </div>
                                        <button type="button" className="order-modal-close" onClick={() => setShowOrderActions(false)} aria-label="Close">
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>

                                    <div className="order-actions-grid">
                                        {/* <button type="button" onClick={() => handleOrderAction("save")} disabled={saving}>
                                            <i className="bi bi-cloud-check-fill"></i>
                                            <strong>Save Order</strong>
                                            <small>Save in the system</small>
                                        </button> */}
                                        <button type="button" onClick={() => handleOrderAction("print")} disabled={saving}>
                                            <i className="bi bi-printer-fill"></i>
                                            <strong>Print / PDF</strong>
                                            <small>Print or choose PDF</small>
                                        </button>
                                        <button type="button" onClick={() => handleOrderAction("excel")} disabled={saving}>
                                            <i className="bi bi-file-earmark-spreadsheet-fill"></i>
                                            <strong>Excel</strong>
                                            <small>Download .xlsx file</small>
                                        </button>
                                        <button type="button" onClick={() => handleOrderAction("csv")} disabled={saving}>
                                            <i className="bi bi-filetype-csv"></i>
                                            <strong>CSV</strong>
                                            <small>Download data file</small>
                                        </button>
                                        <button type="button" className="order-send-action" onClick={() => handleOrderAction("save&send")} disabled={saving}>
                                            <i className="bi bi-send-fill"></i>
                                            <strong>Save & Send Order</strong>
                                            <small>Share or send on WhatsApp</small>
                                        </button>
                                    </div>

                                    {saving && <p className="order-saving-status"><i className="bi bi-arrow-repeat"></i> Preparing order...</p>}
                                </section>
                            </div>
                        )}
                    </div>
                </main>
            </div>                
        </div>
    );
}
