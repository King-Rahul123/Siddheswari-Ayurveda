const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ==========================================
// 1. DEFINE FONT PATHS
// ==========================================
const jimNightshadeFontPath = path.resolve(__dirname, "../../frontend/public/fonts/JimNightshade-Regular.ttf");

// YOU MUST DOWNLOAD THESE FONTS AND PLACE THEM IN THIS DIRECTORY
const robotoRegularPath = path.resolve(__dirname, "../../frontend/public/fonts/Roboto-Regular.ttf");
const robotoBoldPath = path.resolve(__dirname, "../../frontend/public/fonts/Roboto-Bold.ttf");

/**
 * Generates a PDF invoice and saves it to D:\Mongodb_Siddheswari\Invoices\<saleId>.pdf
 * @param {Object} saleData - Sale details (saleId, date, customerName, customerPhone, totalAmount, discountTotal, grandTotal, etc.)
 * @param {Array} items - Array of sale items (productName, batch, expiry, qty, rate, discount, gst, amount)
 * @returns {Promise<string>} - Resolves with the absolute path of the generated PDF file
 */

const generateSalePDF = (saleData, items = []) => {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = "D:\\Mongodb_Siddheswari\\Invoices";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const safeSaleId = (saleData.saleId || "INVOICE").replace(/[/\\?%*:|"<>]/g, "_");
      const filePath = path.join(outputDir, `${safeSaleId}.pdf`);

      const doc = new PDFDocument({ size: "A4", margin: 30 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // ==========================================
      // 2. SET UP FONT FALLBACKS
      // ==========================================
      // If the Roboto fonts are not found, it falls back to Helvetica, 
      // but Helvetica WILL NOT print the ₹ symbol correctly.
      const fontRegular = fs.existsSync(robotoRegularPath) ? robotoRegularPath : "Helvetica";
      const fontBold = fs.existsSync(robotoBoldPath) ? robotoBoldPath : "Helvetica-Bold";

      const startX = 30;
      const startY = 30;
      const width = 535; // A4 width 595 - 60
      const height = 780;

      // Background Watermark Image (logo.png)
      const watermarkPath = path.resolve(__dirname, "../../frontend/public/logo.png");
      if (fs.existsSync(watermarkPath)) {
        doc.save();
        doc.opacity(0.18); // Light transparent watermark
        const wmWidth = 320;
        const wmX = (595 - wmWidth) / 2;
        const wmY = (842 - wmWidth) / 2;
        doc.image(watermarkPath, wmX, wmY, { width: wmWidth });
        doc.restore();
      }

      let currentY = startY + 10;

      // Top-left brand lockup
      const deltasLogoPath = path.resolve(__dirname, "../../frontend/public/deltas.png");
      if (fs.existsSync(deltasLogoPath)) {
        doc.image(deltasLogoPath, startX, currentY + 2, { width: 82 });
      }

      if (fs.existsSync(jimNightshadeFontPath)) {
        doc.font(jimNightshadeFontPath);
      } else {
        doc.font("Times-Italic");
      }

      doc
        .fontSize(28)
        .fillColor("#042f4b")
        .text("Siddheswari Ayurveda", startX + 140, currentY + 6, {
          align: "center",
          width: 265,
        });

      // ==========================================
      // 3. USE CUSTOM FONTS FOR ALL TEXT
      // ==========================================
      doc
        .font(fontBold)
        .fontSize(9)
        .fillColor("#334155")
        .text(`Invoice No : ${saleData.saleId || "N/A"}`, startX + 365, currentY + 8, {
          align: "right",
          width: 170,
        });

      doc
        .font(fontBold)
        .text(`Date : ${saleData.date || new Date().toISOString().split("T")[0]}`, startX + 365, currentY + 22, {
          align: "right",
          width: 170,
        });

      currentY += 62;

      // Banner
      doc
        .font(fontBold)
        .fontSize(11)
        .fillColor("#0f172a")
        .text("TAX INVOICE / SALES INVOICE", startX, currentY, { align: "center", width: width });

      currentY += 25;

      // Customer Details Box
      const custName = saleData.customerName || saleData.customer || "Walk-in Customer";
      const custMobile = saleData.customerPhone || saleData.mobile || saleData.phone || "N/A";

      doc
        .roundedRect(startX, currentY, width, 32, 6)
        .lineWidth(1)
        .stroke("#a7f3d0");

      doc
        .font(fontBold)
        .fontSize(10)
        .fillColor("#1e293b")
        .text("Customer Name : ", startX + 15, currentY + 11, { continued: true })
        .font(fontRegular)
        .text(custName);

      doc
        .font(fontBold)
        .text("Mobile : ", startX + 300, currentY + 11, { continued: true })
        .font(fontRegular)
        .text(custMobile);

      currentY += 50;

      // Table Header Setup
      const cols = [
        { name: "Sl", x: startX + 5, w: 25, align: "center" },
        { name: "Product", x: startX + 30, w: 150, align: "left" },
        { name: "HSN", x: startX + 180, w: 55, align: "center" },
        { name: "Batch", x: startX + 235, w: 65, align: "center" },
        { name: "Exp", x: startX + 300, w: 55, align: "center" },
        { name: "Qty", x: startX + 355, w: 40, align: "center" },
        { name: "Rate", x: startX + 395, w: 50, align: "right" },
        { name: "GST", x: startX + 445, w: 40, align: "right" },
        { name: "Amount", x: startX + 485, w: 45, align: "right" }
      ];

      doc
        .rect(startX, currentY, width, 20)
        .fill("#f1f5f9");

      cols.forEach((col) => {
        doc
          .font(fontBold)
          .fontSize(9)
          .fillColor("#0f172a")
          .text(col.name, col.x, currentY + 5, { width: col.w, align: col.align });
      });

      currentY += 22;

      doc
        .moveTo(startX, currentY)
        .lineTo(startX + width, currentY)
        .stroke("#cbd5e1");

      currentY += 6;

      // Items Table Rows
      let subTotal = 0;
      let totalDiscount = 0;
      let totalGst = 0;

      const itemList = items && items.length > 0 ? items : saleData.items || [];

      itemList.forEach((item, index) => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || 0);
        const discPercent = Number(item.discount || 0);
        const gstPercent = Number(item.gst || 0);

        const itemSubtotal = qty * rate;
        const discAmt = (itemSubtotal * discPercent) / 100;
        const afterDisc = itemSubtotal - discAmt;
        const gstAmt = (afterDisc * gstPercent) / 100;
        const lineAmount = Number(item.amount || (afterDisc + gstAmt));

        subTotal += itemSubtotal;
        totalDiscount += discAmt;
        totalGst += gstAmt;

        doc
          .font(fontRegular)
          .fontSize(9)
          .fillColor("#334155");

        doc.text(String(index + 1), cols[0].x, currentY, { width: cols[0].w, align: cols[0].align });
        doc.text(item.productName || "Product", cols[1].x, currentY, { width: cols[1].w, align: cols[1].align });
        doc.text(item.hsn || "-", cols[2].x, currentY, { width: cols[2].w, align: cols[2].align });
        doc.text(item.batch || "-", cols[3].x, currentY, { width: cols[3].w, align: cols[3].align });
        doc.text(item.expiry || "-", cols[4].x, currentY, { width: cols[4].w, align: cols[4].align });
        doc.text(String(qty), cols[5].x, currentY, { width: cols[5].w, align: cols[5].align });
        doc.text(`₹ ${rate.toFixed(2)}`, cols[6].x, currentY, { width: cols[6].w, align: cols[6].align });
        doc.text(`${gstPercent}%`, cols[7].x, currentY, { width: cols[7].w, align: cols[7].align });
        doc.text(`₹ ${lineAmount.toFixed(2)}`, cols[8].x, currentY, { width: cols[8].w, align: cols[8].align });

        currentY += 18;
      });

      if (currentY < startY + 460) {
        currentY = startY + 460;
      }

      doc
        .moveTo(startX, currentY)
        .lineTo(startX + width, currentY)
        .stroke("#cbd5e1");

      currentY += 12;

      // Summary Section
      const calculatedSubTotal = saleData.totalAmount || subTotal;
      const calculatedDiscount = saleData.discountTotal || totalDiscount;
      const calculatedGst = saleData.gstTotal || totalGst;
      
      const rawGrandTotal = saleData.grandTotal || (calculatedSubTotal - calculatedDiscount + calculatedGst);
      const roundedGrandTotal = saleData.netAmount !== undefined ? Math.round(saleData.netAmount) : Math.round(rawGrandTotal); 
      const roundOffAmount = saleData.roundOff !== undefined ? saleData.roundOff : Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

      const summaryXLabel = startX + 320;
      const summaryXVal = startX + 440;
      const summaryW = 90;

      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#475569")
        .text("Subtotal", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`₹ ${Number(calculatedSubTotal).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 16;
      doc
        .text("Discount", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`₹ ${Number(calculatedDiscount).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 16;
      doc
        .text("GST", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`₹ ${Number(calculatedGst).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 16;
      doc
        .text("Grand Total", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`₹ ${Number(rawGrandTotal).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 16;
      const roundOffSign = roundOffAmount > 0.001 ? "+" : ""; 
      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#475569")
        .text("Round Off", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`${roundOffSign}${Number(roundOffAmount).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 22; 

      doc
        .rect(summaryXLabel - 10, currentY - 4, 230, 22)
        .fill("#f8fafc")
        .stroke("#cbd5e1");

      doc
        .font(fontBold)
        .fontSize(11)
        .fillColor("#14532d")
        .text("Net Amount", summaryXLabel, currentY, { width: 110, align: "left" })
        .text(`₹ ${Number(roundedGrandTotal).toFixed(2)}`, summaryXVal, currentY, { width: summaryW, align: "right" });

      currentY += 25; 

      doc
        .moveTo(startX, currentY)
        .lineTo(startX + width, currentY)
        .stroke("#e2e8f0");

      currentY += 45;

      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#334155")
        .text("_________________________", startX + 350, currentY, { align: "center", width: 170 })
        .font(fontBold)
        .text("Seller Signature", startX + 350, currentY + 15, { align: "center", width: 170 });

      const footerY = startY + height - 25;
      doc
        .moveTo(startX, footerY - 10)
        .lineTo(startX + width, footerY - 10)
        .stroke("#cbd5e1");

      doc
        .font(fontBold)
        .fontSize(10)
        .fillColor("#16a34a")
        .text("PURE  •  NATURAL  •  TRUSTED", startX, footerY, { align: "center", width: width });

      doc.end();

      writeStream.on("finish", () => {
        resolve(filePath);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateSalePDF };