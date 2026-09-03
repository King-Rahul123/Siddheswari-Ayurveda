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

// Get unpaid/outstanding bills
router.get("/unpaid-bills", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    const formatted = sales.map((sale) => {
      const obj = sale.toObject();
      const total = Number(obj.grandTotal || obj.netAmount || obj.totalAmount || obj.total || 0);
      const paid = Number(obj.paidAmount || 0);
      const due = Math.max(0, total - paid);
      let status = obj.status;
      if (!status) {
        status = due <= 0 ? "Paid" : paid > 0 ? "Partial" : "Due";
      }
      return {
        ...obj,
        total,
        paidAmount: paid,
        dueAmount: due,
        status,
        paymentMethod: obj.paymentMethod || "-"
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const findStockForItem = async (item) => {
  const code = (item.itemCode || item.productId || "").toString().trim();
  const name = (item.productName || "").toString().trim();
  const targetStockId = item.stockId || item._id;

  if (targetStockId) {
    const stockOrConditions = [{ stockId: targetStockId }];
    if (mongoose.Types.ObjectId.isValid(targetStockId)) {
      stockOrConditions.push({ _id: targetStockId });
    }
    const stock = await Stock.findOne({ $or: stockOrConditions });
    if (stock) return stock;
  }

  if (code && item.batch) {
    const stock = await Stock.findOne({ itemCode: code, batch: item.batch });
    if (stock) return stock;
  }
  if (code) {
    const stock = await Stock.findOne({ itemCode: code });
    if (stock) return stock;
  }
  if (name) {
    const nameRegex = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
    return Stock.findOne(item.batch
      ? { productName: nameRegex, batch: item.batch }
      : { productName: nameRegex });
  }
  return null;
};

const adjustSaleStock = async (items, amount) => {
  for (const item of items || []) {
    const qty = Number(item.qty || 0);
    if (qty <= 0) continue;

    const code = item.itemCode || item.productId;
    if (code) {
      await Product.findOneAndUpdate({ itemCode: code }, { $inc: { stock: amount * qty } });
    }

    const stock = await findStockForItem(item);
    if (stock) {
      await Stock.findByIdAndUpdate(stock._id, { $inc: { qty: amount * qty } });
    }
  }
};

router.put("/:saleId", async (req, res) => {
  let stockRestored = false;
  let stockApplied = false;

  try {
    const { saleId } = req.params;
    const { saleData, items } = req.body;
    const sale = await Sale.findOne({
      $or: [{ saleId }, { _id: mongoose.Types.ObjectId.isValid(saleId) ? saleId : null }]
    });

    if (!sale) return res.status(404).json({ message: "Sale invoice not found" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Sale must contain at least one item." });
    }

    await adjustSaleStock(sale.items, 1);
    stockRestored = true;

    for (const item of items) {
      const qty = Number(item.qty || 0);
      if (qty <= 0) {
        const error = new Error(`Invalid quantity for ${item.productName || "item"}.`);
        error.statusCode = 400;
        throw error;
      }
      const stock = await findStockForItem(item);
      const product = !stock && item.itemCode
        ? await Product.findOne({ itemCode: item.itemCode })
        : null;
      const available = Number(stock?.qty ?? product?.stock ?? 0);
      if (qty > available) {
        const error = new Error(`Insufficient stock for ${item.productName || item.itemCode || "item"}. Available stock: ${available}.`);
        error.statusCode = 400;
        throw error;
      }
    }

    const processedItems = items.map((item) => {
      const mrp = Number(item.mrp || item.rate || 0);
      return {
        ...item,
        mrp,
        rate: Number(item.rate || mrp),
        amount: Number(item.qty || 0) * mrp,
        hsn: item.hsn || item.hsnCode || ""
      };
    });

    await adjustSaleStock(processedItems, -1);
    stockApplied = true;

    const paidAmount = Number(sale.paidAmount || 0);
    const grandTotal = Number(saleData?.grandTotal || saleData?.netAmount || 0);
    const dueAmount = Math.max(0, grandTotal - paidAmount);
    sale.set({
      ...saleData,
      saleId: sale.saleId,
      paidAmount,
      dueAmount,
      status: dueAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Due",
      paymentMethod: sale.paymentMethod,
      items: processedItems
    });
    await sale.save();

    try {
      sale.pdfPath = await generateSalePDF(sale.toObject(), processedItems);
      await sale.save();
    } catch (pdfErr) {
      console.error("Error regenerating PDF invoice:", pdfErr);
    }

    res.json(sale);
  } catch (error) {
    if (stockApplied) await adjustSaleStock(req.body.items, 1);
    if (stockRestored) await adjustSaleStock((await Sale.findOne({ saleId: req.params.saleId }))?.items || [], -1);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Update payment for a specific sale
router.patch("/:saleId/payment", async (req, res) => {
  try {
    const { saleId } = req.params;
    const { amount, paymentMethod, transactionId, note } = req.body;

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    let sale = await Sale.findOne({
      $or: [{ saleId }, { _id: mongoose.Types.ObjectId.isValid(saleId) ? saleId : null }]
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale invoice not found" });
    }

    const totalBill = Number(sale.grandTotal || sale.totalAmount || sale.netAmount || sale.total || 0);
    const currentPaid = Number(sale.paidAmount || 0);
    const newPaid = currentPaid + payAmount;
    const newDue = Math.max(0, totalBill - newPaid);
    const newStatus = newDue <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Due";

    sale.paidAmount = newPaid > totalBill ? totalBill : newPaid;
    sale.dueAmount = newDue;
    sale.status = newStatus;
    sale.paymentMethod = paymentMethod || "Cash";

    if (!Array.isArray(sale.payments)) {
      sale.payments = [];
    }
    sale.payments.push({
      amount: payAmount,
      method: paymentMethod || "Cash",
      transactionId: transactionId || "",
      note: note || "",
      date: new Date()
    });

    await sale.save();
    res.json({ success: true, message: "Payment updated successfully", bill: sale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear payment sequentially for a customer across pending invoices
router.post("/clear-payment", async (req, res) => {
  try {
    const { customerName, customerPhone, customerCode, amount, paymentMethod, transactionId, note } = req.body;

    const totalPayAmount = Number(amount);
    if (isNaN(totalPayAmount) || totalPayAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    // Build filter for customer
    const filter = {};
    if (customerCode && customerCode.trim()) {
      filter.customerCode = customerCode.trim();
    } else if (customerPhone && customerPhone.trim()) {
      filter.customerPhone = customerPhone.trim();
    } else if (customerName && customerName.trim()) {
      filter.customerName = new RegExp("^" + customerName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
    } else {
      return res.status(400).json({ message: "Customer details are required" });
    }

    // Find all sales for customer sorted by oldest first
    const sales = await Sale.find(filter).sort({ createdAt: 1 });

    let remainingToPay = totalPayAmount;
    const updatedSales = [];

    for (const sale of sales) {
      if (remainingToPay <= 0) break;

      const totalBill = Number(sale.grandTotal || sale.totalAmount || sale.netAmount || sale.total || 0);
      const currentPaid = Number(sale.paidAmount || 0);
      const currentDue = Math.max(0, totalBill - currentPaid);

      if (currentDue <= 0) continue; // Already paid

      const payForThisBill = Math.min(remainingToPay, currentDue);
      const newPaid = currentPaid + payForThisBill;
      const newDue = Math.max(0, totalBill - newPaid);
      const newStatus = newDue <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Due";

      sale.paidAmount = newPaid;
      sale.dueAmount = newDue;
      sale.status = newStatus;
      sale.paymentMethod = paymentMethod || "Cash";

      if (!Array.isArray(sale.payments)) {
        sale.payments = [];
      }
      sale.payments.push({
        amount: payForThisBill,
        method: paymentMethod || "Cash",
        transactionId: transactionId || "",
        note: note || "",
        date: new Date()
      });

      await sale.save();
      updatedSales.push(sale);
      remainingToPay -= payForThisBill;
    }

    res.json({
      success: true,
      message: `Cleared ₹${totalPayAmount - remainingToPay} across ${updatedSales.length} invoice(s)`,
      remainingUnapplied: remainingToPay,
      updatedSales
    });
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

    const billTotal = Number(saleData?.grandTotal || saleData?.netAmount || saleData?.totalAmount || saleData?.total || 0);
    const initialPaid = Number(saleData?.paidAmount || 0);
    const initialDue = Math.max(0, billTotal - initialPaid);
    const initialStatus = initialDue <= 0 ? "Paid" : (initialPaid > 0 ? "Partial" : "Due");
    const initialMethod = saleData?.paymentMethod && saleData?.paymentMethod !== "-" ? saleData.paymentMethod : (initialStatus === "Paid" ? "Cash" : "-");

    const processedItems = (items || []).map((item) => {
      const mrpVal = Number(item.mrp || item.rate || 0);
      const rateVal = Number(item.rate || mrpVal || 0);
      const qtyVal = Number(item.qty || 0);
      return {
        ...item,
        mrp: mrpVal,
        rate: rateVal,
        amount: qtyVal * mrpVal,
        hsn: item.hsn || item.hsnCode || ""
      };
    });

    const sale = new Sale({
      ...saleData,
      saleId,
      paidAmount: initialPaid,
      dueAmount: initialDue,
      status: initialStatus,
      paymentMethod: initialMethod,
      items: processedItems
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
