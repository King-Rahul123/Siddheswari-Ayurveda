const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const { getNextSequence } = require("../models/Counter");

// Generate Next Purchase ID
router.get("/next-id", async (req, res) => {
  try {
    const nextId = await getNextSequence("purchase");
    const year = new Date().getFullYear();
    const purchaseId = `PUR${year}${nextId.toString().padStart(4, "0")}`;
    res.json({ purchaseId, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save Purchase with Items
router.post("/", async (req, res) => {
  try {
    const { purchaseData, items } = req.body;
    let purchaseId = purchaseData?.purchaseId;

    if (!purchaseId) {
      const nextId = await getNextSequence("purchase");
      const year = new Date().getFullYear();
      purchaseId = `PUR${year}${nextId.toString().padStart(4, "0")}`;
    }

    const purchase = new Purchase({
      ...purchaseData,
      purchaseId,
      items: items || []
    });

    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
