const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
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

// Save Purchase with Items, update Product stock, batch & expiry, and update Stock
router.post("/", async (req, res) => {
  try {
    const { purchaseData, items } = req.body;
    let purchaseId = purchaseData?.purchaseId;

    if (!purchaseId) {
      const nextId = await getNextSequence("purchase");
      const year = new Date().getFullYear();
      purchaseId = `PUR${year}${nextId.toString().padStart(4, "0")}`;
    }

    const supplierName = purchaseData?.companyName || purchaseData?.supplier || "";
    const invDate = purchaseData?.invoiceDate || purchaseData?.date || "";

    const purchase = new Purchase({
      ...purchaseData,
      purchaseId,
      supplier: supplierName,
      companyName: supplierName,
      date: invDate,
      invoiceDate: invDate,
      items: items || []
    });

    await purchase.save();

    // Update Product stock balance, batch & expiry for each purchased item
    for (const item of (items || [])) {
      const code = (item.itemCode || item.productId || "").toString().trim();
      const name = (item.productName || "").toString().trim();
      const qtyNum = Number(item.qty || 0);

      let filter = null;
      if (code !== "") {
        filter = { itemCode: code };
      } else if (name !== "") {
        filter = { productName: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") };
      }

      if (filter) {
        const setFields = {};
        if (item.batch) setFields.batch = item.batch;
        if (item.expiry || item.expiryDate) setFields.expiry = item.expiry || item.expiryDate;
        if (item.mrp) setFields.mrp = Number(item.mrp);
        if (item.hsn) setFields.hsnCode = item.hsn;
        if (item.gst) setFields.gstRate = Number(item.gst);

        await Product.findOneAndUpdate(
          filter,
          {
            ...(qtyNum > 0 ? { $inc: { stock: qtyNum } } : {}),
            $set: setFields
          },
          { new: true }
        );
      }
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
