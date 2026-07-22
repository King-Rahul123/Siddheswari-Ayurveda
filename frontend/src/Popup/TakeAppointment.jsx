import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "../CSS/Customer.css";
import "../CSS/Card.css"
import { addPatient, getNextPatientCode, updatePatient } from "../services/patientService";
import { subscribeDoctors } from "../services/doctorService";

export default function AppointmentPopup({ 
    show, 
    onClose, 
    patient: selectedPatient, 
    editMode, 
    viewMode = false,
}) {
    
    const emptyPatient = {
        name: "",
        phone: "",
        gender: "",
        age: "",
        address: "",
        appointDate: "",
        doctor: "",
        problem: "",
        status: "Pending",
    };

    const [patient, setPatient] = useState(
        () => selectedPatient ? { ...selectedPatient } : emptyPatient
    );

    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeDoctors((data) => {
            setDoctors(data);
        });

        return () => unsubscribe();
    }, []);

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

    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

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

        if (viewMode) return;
        
        try {
            if (editMode) {
                await updatePatient(patient.patientCode, patient);
                toast.success(
                    `🌿 ${patient.name} has been updated successfully.`,
                    {
                        icon: false,
                        className: "ayurveda-toast",
                    }
                );
            } else {
                const patientData = {
                    patientCode: await getNextPatientCode(),
                    status: "Pending",
                    ...patient,
                };

                await addPatient(patientData);
                toast.success(
                    `🌿 ${patientData.name} has been registered successfully.`,
                    {
                        icon: false,
                        className: "ayurveda-toast",
                    }
                );
            }

            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Failed to save.");
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
                            <h5>{editMode ? "Edit Appointment" : "Add Patient"}</h5>
                            <p>
                                {editMode
                                    ? "Update patient appointment"
                                    : "Book a patient appointment"}
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
                                <input
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={patient.name}
                                    onChange={handleChange}
                                    readOnly={viewMode}
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
                                    readOnly={viewMode}
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
                                    readOnly={viewMode}
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
                                        readOnly={viewMode}
                                        onKeyDown={(e) => handleEnter(e, "phone")}
                                        required
                                    />
                                </div>
                            </div>

                        <div className="section-title">
                            <i className="bi bi-calendar-check-fill"></i>
                            <span>Appointment Details</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-group">
                                <label>Appointment Date *</label>
                                <input
                                    ref={(el) => (inputRefs.current[4] = el)}
                                    type="date"
                                    name="appointDate"
                                    value={patient.appointDate}
                                    onChange={handleChange}
                                    readOnly={viewMode}
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
                                    readOnly={viewMode}
                                    onKeyDown={(e) => handleEnter(e, "doctor")}
                                    required
                                >
                                    <option value="">--- Select Doctor ---</option>
                                    {doctors.map((doctor) => (
                                        <option
                                            key={doctor.doctorCode}
                                            value={doctor.name}
                                        >
                                            {doctor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={patient.status || "Pending"}
                                    onChange={handleChange}
                                    readOnly={viewMode}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
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
                                readOnly={viewMode}
                                onKeyDown={(e) => handleEnter(e, "problem")}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="popup-footer">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button type="button" className="view-btn" disabled={viewMode} className={viewMode ? "disabled" : ""} onClick={() => setEditMode(!editMode)}>
                            {viewMode && "View Only"}
                        </button>
                        {editMode && !viewMode && (
                            <button type="submit" className="save-btn">
                                <i className="bi bi-check-circle-fill"></i>
                                {editMode ? "Update Appointment" : "Book Appointment"}
                                {viewMode && " (View Only)"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
