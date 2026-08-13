import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

  const [saleId, setSaleId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "{}"
  );

  const firstProductRef = useRef(null);
  const invoiceRef = useRef(null);
  const lastFocusedElement = useRef(null);

  const [items, setItems] = useState([
    {
      itemCode: "",
      productName: "",
      hsn: "",
      batch: "",
      expiry: "",
      qty: "",
      mrp: "",
      rate: "",
      discount: "",
      gst: "",
      amount: 0,
    },
  ]);

  useEffect(() => {
    async function loadBillNo() {
      try {
        const id = await getCurrentSaleId();
        setSaleId(id);
      } catch (err) {
        console.error("Error fetching sale ID:", err);
      }
    }
    loadBillNo();
  }, []);

  // Global listener for End key shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "End") {
        e.preventDefault();
        setShowEndConfirmModal(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Modal key controls for End key confirmation modal
  useEffect(() => {
    if (!showEndConfirmModal) return;

    const handleModalKeyDown = (e) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "c") {
        e.preventDefault();
        setShowEndConfirmModal(false);
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        setShowEndConfirmModal(false);
        saveInvoice();
      } else if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowEndConfirmModal(false);
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => window.removeEventListener("keydown", handleModalKeyDown);
  }, [showEndConfirmModal, items, customer, invoiceDate]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        itemCode: "",
        productName: "",
        hsn: "",
        batch: "",
        expiry: "",
        qty: "",
        mrp: "",
        rate: "",
        discount: "",
        gst: "",
        amount: 0,
      },
    ]);
  };

  const addRowAndFocusNext = (currentIndex) => {
    if (currentIndex === items.length - 1) {
      setItems((prev) => [
        ...prev,
        {
          itemCode: "",
          productName: "",
          hsn: "",
          batch: "",
          expiry: "",
          qty: "",
          mrp: "",
          rate: "",
          discount: "",
          gst: "",
          amount: 0,
        },
      ]);
    }

    setTimeout(() => {
      const rows = invoiceRef.current?.querySelectorAll("tbody tr");
      const nextRow = rows?.[currentIndex + 1];
      const prodInput = nextRow?.querySelector("input[name='productName']");
      if (prodInput) {
        prodInput.focus();
      }
    }, 50);
  };

  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      const current = { ...updated[index], [field]: value };

      const qty = Number(current.qty || 0);
      const mrp = Number(current.mrp || 0);
      const discount = Number(current.discount || 0);

      // Warn if user enters qty greater than available stock
      if (field === "qty" && current.availableStock !== undefined && qty > current.availableStock) {
        setToast({
          show: true,
          message: `Quantity (${qty}) exceeds available stock (${current.availableStock}) for "${current.productName || 'product'}"`,
          type: "error",
        });
      }

      current.amount = qty * mrp;

      updated[index] = current;
      return updated;
    });
  };

  const selectProductInRow = (rowIndex, product) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      const currentQty = Number(updated[rowIndex]?.qty || 0);
      const newQty = currentQty > 0 ? currentQty : 1;

      const mrp = Number(product.mrp || 0);
      const rate = Number(product.rate || 0);
      const gst = Number(product.gst ?? product.gstRate ?? 0);
      const discount = Number(product.discount || 0);

      const batch = product.batch || "";
      let expiry = product.expiry || product.expiryDate || "";
      const availStock = product.stock !== undefined ? Number(product.stock) : undefined;

      if (availStock !== undefined && newQty > availStock) {
        setToast({
          show: true,
          message: `Selected product "${product.productName}" has only ${availStock} unit(s) in stock`,
          type: "error",
        });
      }

      const amount = newQty * mrp;

      updated[rowIndex] = {
        ...updated[rowIndex],
        stockId: product.stockId || product._id || "",
        itemCode: product.itemCode || "",
        productName: product.productName || "",
        hsn: product.hsn || product.hsnCode || "",
        batch: batch,
        expiry: expiry,
        qty: newQty,
        mrp: mrp,
        rate: rate,
        discount: discount,
        gst: gst,
        amount: amount,
        availableStock: availStock,
      };
      return updated;
    });

    setShowProductPopup(false);

    // Auto-focus Qty input of the selected row
    setTimeout(() => {
      const rows = invoiceRef.current?.querySelectorAll("tbody tr");
      const targetRow = rows?.[rowIndex];
      if (targetRow) {
        const qtyInput = targetRow.querySelector("input[name='qty']");
        if (qtyInput) {
          qtyInput.focus();
          qtyInput.select?.();
        }
      }
    }, 100);
  };

  const deleteRow = (index) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const subTotal = items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.mrp || 0),
    0
  );

  const totalItemDiscount = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.qty || 0) * Number(item.mrp || 0) * Number(item.discount || 0)) / 100,
    0
  );

  // (when gst no. include)
  // const gstAmount = items.reduce((sum, item) => {
  //   const qty = Number(item.qty || 0);
  //   const rate = Number(item.rate || 0);
  //   const discount = Number(item.discount || 0);
  //   const itemSub = qty * rate;
  //   const afterDisc = itemSub - (itemSub * discount) / 100;
  //   return sum + (afterDisc * Number(item.gst || 0)) / 100;
  // }, 0);     

  const gstAmount = 0;
  const grandTotal = subTotal - totalItemDiscount + gstAmount;
  const netAmount = Math.round(grandTotal);
  const roundOff = Number((netAmount - grandTotal).toFixed(2));

  const handleEnterKey = (e) => {
    if (e.key === "+" || e.code === "NumpadAdd") {
      e.preventDefault();
      addRow();

      setTimeout(() => {
        const rows = invoiceRef.current?.querySelectorAll(
          "tbody tr input[name='productName']"
        );
        rows?.[rows.length - 1]?.focus();
      }, 50);
    }
  };

  const saveInvoice = async () => {
    try {
      const validItems = items
        .filter((item) => item.productName && item.productName.trim() !== "")
        .map((item) => {
          const mrpVal = Number(item.mrp || 0);
          const rateVal = Number(item.rate || 0);
          const qtyVal = Number(item.qty || 0);
          return {
            ...item,
            mrp: mrpVal,
            rate: rateVal,
            amount: qtyVal * mrpVal,
          };
        });

      if (validItems.length === 0) {
        setToast({
          show: true,
          message: "Please add at least one product before saving",
          type: "error",
        });
        return false;
      }

      // Check quantities against stock and handle invalid quantities
      for (const item of validItems) {
        const qtyNum = Number(item.qty || 0);
        if (qtyNum <= 0) {
          setToast({
            show: true,
            message: `Please enter a valid quantity greater than 0 for "${item.productName}"`,
            type: "error",
          });
          return false;
        }
        if (item.availableStock !== undefined && qtyNum > item.availableStock) {
          setToast({
            show: true,
            message: `Cannot save bill: Quantity (${qtyNum}) exceeds available stock (${item.availableStock}) for "${item.productName}"`,
            type: "error",
          });
          return false;
        }
      }

      const totalQty = validItems.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0
      );

      const generatedSaleId = await getNextSaleId();

      const saleData = {
        saleId: generatedSaleId,
        customerCode: customer.customerCode,
        customerName: customer.customerName,
        customerPhone: customer.phone,
        date: invoiceDate,
        totalQty,
        totalAmount: subTotal,
        discountTotal: totalItemDiscount,
        gstTotal: gstAmount,
        grandTotal: grandTotal,
        roundOff: roundOff,
        netAmount: netAmount,
        createdBy: loggedInUser?.username || "Admin",
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

      // Reset items
      setItems([
        {
          itemCode: "",
          productName: "",
          hsn: "",
          batch: "",
          expiry: "",
          qty: "",
          mrp: "",
          rate: "",
          discount: "",
          gst: "",
          amount: 0,
        },
      ]);

      setToast({
        show: true,
        message: `${saleData.saleId} saved & PDF stored in D:\\Mongodb_Siddheswari`,
        type: "success",
      });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: err.message || "Failed to save invoice",
        type: "error",
      });
      return false;
    }
  };

  const handlePrint = async () => {
    const validItems = items.filter(
      (item) => item.productName && item.productName.trim() !== ""
    );

    if (validItems.length === 0) {
      setToast({
        show: true,
        message: "Please add at least one product before printing",
        type: "error",
      });
      return;
    }

    const currentBillNo = saleId;
    const savedSuccess = await saveInvoice();
    if (!savedSuccess) return;

    navigate("/print-invoice", {
      state: {
        billNumber: currentBillNo,
        invoiceDate,
        customerName: customer.customerName,
        phone: customer.phone,
        mobile: customer.phone,
        customerPhone: customer.phone,
        items: validItems,
        subTotal,
        discount: totalItemDiscount,
        gstAmount,
        grandTotal,
        roundOff,
        netAmount,
      },
    });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        <main className="dashboard-content">
          {toast.show && (
            <div
              className={`invoice-toast ${toast.type === "error" ? "error" : ""
                }`}
            >
              <div className="flex items-center gap-2">
                <i
                  className={`bi ${toast.type === "error"
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
              <i
                className="bi bi-arrow-left bg-gray-500 py-1 px-2 text-white rounded-lg cursor-pointer"
                onClick={() => window.history.back()}
              ></i>
              <h2>Sales Invoice</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="print-btn"
                onClick={handlePrint}
              >
                Save & Print
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={saveInvoice}
              >
                Save
              </button>
            </div>
          </div>

          <form
            ref={invoiceRef}
            className="invoice-card"
            onKeyDown={handleEnterKey}
          >
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const custInput = invoiceRef.current?.querySelector("input[placeholder='Customer Name']");
                    custInput?.focus();
                  }
                }}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />

              <input
                type="text"
                placeholder="Customer Name"
                value={customer.customerName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    lastFocusedElement.current = e.target;
                    setShowCustomerPopup(true);
                  }
                }}
                onChange={(e) =>
                  setCustomer({ ...customer, customerName: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Mobile Number"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Sl No.</th>
                  <th>Product</th>
                  <th>HSN</th>
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
                        name="productName"
                        ref={index === 0 ? firstProductRef : null}
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
                          updateItem(index, "productName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        name="hsn"
                        type="text"
                        placeholder="HSN"
                        value={item.hsn}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const rows = invoiceRef.current?.querySelectorAll("tbody tr");
                            rows?.[index]?.querySelector("input[name='batch']")?.focus();
                          }
                        }}
                        onChange={(e) =>
                          updateItem(index, "hsn", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        name="batch"
                        type="text"
                        placeholder="Batch"
                        value={item.batch}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const rows = invoiceRef.current?.querySelectorAll("tbody tr");
                            rows?.[index]?.querySelector("input[name='qty']")?.focus();
                          }
                        }}
                        onChange={(e) =>
                          updateItem(index, "batch", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        name="qty"
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const rows = invoiceRef.current?.querySelectorAll("tbody tr");
                            rows?.[index]?.querySelector("input[name='discount']")?.focus();
                          }
                        }}
                        onChange={(e) =>
                          updateItem(index, "qty", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        name="mrp"
                        type="number"
                        placeholder="MRP"
                        value={item.mrp}
                        readOnly
                        title="Fixed as per database product record"
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </td>

                    <td>
                      <input
                        name="rate"
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        readOnly
                        title="Fixed as per database product record"
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </td>

                    <td>
                      <input
                        name="expiry"
                        type="text"
                        placeholder="MM/YYYY"
                        maxLength={7}
                        value={item.expiry}
                        readOnly
                        title="Fixed as per database product record"
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </td>

                    <td>
                      <input
                        name="discount"
                        type="number"
                        placeholder="Dis %"
                        value={item.discount}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            addRowAndFocusNext(index);
                          }
                        }}
                        onChange={(e) =>
                          updateItem(index, "discount", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        name="gst"
                        type="number"
                        placeholder="GST %"
                        value={item.gst}
                        readOnly
                        title="Fixed as per database product record"
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </td>

                    <td className="amount-cell">
                      <div className="amount-wrapper">
                        <span className="amount-value">
                          ₹{Number(item.amount || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className="delete-row-btn"
                          onClick={() => deleteRow(index)}
                          title="Delete Row"
                        >
                          &times;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="add-row-btn"
                onClick={addRow}
              >
                + Add Product
              </button>
              <p className="text-xs text-gray-500 italic">
                Tip: Press <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> on GST% to add next row, or press <kbd className="bg-gray-200 px-1 rounded">End</kbd> to save/preview bill.
              </p>
            </div>
            <div className="invoice-summary">
              <h4>Subtotal : ₹{subTotal.toFixed(2)}</h4>
              <h4>Discount : ₹{totalItemDiscount.toFixed(2)}</h4>
              <h4>GST : ₹{gstAmount.toFixed(2)}</h4>
              <h4>Grand Total : ₹{grandTotal.toFixed(2)}</h4>
              <h4>Round Off : {roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</h4>
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
            onSelect={(customerData) => {
              setCustomer({
                customerCode: customerData.customerCode,
                customerName: customerData.name,
                phone: customerData.phone,
              });
              setShowCustomerPopup(false);
              setTimeout(() => {
                firstProductRef.current?.focus();
              }, 100);
            }}
          />
        )}

        <ProductList
          show={showProductPopup}
          mode="sale"
          onClose={() => {
            setShowProductPopup(false);
            setTimeout(() => {
              lastFocusedElement.current?.focus();
            }, 50);
          }}
          onSelect={(product) => {
            selectProductInRow(selectedRow, product);
          }}
        />

        {/* Confirmation Modal when pressing END key */}
        {showEndConfirmModal && (
          <div
            className="popup-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => setShowEndConfirmModal(false)}
          >
            <div
              className="customer-popup"
              style={{ maxWidth: "440px", borderRadius: "20px", padding: "24px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popup-header" style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: 0, color: "#14532d", fontWeight: "700" }}>
                  Confirm Invoice Action
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEndConfirmModal(false)}
                ></button>
              </div>

              <div className="popup-body" style={{ textAlign: "center" }}>
                <p style={{ fontSize: "15px", color: "#475569", marginBottom: "20px" }}>
                  What would you like to do with sale invoice <strong>{saleId}</strong>?
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button
                    type="button"
                    className="save-btn"
                    style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "8px" }}
                    onClick={async () => {
                      setShowEndConfirmModal(false);
                      await saveInvoice();
                    }}
                  >
                    <i className="bi bi-check-circle-fill"></i> Save Invoice (Press S)
                  </button>

                  <button
                    type="button"
                    className="print-btn"
                    style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "8px" }}
                    onClick={() => {
                      setShowEndConfirmModal(false);
                      handlePrint();
                    }}
                  >
                    <i className="bi bi-printer-fill"></i> Save & Preview/Print (Press P)
                  </button>

                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "16px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      fontWeight: "600",
                      color: "#475569",
                      cursor: "pointer"
                    }}
                    onClick={() => setShowEndConfirmModal(false)}
                  >
                    Cancel (Press Esc)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
