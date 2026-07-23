const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  itemCode: { type: String },
  productName: { type: String },
  batch: { type: String },
  qty: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true },
    customerCode: { type: String, default: "" },
    customerName: { type: String, default: "" },
    doctor: { type: String, default: "" },
    date: { type: String, default: "" },
    paymentMethod: { type: String, default: "Cash" },
    total: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },
    createdBy: { type: String, default: "" },
    items: [saleItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
