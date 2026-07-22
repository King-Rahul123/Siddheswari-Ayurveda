import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../CSS/Customer.css";
import "../CSS/Card.css"
import { addCustomer, updateCustomer, getNextCustomerCode, checkCustomerPhone } from "../services/customerService";

export default function AddCustomer({
    show,
    onClose,
    editMode,
    customerForm,
    setCustomerForm,
}) {
    const emptyCustomer = {
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
    };

    const [localForm, setLocalForm] = useState(emptyCustomer);

    const form = customerForm ?? localForm;
    const setForm = setCustomerForm ?? setLocalForm;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editMode) {
                await updateCustomer(form.customerCode, form);

                toast.success(
                    `🌿 ${form.name} updated successfully.`,
                    {
                        icon: false,
                        className: "ayurveda-toast",
                    }
                );
            } else {
                const existingCustomer = await checkCustomerPhone(form.phone);

                if (existingCustomer) {
                    toast.warning(
                        `${existingCustomer.phone} is already registered.`,
                        {
                            icon: false,
                            className: "ayurveda-toast",
                        }
                    );
                    return;
                }

                const newCustomer = {
                    customerCode: await getNextCustomerCode(),
                    ...form,
                };

                await addCustomer(newCustomer);

                toast.success(
                    `🌿 ${newCustomer.name} has been registered successfully.`,
                    {
                        icon: false,
                        className: "ayurveda-toast",
                    }
                );
            }

            resetForm();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(
                editMode
                    ? "Failed to update customer."
                    : "Failed to save customer."
            );
        }
    };

    const resetForm = () => {
        setForm(emptyCustomer);
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="customer-popup-overlay" onClick={handleCancel}>
            <div className="rounded-r rounded-2xl customer-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <div className="popup-icon"><i className="bi bi-person-plus-fill"></i></div>
                        <div>
                            <h5>{editMode ? "Edit Customer" : "Add New Customer"}</h5>
                            <p>
                                {editMode
                                    ? "Update customer information"
                                    : "Register a new customer"}
                            </p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={handleCancel}>&times;</button>
                </div>

                {/* Form */}    
                <form onSubmit={handleSubmit}>
                    <div className="popup-body">
                        {/* Personal Details */}
                        <div className="section-title mt-0">
                            <i className="bi bi-person-vcard-fill text-xl"></i>
                            <span>Personal Information</span>
                        </div>

                        <div className="popup-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" name="name" placeholder="Enter customer name" value={form.name} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" name="phone" placeholder="Enter mobile number" value={form.phone} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Gender *</label>
                                <select name="gender" value={form.gender} onChange={handleChange} required >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="example@gmail.com" value={form.email} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="section-title">
                            <i className="bi bi-geo-alt-fill"></i>
                            <span>Address Information</span>
                        </div>

                        <div className="form-group mb-2">
                            <label>Address</label>
                            <textarea rows="3" name="address" placeholder="Enter address" value={form.address} onChange={handleChange} />
                        </div>

                        <div className="popup-grid">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="save-btn">
                            <i className="bi bi-check-circle-fill"></i>
                            {editMode ? "Update Customer" : "Save Customer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
