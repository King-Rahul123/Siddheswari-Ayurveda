const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    company: { type: String, default: "" },
    category: { type: String, default: "" },
    unit: { type: String, default: "" },
    price: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    hsnCode: { type: String, default: "" },
    gstRate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
