const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientCode: { type: String, required: true, unique: true },
    patientName: { type: String, required: true },
    phone: { type: String, default: "" },
    age: { type: String, default: "" },
    gender: { type: String, default: "" },
    disease: { type: String, default: "" },
    doctor: { type: String, default: "" },
    doctorCode: { type: String, default: "" },
    appointmentDate: { type: String, default: "" },
    timeSlot: { type: String, default: "" },
    status: { type: String, default: "Scheduled" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
