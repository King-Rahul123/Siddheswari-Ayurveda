const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    batch: { type: String, default: null },
    expiry: { type: String, default: null },
    mrp: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    hsnCode: { type: String, default: "" },
    gstRate: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (!this.hsnCode && this.hsn) this.hsnCode = this.hsn;
  if (!this.gstRate && this.gst) this.gstRate = Number(this.gst);
  next();
});

module.exports = mongoose.model("Product", productSchema);
