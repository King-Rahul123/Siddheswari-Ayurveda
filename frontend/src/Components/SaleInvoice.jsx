import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Card.css";
import "../CSS/SaleInvoice.css";

export default function SaleInvoice() {

  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleEnterKey = (e) => {
    if (e.key === "+" || e.code === "NumpadAdd") {
      e.preventDefault();
      addRow();

      setTimeout(() => {
        const rows = invoiceRef.current?.querySelectorAll(
          "tbody tr input:first-child"
        );

        rows?.[rows.length - 1]?.focus();
      }, 50);
    }
    const form = e.currentTarget;

    const elements = Array.from(
      form.querySelectorAll(
        "input, select, textarea, button"
      )
    ).filter(
      (el) =>
        !el.disabled &&
        el.type !== "hidden" &&
        !el.readOnly
    );

    const currentIndex = elements.indexOf(
      document.activeElement
    );

    // Enter → Next Field
    if (e.key === "Enter") {
      e.preventDefault();

      if (
        currentIndex > -1 &&
        currentIndex < elements.length - 1
      ) {
        elements[currentIndex + 1].focus();
      }
    }

    // Backspace on empty field → Previous Field
    if (
      e.key === "Backspace" &&
      e.target.value === ""
    ) {
      e.preventDefault();

      if (currentIndex > 0) {
        elements[currentIndex - 1].focus();
      }
    }
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const saveInvoice = () => {
    try {
      const year = new Date().getFullYear();

      const savedYear = localStorage.getItem("billYear");

      let billCount = parseInt(
        localStorage.getItem("billCount") || "0",
        10
      );

      if (savedYear !== String(year)) {
        billCount = 0;
      }

      billCount++;

      localStorage.setItem("billYear", year);
      localStorage.setItem("billCount", billCount);

      const finalBillNo =
        `SDA${year}${String(billCount).padStart(4, "0")}`;

      // Save invoice data here

      setToast({
        show: true,
        message: `Invoice ${finalBillNo} saved successfully`,
        type: "success",
      });

      // Generate next bill number
      setBillNumber(
        `SDA${year}${String(billCount + 1).padStart(4, "0")}`
      );

      // Clear toast after 3 sec
      setTimeout(() => {
        setToast({
          show: false,
          message: "",
          type: "",
        });
      }, 3000);

    } catch (err) {
      console.error(err);

      setToast({
        show: true,
        message: "Failed to save invoice",
        type: "error",
      });

      setTimeout(() => {
        setToast({
          show: false,
          message: "",
          type: "",
        });
      }, 3000);
    }
  };

  const invoiceRef = useRef(null);

  //Generate Bill Number based on the current year and a counter stored in localStorage
  const [billNumber, setBillNumber] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const year = new Date().getFullYear();

    const savedYear = localStorage.getItem("billYear");
    let billCount = parseInt(
      localStorage.getItem("billCount") || "0",
      10
    );

    if (savedYear !== String(year)) {
      billCount = 0;
    }

    setBillNumber(
      `SDA-${year}-${String(billCount + 1).padStart(4, "0")}`
    );
  }, []);

  const [items, setItems] = useState([
    {
      product: "",
      batch: "",
      qty: "",
      mrp: "",
      rate: "",
      expiry: "",
      discount: "",
      gst: "",
    },
  ]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        product: "",
        batch: "",
        qty: "",
        mrp: "",
        rate: "",
        expiry: "",
        discount: "",
        gst: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const subTotal = items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  const discount = subTotal > 1000 ? subTotal * 0.1 : 0;

  const gstAmount = items.reduce(
    (sum, item) =>
      sum + (item.qty * item.rate * item.gst) / 100,
    0
  );

  const netAmount = subTotal + gstAmount;
  
  const handlePrint = () => {
    const currentBillNo = billNumber;
    saveInvoice();

    navigate("/print-invoice", {
      state: {
        billNumber: currentBillNo,
        invoiceDate,
        customerName,
        mobile,
        items,
        subTotal,
        discount,
        gstAmount,
        netAmount,
      },
    });
  };

  const deleteRow = (index) => {
    if (items.length === 1) return; // Keep at least one row

    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        {/* <Header /> */}

        <main className="dashboard-content">
          {toast.show && (
            <div
              className={`invoice-toast ${
                toast.type === "error" ? "error" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <i
                  className={`bi ${
                    toast.type === "error"
                      ? "bi-exclamation-circle-fill"
                      : "bi-check-circle-fill"
                  }`}
                ></i>

                <span>{toast.message}</span>
              </div>
            </div>
          )}

          <div className="invoice-header">
            <div className="flex items-center gap-3">
              <i className="bi bi-arrow-left bg-gray-500 py-1 px-2 text-white rounded-lg" onClick={() => window.history.back()}></i>
              <h2>Sales Invoice</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="print-btn" onClick={handlePrint}>Save & Print</button>
              <button type="button" className="save-btn" onClick={saveInvoice}>Save</button>
            </div>
          </div>

          <form ref={invoiceRef} className="invoice-card" onKeyDown={handleEnterKey}>
            <div className="invoice-info">
              <input type="text" placeholder="Bill Number" value={billNumber} readOnly />
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}/>
              <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}/>
              <input type="text" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)}/>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Sl No.</th>
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Expiry</th>
                  <th>Dis. %</th>
                  <th>GST %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={item.product}
                        placeholder="Product Name"
                        onChange={(e) =>
                          updateItem( index, "product", e.target.value )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={item.batch}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "batch",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.mrp}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "mrp",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem( index, "rate", Number(e.target.value) )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        maxLength={7}
                        value={item.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 6) value = value.slice(0, 6);
                          if (value.length > 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2);
                          }
                          updateItem(index, "expiry", value);
                        }}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem( index, "discount", Number(e.target.value) )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.gst}
                        onChange={(e) =>
                          updateItem( index, "gst", Number(e.target.value) )
                        }
                      />
                    </td>

                    <td className="amount-cell">
                      <div className="amount-wrapper">
                        <span className="amount-value">₹{(Number(item.qty || 0) * Number(item.rate || 0)).toFixed(2)}</span>
                        <button type="button" className="delete-row-btn" onClick={() => deleteRow(index)} title="Delete Row">&times;</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="add-row-btn" onClick={addRow}>+ Add Product</button>
            <div className="invoice-summary">
              <h4>Subtotal : ₹{subTotal.toFixed(2)}</h4>
              <h4>Discount : ₹{discount.toFixed(2)}</h4>
              <h4>GST : ₹{gstAmount.toFixed(2)}</h4>
              <h3>Net Amount : ₹{netAmount.toFixed(2)}</h3>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}