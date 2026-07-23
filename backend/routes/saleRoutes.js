const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const { getNextSequence, getCurrentSequence } = require("../models/Counter");

// Show current sale ID without incrementing
router.get("/current-id", async (req, res) => {
  try {
    const currentId = await getCurrentSequence("sale");
    const nextId = currentId + 1;
    const saleId = `SDA-${nextId.toString().padStart(5, "0")}`;
    res.json({ saleId, currentId, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate & increment next Sale ID
router.get("/next-id", async (req, res) => {
  try {
    const nextId = await getNextSequence("sale");
    const saleId = `SDA-${nextId.toString().padStart(5, "0")}`;
    res.json({ saleId, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save Sale with Items and Decrease Stock
router.post("/", async (req, res) => {
  try {
    const { saleData, items } = req.body;
    let saleId = saleData?.saleId;

    if (!saleId) {
      const nextId = await getNextSequence("sale");
      saleId = `SDA-${nextId.toString().padStart(5, "0")}`;
    }

    const sale = new Sale({
      ...saleData,
      saleId,
      items: items || []
    });

    await sale.save();

    // Decrease Product stock and Stock collection batch quantities for each sold item
    for (const item of (items || [])) {
      const code = item.itemCode || item.productId;
      const qtyNum = Number(item.qty || 0);
      if (code && qtyNum > 0) {
        // Decrease total stock in Product collection
        await Product.findOneAndUpdate(
          { itemCode: code },
          { $inc: { stock: -qtyNum } }
        );

        // Decrease stock in Stock batch collection
        if (item.batch) {
          await Stock.findOneAndUpdate(
            { itemCode: code, batch: item.batch },
            { $inc: { qty: -qtyNum } }
          );
        } else {
          await Stock.findOneAndUpdate(
            { itemCode: code },
            { $inc: { qty: -qtyNum } }
          );
        }
      }
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
