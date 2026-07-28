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
