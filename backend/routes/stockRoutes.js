const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);


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

const ExpiryReturn = require("../models/ExpiryReturn");

// Get expiry stock (combines ExpiryReturn collection, actual Stock, and Product collections)
router.get("/expiry", async (req, res) => {
  try {
    const expiryReturnList = await ExpiryReturn.find().sort({ createdAt: -1 });
    const stockList = await Stock.find().sort({ createdAt: -1 });
    const productList = await Product.find().sort({ createdAt: -1 });

    const combinedMap = new Map();

    // 1. Process items from ExpiryReturn collection (Saved / Actioned items)
    expiryReturnList.forEach((e) => {
      const obj = e.toObject();
      const key = `${obj.itemCode || obj.productName}_${obj.batch || "default"}`;
      combinedMap.set(key, {
        id: obj._id,
        _id: obj._id,
        stockId: obj.stockId || obj.returnId || obj._id,
        returnId: obj.returnId || "",
        itemCode: obj.itemCode || "",
        productName: obj.productName || "Unknown Product",
        batch: obj.batch || "—",
        expiryDate: obj.expiryDate || "",
        mrp: Number(obj.mrp || 0),
        rate: Number(obj.rate || 0),
        qty: Number(obj.qty || 0),
        actionStatus: obj.actionStatus || "Returned",
        actionDate: obj.actionDate || obj.createdAt,
        isExpiryReturn: true
      });
    });

    // 2. Process items from Stock collection (Active expiring stock)
    stockList.forEach((s) => {
      const obj = s.toObject();
      const key = `${obj.itemCode || obj.productName}_${obj.batch || "default"}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, {
          id: obj._id,
          _id: obj._id,
          stockId: obj.stockId || obj._id,
          itemCode: obj.itemCode || "",
          productName: obj.productName || "Unknown Product",
          batch: obj.batch || "—",
          expiryDate: obj.expiryDate || obj.expiry || "",
          mrp: Number(obj.mrp || obj.rate || 0),
          rate: Number(obj.rate || 0),
          qty: Number(obj.qty || 0),
          actionStatus: obj.actionStatus || ""
        });
      }
    });

    // 3. Process items from Product collection (if not already added by batch)
    productList.forEach((p) => {
      const obj = p.toObject();
      const batches = Array.isArray(obj.batch) && obj.batch.length > 0
        ? obj.batch
        : [obj.batch || "—"];
      const mrpVal = Array.isArray(obj.mrp) && obj.mrp.length > 0
        ? Number(obj.mrp[0])
        : Number(obj.mrp || 0);

      batches.forEach((b) => {
        const key = `${obj.itemCode || obj.productName}_${b || "default"}`;
        if (!combinedMap.has(key)) {
          combinedMap.set(key, {
            id: obj._id,
            _id: obj._id,
            stockId: obj.itemCode || obj._id,
            itemCode: obj.itemCode || "",
            productName: obj.productName || "Unknown Product",
            batch: b || "—",
            expiryDate: obj.expiry || obj.expiryDate || "",
            mrp: mrpVal,
            rate: Number(obj.rate || 0),
            qty: Number(obj.stock || 0),
            actionStatus: obj.actionStatus || ""
          });
        }
      });
    });

    const result = Array.from(combinedMap.values());
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock/product action status (Saves to ExpiryReturn and removes from Stock)
router.patch("/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      actionStatus,
      itemCode,
      productName,
      batch,
      expiryDate,
      qty,
      mrp,
      rate,
      amount,
      reason,
      remarks
    } = req.body;

    if (!actionStatus) {
      return res.status(400).json({ message: "actionStatus is required" });
    }

    const mongoose = require("mongoose");
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { stockId: id }, { itemCode: id }] }
      : { $or: [{ stockId: id }, { itemCode: id }] };

    let stockItem = await Stock.findOne(filter);
    let prodItem = !stockItem ? await Product.findOne(filter) : null;
    let existingExpiry = mongoose.Types.ObjectId.isValid(id) ? await ExpiryReturn.findById(id) : null;

    const resolvedItemCode = itemCode || stockItem?.itemCode || prodItem?.itemCode || existingExpiry?.itemCode || "";
    const resolvedName = productName || stockItem?.productName || prodItem?.productName || existingExpiry?.productName || "Unknown Product";
    const resolvedBatch = batch || stockItem?.batch || (Array.isArray(prodItem?.batch) ? prodItem.batch[0] : prodItem?.batch) || existingExpiry?.batch || "—";
    const resolvedExpiry = expiryDate || stockItem?.expiryDate || prodItem?.expiry || existingExpiry?.expiryDate || "";
    const resolvedQty = Number(qty || stockItem?.qty || prodItem?.stock || existingExpiry?.qty || 1);
    const resolvedMrp = Number(mrp || stockItem?.mrp || (Array.isArray(prodItem?.mrp) ? prodItem.mrp[0] : prodItem?.mrp) || existingExpiry?.mrp || 0);
    const resolvedRate = Number(rate || stockItem?.rate || prodItem?.rate || existingExpiry?.rate || resolvedMrp);
    const resolvedAmount = Number(amount || resolvedQty * resolvedMrp);

    let savedExpiry = null;

    if (existingExpiry) {
      existingExpiry.actionStatus = actionStatus;
      existingExpiry.actionDate = new Date();
      if (reason) existingExpiry.reason = reason;
      if (remarks) existingExpiry.remarks = remarks;
      await existingExpiry.save();
      savedExpiry = existingExpiry;
    } else {
      // Check if already in ExpiryReturn by name + batch
      const nameRegex = new RegExp("^" + resolvedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
      let match = await ExpiryReturn.findOne({
        productName: nameRegex,
        ...(resolvedBatch && resolvedBatch !== "—" ? { batch: resolvedBatch } : {})
      });

      if (match) {
        match.actionStatus = actionStatus;
        match.actionDate = new Date();
        if (reason) match.reason = reason;
        if (remarks) match.remarks = remarks;
        await match.save();
        savedExpiry = match;
      } else {
        const seq = await getNextSequence("expiryreturn");
        const returnId = `EXP${seq.toString().padStart(6, "0")}`;

        savedExpiry = new ExpiryReturn({
          returnId,
          stockId: (id || "").toString(),
          itemCode: resolvedItemCode,
          productName: resolvedName,
          batch: resolvedBatch,
          expiryDate: resolvedExpiry,
          qty: resolvedQty,
          mrp: resolvedMrp,
          rate: resolvedRate,
          amount: resolvedAmount,
          actionStatus,
          actionDate: new Date(),
          reason: reason || "",
          remarks: remarks || "",
          type: "expiry"
        });
        await savedExpiry.save();
      }
    }

    // Remove from Stock collection
    const stockConditions = [];
    if (mongoose.Types.ObjectId.isValid(id)) stockConditions.push({ _id: id });
    stockConditions.push({ stockId: id });
    if (resolvedItemCode) {
      stockConditions.push(resolvedBatch && resolvedBatch !== "—" ? { itemCode: resolvedItemCode, batch: resolvedBatch } : { itemCode: resolvedItemCode });
    }
    if (resolvedName) {
      const nameRegex = new RegExp("^" + resolvedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
      stockConditions.push(resolvedBatch && resolvedBatch !== "—" ? { productName: nameRegex, batch: resolvedBatch } : { productName: nameRegex });
    }
    if (stockConditions.length > 0) {
      await Stock.deleteMany({ $or: stockConditions });
    }

    // Deduct / remove batch from Product if present
    if (prodItem) {
      if (Array.isArray(prodItem.batch) && resolvedBatch && resolvedBatch !== "—") {
        prodItem.batch = prodItem.batch.filter((b) => b !== resolvedBatch);
      }
      prodItem.stock = Math.max(0, Number(prodItem.stock || 0) - resolvedQty);
      prodItem.actionStatus = actionStatus;
      await prodItem.save();
    }

    return res.json({
      success: true,
      message: `Action updated to "${actionStatus}" and product removed from active stock`,
      stock: savedExpiry
    });
  } catch (error) {
    console.error("Error in patch stock action:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add or Update Stock (Upsert by itemCode/productName + batch)
router.post("/", async (req, res) => {
  try {
    const stockData = req.body;
    const code = (stockData.itemCode || stockData.productId || "").toString().trim();
    const name = (stockData.productName || "").toString().trim();
    const batch = (stockData.batch || "").toString().trim();
    const qtyNum = Number(stockData.qty || 0);

    let filter = null;
    if (code !== "") {
      filter = batch ? { itemCode: code, batch } : { itemCode: code };
    } else if (name !== "") {
      const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
      filter = batch ? { productName: nameRegex, batch } : { productName: nameRegex };
    }

    let savedStock = null;

    if (filter) {
      let existingStock = await Stock.findOne(filter);

      if (existingStock) {
        existingStock.qty = Number(existingStock.qty || 0) + qtyNum;
        if (stockData.mrp) existingStock.mrp = Number(stockData.mrp);
        if (stockData.rate) existingStock.rate = Number(stockData.rate || stockData.mrp);
        if (stockData.expiry || stockData.expiryDate) existingStock.expiryDate = stockData.expiry || stockData.expiryDate;
        if (stockData.hsn) existingStock.hsn = stockData.hsn;
        if (stockData.gst) existingStock.gst = Number(stockData.gst);
        if (stockData.productName) existingStock.productName = stockData.productName;
        await existingStock.save();
        savedStock = existingStock;
      }
    }

    if (!savedStock) {
      let stockId = stockData.stockId;
      if (!stockId) {
        const nextId = await getNextSequence("stock");
        stockId = `STOCK${nextId.toString().padStart(6, "0")}`;
      }

      const stock = new Stock({
        ...stockData,
        stockId,
        qty: qtyNum,
        rate: Number(stockData.rate || stockData.mrp || 0),
        expiryDate: stockData.expiryDate || stockData.expiry || "-"
      });

      await stock.save();
      savedStock = stock;
    }

    // Sync Product collection batch and mrp arrays
    if (code || name) {
      const prodFilter = code ? { itemCode: code } : { productName: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") };
      const targetProd = await Product.findOne(prodFilter);
      if (targetProd) {
        targetProd.stock = Number(targetProd.stock || 0) + qtyNum;

        let batchList = Array.isArray(targetProd.batch)
          ? [...targetProd.batch]
          : (targetProd.batch ? [String(targetProd.batch)] : []);
        if (batch && !batchList.includes(batch)) {
          batchList.push(batch);
        }
        targetProd.batch = batchList;

        const numMrp = Number(stockData.mrp);
        let mrpList = Array.isArray(targetProd.mrp)
          ? [...targetProd.mrp]
          : (targetProd.mrp !== undefined && targetProd.mrp !== null && targetProd.mrp !== "" ? [Number(targetProd.mrp)] : []);
        if (!isNaN(numMrp) && numMrp > 0 && !mrpList.includes(numMrp)) {
          mrpList.push(numMrp);
        }
        targetProd.mrp = mrpList;

        await targetProd.save();
      }
    }

    res.status(201).json(savedStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
