import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../CSS/PrintFormate.css";

export default function PrintInvoice() {
  const { state } = useLocation();

  const {
    billNumber,
    invoiceDate,
    customerName,
    mobile,
    items = [],
    subTotal = 0,
    discount = 0,
    gstAmount = 0,
    netAmount = 0,
  } = state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-page-wrapper">
      <div className="print-card">
        {/* Background Light Logo Watermark */}
        <div className="watermark-overlay">
          <img src="/logo.png" alt="Siddheswari Logo Watermark" className="watermark-img" />
        </div>

        {/* Header Bar */}
        <div className="print-header-bar">
          <div className="header-brand">
            <img src="/deltas.png" alt="Deltas Logo" className="brand-logo-img" />
            <div className="counter-brand-text">
              <span>Siddheswari Ayurveda</span>
            </div>
          </div>

          <div className="header-meta">
            <p><strong>Invoice No:</strong> {billNumber || "N/A"}</p>
            <p><strong>Date:</strong> {invoiceDate || new Date().toISOString().split("T")[0]}</p>
          </div>
        </div>

        <div className="divider-line" />

        {/* Title Banner */}
        <div className="invoice-title-banner">
          <h3>TAX INVOICE / SALES INVOICE</h3>
        </div>

        <div className="divider-line" />

        {/* Customer Information */}
        <div className="customer-info-box">
          <p><strong>Customer Name :</strong> {customerName || "Walk-in Customer"}</p>
          <p><strong>Mobile :</strong> {mobile || "N/A"}</p>
        </div>

        <div className="divider-line" />

        {/* Products Table */}
        <table className="printable-table">
          <thead>
            <tr>
              <th style={{ width: "35px" }}>Sl</th>
              <th>Product</th>
              <th style={{ width: "75px" }}>Batch</th>
              <th style={{ width: "65px" }}>Exp</th>
              <th style={{ width: "45px" }}>Qty</th>
              <th style={{ width: "70px", textAlign: "right" }}>Rate</th>
              <th style={{ width: "55px", textAlign: "right" }}>Disc</th>
              <th style={{ width: "55px", textAlign: "right" }}>GST</th>
              <th style={{ width: "85px", textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = Number(item.qty || 0);
              const rate = Number(item.rate || 0);
              const disc = Number(item.discount || 0);
              const gst = Number(item.gst || 0);
              const itemSub = qty * rate;
              const discAmt = (itemSub * disc) / 100;
              const afterDisc = itemSub - discAmt;
              const gstAmt = (afterDisc * gst) / 100;
              const amount = Number(item.amount || (afterDisc + gstAmt));

              return (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.productName || item.product || "Product"}</td>
                  <td style={{ textAlign: "center" }}>{item.batch || "-"}</td>
                  <td style={{ textAlign: "center" }}>{item.expiry || "-"}</td>
                  <td style={{ textAlign: "center" }}>{qty}</td>
                  <td style={{ textAlign: "right" }}>₹{rate.toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>{disc}%</td>
                  <td style={{ textAlign: "right" }}>{gst}%</td>
                  <td style={{ textAlign: "right" }}>₹{amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="divider-line" />

        {/* Summary Block */}
        <div className="invoice-summary-block">
          <div className="summary-col">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{Number(subTotal).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <strong>₹{Number(discount).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>GST</span>
              <strong>₹{Number(gstAmount).toFixed(2)}</strong>
            </div>
            <div className="summary-row grand-total-row">
              <span>Grand Total</span>
              <strong>₹{Number(netAmount).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="divider-line" />

        {/* Signature Section */}
        <div className="signature-area">
          <div className="seller-signature-box">
            <div className="sig-line" />
            <p>Seller Signature</p>
          </div>
        </div>

        <div className="divider-line" />

        {/* Tagline Footer */}
        <div className="print-footer-tagline">
          <span>PURE • NATURAL • TRUSTED</span>
        </div>
      </div>
    </div>
  );
}