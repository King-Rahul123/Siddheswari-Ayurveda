const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  itemCode: { type: String },
  productName: { type: String },
  batch: { type: String },
  qty: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  expiryDate: { type: String }
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, required: true, unique: true },
    supplier: { type: String, default: "" },
    invoiceNo: { type: String, default: "" },
    date: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    items: [purchaseItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
