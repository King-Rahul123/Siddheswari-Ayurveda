const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    password: { type: String, required: true },
    role: { type: String, default: "staff" },
    salary: { type: String, default: "" },
    address: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
