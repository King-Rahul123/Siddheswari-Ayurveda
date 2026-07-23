const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const { getNextSequence } = require("../models/Counter");

// Generate Next Stock ID
router.get("/next-id", async (req, res) => {
  try {
    const nextId = await getNextSequence("stock");
    const stockId = `STOCK${nextId.toString().padStart(6, "0")}`;
    res.json({ stockId, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Stock
router.get("/", async (req, res) => {
  try {
    const stock = await Stock.find().sort({ createdAt: -1 });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Stock
router.post("/", async (req, res) => {
  try {
    const stockData = req.body;
    let stockId = stockData.stockId;
    if (!stockId) {
      const nextId = await getNextSequence("stock");
      stockId = `STOCK${nextId.toString().padStart(6, "0")}`;
    }

    const stock = new Stock({
      ...stockData,
      stockId
    });

    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
