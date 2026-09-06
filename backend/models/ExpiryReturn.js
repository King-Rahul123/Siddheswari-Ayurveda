const mongoose = require("mongoose");

const expiryReturnSchema = new mongoose.Schema(
  {
    returnId: { type: String, unique: true },
    stockId: { type: String, default: "" },
    itemCode: { type: String, default: "" },
    productName: { type: String, required: true },
    batch: { type: String, default: "—" },
    expiryDate: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    actionStatus: { type: String, required: true }, // e.g. "Returned", "No Stock"
    actionDate: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
    remarks: { type: String, default: "" },
    type: { type: String, default: "expiry" }
  },
  { timestamps: true }
);

// Explicitly use the collection name "expiryreturn"
module.exports = mongoose.model("ExpiryReturn", expiryReturnSchema, "expiryreturn");
