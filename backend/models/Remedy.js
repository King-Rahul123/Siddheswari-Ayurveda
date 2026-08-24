const mongoose = require("mongoose");

const remedySchema = new mongoose.Schema(
  {
    remedyId: { type: Number },
    id: { type: Number },
    name: { type: String, required: true },
    category: { type: String, default: "Others" },
    price: { type: String, default: "" },
    mrp: { type: Number, default: 0 },
    rating: { type: Number, default: 4.9 },
    reviews: { type: Number, default: 120 },
    image: { type: String, default: "" },
    tag: { type: String, default: "" },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    specifications: {
      weight: { type: String, default: "" },
      dosage: { type: String, default: "" },
      keyIngredients: { type: String, default: "" },
      benefits: { type: String, default: "" },
      certification: { type: String, default: "Ayush Certified / ISO 9001" },
      expiry: { type: String, default: "24 Months from MFD" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Remedy", remedySchema, "remedies");
