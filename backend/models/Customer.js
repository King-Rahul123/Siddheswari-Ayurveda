const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    customerName: { type: String, default: "" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    gender: { type: String, default: "" },
    age: { type: String, default: "" }
  },
  { timestamps: true }
);

customerSchema.pre("save", function (next) {
  if (!this.name && this.customerName) this.name = this.customerName;
  if (!this.customerName && this.name) this.customerName = this.name;
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
