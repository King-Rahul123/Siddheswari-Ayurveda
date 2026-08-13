const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);


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

    const batchArray = Array.isArray(productData.batch)
      ? productData.batch
      : (productData.batch ? [productData.batch.toString().trim()] : []);
    const mrpArray = Array.isArray(productData.mrp)
      ? productData.mrp.map(Number)
      : (productData.mrp !== undefined && productData.mrp !== "" ? [Number(productData.mrp)] : []);

    const firstBatch = batchArray[0] || "-";
    const firstMrp = mrpArray[0] || 0;
    const rateVal = productData.rate !== undefined && productData.rate !== "" ? Number(productData.rate) : firstMrp;
    const hsnVal = (productData.hsnCode || productData.hsn || "").toString().trim();
    const gstVal = productData.gstRate !== undefined && productData.gstRate !== ""
      ? Number(productData.gstRate)
      : (productData.gst !== undefined && productData.gst !== "" ? Number(productData.gst) : 0);

    const product = new Product({
      ...productData,
      itemCode,
      batch: batchArray,
      mrp: mrpArray,
      rate: rateVal,
      hsnCode: hsnVal,
      hsn: hsnVal,
      gstRate: gstVal,
      gst: gstVal
    });

    await product.save();

    // Ensure record exists in Stock collection
    await Stock.findOneAndUpdate(
      { itemCode: product.itemCode, batch: firstBatch },
      {
        $set: {
          stockId: `STK_${product.itemCode}_${firstBatch}`,
          itemCode: product.itemCode,
          productName: product.productName,
          batch: firstBatch,
          mrp: firstMrp,
          rate: rateVal,
          expiryDate: product.expiry || "-",
          hsn: hsnVal,
          gst: gstVal
        },
        $setOnInsert: {
          qty: Number(product.stock || 0)
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
