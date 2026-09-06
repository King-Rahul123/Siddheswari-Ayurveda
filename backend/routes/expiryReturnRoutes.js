const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ExpiryReturn = require("../models/ExpiryReturn");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// GET all expiry returns
router.get("/", async (req, res) => {
  try {
    const list = await ExpiryReturn.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process Expiry Return Action (Save to expiryreturn collection and remove from Stock)
router.post("/action", async (req, res) => {
  try {
    const {
      targetId,
      id,
      stockId,
      itemCode,
      productName,
      batch,
      expiryDate,
      qty,
      mrp,
      rate,
      amount,
      actionStatus,
      reason,
      remarks
    } = req.body;

    if (!actionStatus) {
      return res.status(400).json({ message: "actionStatus is required" });
    }

    const cleanBatch = (batch || "—").toString().trim();
    const cleanItemCode = (itemCode || "").toString().trim();
    const cleanName = (productName || "").toString().trim();
    const numQty = Number(qty || 1);
    const numMrp = Number(mrp || 0);
    const numRate = Number(rate || numMrp);
    const numAmount = Number(amount || numQty * numMrp);

    // 1. Check if already exists in ExpiryReturn
    let expiryDoc = null;
    const searchId = targetId || id || stockId;

    if (searchId && mongoose.Types.ObjectId.isValid(searchId)) {
      expiryDoc = await ExpiryReturn.findById(searchId);
    }

    if (!expiryDoc && cleanName) {
      const nameRegex = new RegExp("^" + cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
      const matchCriteria = { productName: nameRegex };
      if (cleanBatch && cleanBatch !== "—") {
        matchCriteria.batch = cleanBatch;
      }
      if (cleanItemCode) {
        matchCriteria.itemCode = cleanItemCode;
      }
      expiryDoc = await ExpiryReturn.findOne(matchCriteria);
    }

    if (expiryDoc) {
      // Update existing record
      expiryDoc.actionStatus = actionStatus;
      expiryDoc.actionDate = new Date();
      if (numQty) expiryDoc.qty = numQty;
      if (numMrp) expiryDoc.mrp = numMrp;
      if (numRate) expiryDoc.rate = numRate;
      if (numAmount) expiryDoc.amount = numAmount;
      if (expiryDate) expiryDoc.expiryDate = expiryDate;
      if (reason) expiryDoc.reason = reason;
      if (remarks) expiryDoc.remarks = remarks;
      await expiryDoc.save();
    } else {
      // Create new record
      const seq = await getNextSequence("expiryreturn");
      const returnId = `EXP${seq.toString().padStart(6, "0")}`;

      expiryDoc = new ExpiryReturn({
        returnId,
        stockId: (searchId || "").toString(),
        itemCode: cleanItemCode,
        productName: cleanName || "Unknown Product",
        batch: cleanBatch,
        expiryDate: expiryDate || "",
        qty: numQty,
        mrp: numMrp,
        rate: numRate,
        amount: numAmount,
        actionStatus,
        actionDate: new Date(),
        reason: reason || "",
        remarks: remarks || "",
        type: "expiry"
      });

      await expiryDoc.save();
    }

    // 2. Remove the product / batch from the Stock collection
    const stockConditions = [];
    if (searchId) {
      if (mongoose.Types.ObjectId.isValid(searchId)) {
        stockConditions.push({ _id: searchId });
      }
      stockConditions.push({ stockId: searchId });
    }

    if (cleanItemCode) {
      if (cleanBatch && cleanBatch !== "—") {
        stockConditions.push({ itemCode: cleanItemCode, batch: cleanBatch });
      } else {
        stockConditions.push({ itemCode: cleanItemCode });
      }
    }

    if (cleanName) {
      const nameRegex = new RegExp("^" + cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
      if (cleanBatch && cleanBatch !== "—") {
        stockConditions.push({ productName: nameRegex, batch: cleanBatch });
      } else {
        stockConditions.push({ productName: nameRegex });
      }
    }

    if (stockConditions.length > 0) {
      await Stock.deleteMany({ $or: stockConditions });
    }

    // 3. Deduct or clean batch from Product collection if applicable
    if (cleanItemCode || cleanName) {
      const prodFilter = cleanItemCode
        ? { itemCode: cleanItemCode }
        : { productName: new RegExp("^" + cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") };

      const prod = await Product.findOne(prodFilter);
      if (prod) {
        // If batch exists in array, remove it
        if (Array.isArray(prod.batch) && cleanBatch && cleanBatch !== "—") {
          prod.batch = prod.batch.filter((b) => b !== cleanBatch);
        }
        prod.stock = Math.max(0, Number(prod.stock || 0) - numQty);
        prod.actionStatus = actionStatus;
        await prod.save();
      }
    }

    res.json({
      success: true,
      message: `Product marked as "${actionStatus}" and removed from active stock`,
      data: expiryDoc
    });
  } catch (error) {
    console.error("Error in expiry-return action:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an expiry return record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { returnId: id }] }
      : { returnId: id };

    const deleted = await ExpiryReturn.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ message: "Expiry return record not found" });
    }
    res.json({ success: true, message: "Expiry return record removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
