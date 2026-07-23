const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  itemCode: { type: String },
  productId: { type: String },
  productName: { type: String },
  batch: { type: String, default: "" },
  qty: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  expiryDate: { type: String, default: "" },
  expiry: { type: String, default: "" },
  gst: { type: Number, default: 0 },
  hsn: { type: String, default: "" },
  discount: { type: Number, default: 0 }
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, required: true, unique: true },
    supplier: { type: String, default: "" },
    companyName: { type: String, default: "" },
    companyCode: { type: String, default: "" },
    invoiceNo: { type: String, default: "" },
    date: { type: String, default: "" },
    invoiceDate: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    createdBy: { type: String, default: "" },
    items: [purchaseItemSchema]
  },
  { timestamps: true }
);

purchaseSchema.pre("save", function (next) {
  if (!this.supplier && this.companyName) this.supplier = this.companyName;
  if (!this.companyName && this.supplier) this.companyName = this.supplier;
  if (!this.date && this.invoiceDate) this.date = this.invoiceDate;
  if (!this.invoiceDate && this.date) this.invoiceDate = this.date;
  next();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
