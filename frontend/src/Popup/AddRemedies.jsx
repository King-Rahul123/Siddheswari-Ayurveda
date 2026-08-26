import { useState } from "react";
import "../CSS/Doctor.css";

const initialForm = {
    remedyName: "",
    category: "",
    mrp: "",
    weight: "",
    dosage: "",
    keyIngredients: "",
    benefits: "",
    description: "",
};

export default function AddRemedies({ show, onClose, onSave }) {
    const [remedyForm, setRemedyForm] = useState(initialForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null;

    const handleChange = (event) => {
        setRemedyForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleCancel = () => {
        setRemedyForm(initialForm);
        setImageFile(null);
        setImagePreview(null);
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("remedyName", remedyForm.remedyName);
            formData.append("category", remedyForm.category);
            formData.append("mrp", remedyForm.mrp);
            formData.append("weight", remedyForm.weight);
            formData.append("dosage", remedyForm.dosage);
            formData.append("keyIngredients", remedyForm.keyIngredients);
            formData.append("benefits", remedyForm.benefits);
            formData.append("description", remedyForm.description);

            if (imageFile) {
                formData.append("imageFile", imageFile);
            }

            await onSave?.(formData);

            setRemedyForm(initialForm);
            setImageFile(null);
            setImagePreview(null);
            onClose();
        } catch (err) {
            console.error("Error submitting remedy form:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="doctor-popup-overlay" onClick={handleCancel}>
            <div className="rounded-2xl doctor-popup max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                <div className="popup-header sticky top-0 bg-white z-10 border-b pb-3">
                    <div className="popup-title">
                        <div className="popup-icon"><i className="bi bi-capsule-pill"></i></div>
                        <div>
                            <h5 className="font-bold text-lg m-0">Add New Remedy</h5>
                            <p className="text-xs text-gray-500 m-0">Register a new product remedy to database</p>
                        </div>
                    </div>
                    <button type="button" className="close-btn text-xl font-bold" onClick={handleCancel} aria-label="Close">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="popup-body space-y-4 p-4">
                        <div className="section-title mt-0 flex items-center gap-2 text-emerald-800 font-bold border-b pb-2">
                            <i className="bi bi-image text-xl"></i>
                            <span>Product Image Upload (Saved to E:\Mongodb_Siddheswari\Remedies)</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-3 rounded-xl border">
                            <div className="w-24 h-24 rounded-xl border border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <i className="bi bi-camera text-2xl block"></i>
                                        <span className="text-[10px]">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <label htmlFor="remedyImage" className="block text-xs font-semibold text-gray-700 mb-1">
                                    Upload Product Image *
                                </label>
                                <input
                                    id="remedyImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">Image will be saved to <code className="bg-gray-200 px-1 rounded text-emerald-900 font-mono text-[10px]">E:\Mongodb_Siddheswari\Remedies</code></p>
                            </div>
                        </div>

                        <div className="section-title flex items-center gap-2 text-emerald-800 font-bold border-b pb-2 pt-2">
                            <i className="bi bi-capsule text-xl"></i>
                            <span>Basic Details</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="remedyName" className="block text-xs font-semibold text-gray-700 mb-1">Remedy Name *</label>
                                <input id="remedyName" type="text" name="remedyName" placeholder="Enter remedy name" value={remedyForm.remedyName} onChange={handleChange} required autoFocus className="w-full p-2 text-sm border rounded-lg" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyCategory" className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                                <select id="remedyCategory" name="category" value={remedyForm.category} onChange={handleChange} required className="w-full p-2 text-sm border rounded-lg">
                                    <option value="">---- Select Category ----</option>
                                    <option value="Classical Formulations">Classical Formulations</option>
                                    <option value="Patent & Proprietary Medicines">Patent & Proprietary Medicines</option>
                                    <option value="Single Herb Supplements">Single Herb Supplements</option>
                                    <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                                    <option value="FMCG">FMCG</option>
                                    <option value="Agriculture & Veterinary">Agriculture & Veterinary</option>
                                    <option value="Immunity">Immunity</option>
                                    <option value="Dietary">Dietary</option>
                                    <option value="Haircare">Haircare</option>
                                    <option value="Skincare">Skincare</option>
                                    <option value="Beauty Care">Beauty Care</option>
                                    <option value="Women">Women</option>
                                    <option value="Men">Men</option>
                                    <option value="Eyecare">Eyecare</option>
                                    <option value="Joint Pain">Joint Pain</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyMRP" className="block text-xs font-semibold text-gray-700 mb-1">MRP (₹) *</label>
                                <input id="remedyMRP" type="number" name="mrp" min="0" step="any" placeholder="Enter MRP" value={remedyForm.mrp} onChange={handleChange} required className="w-full p-2 text-sm border rounded-lg" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyWeight" className="block text-xs font-semibold text-gray-700 mb-1">Packaging & Weight</label>
                                <input id="remedyWeight" type="text" name="weight" placeholder="e.g. 500g, 5g x 30 sachets, 100ml" value={remedyForm.weight} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg" />
                            </div>
                        </div>

                        <div className="section-title flex items-center gap-2 text-emerald-800 font-bold border-b pb-2 pt-2">
                            <i className="bi bi-file-earmark-text text-xl"></i>
                            <span>Product Specifications & Details</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="remedyDosage" className="block text-xs font-semibold text-gray-700 mb-1">Recommended Dosage</label>
                                <textarea id="remedyDosage" name="dosage" rows="2" placeholder="e.g. 1-2 tablets twice daily after meals" value={remedyForm.dosage} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg"></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="remedyBenefits" className="block text-xs font-semibold text-gray-700 mb-1">Primary Benefits</label>
                                <textarea id="remedyBenefits" name="benefits" rows="2" placeholder="e.g. Boosts immunity, relieves joint pain" value={remedyForm.benefits} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg"></textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="remedyKeyIngredients" className="block text-xs font-semibold text-gray-700 mb-1">Key Ingredients</label>
                            <textarea id="remedyKeyIngredients" name="keyIngredients" rows="2" placeholder="e.g. Ashwagandha, Neem, Tulsi, Amla, Giloy" value={remedyForm.keyIngredients} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg"></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="remedyDescription" className="block text-xs font-semibold text-gray-700 mb-1">General Description</label>
                            <textarea id="remedyDescription" name="description" rows="2" placeholder="Detailed product description" value={remedyForm.description} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg"></textarea>
                        </div>
                    </div>

                    <div className="popup-footer flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
                        <button type="button" className="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition" onClick={handleCancel} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle-fill"></i>
                                    Save Remedy
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
