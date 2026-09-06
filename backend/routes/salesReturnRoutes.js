const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SalesReturn = require("../models/SalesReturn");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// GET all sales returns
router.get("/", async (req, res) => {
  try {
    const list = await SalesReturn.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sales return (Status: Pending, without directly altering stock)
router.post("/", async (req, res) => {
  try {
    const {
      saleId,
      billNumber,
      customerName,
      customerPhone,
      billingDate,
      items,
      totalQty,
      subTotal,
      roundOff,
      netAmount,
      returnReason
    } = req.body;

    if (!billNumber) {
      return res.status(400).json({ message: "Bill number is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item must be returned" });
    }

    const calculatedTotalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0) || Number(totalQty || 0);
    const calculatedSubTotal = items.reduce((sum, it) => sum + (Number(it.qty || 0) * Number(it.price || it.mrp || 0)), 0) || Number(subTotal || 0);
    const calculatedNetAmount = Number(netAmount || Math.round(calculatedSubTotal));
    const calculatedRoundOff = Number((calculatedNetAmount - calculatedSubTotal).toFixed(2));

    const seq = await getNextSequence("salesreturn");
    const returnId = `SR${seq.toString().padStart(6, "0")}`;

    const newReturn = new SalesReturn({
      returnId,
      saleId: saleId || "",
      billNumber: billNumber || "",
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      billingDate: billingDate || "",
      returnDate: new Date(),
      items: items.map((it) => ({
        productId: it.productId || it.itemCode || "",
        itemCode: it.itemCode || it.productId || "",
        productName: it.productName || it.name || "Unknown Product",
        batch: it.batch || "",
        qty: Number(it.qty || 0),
        expiry: it.expiry || it.expiryDate || "",
        mrp: Number(it.mrp || 0),
        price: Number(it.price || it.rate || 0),
        discount: Number(it.discount || 0),
        gst: Number(it.gst || 0),
        hsn: it.hsn || "",
        amount: Number(it.amount || (Number(it.qty || 0) * Number(it.price || it.rate || 0))),
        reason: it.reason || returnReason || ""
      })),
      totalQty: calculatedTotalQty,
      returnQuantity: calculatedTotalQty,
      returnQty: calculatedTotalQty,
      subTotal: calculatedSubTotal,
      roundOff: calculatedRoundOff,
      netAmount: calculatedNetAmount,
      returnAmount: calculatedNetAmount,
      returnReason: returnReason || "",
      status: "Pending"
    });

    await newReturn.save();

    res.status(201).json({
      success: true,
      message: "Sales return registered successfully. Items are pending return processing.",
      data: newReturn
    });
  } catch (error) {
    console.error("Error creating sales return:", error);
    res.status(500).json({ message: error.message });
  }
});

// Process Sales Return: Restock returned items to Stock collection and mark as Processed
router.post("/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { returnReason } = req.body;

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { returnId: id }, { billNumber: id }] }
      : { $or: [{ returnId: id }, { billNumber: id }] };

    const returnDoc = await SalesReturn.findOne(filter);

    if (!returnDoc) {
      return res.status(404).json({ message: "Sales return record not found" });
    }

    if (returnDoc.status === "Processed") {
      return res.status(400).json({
        message: "This sales return has already been processed and restocked."
      });
    }

    const items = returnDoc.items || [];

    // Restock returned items into Stock and Product collections
    for (const item of items) {
      const code = (item.itemCode || item.productId || "").toString().trim();
      const name = (item.productName || item.name || "").toString().trim();
      const batch = (item.batch || "").toString().trim();
      const returnQty = Number(item.qty || 0);

      if (returnQty > 0) {
        let stockItem = null;
        if (code && batch) {
          stockItem = await Stock.findOne({ itemCode: code, batch });
        } else if (code) {
          stockItem = await Stock.findOne({ itemCode: code });
        } else if (name && batch) {
          const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
          stockItem = await Stock.findOne({ productName: nameRegex, batch });
        }

        if (stockItem) {
          stockItem.qty = Number(stockItem.qty || 0) + returnQty;
          if (item.mrp && !stockItem.mrp) stockItem.mrp = Number(item.mrp);
          if (item.price && !stockItem.rate) stockItem.rate = Number(item.price);
          if (item.expiry && !stockItem.expiryDate) stockItem.expiryDate = item.expiry;
          await stockItem.save();
        } else {
          // Create new Stock document or update Product
          const stockSeq = await getNextSequence("stock");
          const stockId = `STOCK${stockSeq.toString().padStart(6, "0")}`;

          const newStock = new Stock({
            stockId,
            itemCode: code,
            productName: name || "Returned Product",
            batch: batch || "—",
            qty: returnQty,
            mrp: Number(item.mrp || 0),
            rate: Number(item.price || item.mrp || 0),
            expiryDate: item.expiry || "",
            hsn: item.hsn || "",
            gst: Number(item.gst || 0),
            actionStatus: ""
          });
          await newStock.save();

          // Also check Product collection
          const prod = code ? await Product.findOne({ itemCode: code }) : null;
          if (prod) {
            prod.stock = Number(prod.stock || 0) + returnQty;
            if (batch && Array.isArray(prod.batch) && !prod.batch.includes(batch)) {
              prod.batch.push(batch);
            }
            await prod.save();
          }
        }
      }
    }

    returnDoc.status = "Processed";
    returnDoc.processedAt = new Date();
    if (returnReason) {
      returnDoc.returnReason = returnReason;
    }
    await returnDoc.save();

    res.json({
      success: true,
      message: "Sales return processed successfully! Products have been restocked.",
      data: returnDoc
    });
  } catch (error) {
    console.error("Error processing sales return:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
