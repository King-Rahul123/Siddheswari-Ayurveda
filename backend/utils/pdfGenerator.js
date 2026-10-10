const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ==========================================
// FONT PATHS
// ==========================================
const jimNightshadeFontPath = path.resolve(
  __dirname,
  "../../frontend/public/fonts/JimNightshade-Regular.ttf"
);

const robotoRegularPath = path.resolve(
  __dirname,
  "../../frontend/public/fonts/Roboto-Regular.ttf"
);

const robotoBoldPath = path.resolve(
  __dirname,
  "../../frontend/public/fonts/Roboto-Bold.ttf"
);

// ==========================================
// HELPERS
// ==========================================

const normalizeType = (saleData = {}) => {
  return String(
    saleData.gender ||
      saleData.customerType ||
      saleData.customerGender ||
      ""
  )
    .trim()
    .toLowerCase();
};

const formatInvoiceDate = (value) => {
  if (!value) {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const money = (value) => {
  return `₹ ${Number(value || 0).toFixed(2)}`;
};

// ==========================================
// GENERATE SALE PDF
//
// SHOP FORMAT:
//
// Qty | Product Name | HSN | Batch | Exp |
// MRP | Dis | Rate | Amount
//
// NORMAL FORMAT:
//
// Sl No. | Product Name | HSN | Batch |
// Qty | Exp | MRP | Amount
// ==========================================

const generateSalePDF = (saleData, items = []) => {
  return new Promise((resolve, reject) => {
    try {
      // ==========================================
      // OUTPUT DIRECTORY
      // ==========================================

      const outputDir = "D:\\Mongodb_Siddheswari\\Invoices";

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {
          recursive: true,
        });
      }

      const safeSaleId = (
        saleData.saleId || "INVOICE"
      ).replace(/[/\\?%*:|"<>]/g, "_");

      const filePath = path.join(
        outputDir,
        `${safeSaleId}.pdf`
      );

      // ==========================================
      // PDF DOCUMENT
      // ==========================================

      const doc = new PDFDocument({
        size: "A4",
        margin: 30,
      });

      const writeStream =
        fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // ==========================================
      // FONTS
      // ==========================================

      const fontRegular = fs.existsSync(
        robotoRegularPath
      )
        ? robotoRegularPath
        : "Helvetica";

      const fontBold = fs.existsSync(
        robotoBoldPath
      )
        ? robotoBoldPath
        : "Helvetica-Bold";

      const startX = 30;
      const startY = 30;
      const width = 535;
      const height = 780;

      // ==========================================
      // WATERMARK
      // ==========================================

      const watermarkPath = path.resolve(
        __dirname,
        "../../frontend/public/logo.png"
      );

      if (fs.existsSync(watermarkPath)) {
        doc.save();

        doc.opacity(0.12);

        const wmWidth = 320;
        const wmX = (595 - wmWidth) / 2;
        const wmY = (842 - wmWidth) / 2;

        doc.image(
          watermarkPath,
          wmX,
          wmY,
          {
            width: wmWidth,
          }
        );

        doc.restore();
      }

      let currentY = startY + 10;

      // ==========================================
      // CUSTOMER TYPE
      // ==========================================

      const customerType =
        normalizeType(saleData);

      const isShop =
        customerType === "shop";

      // ==========================================
      // HEADER
      // ==========================================

      const deltasLogoPath = path.resolve(
        __dirname,
        "../../frontend/public/deltas.png"
      );

      if (fs.existsSync(deltasLogoPath)) {
        doc.image(
          deltasLogoPath,
          startX,
          currentY + 2,
          {
            width: 82,
          }
        );
      }

      if (fs.existsSync(jimNightshadeFontPath)) {
        doc.font(jimNightshadeFontPath);
      } else {
        doc.font("Times-Italic");
      }

      doc
        .fontSize(28)
        .fillColor("#042f4b")
        .text(
          "Siddheswari Ayurveda",
          startX + 105,
          currentY + 6,
          {
            align: "center",
            width: 310,
          }
        );

      // ==========================================
      // SALE INVOICE TITLE
      // ==========================================

      doc
        .font(fontBold)
        .fontSize(12)
        .fillColor("#0f172a")
        .text(
          "SALE INVOICE",
          startX,
          currentY + 44,
          {
            align: "center",
            width,
          }
        );

      currentY += 70;

      // ==========================================
      // CUSTOMER + QR + INVOICE INFORMATION
      // ==========================================

      const customerName =
          saleData.customerName ||
          saleData.customer ||
          "Walk-in Customer";

      const customerPhone =
          saleData.customerPhone ||
          saleData.mobile ||
          saleData.phone ||
          "N/A";

      const customerAddress =
          saleData.address ||
          saleData.customerAddress ||
          saleData.city ||
          "N/A";

      const invoiceNumber =
          saleData.saleId || "N/A";

      const invoiceDate =
          formatInvoiceDate(
              saleData.date ||
              saleData.createdAt
          );


      // ------------------------------------------
      // BOX DIMENSIONS
      // ------------------------------------------

      const infoBoxX = startX;
      const infoBoxY = currentY;

      const infoBoxW = width;
      const infoBoxH = 86;

      // Three columns
      const leftColW = 210;
      const middleColW = 130;
      const rightColW = infoBoxW - leftColW - middleColW;


      // ------------------------------------------
      // OUTER BOX
      // ------------------------------------------

      doc
          .roundedRect(
              infoBoxX,
              infoBoxY,
              infoBoxW,
              infoBoxH,
              5
          )
          .lineWidth(1)
          .stroke("#64748b");


      // ------------------------------------------
      // VERTICAL COLUMN LINES
      // ------------------------------------------

      doc
          .moveTo(
              infoBoxX + leftColW,
              infoBoxY
          )
          .lineTo(
              infoBoxX + leftColW,
              infoBoxY + infoBoxH
          )
          .stroke("#cbd5e1");

      doc
          .moveTo(
              infoBoxX + leftColW + middleColW,
              infoBoxY
          )
          .lineTo(
              infoBoxX + leftColW + middleColW,
              infoBoxY + infoBoxH
          )
          .stroke("#cbd5e1");


      // ==========================================
      // LEFT COLUMN
      // CUSTOMER DETAILS
      // ==========================================

      const leftX = infoBoxX + 12;

      doc
          .font(fontBold)
          .fontSize(9)
          .fillColor("#1e293b")
          .text(
              "Customer Name:",
              leftX,
              infoBoxY + 10
          );

      doc
          .font(fontRegular)
          .fontSize(9)
          .text(
              customerName,
              leftX + 80,
              infoBoxY + 10,
              {
                  width: leftColW - 92,
              }
          );

      doc
          .font(fontBold)
          .fontSize(9)
          .text(
              "Phone No:",
              leftX,
              infoBoxY + 28
          );

      doc
          .font(fontRegular)
          .fontSize(9)
          .text(
              customerPhone,
              leftX + 80,
              infoBoxY + 28,
              {
                  width: leftColW - 92,
              }
          );

      doc
          .font(fontBold)
          .fontSize(9)
          .text(
              "Add:",
              leftX,
              infoBoxY + 46
          );

      doc
          .font(fontRegular)
          .fontSize(8)
          .text(
              customerAddress,
              leftX + 80,
              infoBoxY + 46,
              {
                  width: leftColW - 92,
                  height: 10,
              }
          );


      // ==========================================
      // MIDDLE COLUMN
      // PAYMENT QR CODE
      // ==========================================

      const qrCenterX =
          infoBoxX +
          leftColW +
          middleColW / 2;

      doc
          .font(fontBold)
          .fontSize(8)
          .fillColor("#475569")
          .text(
              "SCAN TO PAY",
              infoBoxX + leftColW,
              infoBoxY + 7,
              {
                  width: middleColW,
                  align: "center",
              }
          );


      // ------------------------------------------
      // QR CODE
      // ------------------------------------------

      const qrCandidatePaths = [
          path.resolve(
              __dirname,
              "../../frontend/public/QR.jpeg"
          )
      ];

      const qrCodePath = qrCandidatePaths.find((candidate) =>
          fs.existsSync(candidate)
      );

      const qrSize = 55;

      if (qrCodePath) {
          doc.image(
              qrCodePath,
              qrCenterX - qrSize / 2,
              infoBoxY + 19,
              {
                  fit: [qrSize, qrSize],
                  align: "center",
                  valign: "center",
              }
          );
      } else {
          doc
              .rect(
                  qrCenterX - qrSize / 2,
                  infoBoxY + 25,
                  qrSize,
                  qrSize
              )
              .lineWidth(1)
              .stroke("#94a3b8");

          doc
              .font(fontRegular)
              .fontSize(7)
              .fillColor("#64748b")
              .text(
                  "QR CODE",
                  qrCenterX - 25,
                  infoBoxY + 47,
                  {
                      width: 50,
                      align: "center",
                  }
              );
      }


      // ==========================================
      // RIGHT COLUMN
      // INVOICE INFORMATION
      // ==========================================

      const rightX =
          infoBoxX +
          leftColW +
          middleColW +
          12;

      doc
          .font(fontBold)
          .fontSize(9)
          .fillColor("#1e293b")
          .text(
              "Invoice No.:",
              rightX,
              infoBoxY + 14
          );

      doc
          .font(fontRegular)
          .fontSize(9)
          .text(
              invoiceNumber,
              rightX + 70,
              infoBoxY + 14,
              {
                  width: rightColW - 82,
              }
          );

      doc
          .font(fontBold)
          .fontSize(9)
          .text(
              "Date:",
              rightX,
              infoBoxY + 34
          );

      doc
          .font(fontRegular)
          .fontSize(9)
          .text(
              invoiceDate,
              rightX + 70,
              infoBoxY + 34,
              {
                  width: rightColW - 82,
              }
          );


      // Move below information box
      currentY = infoBoxY + infoBoxH + 18;

      // ==========================================
      // TABLE COLUMNS
      // ==========================================

      let cols;

      // ==========================================
      // SHOP INVOICE
      // ==========================================

      if (isShop) {
        cols = [
          {
            name: "Sl No.",
            x: startX + 3,
            w: 28,
            align: "center",
          },
          {
            name: "Qty",
            x: startX + 28,
            w: 28,
            align: "center",
          },
          {
            name: "Product Name",
            x: startX + 60,
            w: 140,
            align: "left",
          },
          {
            name: "HSN",
            x: startX + 195,
            w: 45,
            align: "center",
          },
          {
            name: "Batch",
            x: startX + 248,
            w: 55,
            align: "center",
          },
          {
            name: "Exp",
            x: startX + 300,
            w: 45,
            align: "center",
          },
          {
            name: "MRP",
            x: startX + 340,
            w: 52,
            align: "center",
          },
          {
            name: "Dis",
            x: startX + 385,
            w: 42,
            align: "center",
          },
          {
            name: "Rate",
            x: startX + 420,
            w: 58,
            align: "center",
          },
          {
            name: "Amount",
            x: startX + 460,
            w: 78,
            align: "center",
          },
        ];
      }

      // ==========================================
      // NORMAL CUSTOMER INVOICE
      // ==========================================

      else {
        cols = [
          {
            name: "Sl No.",
            x: startX + 3,
            w: 35,
            align: "center",
          },
          {
            name: "Product Name",
            x: startX + 38,
            w: 140,
            align: "left",
          },
          {
            name: "HSN",
            x: startX + 178,
            w: 45,
            align: "center",
          },
          {
            name: "Batch",
            x: startX + 223,
            w: 60,
            align: "center",
          },
          {
            name: "Qty",
            x: startX + 283,
            w: 38,
            align: "center",
          },
          {
            name: "Exp",
            x: startX + 321,
            w: 48,
            align: "center",
          },
          {
            name: "MRP",
            x: startX + 369,
            w: 58,
            align: "center",
          },
          {
            name: "Amount",
            x: startX + 427,
            w: 108,
            align: "center",
          },
        ];
      }

      // ==========================================
      // TABLE HEADER
      // ==========================================

      doc
        .rect(
          startX,
          currentY,
          width,
          22
        )
        .fill("#e2e8f0");

      cols.forEach((col) => {
        doc
          .font(fontBold)
          .fontSize(isShop ? 7.5 : 8)
          .fillColor("#0f172a")
          .text(
            col.name,
            col.x,
            currentY + 6,
            {
              width: col.w,
              align: col.align,
            }
          );
      });

      currentY += 25;

      doc
        .moveTo(startX, currentY)
        .lineTo(
          startX + width,
          currentY
        )
        .stroke("#cbd5e1");

      currentY += 6;

      // ==========================================
      // ITEMS
      // ==========================================

      let subTotal = 0;
      let totalDiscount = 0;
      let totalQty = 0;

      const itemList =
        items && items.length > 0
          ? items
          : saleData.items || [];

      itemList.forEach(
        (item, index) => {
          const qty = Number(
            item.qty || 0
          );

          const mrp = Number(
            item.mrp ||
              item.rate ||
              0
          );

          const discount = Number(
            item.discount || 0
          );

          const itemSubtotal =
            qty * mrp;

          const discountAmount =
            (itemSubtotal *
              discount) /
            100;

          const rate =
            mrp -
            (mrp * discount) / 100;

          // ======================================
          // SHOP AMOUNT
          // ======================================

          const lineAmount = qty * rate;

          subTotal += itemSubtotal;

          totalDiscount +=
            discountAmount;

          totalQty += qty;

          // ======================================
          // ROW
          // ======================================

          doc
            .font(fontRegular)
            .fontSize(8)
            .fillColor("#334155");

          if (isShop) {

            // ======================================
            // Sl No.
            // ======================================

            doc.text(
                String(index + 1),
                cols[0].x,
                currentY,
                {
                    width: cols[0].w,
                    align: cols[0].align,
                }
            );


            // ======================================
            // Qty
            // ======================================

            doc.text(
                String(qty),
                cols[1].x,
                currentY,
                {
                    width: cols[1].w,
                    align: cols[1].align,
                }
            );


            // ======================================
            // Product Name
            // ======================================

            doc.text(
                item.productName || "Product",
                cols[2].x,
                currentY,
                {
                    width: cols[2].w,
                    align: cols[2].align,
                }
            );


            // ======================================
            // HSN
            // ======================================

            doc.text(
                item.hsn ||
                    item.hsnCode ||
                    "-",
                cols[3].x,
                currentY,
                {
                    width: cols[3].w,
                    align: cols[3].align,
                }
            );


            // ======================================
            // Batch
            // ======================================

            doc.text(
                item.batch || "-",
                cols[4].x,
                currentY,
                {
                    width: cols[4].w,
                    align: cols[4].align,
                }
            );


            // ======================================
            // Exp
            // ======================================

            doc.text(
                item.expiry || "-",
                cols[5].x,
                currentY,
                {
                    width: cols[5].w,
                    align: cols[5].align,
                }
            );


            // ======================================
            // MRP
            // ======================================

            doc.text(
                money(mrp),
                cols[6].x,
                currentY,
                {
                    width: cols[6].w,
                    align: cols[6].align,
                }
            );


            // ======================================
            // Discount
            // ======================================

            doc.text(
                `${discount}%`,
                cols[7].x,
                currentY,
                {
                    width: cols[7].w,
                    align: cols[7].align,
                }
            );


            // ======================================
            // Rate
            // ======================================

            doc.text(
                money(rate),
                cols[8].x,
                currentY,
                {
                    width: cols[8].w,
                    align: cols[8].align,
                }
            );


            // ======================================
            // Amount
            // ======================================

            doc.text(
                money(lineAmount),
                cols[9].x,
                currentY,
                {
                    width: cols[9].w,
                    align: cols[9].align,
                }
            );

        } else {
            // Sl No.
            doc.text(
              String(index + 1),
              cols[0].x,
              currentY,
              {
                width: cols[0].w,
                align: cols[0].align,
              }
            );

            // Product
            doc.text(
              item.productName ||
                "Product",
              cols[1].x,
              currentY,
              {
                width: cols[1].w,
                align: cols[1].align,
              }
            );

            // HSN
            doc.text(
              item.hsn ||
                item.hsnCode ||
                "-",
              cols[2].x,
              currentY,
              {
                width: cols[2].w,
                align: cols[2].align,
              }
            );

            // Batch
            doc.text(
              item.batch || "-",
              cols[3].x,
              currentY,
              {
                width: cols[3].w,
                align: cols[3].align,
              }
            );

            // Qty
            doc.text(
              String(qty),
              cols[4].x,
              currentY,
              {
                width: cols[4].w,
                align: cols[4].align,
              }
            );

            // Exp
            doc.text(
              item.expiry || "-",
              cols[5].x,
              currentY,
              {
                width: cols[5].w,
                align: cols[5].align,
              }
            );

            // MRP
            doc.text(
              money(mrp),
              cols[6].x,
              currentY,
              {
                width: cols[6].w,
                align: cols[6].align,
              }
            );

            // Amount
            doc.text(
              money(lineAmount),
              cols[7].x,
              currentY,
              {
                width: cols[7].w,
                align: cols[7].align,
              }
            );
          }

          // Row separator
          doc
            .moveTo(
              startX,
              currentY + 17
            )
            .lineTo(
              startX + width,
              currentY + 17
            )
            .stroke("#e2e8f0");

          currentY += 20;
        }
      );

      // ==========================================
      // KEEP SUMMARY AT LOWER POSITION
      // ==========================================

      if (
        currentY <
        startY + 460
      ) {
        currentY =
          startY + 460;
      }

      doc
        .moveTo(
          startX,
          currentY
        )
        .lineTo(
          startX + width,
          currentY
        )
        .stroke("#cbd5e1");

      currentY += 12;

      // ==========================================
      // TOTALS
      // ==========================================

      const calculatedSubTotal =
        subTotal;

      const calculatedDiscount =
        totalDiscount;

      const rawGrandTotal =
        calculatedSubTotal -
        calculatedDiscount;

      const roundedGrandTotal =
        saleData.netAmount !==
        undefined
          ? Math.round(
              Number(
                saleData.netAmount
              )
            )
          : Math.round(
              rawGrandTotal
            );

      const roundOffAmount =
        saleData.roundOff !==
        undefined
          ? Number(
              saleData.roundOff
            )
          : Number(
              (
                roundedGrandTotal -
                rawGrandTotal
              ).toFixed(2)
            );

      const summaryXLabel =
        startX + 320;

      const summaryXVal =
        startX + 440;

      const summaryW = 90;

      // ==========================================
      // SUBTOTAL
      // ==========================================

      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#475569")
        .text(
          "Subtotal",
          summaryXLabel,
          currentY,
          {
            width: 110,
          }
        )
        .text(
          money(
            calculatedSubTotal
          ),
          summaryXVal,
          currentY,
          {
            width: summaryW,
            align: "right",
          }
        );

      currentY += 16;

      // ==========================================
      // DISCOUNT
      // ==========================================

      doc
        .text(
          "Discount",
          summaryXLabel,
          currentY,
          {
            width: 110,
          }
        )
        .text(
          money(
            calculatedDiscount
          ),
          summaryXVal,
          currentY,
          {
            width: summaryW,
            align: "right",
          }
        );

      currentY += 16;

      // ==========================================
      // GRAND TOTAL
      // ==========================================

      doc
        .text(
          "Grand Total",
          summaryXLabel,
          currentY,
          {
            width: 110,
          }
        )
        .text(
          money(rawGrandTotal),
          summaryXVal,
          currentY,
          {
            width: summaryW,
            align: "right",
          }
        );

      currentY += 16;

      // ==========================================
      // ROUND OFF
      // ==========================================

      const roundOffSign =
        roundOffAmount > 0.001
          ? "+"
          : "";

      doc
        .text(
          "Round Off",
          summaryXLabel,
          currentY,
          {
            width: 110,
          }
        )
        .text(
          `${roundOffSign}${roundOffAmount.toFixed(
            2
          )}`,
          summaryXVal,
          currentY,
          {
            width: summaryW,
            align: "right",
          }
        );

      currentY += 22;

      // ==========================================
      // NET AMOUNT
      // ==========================================

      doc
        .rect(
          summaryXLabel - 10,
          currentY - 4,
          230,
          24
        )
        .fill("#f8fafc")
        .stroke("#cbd5e1");

      doc
        .font(fontBold)
        .fontSize(11)
        .fillColor("#14532d")
        .text(
          "Net Amount",
          summaryXLabel,
          currentY,
          {
            width: 110,
          }
        )
        .text(
          money(
            roundedGrandTotal
          ),
          summaryXVal,
          currentY,
          {
            width: summaryW,
            align: "right",
          }
        );

      currentY += 30;

      // ==========================================
      // TOTAL QUANTITY
      // ==========================================

      doc
        .font(fontBold)
        .fontSize(9)
        .fillColor("#475569")
        .text(
          `Total Qty : ${totalQty}`,
          startX,
          currentY
        );

      currentY += 20;

      // ==========================================
      // SIGNATURE
      // ==========================================

      doc
        .moveTo(
          startX,
          currentY
        )
        .lineTo(
          startX + width,
          currentY
        )
        .stroke("#e2e8f0");

      currentY += 45;

      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#334155")
        .text(
          "_________________________",
          startX + 350,
          currentY,
          {
            align: "center",
            width: 170,
          }
        )
        .font(fontBold)
        .text(
          "Authorized Signature",
          startX + 350,
          currentY + 15,
          {
            align: "center",
            width: 170,
          }
        );

      // ==========================================
      // FOOTER
      // ==========================================

      const footerY =
        startY + height - 25;

      doc
        .moveTo(
          startX,
          footerY - 10
        )
        .lineTo(
          startX + width,
          footerY - 10
        )
        .stroke("#cbd5e1");

      doc
        .font(fontBold)
        .fontSize(10)
        .fillColor("#16a34a")
        .text(
          "PURE  •  NATURAL  •  TRUSTED",
          startX,
          footerY,
          {
            align: "center",
            width,
          }
        );

      // ==========================================
      // FINISH PDF
      // ==========================================

      doc.end();

      writeStream.on(
        "finish",
        () => {
          resolve(filePath);
        }
      );

      writeStream.on(
        "error",
        (error) => {
          reject(error);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateSalePDF,
};