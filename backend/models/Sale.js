const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  itemCode: { type: String },
  productName: { type: String },
  hsn: { type: String },
  batch: { type: String },
  expiry: { type: String, default: "" },
  qty: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const paymentLogSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, default: "Cash" },
  transactionId: { type: String, default: "" },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now }
});

const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true },
    customerCode: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    doctor: { type: String, default: "" },
    date: { type: String, default: "" },
    paymentMethod: { type: String, default: "-" },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Due", "Partial", "Paid"], default: "Due" },
    total: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },
    createdBy: { type: String, default: "" },
    pdfPath: { type: String, default: "" },
    payments: [paymentLogSchema],
    items: [saleItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
