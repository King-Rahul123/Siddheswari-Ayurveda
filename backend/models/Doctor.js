const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorCode: { type: String, required: true, unique: true },
    doctorName: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    qualification: { type: String, default: "" },
    specialization: { type: String, default: "" },
    address: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
