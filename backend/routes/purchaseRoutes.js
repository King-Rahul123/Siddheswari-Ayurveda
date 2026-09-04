const express = require("express");
const mongoose = require("mongoose");
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
      const freeNum = Number(item.free || 0);
      const totalStockQty = qtyNum + freeNum;

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
      const itemRate = item.rate !== undefined && item.rate !== "" ? Number(item.rate) : (itemMrp || 0);
      const itemExpiry = item.expiry || item.expiryDate || "";
      const itemHsn = item.hsn || item.hsnCode || "";
      const itemGst = item.gst !== undefined ? Number(item.gst) : 0;

      if (updatedProd) {
        updatedProd.stock = Number(updatedProd.stock || 0) + totalStockQty;
        if (itemRate) updatedProd.rate = itemRate;

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
          rate: itemRate,
          stock: totalStockQty,
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
        existingStock.qty = Number(existingStock.qty || 0) + totalStockQty;
        if (itemMrp !== null && !isNaN(itemMrp)) {
          existingStock.mrp = itemMrp;
        }
        existingStock.rate = itemRate;
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
          qty: totalStockQty,
          mrp: itemMrp !== null && !isNaN(itemMrp) ? itemMrp : itemRate,
          rate: itemRate,
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

// Update Purchase with Stock Recalculation and 2-Day Limit Enforcement
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { purchaseData, items, originalItems } = req.body;

    const orConditions = [
      { purchaseId: id },
      { invoiceNo: id },
      { docId: id }
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    let existingPurchase = await Purchase.findOne({ $or: orConditions });

    if (!existingPurchase) {
      return res.status(404).json({ message: "Purchase record not found" });
    }

    // 2-day limit check
    const pDate = new Date(existingPurchase.createdAt || existingPurchase.invoiceDate || existingPurchase.date);
    const now = new Date();
    const diffInDays = (now - pDate) / (1000 * 60 * 60 * 24);

    if (diffInDays > 7) {
      return res.status(400).json({
        message: "This purchase invoice is more than 7 days old and cannot be edited."
      });
    }

    // Capture the old items before we overwrite the purchase document
    const oldItemsList = (originalItems && originalItems.length > 0) ? originalItems : (existingPurchase.items || []);

    // Compute updated totals
    const newSubTotal = purchaseData?.subTotal ?? 0;
    const newGstAmount = purchaseData?.gstAmount ?? 0;
    const newGrandTotal = purchaseData?.grandTotal ?? purchaseData?.netAmount ?? (newSubTotal + newGstAmount);
    const newNetAmount = purchaseData?.netAmount ?? newGrandTotal;
    const newTotalQty = (items || []).reduce((sum, it) => sum + Number(it.qty || 0) + Number(it.free || 0), 0);
    const newTotalItems = (items || []).length;

    const supplierName = purchaseData?.companyName || purchaseData?.supplier || existingPurchase.supplier;
    const invDate = purchaseData?.invoiceDate || purchaseData?.date || existingPurchase.invoiceDate;

    existingPurchase.supplier = supplierName;
    existingPurchase.companyName = supplierName;
    existingPurchase.date = invDate;
    existingPurchase.invoiceDate = invDate;
    if (purchaseData?.customerName) existingPurchase.customerName = purchaseData.customerName;
    if (purchaseData?.mobile || purchaseData?.phone) existingPurchase.mobile = purchaseData.mobile || purchaseData.phone;

    existingPurchase.subTotal = newSubTotal;
    existingPurchase.discount = purchaseData?.discount ?? 0;
    existingPurchase.gstAmount = newGstAmount;
    existingPurchase.grandTotal = newGrandTotal;
    existingPurchase.netAmount = newNetAmount;
    existingPurchase.totalAmount = newNetAmount;
    existingPurchase.totalQty = newTotalQty;
    existingPurchase.totalItems = newTotalItems;
    existingPurchase.items = items || [];

    await existingPurchase.save();

    // ==========================================
    // STEP 1: REVERT ALL OLD STOCK
    // ==========================================
    for (const oldItem of oldItemsList) {
      const code = (oldItem.itemCode || oldItem.productId || "").toString().trim();
      const name = (oldItem.productName || oldItem.product || "").toString().trim();
      const oldQty = Number(oldItem.qty || 0) + Number(oldItem.free || 0);
      const oldBatch = (oldItem.batch || "-").toString().trim();

      if (!code && !name) continue;

      let productDoc = null;
      if (code) productDoc = await Product.findOne({ itemCode: code });
      if (!productDoc && name) {
        const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
        productDoc = await Product.findOne({ productName: nameRegex });
      }

      if (productDoc) {
        productDoc.stock = Math.max(0, Number(productDoc.stock || 0) - oldQty);
        await productDoc.save();
      }

      let stockQuery = [];
      if (code) stockQuery.push({ itemCode: code });
      if (name) stockQuery.push({ productName: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") });

      if (stockQuery.length > 0) {
        let stockDocs = await Stock.find({ $or: stockQuery });
        let targetStock = stockDocs.find(s => s.batch && s.batch.toString().trim().toLowerCase() === oldBatch.toLowerCase());
        if (!targetStock && stockDocs.length > 0) targetStock = stockDocs[0]; // fallback if batch changed

        if (targetStock) {
          targetStock.qty = Math.max(0, Number(targetStock.qty || 0) - oldQty);
          await targetStock.save();
        }
      }
    }

    // ==========================================
    // STEP 2: APPLY ALL NEW STOCK
    // ==========================================
    for (const newItem of (items || [])) {
      const code = (newItem.itemCode || newItem.productId || "").toString().trim();
      const name = (newItem.productName || newItem.product || "").toString().trim();
      const newQty = Number(newItem.qty || 0) + Number(newItem.free || 0);
      const newBatch = (newItem.batch || "-").toString().trim();

      if (!code && !name) continue;

      let productDoc = null;
      if (code) productDoc = await Product.findOne({ itemCode: code });
      if (!productDoc && name) {
        const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
        productDoc = await Product.findOne({ productName: nameRegex });
      }

      // Update or Create Product
      if (productDoc) {
        productDoc.stock = Number(productDoc.stock || 0) + newQty;
        if (newItem.rate) productDoc.rate = Number(newItem.rate);
        if (newItem.mrp) {
          let mrpList = Array.isArray(productDoc.mrp) ? [...productDoc.mrp] : [Number(productDoc.mrp || 0)];
          if (!mrpList.includes(Number(newItem.mrp))) mrpList.push(Number(newItem.mrp));
          productDoc.mrp = mrpList;
        }
        await productDoc.save();
      } else if (code || name) {
        let itemCodeToCreate = code;
        if (!itemCodeToCreate) {
          const nextId = await getNextSequence("product");
          itemCodeToCreate = `PCM${nextId.toString().padStart(3, "0")}`;
        }
        productDoc = new Product({
          itemCode: itemCodeToCreate,
          productName: name || "Unnamed Product",
          batch: newBatch && newBatch !== "-" ? [newBatch] : [],
          mrp: newItem.mrp ? [Number(newItem.mrp)] : [],
          rate: Number(newItem.rate || 0),
          stock: newQty,
          expiry: newItem.expiry || "",
          hsnCode: newItem.hsn || "",
          gstRate: Number(newItem.gst || 0)
        });
        await productDoc.save();
      }

      // Update or Create Stock Data
      let stockQuery = [];
      if (code) stockQuery.push({ itemCode: code });
      if (name) stockQuery.push({ productName: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") });

      if (stockQuery.length > 0) {
        let stockDocs = await Stock.find({ $or: stockQuery });
        let targetStock = stockDocs.find(s => s.batch && s.batch.toString().trim().toLowerCase() === newBatch.toLowerCase());

        if (targetStock) {
          targetStock.qty = Number(targetStock.qty || 0) + newQty;
          if (newItem.rate) targetStock.rate = Number(newItem.rate);
          if (newItem.mrp) targetStock.mrp = Number(newItem.mrp);
          if (newItem.expiry) targetStock.expiryDate = newItem.expiry;
          await targetStock.save();
        } else {
          // Create new stock document if batch doesn't exist
          const nextStockIdSeq = await getNextSequence("stock");
          const codePart = code || (productDoc ? productDoc.itemCode : "PCM");
          const generatedStockId = `STK_${codePart}_${newBatch.replace(/\s+/g, '_')}_${nextStockIdSeq}`;
          const newStockDoc = new Stock({
            stockId: generatedStockId,
            itemCode: codePart,
            productName: name || (productDoc ? productDoc.productName : "Unnamed Product"),
            batch: newBatch,
            qty: newQty,
            mrp: Number(newItem.mrp || newItem.rate || 0),
            rate: Number(newItem.rate || 0),
            expiryDate: newItem.expiry || "-",
            hsn: newItem.hsn || "",
            gst: Number(newItem.gst || 0)
          });
          await newStockDoc.save();
        }
      }
    }

    res.json({ message: "Purchase updated successfully and stock adjusted", purchase: existingPurchase });
   } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
