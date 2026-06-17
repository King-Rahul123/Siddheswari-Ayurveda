import { useState } from "react";
// import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/SaleInvoice.css";

export default function SaleInvoice() {
    const [billNumber] = useState(() => {
        return `INV${new Date().getFullYear()}${Math.floor(
            1000 + Math.random() * 9000
        )}`;
    });

  const [items, setItems] = useState([
    {
      product: "",
      qty: 1,
      rate: 0,
      gst: 5,
    },
  ]);

  const addRow = () => {
    setItems([
      ...items,
      {
        product: "",
        qty: 1,
        rate: 0,
        gst: 5,
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

  const gstAmount = items.reduce(
    (sum, item) =>
      sum + (item.qty * item.rate * item.gst) / 100,
    0
  );

  const netAmount = subTotal + gstAmount;

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        {/* <Header /> */}

        <main className="dashboard-content">

          <div className="invoice-header">
            <div className="flex items-center gap-3">
                <i className="bi bi-arrow-left bg-gray-500 py-1 px-2 text-white rounded-lg" onClick={() => window.history.back()}></i>
                <h2>Sales Invoice</h2>
            </div>

            <button className="save-btn">Save Invoice</button>
          </div>

          <div className="invoice-card">

            <div className="invoice-info">

              <input
                type="text"
                placeholder="Bill Number"
                value={billNumber}
                readOnly
              />

              <input type="date" />

              <input
                type="text"
                placeholder="Customer Name"
              />

              <input
                type="text"
                placeholder="Mobile Number"
              />

            </div>

            <table className="invoice-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>

                {items.map((item, index) => (
                  <tr key={index}>

                    <td>
                      <input
                        value={item.product}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "product",
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
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={item.gst}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "gst",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      ₹{item.qty * item.rate}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            <button
              className="add-row-btn"
              onClick={addRow}
            >
              + Add Product
            </button>

            <div className="invoice-summary">

              <h4>Subtotal : ₹{subTotal}</h4>

              <h4>GST : ₹{gstAmount.toFixed(2)}</h4>

              <h3>Net Amount : ₹{netAmount.toFixed(2)}</h3>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}