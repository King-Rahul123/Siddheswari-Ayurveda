import { useState } from "react";
import { toast } from "react-toastify";
import "../CSS/Staff.css";

export default function AddStaff({ show, onClose, onSave }) {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "staff",
    });

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.username ||
            !formData.name ||
            !formData.phone ||
            !formData.password
        ) {
            toast.error( "Please fill all required fields", { className: "ayurveda-toast error" });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match", { className: "ayurveda-toast error" });
            return;
        }

        try {
            await onSave({
                username: formData.username.trim().toLowerCase(),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
            });

            setFormData({
                username: "",
                name: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
                role: "staff",
            });

            onClose();
            toast.success("Staff added successfully", { className: "ayurveda-toast" });
        } catch (err) {
            toast.error(err.message || "Failed to add staff", { className: "ayurveda-toast error" });
        }
    };

    return (
        <div className="staff-popup-overlay">
            <div className="popup-card">
                <div className="popup-header">
                    <div className="flex items-center gap-2">
                        <div className="popup-icon"><i className="bi bi-person-plus-fill"></i></div>
                        <h3>Add New Staff</h3>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="popup-grid">
                        <div className="form-group">
                            <label>Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>

                        <button type="submit" className="save-btn">
                            <i className="bi bi-person-plus-fill"></i>
                            Save Staff
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}