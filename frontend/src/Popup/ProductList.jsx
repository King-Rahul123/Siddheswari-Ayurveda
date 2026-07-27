import { useEffect, useRef, useState } from "react";
import { subscribeProducts } from "../services/productService";
import { subscribeStock } from "../services/stockService";
import "../CSS/PopupList.css";

export default function ProductList({ show, onClose, onSelect, mode = "sale" }) {

    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        if (!show) return;

        const unsubscribeProd = subscribeProducts(setProducts);
        const unsubscribeStock = subscribeStock(setStocks);

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
            unsubscribeProd();
            unsubscribeStock();
            window.removeEventListener("keydown", handleEscape, true);
        };
    }, [show, onClose]);

    // Create product details map (gstRate, hsnCode, discount) from Products database
    const prodDetailsMap = new Map();
    (products || []).forEach((p) => {
        const codeKey = (p.itemCode || p.code || "").toLowerCase();
        const nameKey = (p.productName || p.product || "").toLowerCase();
        const details = {
            gst: Number(p.gstRate ?? p.gst ?? 0),
            hsn: p.hsnCode || p.hsn || "",
            discount: Number(p.discount || 0)
        };
        if (codeKey) prodDetailsMap.set(codeKey, details);
        if (nameKey) prodDetailsMap.set(nameKey, details);
    });

    // Format list based on mode
    let listToDisplay = [];

    if (mode === "sale") {
        // Show stocks database records for sales, enriched with GST and details from products database
        listToDisplay = (stocks || []).map((s) => {
            const codeKey = (s.itemCode || s.code || "").toLowerCase();
            const nameKey = (s.productName || s.product || "").toLowerCase();
            const matchedProd = prodDetailsMap.get(codeKey) || prodDetailsMap.get(nameKey) || {};

            const gstVal = matchedProd.gst !== undefined && matchedProd.gst !== 0
                ? Number(matchedProd.gst)
                : Number(s.gst ?? s.gstRate ?? 0);

            const hsnVal = s.hsn || s.hsnCode || matchedProd.hsn || "";
            const discVal = Number(s.discount || matchedProd.discount || 0);

            return {
                ...s,
                stockId: s.stockId || s._id,
                itemCode: s.itemCode || s.code || "",
                productName: s.productName || s.product || "Unnamed Product",
                batch: s.batch || "-",
                mrp: Number(s.mrp || s.rate || 0),
                rate: Number(s.rate || s.mrp || 0),
                expiry: s.expiryDate || s.expiry || "-",
                stock: Number(s.qty ?? s.stock ?? 0),
                gst: gstVal,
                gstRate: gstVal,
                hsn: hsnVal,
                discount: discVal
            };
        });
    } else {
        // Show products collection for purchase entry
        listToDisplay = (products || []).map((p) => {
            const batchDisplay = Array.isArray(p.batch) ? p.batch.join(", ") : (p.batch || "-");
            const mrpDisplay = Array.isArray(p.mrp) ? p.mrp.join(", ") : (p.mrp || 0);
            return {
                ...p,
                itemCode: p.itemCode || p.code || "",
                productName: p.productName || "Unnamed Product",
                batchDisplay,
                mrpDisplay,
                stock: Number(p.stock || 0)
            };
        });
    }

    const filteredItems = listToDisplay.filter((item) => {
        const text = search.toLowerCase();
        const nameMatch = String(item.productName || "").toLowerCase().includes(text);
        const codeMatch = String(item.itemCode || "").toLowerCase().includes(text);
        const batchMatch = String(item.batch || item.batchDisplay || "").toLowerCase().includes(text);
        const mrpMatch = String(item.mrp ?? item.mrpDisplay ?? "").toLowerCase().includes(text);

        return nameMatch || codeMatch || batchMatch || mrpMatch;
    });

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
            onClose();
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
        <div className="popup-overlay">
            <div className="customer-popup" style={{ maxWidth: mode === "sale" ? "750px" : "650px" }}>
                <div className="popup-header">
                    <h4>{mode === "sale" ? "Select Product Stock" : "Select Product"}</h4>
                    <button
                        className="btn-close"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="popup-body">
                    <input
                        ref={searchRef}
                        className="form-control mb-3"
                        placeholder={mode === "sale" ? "Search Stock by Name, Code, Batch, MRP..." : "Search Product..."}
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
                                {mode === "sale" ? (
                                    <tr>
                                        <th style={{ width: 110 }}>Item Code</th>
                                        <th>Product Name</th>
                                        <th style={{ width: 90 }}>Batch</th>
                                        <th style={{ width: 80 }} className="text-end">MRP</th>
                                        <th style={{ width: 90 }} className="text-center">Expiry</th>
                                        <th style={{ width: 80 }} className="text-center">Stock</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th style={{ width: 120 }}>Item Code</th>
                                        <th>Product Name</th>
                                        <th>Batch(es)</th>
                                        <th style={{ width: 90 }} className="text-center">Stock</th>
                                    </tr>
                                )}
                            </thead>

                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={mode === "sale" ? 6 : 4}
                                            className="text-center py-4"
                                        >
                                            No {mode === "sale" ? "Stock" : "Product"} Record Found
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
                                            {mode === "sale" ? (
                                                <>
                                                    <td>{item.batch}</td>
                                                    <td className="text-end">₹{Number(item.mrp || 0).toFixed(2)}</td>
                                                    <td className="text-center">{item.expiry}</td>
                                                    <td className={`text-center font-bold ${Number(item.stock || 0) <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                                        {item.stock}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.batchDisplay}</td>
                                                    <td className={`text-center font-bold ${Number(item.stock || 0) <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                                        {item.stock}
                                                    </td>
                                                </>
                                            )}
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