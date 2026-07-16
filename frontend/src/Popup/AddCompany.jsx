export default function AddCompany({
	isOpen,
	onClose,
	newCompany,
	onChange,
	onSave,
	companyNameRef,
	mobileRef,
	emailRef,
	gstRef,
	onFieldKeyDown,
}) {
	if (!isOpen) return null;

	return (
		<div className="add-product-popup" onClick={onClose}>
			<div className="popup-overlay" onClick={(e) => e.stopPropagation()}>
				<div className="popup-box" onClick={(e) => e.stopPropagation()}>
					<div className="popup-header">
						<h4>Add New Company</h4>
						<button onClick={onClose}>&times;</button>
					</div>

					<div className="popup-body">
						<div className="form-group">
							<label>Company Name</label>
							<input
								ref={companyNameRef}
								name="companyName"
								value={newCompany.companyName}
								onChange={onChange}
								onKeyDown={(e) => onFieldKeyDown(e, mobileRef)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="form-group">
								<label>Mobile</label>
								<input
									ref={mobileRef}
									name="mobile"
									value={newCompany.mobile}
									onChange={onChange}
									onKeyDown={(e) => onFieldKeyDown(e, emailRef)}
								/>
							</div>
							<div className="form-group">
								<label>Email</label>
								<input
									ref={emailRef}
									name="email"
									value={newCompany.email}
									onChange={onChange}
									onKeyDown={(e) => onFieldKeyDown(e, gstRef)}
								/>
							</div>
						</div>

						<div className="form-group">
							<label>GST</label>
							<input
								ref={gstRef}
								name="gst"
								value={newCompany.gst}
								onChange={onChange}
								onKeyDown={(e) => onFieldKeyDown(e, null, true)}
							/>
						</div>
					</div>

					<div className="popup-footer">
						<button className="cancel-btn" onClick={onClose}>
							Cancel
						</button>
						<button className="save-btn" onClick={onSave}>
							Save Company
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
