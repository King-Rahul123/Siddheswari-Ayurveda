import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../api/apiClient";
import "../CSS/Dashboard.css";
import "../CSS/Outstanding.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

export default function Outstanding() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Due");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Cash",
    transactionId: "",
    note: "",
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);

    try {
      // Change this endpoint if your existing sales API uses another route.
      const res = await apiFetch("/sales/unpaid-bills");

      if (!res.ok) throw new Error("Unable to load bills");

      const data = await res.json();
      setBills(Array.isArray(data) ? data : data.bills || []);
    } catch (error) {
      console.error("Bill payment loading error:", error);
      toast.error("Unable to load pending bills");
    } finally {
      setLoading(false);
    }
  };

  const getTotal = (bill) =>
    Number(bill.total ?? bill.grandTotal ?? bill.amount ?? 0);

  const getPaid = (bill) => Number(bill.paidAmount ?? bill.paid ?? 0);

  const getDue = (bill) =>
    Math.max(0, getTotal(bill) - getPaid(bill));

  const normalizedStatus = (bill) => {
    const due = getDue(bill);
    const paid = getPaid(bill);

    if (due <= 0) return "Paid";
    if (paid > 0) return "Partial";
    return "Due";
  };

  const filteredBills = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return bills.filter((bill) => {
      const status = normalizedStatus(bill);
      const method = bill.paymentMethod || bill.method || "—";

      const matchesSearch =
        !keyword ||
        String(bill.invoiceNumber ?? bill.billNumber ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(bill.customerName ?? bill.customer ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(bill.customerPhone ?? bill.phone ?? "").includes(searchTerm);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesMethod =
        methodFilter === "All" || method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [bills, searchTerm, statusFilter, methodFilter]);

  const summary = useMemo(() => {
    const total = bills.reduce((sum, bill) => sum + getTotal(bill), 0);
    const paid = bills.reduce((sum, bill) => sum + getPaid(bill), 0);
    const due = bills.reduce((sum, bill) => sum + getDue(bill), 0);

    return {
      total,
      paid,
      due,
      dueBills: bills.filter((bill) => normalizedStatus(bill) === "Due").length,
      partialBills: bills.filter((bill) => normalizedStatus(bill) === "Partial").length,
    };
  }, [bills]);

  const openPayment = (bill) => {
    const due = getDue(bill);

    setSelectedBill(bill);
    setPaymentForm({
      amount: due > 0 ? String(due) : "",
      method: "Cash",
      transactionId: "",
      note: "",
    });
    setShowPaymentModal(true);
  };

  const closePayment = () => {
    if (saving) return;
    setShowPaymentModal(false);
    setSelectedBill(null);
  };

  // Get all unpaid/partial bills for the selected customer
  const customerPendingBills = useMemo(() => {
    if (!selectedBill) return [];

    const targetCustomerName = (selectedBill.customerName || selectedBill.customer || "").trim().toLowerCase();
    const targetCustomerPhone = (selectedBill.customerPhone || selectedBill.phone || "").trim();

    return bills.filter((b) => {
      const status = normalizedStatus(b);
      if (status === "Paid") return false;

      const bName = (b.customerName || b.customer || "").trim().toLowerCase();
      const bPhone = (b.customerPhone || b.phone || "").trim();

      const nameMatch = targetCustomerName && bName === targetCustomerName;
      const phoneMatch = targetCustomerPhone && bPhone === targetCustomerPhone;

      return nameMatch || phoneMatch;
    });
  }, [selectedBill, bills]);

  // Projected allocation of entered amount across customer's pending bills
  const paymentAllocation = useMemo(() => {
    const entered = Number(paymentForm.amount || 0);
    let remaining = entered;

    return customerPendingBills.map((b) => {
      const billTotal = getTotal(b);
      const billPaid = getPaid(b);
      const billDue = getDue(b);

      if (remaining <= 0) {
        return {
          ...b,
          allocated: 0,
          newPaid: billPaid,
          newDue: billDue,
          newStatus: normalizedStatus(b)
        };
      }

      const allocated = Math.min(remaining, billDue);
      const newPaid = billPaid + allocated;
      const newDue = Math.max(0, billTotal - newPaid);
      const newStatus = newDue <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Due";

      remaining -= allocated;

      return {
        ...b,
        allocated,
        newPaid,
        newDue,
        newStatus
      };
    });
  }, [customerPendingBills, paymentForm.amount]);

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBill) return;

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      toast.warning("Enter a valid payment amount");
      return;
    }

    if (
      paymentForm.method === "UPI" &&
      !paymentForm.transactionId.trim()
    ) {
      toast.warning("Enter the UPI transaction ID");
      return;
    }

    setSaving(true);

    try {
      const billId =
        selectedBill.id ??
        selectedBill._id ??
        selectedBill.saleId ??
        selectedBill.invoiceNumber ??
        selectedBill.billNumber;

      const customerName = selectedBill.customerName || selectedBill.customer || "";
      const customerPhone = selectedBill.customerPhone || selectedBill.phone || "";
      const customerCode = selectedBill.customerCode || "";

      // If customer has multiple pending bills, use customer clear-payment
      let res;
      if (customerPendingBills.length > 1) {
        res = await apiFetch("/sales/clear-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            customerPhone,
            customerCode,
            amount,
            paymentMethod: paymentForm.method,
            transactionId: paymentForm.method === "UPI" ? paymentForm.transactionId.trim() : "",
            note: paymentForm.note.trim()
          })
        });
      } else {
        res = await apiFetch(`/sales/${billId}/payment`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            paymentMethod: paymentForm.method,
            transactionId: paymentForm.method === "UPI" ? paymentForm.transactionId.trim() : "",
            note: paymentForm.note.trim()
          })
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Payment update failed");
      }

      toast.success(`₹${amount.toLocaleString("en-IN")} payment processed successfully!`);
      closePayment();
      await loadBills();
    } catch (error) {
      console.error("Payment update error:", error);
      toast.error(error.message || "Unable to update payment");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDownModal = (e) => {
    if (e.key === "Enter" && !saving) {
      e.preventDefault();
      handlePayment();
    }
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        <Header />

        <main className="dashboard-content bill-payment-page">
          <div className="bill-page-header">
            <div>
              <div className="bill-title-row">
                <div className="bill-title-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <h2>Bill Payment</h2>
                  <p>Track pending bills and update payments by Cash or UPI</p>
                </div>
              </div>
            </div>

            <button
              className="bill-refresh-btn"
              onClick={loadBills}
              disabled={loading}
            >
              <i className={`bi ${loading ? "bi-arrow-repeat bill-spin" : "bi-arrow-clockwise"}`}></i>
              Refresh
            </button>
          </div>

          <section className="bill-summary-grid">
            <div className="bill-summary-card outstanding">
              <div className="bill-summary-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div>
                <span>Total Outstanding</span>
                <strong>{formatCurrency(summary.due)}</strong>
                <small>{summary.dueBills} unpaid bills</small>
              </div>
            </div>

            <div className="bill-summary-card received">
              <div className="bill-summary-icon">
                <i className="bi bi-check2-circle"></i>
              </div>
              <div>
                <span>Already Paid</span>
                <strong>{formatCurrency(summary.paid)}</strong>
                <small>Collected amount</small>
              </div>
            </div>

            <div className="bill-summary-card partial">
              <div className="bill-summary-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <span>Partial Bills</span>
                <strong>{summary.partialBills}</strong>
                <small>Need remaining payment</small>
              </div>
            </div>

            <div className="bill-summary-card invoices">
              <div className="bill-summary-icon">
                <i className="bi bi-receipt-cutoff"></i>
              </div>
              <div>
                <span>Total Bills</span>
                <strong>{bills.length}</strong>
                <small>{formatCurrency(summary.total)} bill value</small>
              </div>
            </div>
          </section>

          <section className="bill-toolbar-card">
            <div className="bill-search">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search invoice, customer or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <div className="bill-filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Due">Due</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="-">— (Unassigned)</option>
              </select>
            </div>
          </section>

          <section className="bill-table-card">
            <div className="bill-table-header">
              <div>
                <h4>Payment Ledger</h4>
                <p>{filteredBills.length} bills shown</p>
              </div>

              <div className="payment-legend">
                <span><i className="bi bi-circle-fill due-dot"></i> Due</span>
                <span><i className="bi bi-circle-fill partial-dot"></i> Partial</span>
                <span><i className="bi bi-circle-fill paid-dot"></i> Paid</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dashboard-table bill-table">
                <thead>
                  <tr>
                    <th>Sl</th>
                    <th>Invoice No.</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="bill-loading">
                        <div className="spinner-border spinner-border-sm text-success"></div>
                        <span>Loading bills...</span>
                      </td>
                    </tr>
                  ) : filteredBills.length > 0 ? (
                    filteredBills.map((bill, index) => {
                      const total = getTotal(bill);
                      const status = normalizedStatus(bill);
                      const method = bill.paymentMethod || bill.method || "—";
                      const invoice =
                        bill.invoiceNumber ?? bill.billNumber ?? bill.saleId ?? bill.id ?? "—";
                      const customer =
                        bill.customerName ?? bill.customer ?? "Walk-in Customer";

                      return (
                        <tr key={bill.id ?? bill._id ?? invoice}>
                          <td className="text-center">{index + 1}</td>

                          <td>
                            <div className="invoice-cell">
                              <span className="invoice-icon">
                                <i className="bi bi-receipt"></i>
                              </span>
                              <div>
                                <strong>{invoice}</strong>
                                <small>{bill.orderNumber || "Sales Bill"}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="customer-cell">
                              <strong>{customer}</strong>
                              {bill.customerPhone || bill.phone ? (
                                <small>{bill.customerPhone || bill.phone}</small>
                              ) : null}
                            </div>
                          </td>

                          <td>{bill.date || bill.billDate || (bill.createdAt ? new Date(bill.createdAt).toLocaleDateString("en-IN") : "—")}</td>

                          <td className="amount total">{formatCurrency(total)}</td>

                          <td>
                            {status === "Paid" ? (
                              method === "Cash" ? (
                                <span className="payment-method cash">
                                  <i className="bi bi-cash"></i> Cash
                                </span>
                              ) : method === "UPI" ? (
                                <span className="payment-method upi">
                                  <i className="bi bi-phone"></i> UPI
                                </span>
                              ) : (
                                <span className="payment-method empty">—</span>
                              )
                            ) : (
                              <button
                                type="button"
                                className="pay-method-btn"
                                onClick={() => openPayment(bill)}
                                title="Click to clear payment"
                              >
                                <span className="method-label">{method !== "—" ? method : "—"}</span>
                                <span className="pay-badge"><i className="bi bi-wallet2"></i> Clear Pay</span>
                              </button>
                            )}
                          </td>

                          <td>
                            <span className={`bill-status ${status.toLowerCase()}`}>
                              <i className="bi bi-circle-fill"></i>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="bill-empty-state">
                        <div className="empty-wallet">
                          <i className="bi bi-wallet2"></i>
                        </div>
                        <h5>No bills found</h5>
                        <p>Try changing the search or payment filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {showPaymentModal && selectedBill && (
          <div className="payment-modal-overlay" onClick={closePayment}>
            <div
              className="payment-modal"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDownModal}
            >
              <div className="payment-modal-top">
                <div className="payment-modal-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <button
                  className="payment-close"
                  onClick={closePayment}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="payment-modal-heading">
                <span>CLEAR PAYMENT FOR CUSTOMER</span>
                <h3>{selectedBill.customerName ?? selectedBill.customer ?? "Walk-in Customer"}</h3>
                <p>Invoice #{selectedBill.saleId ?? selectedBill.invoiceNumber ?? selectedBill.billNumber ?? "—"}</p>
              </div>

              <div className="payment-balance">
                <div>
                  <small>Selected Bill Due</small>
                  <strong>{formatCurrency(getDue(selectedBill))}</strong>
                </div>
                <div>
                  <small>Customer Total Due</small>
                  <strong>{formatCurrency(customerPendingBills.reduce((s, b) => s + getDue(b), 0))}</strong>
                </div>
                <div className="balance-due">
                  <small>Pending Invoices</small>
                  <strong>{customerPendingBills.length} Bill(s)</strong>
                </div>
              </div>

              <form className="payment-form" onSubmit={handlePayment}>
                <label>Payment Method</label>
                <div className="payment-method-grid">
                  <button
                    type="button"
                    className={paymentForm.method === "Cash" ? "active cash-option" : ""}
                    onClick={() =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        method: "Cash",
                        transactionId: "",
                      }))
                    }
                  >
                    <i className="bi bi-cash-stack"></i>
                    <span>Cash</span>
                    <small>Received physically</small>
                  </button>

                  <button
                    type="button"
                    className={paymentForm.method === "UPI" ? "active upi-option" : ""}
                    onClick={() =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        method: "UPI",
                      }))
                    }
                  >
                    <i className="bi bi-qr-code-scan"></i>
                    <span>UPI</span>
                    <small>Digital payment</small>
                  </button>
                </div>

                <label htmlFor="modal-payment-amount">Payment Amount (Press Enter to Apply)</label>
                <div className="payment-amount-input">
                  <span>₹</span>
                  <input
                    id="modal-payment-amount"
                    type="number"
                    min="1"
                    autoFocus
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="Enter payment amount"
                  />
                </div>

                {paymentForm.method === "UPI" && (
                  <div className="upi-field">
                    <label>UPI Transaction ID</label>
                    <div className="input-with-icon">
                      <i className="bi bi-upc-scan"></i>
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            transactionId: e.target.value,
                          }))
                        }
                        placeholder="Enter UTR / Transaction ID"
                      />
                    </div>
                  </div>
                )}

                <label>Note <span>(Optional)</span></label>
                <textarea
                  value={paymentForm.note}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Add payment note..."
                  rows="2"
                ></textarea>
              </form>

              {/* Customer Pending Invoices Allocation Preview */}
              {customerPendingBills.length > 0 && (
                <div className="customer-bills-preview">
                  <h5>Customer Pending Invoices Breakdown</h5>
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Total</th>
                          <th>Current Due</th>
                          <th>Allocated</th>
                          <th>New Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentAllocation.map((item) => (
                          <tr key={item.id ?? item._id ?? item.saleId} className={item.allocated > 0 ? "active-alloc" : ""}>
                            <td><strong>{item.saleId || item.invoiceNumber || item.billNumber}</strong></td>
                            <td>{formatCurrency(getTotal(item))}</td>
                            <td className="text-danger">{formatCurrency(getDue(item))}</td>
                            <td className="text-success font-weight-bold">
                              {item.allocated > 0 ? `+${formatCurrency(item.allocated)}` : "₹0"}
                            </td>
                            <td>
                              <span className={`bill-status ${item.newStatus.toLowerCase()}`}>
                                {item.newStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="payment-modal-footer">
                <button
                  className="payment-cancel-btn"
                  type="button"
                  onClick={closePayment}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="payment-save-btn"
                  type="button"
                  onClick={handlePayment}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i>
                      Clear Payment (Enter)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}