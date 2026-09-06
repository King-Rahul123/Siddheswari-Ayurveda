const mongoose = require("mongoose");

const salesReturnItemSchema = new mongoose.Schema({
  productId: { type: String, default: "" },
  itemCode: { type: String, default: "" },
  productName: { type: String, required: true },
  batch: { type: String, default: "" },
  qty: { type: Number, default: 0 },
  expiry: { type: String, default: "" },
  mrp: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  hsn: { type: String, default: "" },
  amount: { type: Number, default: 0 },
  reason: { type: String, default: "" }
});

const salesReturnSchema = new mongoose.Schema(
  {
    returnId: { type: String, unique: true },
    saleId: { type: String, default: "" },
    billNumber: { type: String, required: true },
    customerName: { type: String, default: "Walk-in Customer" },
    customerPhone: { type: String, default: "" },
    billingDate: { type: String, default: "" },
    returnDate: { type: Date, default: Date.now },
    items: [salesReturnItemSchema],
    totalQty: { type: Number, default: 0 },
    returnQuantity: { type: Number, default: 0 },
    returnQty: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    returnAmount: { type: Number, default: 0 },
    returnReason: { type: String, default: "" },
    status: { type: String, default: "Pending" }, // "Pending" or "Processed"
    processedAt: { type: Date }
  },
  { timestamps: true }
);

salesReturnSchema.pre("save", function (next) {
  if (!this.returnQty && this.totalQty) this.returnQty = this.totalQty;
  if (!this.returnQuantity && this.totalQty) this.returnQuantity = this.totalQty;
  if (!this.returnAmount && this.netAmount) this.returnAmount = this.netAmount;
  next();
});

module.exports = mongoose.model("SalesReturn", salesReturnSchema, "salesreturn");
