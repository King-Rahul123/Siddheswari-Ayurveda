import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeProducts } from "../services/productService";
import { subscribeStock } from "../services/stockService";
import "../CSS/PopupList.css";
import EditProduct from "./EditProduct";

export default function ProductList({ show, onClose, onSelect }) {

    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const searchRef = useRef(null);
    const rowRefs = useRef([]);

    const handleClose = useCallback(() => {
        if (editOpen) {
            setEditOpen(false);
            setEditProduct(null);
            return;
        }

        onClose();
    }, [editOpen, onClose]);

    useEffect(() => {
        if (!show) return;

        const unsubscribeProd = subscribeProducts(setProducts);
        const unsubscribeStock = subscribeStock(setStocks);

        const focusTimeout = editOpen
            ? null
            : setTimeout(() => {
                  searchRef.current?.focus();
              }, 100);

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === "function") {
                    e.stopImmediatePropagation();
                }
                handleClose();
            }
        };

        window.addEventListener("keydown", handleEscape, true);

        return () => {
            unsubscribeProd();
            unsubscribeStock();
            if (focusTimeout) clearTimeout(focusTimeout);
            window.removeEventListener("keydown", handleEscape, true);
        };
    }, [show, editOpen, handleClose]);

    // Create product details map (gstRate, hsnCode, discount, rate, mrp) from Products database
    const prodDetailsMap = new Map();
    (products || []).forEach((p) => {
        const codeKey = (p.itemCode || p.code || "").toLowerCase();
        const nameKey = (p.productName || p.product || "").toLowerCase();
        const mrpVal = Array.isArray(p.mrp) ? (p.mrp[p.mrp.length - 1] || 0) : Number(p.mrp || 0);
        const details = {
            gst: Number(p.gstRate ?? p.gst ?? 0),
            hsn: p.hsnCode || p.hsn || "",
            discount: Number(p.discount || 0),
            rate: Number(p.rate || 0),
            mrp: Number(mrpVal || 0)
        };
        if (codeKey) prodDetailsMap.set(codeKey, details);
        if (nameKey) prodDetailsMap.set(nameKey, details);
    });

    const stockCodeKeys = new Set((stocks || []).map(s => (s.itemCode || s.code || "").toLowerCase()).filter(Boolean));
    const stockNameKeys = new Set((stocks || []).map(s => (s.productName || s.product || "").toLowerCase()).filter(Boolean));

    const stockItemsMapped = (stocks || []).map((s) => {
        const codeKey = (s.itemCode || s.code || "").toLowerCase();
        const nameKey = (s.productName || s.product || "").toLowerCase();
        const matchedProd = prodDetailsMap.get(codeKey) || prodDetailsMap.get(nameKey) || {};

        const gstVal = matchedProd.gst !== undefined && matchedProd.gst !== 0
            ? Number(matchedProd.gst)
            : Number(s.gst ?? s.gstRate ?? 0);

        const hsnVal = s.hsn || s.hsnCode || matchedProd.hsn || "";
        const discVal = Number(s.discount || matchedProd.discount || 0);

        const mrpVal = s.mrp !== undefined && s.mrp !== null && s.mrp !== "" ? Number(s.mrp) : Number(matchedProd.mrp || 0);
        const rateVal = s.rate !== undefined && s.rate !== null && s.rate !== "" ? Number(s.rate) : Number(matchedProd.rate || 0);

        return {
            ...s,
            stockId: s.stockId || s._id,
            itemCode: s.itemCode || s.code || "",
            productName: s.productName || s.product || "Unnamed Product",
            batch: s.batch || "-",
            mrp: mrpVal,
            rate: rateVal,
            expiry: s.expiryDate || s.expiry || "-",
            stock: Number(s.qty ?? s.stock ?? 0),
            gst: gstVal,
            gstRate: gstVal,
            hsn: hsnVal,
            hsnCode: hsnVal,
            discount: discVal
        };
    });

    const missingProdItems = (products || []).filter((p) => {
        const codeKey = (p.itemCode || p.code || "").toLowerCase();
        const nameKey = (p.productName || p.product || "").toLowerCase();
        return (codeKey && !stockCodeKeys.has(codeKey)) || (nameKey && !stockNameKeys.has(nameKey));
    }).map((p) => {
        const hsnVal = p.hsnCode || p.hsn || "";
        const gstVal = Number(p.gstRate ?? p.gst ?? 0);
        const mrpVal = Array.isArray(p.mrp) ? (p.mrp[p.mrp.length - 1] || 0) : Number(p.mrp || 0);
        const rateVal = Number(p.rate || 0);
        const batchVal = Array.isArray(p.batch) ? (p.batch[p.batch.length - 1] || "-") : (p.batch || "-");

        return {
            ...p,
            stockId: p._id,
            itemCode: p.itemCode || "",
            productName: p.productName || "Unnamed Product",
            batch: batchVal,
            mrp: mrpVal,
            rate: rateVal,
            expiry: p.expiry || "-",
            stock: Number(p.stock || 0),
            gst: gstVal,
            gstRate: gstVal,
            hsn: hsnVal,
            hsnCode: hsnVal,
            discount: Number(p.discount || 0)
        };
    });

    const listToDisplay = [...stockItemsMapped, ...missingProdItems];

    const filteredItems = listToDisplay.filter((item) => {
        const text = search.toLowerCase();
        const nameMatch = String(item.productName || "").toLowerCase().includes(text);
        const codeMatch = String(item.itemCode || "").toLowerCase().includes(text);
        const batchMatch = String(item.batch || "").toLowerCase().includes(text);
        const mrpMatch = String(item.mrp ?? "").toLowerCase().includes(text);

        return nameMatch || codeMatch || batchMatch || mrpMatch;
    });

    useEffect(() => {
    if (!show || editOpen) return;

    const handleF7 = (e) => {
        if (e.key !== "F7") return;

        e.preventDefault();
        e.stopPropagation();

        const selectedItem =
            filteredItems[selectedIndex];

        if (!selectedItem) return;

        const productRecord =
            products.find(
                (p) =>
                    (p.itemCode || p.code || "")
                        .toLowerCase() ===
                    (selectedItem.itemCode || "")
                        .toLowerCase()
            ) ||
            products.find(
                (p) =>
                    (p.productName || p.product || "")
                        .toLowerCase() ===
                    (selectedItem.productName || "")
                        .toLowerCase()
            ) ||
            selectedItem;

        setEditProduct({
            ...productRecord,

            productName:
                productRecord.productName ||
                productRecord.product ||
                "",

            itemCode:
                productRecord.itemCode ||
                productRecord.code ||
                "",

            hsn:
                productRecord.hsn ??
                productRecord.hsnCode ??
                "",

            mrp: Array.isArray(productRecord.mrp)
                ? productRecord.mrp[
                      productRecord.mrp.length - 1
                  ] || ""
                : productRecord.mrp ?? "",

            rate:
                productRecord.rate ?? "",

            gst:
                productRecord.gst ??
                productRecord.gstRate ??
                "",

            minStock:
                productRecord.minStock ??
                "",

            discount:
                productRecord.discount ??
                "",
        });

        setEditOpen(true);
    };

    window.addEventListener(
        "keydown",
        handleF7,
        true
    );

    return () => {
        window.removeEventListener(
            "keydown",
            handleF7,
            true
        );
    };
}, [
    show,
    editOpen,
    selectedIndex,
    products,
    filteredItems,
]);

    useEffect(() => {
        const row = rowRefs.current[selectedIndex];
        if (row) {
            row.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedIndex, filteredItems]);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") {
                e.stopImmediatePropagation();
            }
            handleClose();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const selectedItem = filteredItems[selectedIndex];
            if (selectedItem) {
                onSelect(selectedItem);
                onClose();
            }
            return;
        }

        if (!filteredItems.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    Math.min(prev + 1, filteredItems.length - 1)
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    Math.max(prev - 1, 0)
                );
                break;

            case "Enter":
                e.preventDefault();
                onSelect(filteredItems[selectedIndex]);
                onClose();
                break;

            default:
                break;
        }
    };

    if (!show) return null;

    return (
        <>
        <div
            className="popup-overlay"
            inert={editOpen ? "" : undefined}
            aria-hidden={editOpen}
        >
            <div className="customer-popup" style={{ maxWidth: "750px" }}>
                <div className="popup-header">
                    <h4>Select Product Stock</h4>
                    <button type="button" className="popup-close" onClick={handleClose} aria-label="Close">×</button>
                </div>

                <div className="popup-body py-2">
                    <input
                        ref={searchRef}
                        className="form-control mb-3"
                        placeholder="Search Stock by Name, Code, Batch, MRP..."
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
                                    <th style={{ width: 110 }}>Item Code</th>
                                    <th>Product Name</th>
                                    <th style={{ width: 90 }}>Batch</th>
                                    <th style={{ width: 80 }} className="text-end">MRP</th>
                                    <th style={{ width: 90 }} className="text-center">Expiry</th>
                                    <th style={{ width: 80 }} className="text-center">Stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            No Stock Record Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr
                                            ref={(el) => (rowRefs.current[index] = el)}
                                            key={item.stockId || item._id || item.itemCode || index}
                                            className={
                                                index === selectedIndex
                                                    ? "table-primary"
                                                    : ""
                                            }
                                            onClick={() => {
                                                setSelectedIndex(index);
                                                onSelect(item);
                                                onClose();
                                            }}
                                        >
                                            <td>{item.itemCode}</td>
                                            <td>{item.productName}</td>
                                            <td>{item.batch}</td>
                                            <td className="text-end">₹{Number(item.mrp || 0).toFixed(2)}</td>
                                            <td className="text-center">{item.expiry}</td>
                                            <td className={`text-center font-bold ${Number(item.stock || 0) <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                                {item.stock}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <EditProduct
            key={editProduct?.itemCode || editProduct?._id || editProduct?.docId || "edit-product"}
            show={editOpen}
            product={editProduct}
            onClose={() => {
                setEditOpen(false);
                setEditProduct(null);
            }}
        />
    </>
    );
}