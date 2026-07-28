const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const { getNextSequence, getCurrentSequence } = require("../models/Counter");
const authMiddleware = require("../middleware/authMiddleware");
const { generateSalePDF } = require("../utils/pdfGenerator");

router.use(authMiddleware);

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

// Stream / Download PDF invoice
router.get("/pdf/:saleId", async (req, res) => {
  try {
    const { saleId } = req.params;
    let sale = await Sale.findOne({ saleId });
    if (!sale) {
      sale = await Sale.findOne({ saleId: saleId.replace(/_/g, " ") }) || await Sale.findOne({ saleId: saleId.replace(/_/g, "-") });
    }

    const safeSaleId = (saleId || "INVOICE").replace(/[/\\?%*:|"<>]/g, "_");
    
    let filePath = sale?.pdfPath;

    if (!filePath || !fs.existsSync(filePath)) {
      filePath = path.join("D:\\Mongodb_Siddheswari\\Invoices", `${safeSaleId}.pdf`);
      if (!fs.existsSync(filePath)) {
        filePath = path.join("D:\\Mongodb_Siddheswari", `${safeSaleId}.pdf`);
      }
    }

    // If file does not exist on disk but sale document exists, re-generate PDF on demand
    if (!fs.existsSync(filePath)) {
      if (sale) {
        filePath = await generateSalePDF(sale.toObject(), sale.items);
        sale.pdfPath = filePath;
        await sale.save();
      } else {
        return res.status(404).json({ message: "Sale invoice not found in database" });
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeSaleId}.pdf"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save Sale with Items, Decrease Stock, and generate PDF
router.post("/", async (req, res) => {
  try {
    const { saleData, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Sale must contain at least one item." });
    }

    // Validate quantities and stock availability for all items BEFORE saving
    for (const item of items) {
      const code = (item.itemCode || item.productId || "").toString().trim();
      const name = (item.productName || "").toString().trim();
      const qtyNum = Number(item.qty || 0);

      if (qtyNum <= 0) {
        return res.status(400).json({
          message: `Invalid quantity (${qtyNum}) for product "${name || code || 'Item'}". Quantity must be greater than 0.`
        });
      }

      let availableStock = 0;
      let stockDoc = null;

      const targetStockId = item.stockId || item._id;
      if (targetStockId) {
        const stockOrConditions = [{ stockId: targetStockId }];
        if (mongoose.Types.ObjectId.isValid(targetStockId)) {
          stockOrConditions.push({ _id: targetStockId });
        }
        stockDoc = await Stock.findOne({ $or: stockOrConditions });
      }

      if (!stockDoc && code) {
        if (item.batch) {
          stockDoc = await Stock.findOne({ itemCode: code, batch: item.batch });
        }
        if (!stockDoc) {
          stockDoc = await Stock.findOne({ itemCode: code });
        }
      } else if (!stockDoc && name) {
        const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
        stockDoc = item.batch
          ? await Stock.findOne({ productName: nameRegex, batch: item.batch })
          : await Stock.findOne({ productName: nameRegex });
      }

      if (stockDoc) {
        availableStock = Number(stockDoc.qty || 0);
      } else {
        const prodDoc = code
          ? await Product.findOne({ itemCode: code })
          : await Product.findOne({ productName: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") });
        if (prodDoc) {
          availableStock = Number(prodDoc.stock || 0);
        }
      }

      if (qtyNum > availableStock) {
        return res.status(400).json({
          message: `Insufficient stock for product "${name || code}" (Batch: ${item.batch || 'DEFAULT'}). Available stock: ${availableStock}, Requested quantity: ${qtyNum}.`
        });
      }
    }

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

    // Generate PDF invoice and store path
    try {
      const pdfPath = await generateSalePDF(sale.toObject(), items);
      sale.pdfPath = pdfPath;
      await sale.save();
    } catch (pdfErr) {
      console.error("Error generating PDF invoice:", pdfErr);
    }

    // Decrease Product stock and Stock collection batch quantities for each sold item
    for (const item of (items || [])) {
      const code = item.itemCode || item.productId;
      const qtyNum = Number(item.qty || 0);
      if (qtyNum > 0) {
        if (code) {
          await Product.findOneAndUpdate(
            { itemCode: code },
            { $inc: { stock: -qtyNum } }
          );
        }

        const targetStockId = item.stockId || item._id;
        let updatedStock = null;
        if (targetStockId) {
          const stockFilter = mongoose.Types.ObjectId.isValid(targetStockId)
            ? { $or: [{ stockId: targetStockId }, { _id: targetStockId }] }
            : { stockId: targetStockId };

          updatedStock = await Stock.findOneAndUpdate(
            stockFilter,
            { $inc: { qty: -qtyNum } },
            { new: true }
          );
        }

        if (!updatedStock && code && item.batch) {
          await Stock.findOneAndUpdate(
            { itemCode: code, batch: item.batch },
            { $inc: { qty: -qtyNum } }
          );
        } else if (!updatedStock && code) {
          await Stock.findOneAndUpdate(
            { itemCode: code },
            { $inc: { qty: -qtyNum } }
          );
        }
      }
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
