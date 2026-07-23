import { useMemo, useState, useEffect } from "react";

export default function AddProduct({
    isOpen,
    onClose,
    newProduct,
    onChange,
    onSave,
    popupCompanyRef,
    productNameRef,
    itemCodeRef,
    hsnRef,
    gstRef,
    unitRef,
    minStockRef,
    discountRef,
    companies,
    onFieldKeyDown,
}) {
    const [companySearch, setCompanySearch] = useState("");
    const [showCompanySearch, setShowCompanySearch] = useState(false);
    const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);
    
    useEffect(() => {
        if (!isOpen) return;

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
            window.removeEventListener("keydown", handleEscape, true);
        };
    }, [isOpen, onClose]);

    const filteredCompanies = useMemo(() => {
        if (!companySearch.trim()) return companies || [];
    
        return (companies || []).filter((company) =>
            (company.companyName || "")
                .toLowerCase()
                .includes(companySearch.toLowerCase())
        );
    }, [companies, companySearch]);

    if (!isOpen) return null;
	
    return (
		<div className="add-product-popup" onClick={onClose}>
			<div className="popup-overlay" onClick={(e) => e.stopPropagation()}>
				<div className="popup-box" onClick={(e) => e.stopPropagation()}>
					<div className="popup-header">
						<h4>Add New Product</h4>
						<button type="button" onClick={onClose}>&times;</button>
					</div>

					<div className="popup-body">
						<div className="form-group">
							<label>Product Name *</label>
							<input
								ref={productNameRef}
								name="productName"
								placeholder="Enter product name"
								value={newProduct.productName || ""}
								onChange={onChange}
								onKeyDown={(event) => onFieldKeyDown(event, itemCodeRef)}
							/>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-2 gap-4">
							<div className="form-group">
								<label>Item Code</label>
								<input
									ref={itemCodeRef}
									name="itemCode"
									placeholder="Item code"
									value={newProduct.itemCode || ""}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, hsnRef)}
								/>
							</div>

							<div className="form-group">
								<label>HSN Code</label>
								<input
									ref={hsnRef}
									name="hsn"
									placeholder="HSN code"
									value={newProduct.hsn || ""}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, gstRef)}
								/>
							</div>

							<div className="form-group">
								<label>MRP (₹)</label>
								<input
									name="mrp"
									type="number"
									placeholder="Enter MRP"
									value={newProduct.mrp || ""}
									onChange={onChange}
								/>
							</div>

							<div className="form-group">
								<label>GST %</label>
								<select
									ref={gstRef}
									name="gst"
									value={newProduct.gst || ""}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, unitRef)}
								>
									<option value="">Select GST</option>
									<option value="0">0%</option>
									<option value="5">5%</option>
									<option value="12">12%</option>
									<option value="18">18%</option>
									<option value="28">28%</option>
								</select>
							</div>

							<div className="form-group">
								<label>Minimum Stock</label>
								<input
									ref={minStockRef}
									name="minStock"
									type="number"
									placeholder="Min stock"
									value={newProduct.minStock || ""}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, discountRef)}
								/>
							</div>

							<div className="form-group">
								<label>Discount (%)</label>
								<input
									ref={discountRef}
									name="discount"
									type="number"
									placeholder="Discount %"
									value={newProduct.discount || ""}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, null, true)}
								/>
							</div>
						</div>
					</div>

					<div className="popup-footer">
						<button type="button" className="cancel-btn" onClick={onClose}>
							Cancel
						</button>
						<button type="button" className="save-btn" onClick={onSave}>
							Save Product
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
