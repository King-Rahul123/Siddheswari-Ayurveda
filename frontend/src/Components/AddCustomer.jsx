import { useState } from "react";
import { toast } from "react-toastify";
import "../CSS/Customer.css";
import "../CSS/Card.css"

export default function AddCustomer({ show, onClose }) {
    const [customerForm, setCustomerForm] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
    });

    const handleChange = (e) => {
        setCustomerForm({
        ...customerForm,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const customer = {
            id: `CUS${Date.now().toString().slice(-3)}`,
            ...customerForm,
        };

        console.log(customer);

        toast.success(
            `🌿 ${customer.name} has been registered successfully.`,
            {
                icon: false,
                className: "ayurveda-toast",
            }
        );

        setCustomerForm({
            name: "",
            age: "",
            gender: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
        });

        onClose();
    };

    if (!show) return null;

    return (
        <div className="customer-popup-overlay" onClick={onClose}>
            <div className="rounded-r rounded-2xl customer-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <div className="popup-icon"><i className="bi bi-person-plus-fill"></i></div>
                        <div>
                            <h5>Add New Customer</h5>
                            <p>Register a new patient for consultation</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
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
                                <input type="text" name="name" placeholder="Enter customer name" value={customerForm.name} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" name="phone" placeholder="Enter mobile number" value={customerForm.phone} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Gender *</label>
                                <select name="gender" value={customerForm.gender} onChange={handleChange} required >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="example@gmail.com" value={customerForm.email} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="section-title">
                            <i className="bi bi-geo-alt-fill"></i>
                            <span>Address Information</span>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea rows="3" name="address" placeholder="Enter address" value={customerForm.address} onChange={handleChange} />
                        </div>

                        <div className="popup-grid">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" placeholder="City" value={customerForm.city} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input type="text" name="state" placeholder="State" value={customerForm.state} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn">
                            <i className="bi bi-check-circle-fill"></i>
                            Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
