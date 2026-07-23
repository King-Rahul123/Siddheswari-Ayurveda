const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
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

// Save Sale with Items
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
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
