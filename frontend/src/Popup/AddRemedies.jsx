import { useState } from "react";
import "../CSS/Doctor.css";

const initialForm = {
    remedyName: "",
    category: "",
    price: "",
    stock: "",
    description: "",
};

export default function AddRemedies({ show, onClose, onSave }) {
    const [remedyForm, setRemedyForm] = useState(initialForm);

    if (!show) return null;

    const handleChange = (event) => {
        setRemedyForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    };

    const handleCancel = () => {
        setRemedyForm(initialForm);
        onClose();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave?.(remedyForm);
        setRemedyForm(initialForm);
        onClose();
    };

    return (
        <div className="doctor-popup-overlay" onClick={handleCancel}>
            <div className="rounded-r rounded-2xl doctor-popup" onClick={(event) => event.stopPropagation()}>
                <div className="popup-header">
                    <div className="popup-title">
                        <div className="popup-icon"><i className="bi bi-capsule-pill"></i></div>
                        <div>
                            <h5>Add New Remedy</h5>
                            <p>Register a remedy for the clinic</p>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={handleCancel} aria-label="Close">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="popup-body">
                        <div className="section-title mt-0">
                            <i className="bi bi-capsule text-xl"></i>
                            <span>Remedy Information</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="remedyName">Remedy Name *</label>
                                <input id="remedyName" type="text" name="remedyName" placeholder="Enter remedy name" value={remedyForm.remedyName} onChange={handleChange} required autoFocus />
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyCategory">Category *</label>
                                <select id="remedyCategory" name="category" value={remedyForm.category} onChange={handleChange} required>
                                    <option value="">---- Select ----</option>
                                    <option value="Immunity">Immunity</option>
                                    <option value="Dietary">Dietary</option>
                                    <option value="Haircare">Haircare</option>
                                    <option value="Skincare">Skincare</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyPrice">Price (₹) *</label>
                                <input id="remedyPrice" type="number" name="price" min="0" step="any" placeholder="Enter price" value={remedyForm.price} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyStock">Available Stock</label>
                                <input id="remedyStock" type="number" name="stock" min="0" placeholder="Enter stock quantity" value={remedyForm.stock} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label htmlFor="remedyDescription">Description</label>
                            <textarea id="remedyDescription" name="description" rows="3" placeholder="Add remedy details" value={remedyForm.description} onChange={handleChange}></textarea>
                        </div>
                    </div>

                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="save-btn">
                            <i className="bi bi-check-circle-fill"></i>
                            Save Remedy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
