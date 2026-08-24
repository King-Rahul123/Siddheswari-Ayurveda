import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ProductList from "../Popup/ProductList";
import { updatePurchase } from "../services/purchaseService";
import "../CSS/EditBill.css";

export default function EditSale() {
  const navigate = useNavigate();
  const params = useParams();
  const rawBillParam = params["*"] || params.billnumber || params.billNumber;
  const billNumber = rawBillParam ? decodeURIComponent(rawBillParam) : "";
  const { state } = useLocation();

  const [billNo, setBillNo] = useState(billNumber || "");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [originalItems, setOriginalItems] = useState([]);
  const [items, setItems] = useState([
    {
      itemCode: "",
      productName: "",
      batch: "",
      expiry: "",
      qty: 1,
      free: 0,
      mrp: 0,
      rate: 0,
      discount: 0,
      gst: 0,
      amount: 0,
    },
  ]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [elapsedDays, setElapsedDays] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const tableRefs = useRef([]);
  const billNoRef = useRef(null);
  const dateRef = useRef(null);
  const companyRef = useRef(null);
  const mobileRef = useRef(null);
  const lastFocusedCell = useRef(null);

  const columns = [
    "productName",
    "batch",
    "expiry",
    "qty",
    "free",
    "mrp",
    "rate",
    "gst",
  ];

  // Initial Load & 2-Day Limit Validation
  useEffect(() => {
    let pDateVal = Date.now();

    if (state) {
      setBillNo(state.invoiceNo || state.purchaseId || state.billNumber || billNumber || "");
      setInvoiceDate(state.invoiceDate || state.date || new Date().toISOString().split("T")[0]);
      setCustomerName(state.companyName || state.supplier || state.customerName || "");
      setMobile(state.phone || state.mobile || state.customerPhone || "");
      pDateVal = state.createdAt || state.invoiceDate || state.date || Date.now();

      if (Array.isArray(state.items) && state.items.length > 0) {
        const loadedItems = state.items.map((item) => ({
          itemCode: item.itemCode || item.productId || "",
          productName: item.productName || item.product || "",
          batch: item.batch || "",
          expiry: item.expiry || item.expiryDate || "",
          qty: item.qty !== undefined && item.qty !== null && item.qty !== "" ? Number(item.qty) : 0,
          free: Number(item.free || 0),
          mrp: item.mrp !== undefined && item.mrp !== null ? Number(item.mrp) : 0,
          rate: item.rate !== undefined && item.rate !== null && item.rate !== "" ? Number(item.rate) : Number(item.mrp || 0),
          discount: 0,
          gst: Number(item.gst || 0),
          amount: Number(item.amount || 0),
        }));
        setItems(loadedItems);
        setOriginalItems(JSON.parse(JSON.stringify(loadedItems)));
      }
    } else {
      // Fallback search in localStorage
      const salesBills = JSON.parse(localStorage.getItem("salesBills")) || [];
      const foundSale = salesBills.find((b) => b.billNumber === billNumber);

      if (foundSale) {
        setBillNo(foundSale.billNumber || billNumber || "");
        setInvoiceDate(foundSale.invoiceDate || new Date().toISOString().split("T")[0]);
        setCustomerName(foundSale.customerName || "");
        setMobile(foundSale.mobile || "");
        pDateVal = foundSale.createdAt || foundSale.invoiceDate || Date.now();
        if (Array.isArray(foundSale.items) && foundSale.items.length > 0) {
          const loadedItems = foundSale.items.map((item) => ({
            ...item,
            qty: item.qty !== undefined && item.qty !== null && item.qty !== "" ? Number(item.qty) : 0,
            free: Number(item.free || 0),
            mrp: item.mrp !== undefined && item.mrp !== null ? Number(item.mrp) : 0,
            rate: item.rate !== undefined && item.rate !== null && item.rate !== "" ? Number(item.rate) : Number(item.mrp || 0),
            discount: 0,
          }));
          setItems(loadedItems);
          setOriginalItems(loadedItems);
        }
      }
    }

    // Calculate elapsed days for 7-day edit window
    try {
      const pDate = new Date(pDateVal);
      if (!isNaN(pDate.getTime())) {
        const now = new Date();
        const diffMs = now.getTime() - pDate.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        setElapsedDays(Number(days.toFixed(1)));
        if (days > 7) {
          setIsExpired(true);
        }
      }
    } catch (e) {
      console.error("Error calculating invoice age:", e);
    }
  }, [billNumber, state]);

  // Global Keyboard Controls (Esc to close/exit, End to open confirm modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showConfirmModal) {
          setShowConfirmModal(false);
          return;
        }
        if (showProductPopup) {
          setShowProductPopup(false);
          setTimeout(() => {
            lastFocusedCell.current?.focus();
          }, 50);
          return;
        }
        navigate(-1);
        return;
      }

      if (showConfirmModal) {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmSave();
        }
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        handleSaveClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, customerName, mobile, invoiceDate, billNo, showConfirmModal, showProductPopup, isExpired]);

  // Update field in specific row
  const updateItem = (index, field, value) => {
    if (isExpired) return;
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Add new empty item row
  const addRow = () => {
    if (isExpired) return;
    setItems((prev) => [
      ...prev,
      {
        itemCode: "",
        productName: "",
        batch: "",
        expiry: "",
        qty: 1,
        free: 0,
        mrp: 0,
        rate: 0,
        discount: 0,
        gst: 0,
        amount: 0,
      },
    ]);
  };

  // Delete row
  const deleteRow = (index) => {
    if (isExpired) return;
    if (items.length <= 1) {
      setItems([
        {
          itemCode: "",
          productName: "",
          batch: "",
          expiry: "",
          qty: 1,
          free: 0,
          mrp: 0,
          rate: 0,
          discount: 0,
          gst: 0,
          amount: 0,
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Table Navigation & Key Handlers
  const moveNext = (row, col) => {
    if (col < columns.length - 1) {
      tableRefs.current[row]?.[col + 1]?.focus();
    } else {
      if (row === items.length - 1) {
        if (!isExpired) {
          addRow();
          setTimeout(() => {
            tableRefs.current[row + 1]?.[0]?.focus();
          }, 50);
        }
      } else {
        tableRefs.current[row + 1]?.[0]?.focus();
      }
    }
  };

  const movePrevious = (row, col) => {
    if (col > 0) {
      tableRefs.current[row]?.[col - 1]?.focus();
    } else if (row > 0) {
      tableRefs.current[row - 1]?.[columns.length - 1]?.focus();
    }
  };

  const handleDeleteRow = (index) => {
    if (isExpired) return;
    deleteRow(index);

    const targetRow = index < items.length - 1 ? index : Math.max(0, index - 1);
    setTimeout(() => {
      tableRefs.current[targetRow]?.[0]?.focus();
    }, 50);
  };

  const handleTableKey = (e, row, col) => {
    if (e.key === "Delete") {
      e.preventDefault();
      handleDeleteRow(row);
      return;
    }

    switch (e.key) {
      case "Enter":
      case "ArrowRight":
        e.preventDefault();
        moveNext(row, col);
        break;

      case "ArrowLeft":
        e.preventDefault();
        movePrevious(row, col);
        break;

      case "ArrowDown": {
        e.preventDefault();
        if (row < items.length - 1) {
          tableRefs.current[row + 1]?.[col]?.focus();
        }
        break;
      }

      case "ArrowUp": {
        e.preventDefault();
        if (row > 0) {
          tableRefs.current[row - 1]?.[col]?.focus();
        }
        break;
      }

      default:
        break;
    }
  };

  // Calculations (Discount removed for Purchase edit)
  const calculatedItems = items.map((item) => {
    const qty = Number(item.qty || 0);
    const free = Number(item.free || 0);
    const mrp = Number(item.mrp || 0);
    const rate = Number(item.rate !== undefined && item.rate !== null && item.rate !== "" ? item.rate : mrp);
    const gst = Number(item.gst || 0);

    const sub = qty * rate;
    const discAmt = 0;
    const gstAmt = 0;
    const amount = Number((sub).toFixed(2));

    return {
      ...item,
      qty,
      free,
      mrp,
      rate,
      disc: 0,
      gst,
      sub,
      discAmt,
      gstAmt,
      amount,
    };
  });

  const subTotal = calculatedItems.reduce((acc, curr) => acc + curr.sub, 0);
  const totalDiscount = 0;
  const totalGst = calculatedItems.reduce((acc, curr) => acc + curr.gstAmt, 0);
  const rawGrandTotal = subTotal + totalGst;
  const roundedNet = Math.round(rawGrandTotal);
  const roundOff = Number((roundedNet - rawGrandTotal).toFixed(2));

  // Trigger Confirmation Modal
  const handleSaveClick = () => {
    if (isExpired) {
      alert(`Editing Restricted: This purchase invoice is ${elapsedDays} days old. Purchase invoices can only be edited within 7 days of purchase entry.`);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const computedTotalAmount = roundedNet;
    const computedTotalQty = calculatedItems.reduce((acc, curr) => acc + Number(curr.qty || 0) + Number(curr.free || 0), 0);
    const computedTotalItems = calculatedItems.length;

    const updatedData = {
      purchaseId: billNo,
      billNumber: billNo,
      invoiceNo: billNo,
      invoiceDate,
      date: invoiceDate,
      customerName,
      companyName: customerName,
      supplier: customerName,
      mobile,
      items: calculatedItems,
      subTotal,
      discount: totalDiscount,
      gstAmount: totalGst,
      grandTotal: rawGrandTotal,
      roundOff,
      netAmount: roundedNet,
      totalAmount: computedTotalAmount,
      totalQty: computedTotalQty,
      totalItems: computedTotalItems,
    };

    try {
      const targetId = state?.purchaseId || state?._id || state?.docId || state?.invoiceNo || billNo;
      await updatePurchase(targetId, updatedData, calculatedItems, originalItems);

      // Also update localStorage if present
      const salesBills = JSON.parse(localStorage.getItem("salesBills")) || [];
      const idx = salesBills.findIndex((b) => b.billNumber === billNo || b.billNumber === billNumber);
      if (idx !== -1) {
        salesBills[idx] = { ...salesBills[idx], ...updatedData };
        localStorage.setItem("salesBills", JSON.stringify(salesBills));
      }

      alert(`Purchase Invoice #${billNo} updated successfully! Product stock levels and bill totals have been updated.`);
      setShowConfirmModal(false);
      navigate(-1);
    } catch (err) {
      console.error("Error updating purchase:", err);
      alert(`Failed to update purchase invoice: ${err.message || "Server error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-wrapper">
        <Header />
        <main className="edit-bill-wrapper">
          <div className="edit-bill-card">
            {/* 2-Day Limit Warning Banner if Expired */}
            {isExpired && (
              <div className="expired-alert-banner">
                <i className="bi bi-exclamation-triangle-fill text-xl"></i>
                <span>
                  <strong>Editing Restricted:</strong> This purchase invoice was entered {elapsedDays} days ago. Purchase invoices can only be edited within 2 days of purchase entry.
                </span>
              </div>
            )}

            {/* Action Bar Header */}
            <div className="edit-bill-header-bar">
              <div className="edit-bill-title">
                <h2>Edit Purchase Invoice</h2>
                <span className="edit-mode-badge">
                  <i className="bi bi-pencil-square"></i> Editing Mode
                </span>
              </div>
              <div className="edit-bill-actions">
                <button
                  type="button"
                  className="btn-edit-close"
                  onClick={() => navigate(-1)}
                  title="Close and return back (Esc)"
                >
                  <i className="bi bi-x-lg"></i> Close <kbd className="kbd-badge">Esc</kbd>
                </button>
                <button
                  type="button"
                  className="btn-edit-save"
                  onClick={handleSaveClick}
                  disabled={isExpired}
                  style={isExpired ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  title="Save bill changes (End)"
                >
                  <i className="bi bi-check-circle-fill"></i> Save Changes <kbd className="kbd-badge">End</kbd>
                </button>
              </div>
            </div>

            {/* Bill Top Metadata */}
            <div className="edit-bill-meta-grid">
              <div className="edit-meta-group">
                <label>Invoice / Bill No</label>
                <input
                  ref={billNoRef}
                  type="text"
                  className="edit-meta-input"
                  value={billNo}
                  onChange={(e) => !isExpired && setBillNo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      dateRef.current?.focus();
                    }
                  }}
                  disabled={isExpired}
                  placeholder="e.g. SDA-0098"
                />
              </div>

              <div className="edit-meta-group">
                <label>Invoice Date</label>
                <input
                  ref={dateRef}
                  type="date"
                  className="edit-meta-input"
                  value={invoiceDate}
                  onChange={(e) => !isExpired && setInvoiceDate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      companyRef.current?.focus();
                    }
                  }}
                  disabled={isExpired}
                />
              </div>

              <div className="edit-meta-group">
                <label>Supplier / Company Name</label>
                <input
                  ref={companyRef}
                  type="text"
                  className="edit-meta-input"
                  value={customerName}
                  onChange={(e) => !isExpired && setCustomerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      mobileRef.current?.focus();
                    }
                  }}
                  disabled={isExpired}
                  placeholder="Enter Supplier Name"
                />
              </div>

              <div className="edit-meta-group">
                <label>Mobile / Contact No</label>
                <input
                  ref={mobileRef}
                  type="text"
                  className="edit-meta-input"
                  value={mobile}
                  onChange={(e) => !isExpired && setMobile(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      tableRefs.current[0]?.[0]?.focus();
                    }
                  }}
                  disabled={isExpired}
                  placeholder="Enter Phone / Mobile"
                />
              </div>
            </div>

            {/* Editable Products Table */}
            <div className="edit-items-table-wrapper">
              <table className="edit-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "35px", textAlign: "center" }}>Sl</th>
                    <th style={{ minWidth: "170px" }}>Product Name</th>
                    <th style={{ width: "90px" }}>Batch</th>
                    <th style={{ width: "85px" }}>Exp</th>
                    <th style={{ width: "65px" }}>Qty</th>
                    <th style={{ width: "65px" }}>Free</th>
                    <th style={{ width: "95px" }}>MRP (₹)</th>
                    <th style={{ width: "95px" }}>Rate (₹)</th>
                    <th style={{ width: "75px" }}>GST (%)</th>
                    <th style={{ width: "105px", textAlign: "right" }}>Amount (₹)</th>
                    <th style={{ width: "45px", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>
                        {index + 1}
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][0] = el;
                          }}
                          type="text"
                          className="edit-table-input"
                          value={item.productName}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][0];
                            setSelectedRow(index);
                          }}
                          onChange={(e) => {
                            updateItem(index, "productName", e.target.value);
                            setSelectedRow(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              e.preventDefault();
                              handleDeleteRow(index);
                              return;
                            }
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              lastFocusedCell.current = e.target;
                              setSelectedRow(index);
                              setShowProductPopup(true);
                              return;
                            }
                            handleTableKey(e, index, 0);
                          }}
                          disabled={isExpired}
                          placeholder="Product Name"
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][1] = el;
                          }}
                          type="text"
                          className="edit-table-input"
                          value={item.batch}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][1];
                          }}
                          onChange={(e) => updateItem(index, "batch", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 1)}
                          disabled={isExpired}
                          placeholder="Batch"
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][2] = el;
                          }}
                          type="text"
                          className="edit-table-input"
                          value={item.expiry}
                          maxLength={5}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][2];
                          }}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (value.length >= 2) {
                              let month = parseInt(value.substring(0, 2), 10);
                              if (month > 12) month = 12;
                              if (month < 1 && value.length === 2) month = 1;
                              value = month.toString().padStart(2, "0") + value.substring(2);
                            }
                            if (value.length > 2) {
                              value = value.substring(0, 2) + "/" + value.substring(2);
                            }
                            updateItem(index, "expiry", value);
                          }}
                          onKeyDown={(e) => handleTableKey(e, index, 2)}
                          disabled={isExpired}
                          placeholder="MM/YY"
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][3] = el;
                          }}
                          type="number"
                          min="0"
                          className="edit-table-input num"
                          value={item.qty}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][3];
                          }}
                          onChange={(e) => updateItem(index, "qty", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 3)}
                          disabled={isExpired}
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][4] = el;
                          }}
                          type="number"
                          min="0"
                          className="edit-table-input num"
                          value={item.free}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][4];
                          }}
                          onChange={(e) => updateItem(index, "free", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 4)}
                          disabled={isExpired}
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][5] = el;
                          }}
                          type="number"
                          step="0.01"
                          className="edit-table-input num"
                          value={item.mrp}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][5];
                          }}
                          onChange={(e) => updateItem(index, "mrp", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 5)}
                          disabled={isExpired}
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][6] = el;
                          }}
                          type="number"
                          step="0.01"
                          className="edit-table-input num"
                          value={item.rate}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][6];
                          }}
                          onChange={(e) => updateItem(index, "rate", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 6)}
                          disabled={isExpired}
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <input
                          ref={(el) => {
                            if (!tableRefs.current[index]) tableRefs.current[index] = [];
                            tableRefs.current[index][7] = el;
                          }}
                          type="number"
                          step="0.01"
                          className="edit-table-input num"
                          value={item.gst}
                          onFocus={() => {
                            lastFocusedCell.current = tableRefs.current[index][7];
                          }}
                          onChange={(e) => updateItem(index, "gst", e.target.value)}
                          onKeyDown={(e) => handleTableKey(e, index, 7)}
                          disabled={isExpired}
                        />
                      </td>
                      <td className="item-amount-cell">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn-delete-row"
                          title="Delete row"
                          onClick={() => handleDeleteRow(index)}
                          disabled={isExpired}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Product Button */}
            {!isExpired && (
              <div>
                <button type="button" className="btn-add-item" onClick={addRow}>
                  <i className="bi bi-plus-circle-fill"></i> Add Product
                </button>
              </div>
            )}

            {/* Invoice Summary Block */}
            <div className="edit-summary-container">
              <div className="edit-summary-card">
                <div className="summary-row-item">
                  <span>Subtotal</span>
                  <strong>₹{subTotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row-item">
                  <span>Round Off</span>
                  <strong>{roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</strong>
                </div>
                <div className="summary-row-item grand-total">
                  <span>Net Amount</span>
                  <strong>₹{roundedNet.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Product List Search Popup Modal */}
      <ProductList
        show={showProductPopup}
        mode="purchase"
        onClose={() => {
          setShowProductPopup(false);
          setTimeout(() => {
            lastFocusedCell.current?.focus();
          }, 50);
        }}
        onSelect={(product) => {
          if (!product) return;
          const mrpVal = Array.isArray(product.mrp)
            ? (product.mrp.length > 0 ? product.mrp[product.mrp.length - 1] : "")
            : (product.mrp || product.price || "");
          const rateVal = product.rate !== undefined && product.rate !== null && product.rate !== ""
            ? product.rate
            : mrpVal;
          const batchVal = Array.isArray(product.batch)
            ? (product.batch.length > 0 ? product.batch[product.batch.length - 1] : "")
            : (product.batch || "");
          const hsnVal = product.hsnCode || product.hsn || "";
          const gstVal = product.gstRate !== undefined && product.gstRate !== null && product.gstRate !== ""
            ? product.gstRate
            : (product.gst !== undefined ? product.gst : "");

          const updated = [...items];
          updated[selectedRow] = {
            ...updated[selectedRow],
            productId: product.itemCode || "",
            itemCode: product.itemCode || "",
            productName: product.productName || "",
            hsn: hsnVal,
            gst: gstVal !== "" ? Number(gstVal) : 0,
            batch: batchVal,
            expiry: product.expiry || product.expiryDate || "",
            mrp: mrpVal !== "" ? Number(mrpVal) : 0,
            rate: rateVal !== "" ? Number(rateVal) : 0,
            free: updated[selectedRow]?.free || 0,
            qty: updated[selectedRow]?.qty !== undefined && updated[selectedRow]?.qty !== null && updated[selectedRow]?.qty !== "" ? Number(updated[selectedRow]?.qty) : 0,
            discount: product.discount || 0,
          };
          setItems(updated);
          setShowProductPopup(false);
          setTimeout(() => {
            tableRefs.current[selectedRow]?.[1]?.focus();
          }, 100);
        }}
      />

      {/* Confirmation Modal Popup */}
      {showConfirmModal && (
        <div className="edit-confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="edit-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>
                <i className="bi bi-question-circle-fill text-emerald-600"></i> Confirm Invoice Update
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-lg"
                onClick={() => setShowConfirmModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>
                Are you sure you want to update <strong>Invoice #{billNo}</strong>?
              </p>
              <div className="stock-change-box">
                <i className="bi bi-box-seam-fill mr-1"></i>
                <strong>Stock Recalculation Notice:</strong>
                <br />
                Product stock balance will be automatically adjusted based on your quantity changes:
                <div style={{ marginTop: "4px", fontStyle: "italic" }}>
                  New Stock = Current Stock - (Old Purchase Qty - New Purchase Qty)
                </div>
              </div>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel <kbd className="kbd-badge">Esc</kbd>
              </button>
              <button
                type="button"
                className="btn-confirm-save"
                onClick={confirmSave}
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Confirm & Save"} <kbd className="kbd-badge">Enter</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}