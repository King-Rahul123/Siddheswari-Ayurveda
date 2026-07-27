const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const { getNextSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);


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

      let updatedProd = null;

      // 1. Try finding product by itemCode first
      if (code !== "") {
        updatedProd = await Product.findOne({ itemCode: code });
      }
      // Fallback: search product by name if not found by itemCode
      if (!updatedProd && name !== "") {
        const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
        updatedProd = await Product.findOne({ productName: nameRegex });
      }

      const itemBatch = (item.batch || "").toString().trim();
      const itemMrp = item.mrp !== undefined && item.mrp !== "" ? Number(item.mrp) : null;
      const itemExpiry = item.expiry || item.expiryDate || "";
      const itemHsn = item.hsn || item.hsnCode || "";
      const itemGst = item.gst !== undefined ? Number(item.gst) : 0;

      if (updatedProd) {
        updatedProd.stock = Number(updatedProd.stock || 0) + qtyNum;

        if (itemExpiry) updatedProd.expiry = itemExpiry;
        if (itemHsn) updatedProd.hsnCode = itemHsn;
        if (itemGst) updatedProd.gstRate = itemGst;

        // Safely migrate/handle batch as array
        let batchList = Array.isArray(updatedProd.batch)
          ? [...updatedProd.batch]
          : (updatedProd.batch ? [String(updatedProd.batch)] : []);
        if (itemBatch && !batchList.includes(itemBatch)) {
          batchList.push(itemBatch);
        }
        updatedProd.batch = batchList;

        // Safely migrate/handle mrp as array
        let mrpList = Array.isArray(updatedProd.mrp)
          ? [...updatedProd.mrp]
          : (updatedProd.mrp !== undefined && updatedProd.mrp !== null && updatedProd.mrp !== "" ? [Number(updatedProd.mrp)] : []);
        if (itemMrp !== null && !isNaN(itemMrp) && !mrpList.includes(itemMrp)) {
          mrpList.push(itemMrp);
        }
        updatedProd.mrp = mrpList;

        await updatedProd.save();
      } else if (code || name) {
        let itemCodeToCreate = code;
        if (itemCodeToCreate) {
          const existingCode = await Product.findOne({ itemCode: itemCodeToCreate });
          if (existingCode) itemCodeToCreate = null;
        }
        if (!itemCodeToCreate) {
          const nextId = await getNextSequence("product");
          itemCodeToCreate = `PCM${nextId.toString().padStart(3, "0")}`;
        }
        updatedProd = new Product({
          itemCode: itemCodeToCreate,
          productName: name || "Unnamed Product",
          batch: itemBatch ? [itemBatch] : [],
          mrp: itemMrp !== null && !isNaN(itemMrp) ? [itemMrp] : [],
          stock: qtyNum,
          expiry: itemExpiry,
          hsnCode: itemHsn,
          gstRate: itemGst
        });
        await updatedProd.save();
      }

      // Update / Upsert in Stock collection per product + batch
      let itemCodeToUse = updatedProd?.itemCode || code;
      if (!itemCodeToUse) {
        const nextProdSeq = await getNextSequence("product");
        itemCodeToUse = `PCM${nextProdSeq.toString().padStart(3, "0")}`;
      }

      const productNameToUse = updatedProd?.productName || name || "Unnamed Product";
      const batchToUse = itemBatch || "-";

      let stockFilter = { itemCode: itemCodeToUse, batch: batchToUse };

      let existingStock = await Stock.findOne(stockFilter);
      if (!existingStock && productNameToUse) {
        const nameRegex = new RegExp("^" + productNameToUse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
        existingStock = await Stock.findOne({ productName: nameRegex, batch: batchToUse });
      }

      if (existingStock) {
        existingStock.qty = Number(existingStock.qty || 0) + qtyNum;
        if (itemMrp !== null && !isNaN(itemMrp)) {
          existingStock.mrp = itemMrp;
          existingStock.rate = itemMrp;
        }
        if (itemExpiry) existingStock.expiryDate = itemExpiry;
        if (itemHsn) existingStock.hsn = itemHsn;
        if (itemGst) existingStock.gst = itemGst;
        existingStock.productName = productNameToUse;
        existingStock.itemCode = itemCodeToUse;
        await existingStock.save();
      } else {
        const nextStockIdSeq = await getNextSequence("stock");
        const codePart = itemCodeToUse || "PCM";
        const generatedStockId = `STK_${codePart}_${batchToUse.replace(/\s+/g, '_')}_${nextStockIdSeq}`;
        const newStockDoc = new Stock({
          stockId: generatedStockId,
          itemCode: itemCodeToUse,
          productName: productNameToUse,
          batch: batchToUse,
          qty: qtyNum,
          mrp: itemMrp !== null && !isNaN(itemMrp) ? itemMrp : 0,
          rate: itemMrp !== null && !isNaN(itemMrp) ? itemMrp : 0,
          expiryDate: itemExpiry || "-",
          hsn: itemHsn,
          gst: itemGst
        });
        await newStockDoc.save();
      }
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
