import { useEffect, useRef, useState } from "react";
import { subscribeProducts } from "../services/productService";
import { subscribeStock } from "../services/stockService";
import "../CSS/PopupList.css";

export default function ProductList({ show, onClose, onSelect }) {

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

    // Map product with stock from Stock collection if available
    const stockMap = new Map();
    (stocks || []).forEach((s) => {
        const code = (s.itemCode || s.code || "").toLowerCase();
        if (code) {
            stockMap.set(code, Number(s.qty ?? s.stock ?? 0));
        }
    });

    const productsWithStock = (products || []).map((p) => {
        const codeKey = (p.itemCode || p.code || "").toLowerCase();
        const availableStock = stockMap.has(codeKey)
            ? stockMap.get(codeKey)
            : Number(p.stock || 0);
        return {
            ...p,
            stock: availableStock
        };
    });

    const filteredProducts = productsWithStock.filter((product) => {
        const text = search.toLowerCase();

        return (
            (product.productName || "").toLowerCase().includes(text) ||
            (product.itemCode || "").toLowerCase().includes(text) ||
            (product.companyName || product.company || "").toLowerCase().includes(text)
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
    }, [selectedIndex, filteredProducts]);

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

        if (!filteredProducts.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    Math.min(prev + 1, filteredProducts.length - 1)
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
                onSelect(filteredProducts[selectedIndex]);
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
                    <h4>Select Product</h4>
                    <button
                        className="btn-close"
                        onClick={onClose}
                    ></button>
                </div>

                <div className="popup-body">
                    <input
                        ref={searchRef}
                        className="form-control mb-3"
                        placeholder="Search Product..."
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
                                    <th style={{ width: 140 }}>Item Code</th>
                                    <th>Product Name</th>
                                    <th style={{ width: 100 }} className="text-center">Stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center py-4"
                                        >
                                            No Product Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product, index) => (
                                        <tr
                                            ref={(el) => (rowRefs.current[index] = el)}
                                            key={product.itemCode || index}
                                            className={
                                                index === selectedIndex
                                                    ? "table-primary"
                                                    : ""
                                            }
                                            onClick={() => {
                                                setSelectedIndex(index);
                                                onSelect(product);
                                                onClose();
                                            }}
                                        >
                                            <td>{product.itemCode}</td>
                                            <td>{product.productName}</td>
                                            <td className={`text-center font-bold ${Number(product.stock || 0) <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                                {product.stock ?? 0}
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
    );
}