const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { getNextSequence } = require("../models/Counter");

// Generate Next Product Code
router.get("/next-code", async (req, res) => {
  try {
    const nextId = await getNextSequence("product");
    const code = `PCM${nextId.toString().padStart(3, "0")}`;
    res.json({ code, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Product
router.post("/", async (req, res) => {
  try {
    const productData = req.body;
    let itemCode = productData.itemCode;
    if (!itemCode) {
      const nextId = await getNextSequence("product");
      itemCode = `PCM${nextId.toString().padStart(3, "0")}`;
    }

    const product = new Product({
      ...productData,
      itemCode
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
