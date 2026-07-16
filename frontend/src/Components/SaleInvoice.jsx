import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../Components/Header";
import Sidebar from "./Sidebar";
import "../CSS/Card.css";
import "../CSS/SaleInvoice.css";
import CustomerList from "../Popup/CustomerList";
import ProductList from "../Popup/ProductList";
import { addSale, getNextSaleId, getCurrentSaleId } from "../services/saleService";

export default function SaleInvoice() {

  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
      customerCode: "",
      customerName: "",
      phone: "",
  });

  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

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

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
  );

  const saveInvoice = async () => {
    try {
      const validItems = items.filter(
        (item) => item.productName.trim() !== ""
      );

      const totalQty = validItems.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0
      );

      const generatedSaleId = await getNextSaleId();

      const saleData = {
        saleId: generatedSaleId,
        customerCode: customer.customerCode,
        customerName: customer.customerName,
        date: invoiceDate,
        totalQty,
        totalAmount: netAmount,
        createdBy: loggedInUser.username,
      };

      await addSale(saleData, validItems);

      const nextDisplayId = await getCurrentSaleId();
      setSaleId(nextDisplayId);

      // Clear customer
      setCustomer({
        customerCode: "",
        customerName: "",
        phone: "",
      });

      // Clear items
      setItems([
        {
          itemCode: "",
          productName: "",
          batch: "",
          expiry: "",
          qty: 0,
          mrp: 0,
          rate: 0,
          discount: 0,
          gst: 0,
          amount: 0,
        },
      ]);

      setToast({
        show: true,
        message: `${saleId} saved successfully`,
        type: "success",
      });
    } catch (err) {
      console.error(err);

      setToast({
        show: true,
        message: "Failed to save invoice",
        type: "error",
      });
    }
  };

  const firstProductRef = useRef(null);
  const invoiceRef = useRef(null);
  const lastFocusedElement = useRef(null);

  //Generate Bill Number based on the current year and a counter stored in localStorage
  const [saleId, setSaleId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    async function loadBillNo() {
    const id = await getCurrentSaleId();
      setSaleId(id);
    }
    loadBillNo();
  }, []);

  const [items, setItems] = useState([
    {
      itemCode:"",
      productName:"",
      batch:"",
      expiry:"",
      qty:0,
      mrp:0,
      rate:0,
      discount:0,
      gst:0,
      amount:0,
  }
  ]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        itemCode: "",
        productName: "",
        batch: "",
        expiry: "",
        qty: "",
        mrp: "",
        rate: "",
        discount: "",
        gst: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    updated[index].amount =
      Number(updated[index].qty || 0) *
      Number(updated[index].rate || 0);
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
    const currentBillNo = saleId;
    saveInvoice();

    navigate("/print-invoice", {
      state: {
        billNumber: currentBillNo,
        invoiceDate,
        customerName: customer.customerName,
        mobile: customer.phone,
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
              <input 
                type="text" 
                placeholder="Sale ID" 
                value={saleId} 
                readOnly
              />

              <input 
                autoFocus 
                type="date" 
                value={invoiceDate} 
                onChange={(e) => setInvoiceDate(e.target.value)}
              />

              <input
                  type="text"
                  placeholder="Customer Name"
                  value={customer.customerName}
                  onKeyDown={(e)=>{
                      if(e.key==="Enter"){
                        e.preventDefault();
                        e.stopPropagation();
                        lastFocusedElement.current = e.target;
                        setShowCustomerPopup(true);
                      }
                  }}
              />

              <input 
                type="text" 
                placeholder="Mobile Number" 
                value={customer.phone} 
                onChange={(e) => 
                  setCustomer({ ...customer, phone: e.target.value })} 
                readOnly
              />
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
                        ref={index===0 ? firstProductRef : null}
                        type="text"
                        value={item.productName}
                        placeholder="Product Name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            lastFocusedElement.current = e.target;
                            setSelectedRow(index);
                            setShowProductPopup(true);
                          }
                        }}
                        onChange={(e) =>
                          updateItem( index, "productName", e.target.value )
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
                        <span className="amount-value">₹{Number(item.amount).toFixed(2)}</span>
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

        {showCustomerPopup && (
          <CustomerList
            show={showCustomerPopup}
            onClose={() => {
              setShowCustomerPopup(false);
              setTimeout(() => {
                lastFocusedElement.current?.focus();
              }, 50);
            }}
            onSelect={(customerData)=>{
                setCustomer({
                    customerCode:customerData.customerCode,
                    customerName:customerData.name,
                    phone:customerData.phone,
                });
                setShowCustomerPopup(false);
                setTimeout(()=>{
                    firstProductRef.current?.focus();
                },100);
            }}
          />
        )}

        <ProductList
          show={showProductPopup}
          onClose={() => {
            setShowProductPopup(false);
            setTimeout(() => {
              lastFocusedElement.current?.focus();
            }, 50);
          }}
          onSelect={(product) => {
            updateItem(selectedRow, "itemCode", product.itemCode);
            updateItem(selectedRow, "productName", product.productName);
            updateItem(selectedRow, "mrp", product.mrp);
            updateItem(selectedRow, "gst", product.gst);
            setShowProductPopup(false);
          }}
        />
      </div>
    </div>
  );
}