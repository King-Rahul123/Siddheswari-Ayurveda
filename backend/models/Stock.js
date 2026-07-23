const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    stockId: { type: String, required: true, unique: true },
    itemCode: { type: String, required: true },
    productName: { type: String, default: "" },
    batch: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    expiryDate: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
