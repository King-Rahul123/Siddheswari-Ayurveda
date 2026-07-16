import { useState, useRef } from "react";
import { toast } from "react-toastify";
import "../CSS/Customer.css";
import "../CSS/Card.css"
import { addPatient, getNextPatientCode } from "../services/patientService";

export default function AppointmentPopup({ show, onClose }) {
    const [patient, setPatient] = useState({
        name: "",
        phone: "",
        gender: "",
        age: "",
        address: "",
        appointDate: "",
        doctor: "",
        problem: "",
    });

    const inputRefs = useRef([]);

    const fields = [
        "name",
        "age",
        "gender",
        "phone",
        "appointDate",
        "doctor",
        "problem",
    ];

    const handleEnter = (e, field) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const currentIndex = fields.indexOf(field);

        if (currentIndex < fields.length - 1) {
            inputRefs.current[currentIndex + 1]?.focus();
        } else {
            e.target.form.requestSubmit();
        }
    };

    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare patient data first
        const patientData = {
            patientCode: await getNextPatientCode(),
            ...patient,
        };

        // Clear form and close popup immediately
        setPatient({
            name: "",
            phone: "",
            gender: "",
            age: "",
            address: "",
            appointDate: "",
            doctor: "",
            problem: "",
        });

        onClose();

        // Save in background
        try {
            await addPatient(patientData);
            
            toast.success(
            `🌿 ${patientData.name} has been registered successfully.`,
            {
                icon: false,
                className: "ayurveda-toast",
            }
            );
        } catch (error) {
            console.error(error);

            toast.error("Failed to book appointment.");

            // Optional: reopen popup if save fails
            // onOpen?.();
        }
    };

    const resetForm = () => {
        setPatient({
            name: "",
            phone: "",
            gender: "",
            age: "",
            address: "",
            appointDate: "",
            doctor: "",
            problem: "",
        });
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
                            <h5>Add Patient</h5>
                            <p>Book a patient Appointment</p>
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
                                <input
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={patient.name}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleEnter(e, "name")}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Age *</label>
                                <input
                                    ref={(el) => (inputRefs.current[1] = el)}
                                    type="number"
                                    name="age"
                                    placeholder="Enter age"
                                    value={patient.age}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleEnter(e, "age")}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Gender *</label>
                                <select
                                    ref={(el) => (inputRefs.current[2] = el)}
                                    name="gender"
                                    value={patient.gender}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleEnter(e, "gender")}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                    <input
                                        ref={(el) => (inputRefs.current[3] = el)}
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter mobile number"
                                        value={patient.phone}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleEnter(e, "phone")}
                                        required
                                    />
                                </div>
                            </div>

                        <div className="section-title">
                            <i className="bi bi-calendar-check-fill"></i>
                            <span>Appointment Details</span>
                        </div>

                        <div className="popup-grid">

                            <div className="form-group">
                                <label>Appointment Date *</label>
                                <input
                                    ref={(el) => (inputRefs.current[4] = el)}
                                    type="date"
                                    name="appointDate"
                                    value={patient.appointDate}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleEnter(e, "appointDate")}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Doctor</label>
                                <select
                                    ref={(el) => (inputRefs.current[5] = el)}
                                    name="doctor"
                                    placeholder="Select doctor"
                                    value={patient.doctor}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleEnter(e, "doctor")}
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    <option value="Dr. Smith">Dr. Smith</option>
                                    <option value="Dr. Johnson">Dr. Johnson</option>
                                </select>
                            </div>
                        </div>
                        <br />
                        <div className="form-group">
                            <label>Problem / Symptoms</label>
                            <textarea
                                ref={(el) => (inputRefs.current[6] = el)}
                                name="problem"
                                value={patient.problem}
                                onChange={handleChange}
                                onKeyDown={(e) => handleEnter(e, "problem")}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="save-btn">
                            <i className="bi bi-check-circle-fill"></i>
                            Book Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
