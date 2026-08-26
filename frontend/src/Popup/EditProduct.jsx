import { useState, useEffect, useRef } from "react";
import { updateProduct, deleteProduct } from "../services/productService";

export default function EditProduct({ show, product, onClose }) {
    const [editProduct, setEditProduct] = useState(product);
    const [savingEdit, setSavingEdit] = useState(false);
    const productNameRef = useRef(null);

    useEffect(() => {
        if (show) {
            productNameRef.current?.focus();
        }
    }, [show]);

    if (!show || !editProduct) return null;

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClose = () => {
        if (savingEdit) return;

        onClose();
    };

    const handleFieldKeyDown = (event) => {
        if (event.key !== "Enter") return;

        const fields = Array.from(
            event.currentTarget.querySelectorAll("input, select")
        );
        const currentIndex = fields.indexOf(event.target);
        const nextField = fields[currentIndex + 1];

        if (nextField) {
            event.preventDefault();
            nextField.focus();
        }
    };

    const handleUpdate = async () => {
        if (!editProduct) return;

        if (!String(editProduct.productName || "").trim()) {
            alert("Product Name is required.");
            return;
        }

        if (!String(editProduct.itemCode || "").trim()) {
            alert("Item Code is required.");
            return;
        }

        setSavingEdit(true);

        try {
            const productId =
                editProduct.itemCode ||
                editProduct._id ||
                editProduct.docId;

            const payload = {
                ...editProduct,

                productName: String(
                    editProduct.productName || ""
                ).trim(),

                itemCode: String(
                    editProduct.itemCode || ""
                ).trim(),

                hsn: editProduct.hsn ?? "",

                mrp:
                    editProduct.mrp === ""
                        ? ""
                        : Number(editProduct.mrp),

                rate:
                    editProduct.rate === ""
                        ? ""
                        : Number(editProduct.rate),

                gst:
                    editProduct.gst === ""
                        ? ""
                        : Number(editProduct.gst),

                minStock:
                    editProduct.minStock === ""
                        ? ""
                        : Number(editProduct.minStock),

                discount:
                    editProduct.discount === ""
                        ? ""
                        : Number(editProduct.discount),
            };

            delete payload._id;
            delete payload.docId;
            delete payload.createdAt;
            delete payload.updatedAt;

            await updateProduct(productId, payload);

            alert("Product updated successfully.");

            onClose();
        } catch (error) {
            console.error(
                "Error updating product:",
                error
            );

            alert(
                error.message ||
                "Failed to update product."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!editProduct) return;

        const productName =
            editProduct.productName ||
            editProduct.product ||
            "this product";

        const confirmed = window.confirm(
            `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setSavingEdit(true);

            const productId =
                editProduct.itemCode ||
                editProduct._id ||
                editProduct.docId;

            await deleteProduct(productId);

            alert("Product deleted successfully.");

            onClose();
        } catch (error) {
            console.error(
                "Error deleting product:",
                error
            );

            alert(
                error.message ||
                "Failed to delete product."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div
            className="popup-overlay"
            style={{ zIndex: 9999 }}
            onClick={handleClose}
        >
            <div
                className="customer-popup"
                style={{
                    maxWidth: "720px",
                    width: "calc(100% - 30px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="popup-header">
                    <h4>Edit Product</h4>

                    <button
                        type="button"
                        className="popup-close"
                        disabled={savingEdit}
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="popup-body" onKeyDown={handleFieldKeyDown}>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >

                        {/* Product Name */}
                        <div className="form-group">
                            <label>
                                Product Name *
                            </label>

                            <input
                                ref={productNameRef}
                                autoFocus
                                name="productName"
                                className="form-control"
                                value={
                                    editProduct.productName ||
                                    ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* Item Code */}
                        <div className="form-group">
                            <label>
                                Item Code *
                            </label>

                            <input
                                name="itemCode"
                                className="form-control"
                                value={
                                    editProduct.itemCode ||
                                    ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* HSN */}
                        <div className="form-group">
                            <label>
                                HSN Code
                            </label>

                            <input
                                name="hsn"
                                className="form-control"
                                value={
                                    editProduct.hsn ||
                                    ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* MRP */}
                        <div className="form-group">
                            <label>
                                MRP (₹)
                            </label>

                            <input
                                name="mrp"
                                type="number"
                                step="any"
                                className="form-control"
                                value={
                                    editProduct.mrp ?? ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* Rate */}
                        <div className="form-group">
                            <label>
                                Rate (₹)
                            </label>

                            <input
                                name="rate"
                                type="number"
                                step="any"
                                className="form-control"
                                value={
                                    editProduct.rate ?? ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* GST */}
                        <div className="form-group">
                            <label>
                                GST %
                            </label>

                            <select
                                name="gst"
                                className="form-control"
                                value={
                                    editProduct.gst ?? ""
                                }
                                onChange={handleEditChange}
                            >
                                <option value="">
                                    Select GST
                                </option>

                                <option value="0">
                                    0%
                                </option>

                                <option value="5">
                                    5%
                                </option>

                                <option value="12">
                                    12%
                                </option>

                                <option value="18">
                                    18%
                                </option>

                                <option value="28">
                                    28%
                                </option>
                            </select>
                        </div>

                        {/* Minimum Stock */}
                        <div className="form-group">
                            <label>
                                Minimum Stock
                            </label>

                            <input
                                name="minStock"
                                type="number"
                                className="form-control"
                                value={
                                    editProduct.minStock ??
                                    ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                        {/* Discount */}
                        <div className="form-group">
                            <label>
                                Discount (%)
                            </label>

                            <input
                                name="discount"
                                type="number"
                                step="any"
                                className="form-control"
                                value={
                                    editProduct.discount ??
                                    ""
                                }
                                onChange={handleEditChange}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="popup-footer">

                    <button
                        type="button"
                        disabled={savingEdit}
                        onClick={handleDelete}
                        style={{
                            border: "none",
                            borderRadius: "6px",
                            padding: "9px 16px",
                            background: "#dc3545",
                            color: "#fff",
                            fontWeight: 600,
                        }}
                    >
                        Delete Product
                    </button>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            type="button"
                            className="cancel-btn"
                            disabled={savingEdit}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="save-btn"
                            disabled={savingEdit}
                            onClick={handleUpdate}
                        >
                            {savingEdit
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}