const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companiesCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    gstin: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
