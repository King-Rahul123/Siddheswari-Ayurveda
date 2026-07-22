import { useMemo, useState } from "react";

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
    
    const filteredCompanies = useMemo(() => {
        if (!companySearch.trim()) return companies;
    
            return companies.filter((company) =>
                company.companyName
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
							<label>Company Name</label>
							<input
								ref={popupCompanyRef}
								name="companyName"
								value={newProduct.companyName}
								onChange={(e) => {
                                    onChange(e);
                                    setCompanySearch(e.target.value);
                                    setShowCompanySearch(true);
                                    setSelectedCompanyIndex(0);
                                }}
								onKeyDown={(e) => {
									if (showCompanySearch) {
										if (e.key === "ArrowDown") {
											e.preventDefault();
											setSelectedCompanyIndex((prev) =>
												Math.min(prev + 1, filteredCompanies.length - 1)
											);
											return;
										}
										if (e.key === "ArrowUp") {
											e.preventDefault();
											setSelectedCompanyIndex((prev) =>
												Math.max(prev - 1, 0)
											);
											return;
										}
										if (e.key === "Enter") {
											e.preventDefault();
                                            const company = filteredCompanies[selectedCompanyIndex];
                                            if (company) {
                                                onChange({
                                                    target: {
                                                        name: "companyName",
                                                        value: company.companyName,
                                                    },
                                                });
                                                setCompanySearch(company.companyName);
                                                setShowCompanySearch(false);
                                                productNameRef.current?.focus();
                                            }
											return;
										}
									}
									onFieldKeyDown(e, productNameRef);
								}}
							/>
                            {showCompanySearch && (
                                <div className="text-xs">
                                    <table>
                                        <tbody>
                                            {filteredCompanies.map((company, index) => (
                                                <tr
                                                    key={company.companiesCode}
                                                    className={selectedCompanyIndex === index ? "active" : ""}
                                                    onClick={() => {
                                                        onChange({
                                                            target: {
                                                                name: "companyName",
                                                                value: company.companyName,
                                                            },
                                                        });

                                                        setCompanySearch(company.companyName);
                                                        setShowCompanySearch(false);

                                                        productNameRef.current?.focus();
                                                    }}
                                                >
                                                    <td>{company.companyName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
						</div>

						<div className="form-group">
							<label>Product Name</label>
							<input
								ref={productNameRef}
								name="productName"
								value={newProduct.productName}
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
									value={newProduct.itemCode}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, hsnRef)}
								/>
							</div>

							<div className="form-group">
								<label>HSN Code</label>
								<input
									ref={hsnRef}
									name="hsn"
									value={newProduct.hsn}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, gstRef)}
								/>
							</div>

							<div className="form-group">
								<label>GST %</label>
								<select
									ref={gstRef}
									name="gst"
									value={newProduct.gst}
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
								<label>Unit</label>
								<input
									ref={unitRef}
									name="unit"
									value={newProduct.unit}
									onChange={onChange}
									onKeyDown={(event) => onFieldKeyDown(event, minStockRef)}
								/>
							</div>

							<div className="form-group">
								<label>Minimum Stock</label>
								<input
									ref={minStockRef}
									name="minStock"
									type="number"
									value={newProduct.minStock}
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
									value={newProduct.discount}
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
