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
    items,
    subTotal,
    discount,
    gstAmount,
    netAmount,
  } = state || {};

  useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div className="print-container">
      <div className="invoice-header-print">
        <h1>SIDDHESWARI AYURVEDA</h1>
        <p>Kushpata (Near Baro Haat Kali Mandir), Ghatal, Paschim Medinipur</p>
        <p>Mobile: +91 8145322318</p>
      </div>

      <h2 className="text-black text-center underline">Sales Invoice</h2>

      <div className="invoice-details">
        <div>
          <strong>Invoice No:</strong> {billNumber}
        </div>

        <div>
          <strong>Date:</strong> {invoiceDate}
        </div>
      </div>

      <div className="customer-details">
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Mobile:</strong> {mobile}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th className="w-12">Sl.</th>
            <th className="w-50">Product</th>
            <th className="w-24">Batch</th>
            <th className="w-16">Qty</th>
            <th className="w-24">MRP</th>
            <th className="w-24">Rate</th>
            <th className="w-24">GST%</th>
            <th className="w-24">Total</th>
          </tr>
        </thead>

        <tbody>
          {items?.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.product}</td>
              <td>{item.batch}</td>
              <td>{item.qty}</td>
              <td>{item.mrp}</td>
              <td>{item.rate}</td>
              <td>{item.gst}</td>
              <td>
                ₹
                {(
                  item.qty * item.rate
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-total">
        <p>Subtotal : ₹{subTotal?.toFixed(2)}</p>
        <p>Discount : ₹{discount?.toFixed(2)}</p>
        <p>GST : ₹{gstAmount?.toFixed(2)}</p>

        <h2>Net Amount : ₹{netAmount?.toFixed(2)}</h2>
      </div>

      <div className="signature-section">
        <div>
          ____________________
          <br />
          Customer Signature
        </div>

        <div>
          ____________________
          <br />
          Authorized Signature
        </div>
      </div>
    </div>
  );
}