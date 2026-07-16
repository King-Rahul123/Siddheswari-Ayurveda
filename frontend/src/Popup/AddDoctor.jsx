import { useState } from "react";
import { toast } from "react-toastify";
import "../CSS/Doctor.css";
import "../CSS/Card.css"
import { addDoctor, getNextDoctorCode } from "../services/DoctorService";

export default function AddDoctor({ show, onClose }) {
    const [doctorForm, setDoctorForm] = useState({
        name: "",
        photo: "",
        age: "",
        gender: "",
        phone: "",
        specialization: "",
    });

    const handleChange = (e) => {
        setDoctorForm({
        ...doctorForm,
        [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            setDoctorForm((prev) => ({
                ...prev,
                photo: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare doctor data first
        const doctor = {
            doctorCode: await getNextDoctorCode(),
            ...doctorForm,
        };

        // Clear form and close popup immediately
        setDoctorForm({
            name: "",
            photo: "",
            age: "",
            gender: "",
            phone: "",
            specialization: "",
        });

        onClose();

        // Save in background
        try {
            await addDoctor(doctor);

            toast.success(
            `🌿 ${doctor.name} has been registered successfully.`,
            {
                icon: false,
                className: "ayurveda-toast",
            }
            );
        } catch (error) {
            console.error(error);

            toast.error("Failed to save doctor.");

            // Optional: reopen popup if save fails
            // onOpen?.();
        }
    };

    const resetForm = () => {
        setDoctorForm({
            name: "",
            photo: "",
            age: "",
            gender: "",
            phone: "",
            specialization: "",
        });
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="doctor-popup-overlay" onClick={handleCancel}>
            <div className="rounded-r rounded-2xl doctor-popup" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <div className="popup-icon"><i className="bi bi-person-plus-fill"></i></div>
                        <div>
                            <h5>Add New Doctor</h5>
                            <p>Register a new doctor for the clinic</p>
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
                            <span>Doctor's Information</span>
                        </div>

                        <div className="grid grid-cols md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" name="name" placeholder="Enter doctor name" value={doctorForm.name} onChange={handleChange} required />
                            </div>

                            <div className="doctor-photo-section">
                                <div className="doctor-photo-preview">
                                    {doctorForm.photo ? (
                                        <img src={doctorForm.photo} alt="Doctor" />
                                    ) : (
                                        <i className="bi bi-person-circle"></i>
                                    )}
                                </div>

                                <div className="doctor-photo-upload">
                                    <label className="upload-btn">
                                        <i className="bi bi-upload"></i>
                                        Upload Photo
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols md:grid-cols-4 gap-4">
                            <div className="form-group">
                                <label>Age *</label>
                                <input type="number" name="age" placeholder="Enter age" value={doctorForm.age} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Gender *</label>
                                <select name="gender" value={doctorForm.gender} onChange={handleChange} required >
                                    <option value="">---- Select ----</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" name="phone" placeholder="Enter mobile number" value={doctorForm.phone} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Specialization *</label>
                                <select name="specialization" value={doctorForm.specialization} onChange={handleChange} required>
                                    <option value="">---- Select ----</option>
                                    <option value="All">All</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                </select>
                            </div>
                        </div>
                        <br />
                    </div>

                    {/* Footer */}
                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="save-btn" onClick={handleSubmit}>
                            <i className="bi bi-check-circle-fill"></i>
                            Save Doctor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
