import { useState } from "react";
import "../CSS/Staff.css";  

export default function ViewStaff({
    show,
    staff,
    editMode,
    setEditMode,
    onSave,
    onEdit,
    onClose,
    onDelete,
}) {
    const [formData, setFormData] = useState(() => staff || {});
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    
    if (!show || !staff) return null;
    
    return (
        <div className="staff-popup-overlay">
            <div className="popup-card">
                <div className="popup-header">
                    <div className="flex items-center gap-2">
                        <div className="popup-icon"><i className="bi bi-person-plus-fill"></i></div>
                        <h3>Staff Details</h3>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="popup-body">
                    <form>
                        <div className="popup-grid">

                            <div className="form-group">
                                <label>Username</label>
                                <input value={staff.username || ""} disabled />
                            </div>

                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    name="role"
                                    value={formData.role || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>
                            <div className="form-group">
                                <label>Salary</label>
                                <input
                                    name="salary"
                                    value={formData.salary || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <input
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />
                            </div>
                        </div>

                        <div className="popup-footer">
                            {editMode ? (
                                <>
                                    <button
                                        type="button"
                                        className="save-btn"
                                        onClick={() => onSave(formData)}
                                    >
                                        <i className="bi bi-check-circle"></i>
                                        Save
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => {
                                            setFormData(staff);
                                            setEditMode(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="save-btn"
                                        onClick={onEdit}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        style={{ background: "#dc3545", color: "#fff" }}
                                        onClick={() => onDelete(formData)}
                                    >
                                        <i className="bi bi-trash"></i>
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}