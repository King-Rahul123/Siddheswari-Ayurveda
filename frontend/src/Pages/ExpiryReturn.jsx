/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "../api/apiClient";
import { subscribeSales } from "../services/saleService";

import "../CSS/Dashboard.css";
import "../CSS/ExpiryReturn.css";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

const ExpiryReturn = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sales");

  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);

  const [salesReturnList, setSalesReturnList] = useState([]);
  const [salesReturnLoading, setSalesReturnLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [salesStatusFilter, setSalesStatusFilter] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [showSalesReturnModal, setShowSalesReturnModal] = useState(false);
  const [returnQty, setReturnQty] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnSaving, setReturnSaving] = useState(false);

  // =========================================================
  // LOAD EXPIRY STOCK
  // =========================================================

  const loadExpiryStock = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/stock/expiry");

      if (!response.ok) {
        throw new Error("Unable to load expiry stock");
      }

      const data = await response.json();

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || data.stock || []
      );
    } catch (error) {
      console.error("Expiry stock error:", error);
      toast.error("Unable to load expiry stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpiryStock();
  }, [loadExpiryStock]);

  // =========================================================
  // LOAD SALES
  // Existing project uses Firestore subscribeSales.
  // =========================================================

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = subscribeSales((data) => {
        setSalesData(Array.isArray(data) ? data : []);
        setSalesLoading(false);
      });
    } catch (error) {
      console.error("Sales loading error:", error);
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Load ONLY saved sales returns
  const loadSalesReturns = useCallback(async () => {
    setSalesReturnLoading(true);

    try {
      const response = await apiFetch("/sales/returns");

      if (!response.ok) {
        throw new Error("Unable to load sales returns");
      }

      const data = await response.json();

      setSalesReturnList(
        Array.isArray(data)
          ? data
          : data.returns ||
            data.salesReturns ||
            []
      );
    } catch (error) {
      console.error(
        "Sales return loading error:",
        error
      );

      setSalesReturnList([]);
    } finally {
      setSalesReturnLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesReturns();
  }, [loadSalesReturns]);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const parseDate = (value) => {
    if (!value || value === "—" || value === "-") {
      return null;
    }

    const str = String(value).trim();

    const mmyyMatch = str.match(/^(0[1-9]|1[0-2])[/-](\d{2}|\d{4})$/);

    if (mmyyMatch) {
      const month = parseInt(mmyyMatch[1], 10);
      let year = parseInt(mmyyMatch[2], 10);

      if (year < 100) {
        year += 2000;
      }

      const lastDay = new Date(year, month, 0).getDate();

      return new Date(year, month - 1, lastDay);
    }

    const ddmmyyyyMatch = str.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
    );

    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10);
      const year = parseInt(ddmmyyyyMatch[3], 10);

      return new Date(year, month - 1, day);
    }

    const yyyymmddMatch = str.match(
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
    );

    if (yyyymmddMatch) {
      const year = parseInt(yyyymmddMatch[1], 10);
      const month = parseInt(yyyymmddMatch[2], 10);
      const day = parseInt(yyyymmddMatch[3], 10);

      return new Date(year, month - 1, day);
    }

    if (
      typeof value === "object" &&
      typeof value?.toDate === "function"
    ) {
      const firebaseDate = value.toDate();

      if (!Number.isNaN(firebaseDate.getTime())) {
        return firebaseDate;
      }
    }

    const date = new Date(str);

    if (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() > 2005
    ) {
      return date;
    }

    return null;
  };

  const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) {
      return value || "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // EXPIRY INFO
  // =========================================================

  const getExpiryInfo = useCallback((product) => {
    const expiryDateStr =
      product.expiryDate ||
      product.expiry ||
      product.batchExpiry ||
      null;

    const expiry = parseDate(expiryDateStr);

    if (!expiry) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expiry.setHours(0, 0, 0, 0);

    const days = Math.ceil(
      (expiry.getTime() - today.getTime()) / 86400000
    );

    if (days <= 0) {
      return {
        days,
        status: "Expired",
        className: "expired",
      };
    }

    if (days <= 30) {
      return {
        days,
        status: "Expire in 30 days",
        className: "critical",
      };
    }

    if (days <= 60) {
      return {
        days,
        status: "Expire in 60 days",
        className: "near-expiry",
      };
    }

    return null;
  }, []);

  // =========================================================
  // EXPIRY TABLE FILTER
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const expiryInfo = getExpiryInfo(product);

      if (!expiryInfo) {
        return false;
      }

      const productName =
        product.productName ||
        product.name ||
        "Unknown Product";

      const batch =
        product.batchNumber ||
        product.batch ||
        product.batchNo ||
        "—";

      const actionStatus =
        product.actionStatus || "";

      const matchesSearch =
        !keyword ||
        String(productName)
          .toLowerCase()
          .includes(keyword) ||
        String(batch)
          .toLowerCase()
          .includes(keyword);

      let matchesExpiry = true;

      if (expiryFilter === "Expired") {
        matchesExpiry = expiryInfo.days <= 0;
      } else if (expiryFilter === "30") {
        matchesExpiry =
          expiryInfo.days > 0 &&
          expiryInfo.days <= 30;
      } else if (expiryFilter === "60") {
        matchesExpiry =
          expiryInfo.days > 30 &&
          expiryInfo.days <= 60;
      }

      let matchesAction = true;

      if (actionFilter === "Pending") {
        matchesAction = !actionStatus;
      } else if (actionFilter === "Returned") {
        matchesAction =
          actionStatus === "Returned";
      } else if (actionFilter === "No Stock") {
        matchesAction =
          actionStatus === "No Stock";
      }

      return (
        matchesSearch &&
        matchesExpiry &&
        matchesAction
      );
    });
  }, [
    products,
    searchTerm,
    expiryFilter,
    actionFilter,
    getExpiryInfo,
  ]);

  // =========================================================
  // SALES NORMALIZATION
  // =========================================================

  const getSaleId = (sale) =>
    sale.saleId ||
    sale.docId ||
    sale.id ||
    sale._id ||
    "—";

  const getBillNumber = (sale) =>
    sale.billnumber ||
    sale.billNumber ||
    sale.invoiceNumber ||
    sale.invoiceNo ||
    sale.saleId ||
    sale.docId ||
    "—";

  const getCustomerName = (sale) =>
    sale.customerName ||
    sale.customer ||
    "Walk-in Customer";

  const getCustomerPhone = (sale) =>
    sale.customerPhone ||
    sale.phone ||
    sale.mobile ||
    "—";

  const getSaleDate = (sale) =>
    sale.date ||
    sale.saleDate ||
    sale.invoiceDate ||
    sale.createdAt ||
    null;

  const getSaleItems = (sale) => {
    if (Array.isArray(sale.items)) {
      return sale.items;
    }

    if (Array.isArray(sale.saleItems)) {
      return sale.saleItems;
    }

    return [];
  };

  const getSaleQuantity = (sale) =>
    Number(
      sale.totalQty ??
        sale.quantity ??
        sale.qty ??
        getSaleItems(sale).reduce(
          (sum, item) =>
            sum + Number(item.qty || 0),
          0
        ) ??
        0
    );

  const getReturnQuantity = (sale) =>
    Number(
      sale.returnQuantity ??
        sale.returnQty ??
        sale.totalReturnedQty ??
        0
    );

  const getReturnedAmount = (sale) =>
    Number(
      sale.returnAmount ??
        sale.totalReturnAmount ??
        0
    );

  const filteredSales = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return salesReturnList.filter((item) => {
      const billNumber =
        item.billNumber ||
        item.billnumber ||
        item.invoiceNumber ||
        "";

      const customerName =
        item.customerName ||
        item.customer ||
        "";

      const productName =
        item.productName ||
        item.product ||
        item.name ||
        "";

      return (
        !keyword ||
        String(billNumber)
          .toLowerCase()
          .includes(keyword) ||
        String(customerName)
          .toLowerCase()
          .includes(keyword) ||
        String(productName)
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [
    salesReturnList,
    searchTerm,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    let expiredCount = 0;
    let upcomingCount = 0;
    let expiryAmount = 0;

    products.forEach((product) => {
      const info = getExpiryInfo(product);

      if (!info) {
        return;
      }

      const quantity = Number(
        product.quantity ??
          product.qty ??
          product.stockQuantity ??
          product.currentStock ??
          1
      );

      const mrp = Number(
        product.mrp ??
          product.rate ??
          0
      );

      expiryAmount += quantity * mrp;

      if (info.days <= 0) {
        expiredCount++;
      } else {
        upcomingCount++;
      }
    });

    const saleReturnQty = salesData.reduce(
      (sum, sale) =>
        sum + getReturnQuantity(sale),
      0
    );

    return {
      expiredCount,
      upcomingCount,
      expiryAmount,
      saleReturnQty,
    };
  }, [products, salesData, getExpiryInfo]);

  // =========================================================
  // EXPIRY ACTION
  // =========================================================

  const openActionModal = (product) => {
    setSelectedProduct(product);
    setSelectedAction(
      product.actionStatus || "Returned"
    );
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (saving) {
      return;
    }

    setShowActionModal(false);
    setSelectedProduct(null);
  };

  const saveActionStatus = async () => {
    if (!selectedProduct) {
      return;
    }

    if (!selectedAction) {
      toast.warning(
        "Please choose an action option"
      );
      return;
    }

    setSaving(true);

    try {
      const targetId =
        selectedProduct.id ||
        selectedProduct._id ||
        selectedProduct.stockId;

      if (!targetId) {
        throw new Error(
          "Unable to identify the stock item"
        );
      }

      const res = await apiFetch(
        `/stock/${targetId}/action`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actionStatus: selectedAction,
          }),
        }
      );

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({}));

        throw new Error(
          err.message ||
            "Failed to update action status"
        );
      }

      toast.success(
        `Action updated to "${selectedAction}"`
      );

      closeActionModal();
      await loadExpiryStock();
    } catch (error) {
      console.error(
        "Save action error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to save action status"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SALES RETURN MODAL
  // =========================================================

  const openSalesReturnModal = (sale) => {
    setSelectedSale(sale);

    const availableQty = Math.max(
      0,
      getSaleQuantity(sale) -
        getReturnQuantity(sale)
    );

    setReturnQty(
      availableQty > 0
        ? String(availableQty)
        : ""
    );

    setReturnReason("");
    setShowSalesReturnModal(true);
  };

  const closeSalesReturnModal = () => {
    if (returnSaving) {
      return;
    }

    setShowSalesReturnModal(false);
    setSelectedSale(null);
    setReturnQty("");
    setReturnReason("");
  };

  const saveSalesReturn = async () => {
    if (!selectedSale) {
      return;
    }

    const quantity = Number(returnQty);

    if (!quantity || quantity <= 0) {
      toast.warning(
        "Enter a valid return quantity"
      );
      return;
    }

    const soldQty = getSaleQuantity(
      selectedSale
    );

    const alreadyReturned =
      getReturnQuantity(selectedSale);

    const availableQty = Math.max(
      0,
      soldQty - alreadyReturned
    );

    if (quantity > availableQty) {
      toast.warning(
        `Return quantity cannot exceed ${availableQty}`
      );
      return;
    }

    if (!returnReason.trim()) {
      toast.warning(
        "Please select a return reason"
      );
      return;
    }

    /*
     * The existing project source exposes sales through
     * subscribeSales, but no sales-return persistence
     * endpoint/service was found in the supplied project
     * sources. Do not silently pretend a return was saved.
     *
     * This handler intentionally reports that the backend
     * return operation must be connected before changing
     * the database.
     */
    setReturnSaving(true);

    try {
      throw new Error(
        "Sales return API is not available in the current project"
      );
    } catch (error) {
      console.error(
        "Sales return error:",
        error
      );

      toast.error(
        "Sales Return screen is ready, but the sales-return API/service is not connected yet."
      );
    } finally {
      setReturnSaving(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  const getExpiryBadgeClass = (info) => {
    if (!info) {
      return "upcoming";
    }

    if (info.days <= 0) {
      return "expired";
    }

    return "upcoming";
  };

  const getActionBadgeClass = (status) => {
    if (status === "Returned") {
      return "returned";
    }

    if (status === "No Stock") {
      return "no-stock";
    }

    return "pending";
  };

  return (
    <>
      <div className="dashboard">
        <Sidebar />

        <div className="dashboard-wrapper">
          <Header />

          <main className="dashboard-content return-management-page">

            {/* <section className="return-hero">
              <div className="return-hero-left">
                <div className="return-hero-icon"><i className="bi bi-cart-x"></i></div>
                <div>
                  <h2>
                    Expiry and Sales Return Management
                  </h2>

                  <p>
                    Monitor expiring stock and manage
                    customer sales returns from one place.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="return-refresh"
                onClick={() => {
                  loadExpiryStock();
                  setSearchTerm("");
                }}
                disabled={loading}
              >
                <i
                  className={`bi ${
                    loading
                      ? "bi-arrow-repeat expiry-spin"
                      : "bi-arrow-clockwise"
                  }`}
                ></i>
                Refresh
              </button>
            </section> */}

            {/* =================================================
                SUMMARY CARDS
                ================================================= */}

            <section className="return-summary-grid">

              <div className="return-summary-card expired">
                <div className="return-summary-icon">
                  <i className="bi bi-calendar-x-fill"></i>
                </div>

                <div>
                  <span>Expired Products</span>
                  <strong>
                    {summary.expiredCount}
                  </strong>
                  <small>
                    Immediate attention required
                  </small>
                </div>
              </div>

              <div className="return-summary-card upcoming">
                <div className="return-summary-icon">
                  <i className="bi bi-calendar2-week-fill"></i>
                </div>

                <div>
                  <span>Upcoming Products</span>
                  <strong>
                    {summary.upcomingCount}
                  </strong>
                  <small>
                    Expiring within 60 days
                  </small>
                </div>
              </div>

              <div className="return-summary-card amount">
                <div className="return-summary-icon">
                  <i className="bi bi-currency-rupee"></i>
                </div>

                <div>
                  <span>Expiry Amount</span>
                  <strong>
                    {formatCurrency(
                      summary.expiryAmount
                    )}
                  </strong>
                  <small>
                    Current expiry stock value
                  </small>
                </div>
              </div>

              <div className="return-summary-card sales">
                <div className="return-summary-icon">
                  <i className="bi bi-box-arrow-left"></i>
                </div>

                <div>
                  <span>Sale Return</span>
                  <strong>
                    {summary.saleReturnQty}
                  </strong>
                  <small>
                    Returned quantity
                  </small>
                </div>
              </div>

            </section>

            {/* =================================================
                TABS
                ================================================= */}

            <section className="return-tabs-card">

              <div className="return-tabs">

                <button
                  type="button"
                  className={`return-tab ${
                    activeTab === "sales"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveTab("sales");
                    setSearchTerm("");
                  }}
                >
                  <i className="bi bi-receipt"></i>
                  Original Return
                </button>

                <button
                  type="button"
                  className={`return-tab ${
                    activeTab === "expiry"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveTab("expiry");
                    setSearchTerm("");
                  }}
                >
                  <i className="bi bi-calendar-x"></i>
                  Expiry Return
                </button>

              </div>

            </section>

            {/* =================================================
                SALES RETURN
                ================================================= */}

            {activeTab === "sales" && (
              <section className="return-content-card">

                <div className="return-content-header">
                  <div>
                    <h4>
                      Sales Return Register
                    </h4>

                    <p>
                      Review sales invoices and
                      identify return eligibility.
                    </p>
                  </div>

                  <div className="justify between flex gap-3">
                    <button type="button" className="btn btn-primary" onClick={() => navigate("/dashboard/sales-return")}>Add Return</button>
                    <span className="return-badge pending">
                      <i className="bi bi-receipt"></i>
                      {filteredSales.length} Bills
                    </span>
                  </div>
                </div>

                <div className="return-toolbar">

                  <div className="return-search">
                    <i className="bi bi-search"></i>

                    <input
                      type="text"
                      placeholder="Search bill, customer or phone..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchTerm("")
                        }
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    )}
                  </div>

                  <select
                    className="return-select"
                    value={salesStatusFilter}
                    onChange={(e) =>
                      setSalesStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Eligible">
                      Eligible
                    </option>

                    <option value="Returned">
                      Returned
                    </option>
                  </select>

                </div>

                <div className="return-table-wrap">
                  <table className="return-table">
                    <thead>
                      <tr>
                        <th>Sl No.</th>
                        <th>Bill Number</th>
                        <th>Customer Name</th>
                        <th>Phone</th>
                        <th>Return Qty</th>
                        <th>Return Amount</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {salesLoading || salesReturnLoading ? (
                        <tr>
                          <td colSpan="7" className="return-empty">
                            <div className="spinner-border spinner-border-sm text-success"></div>
                            <span>Loading sales...</span>
                          </td>
                        </tr>
                      ) : filteredSales.length > 0 ? (
                        filteredSales.map((sale, index) => {
                          const returnedQty = getReturnQuantity(sale);
                          const returnedAmount = getReturnedAmount(sale);
                          // const status = getSaleStatus(sale);

                          // const availableQty = Math.max(
                          //   0,
                          //   getSaleQuantity(sale) - returnedQty
                          // );

                          return (
                            <tr
                              key={
                                getSaleId(sale) || index
                              }
                            >
                              <td>{index + 1}</td>

                              <td>
                                <strong>{getBillNumber(sale)}</strong>
                              </td>

                              <td>
                                <div>
                                  <strong>{getCustomerName(sale)}</strong>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <small>{getCustomerPhone(sale)}</small>
                                </div>
                              </td>

                              <td>
                                <strong>{returnedQty}</strong>
                              </td>

                              <td>
                                <strong>{formatCurrency(returnedAmount)}</strong>
                              </td>

                              <td>
                                <strong>{getSaleDate(sale)}</strong>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="return-action-btn"
                                  onClick={() => openSalesReturnModal(sale)}
                                >
                                  <i className="bi bi-arrow-return-left"></i>
                                  Return
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="return-empty"
                          >
                            <i className="bi bi-receipt-cutoff"></i>

                            <strong>
                              No sales return records found
                            </strong>

                            <span>
                              Sales return records will appear here
                              when available.
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* =================================================
                EXPIRY RETURN
                ================================================= */}

            {activeTab === "expiry" && (
              <section className="return-content-card">

                <div className="return-content-header">

                  <div>
                    <h4>
                      Expiry Return Register
                    </h4>

                    <p>
                      Expired and near-expiry stock
                      requiring action.
                    </p>
                  </div>

                  <span className="return-badge expired">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {filteredProducts.length} Items
                  </span>

                </div>

                <div className="return-toolbar">

                  <div className="return-search">
                    <i className="bi bi-search"></i>

                    <input
                      type="text"
                      placeholder="Search product or batch..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchTerm("")
                        }
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    )}
                  </div>

                  <select
                    className="return-select"
                    value={expiryFilter}
                    onChange={(e) =>
                      setExpiryFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Expiry Windows
                    </option>

                    <option value="Expired">
                      Expired Only
                    </option>

                    <option value="30">
                      Expire in 30 Days
                    </option>

                    <option value="60">
                      Expire in 60 Days
                    </option>
                  </select>

                  <select
                    className="return-select"
                    value={actionFilter}
                    onChange={(e) =>
                      setActionFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Action Status
                    </option>

                    <option value="Pending">
                      Pending Action
                    </option>

                    <option value="Returned">
                      Returned
                    </option>

                    <option value="No Stock">
                      No Stock
                    </option>
                  </select>

                </div>

                <div className="return-table-wrap">

                  <table className="return-table">

                    <thead>
                      <tr>
                        <th>Sl No.</th>
                        <th>Product Name</th>
                        <th>Batch</th>
                        <th>Expiry Date</th>
                        <th>Qty</th>
                        <th>MRP</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {loading ? (
                        <tr>
                          <td
                            colSpan="9"
                            className="return-empty"
                          >
                            <div className="spinner-border spinner-border-sm text-success"></div>

                            <span>
                              Loading expiry stock...
                            </span>
                          </td>
                        </tr>
                      ) : filteredProducts.length >
                        0 ? (
                        filteredProducts.map(
                          (product, index) => {
                            const expiryInfo =
                              getExpiryInfo(
                                product
                              );

                            const productName =
                              product.productName ||
                              product.name ||
                              "Unknown Product";

                            const batch =
                              product.batchNumber ||
                              product.batch ||
                              product.batchNo ||
                              "—";

                            const expiryDate =
                              product.expiryDate ||
                              product.expiry ||
                              product.batchExpiry ||
                              "—";

                            const quantity =
                              Number(
                                product.quantity ??
                                  product.qty ??
                                  product.stockQuantity ??
                                  product.currentStock ??
                                  1
                              );

                            const mrp =
                              Number(
                                product.mrp ??
                                  product.rate ??
                                  0
                              );

                            const amount =
                              quantity * mrp;

                            const actionStatus =
                              product.actionStatus;

                            return (
                              <tr
                                key={
                                  product.id ||
                                  product._id ||
                                  product.stockId ||
                                  `${productName}-${batch}-${index}`
                                }
                              >

                                <td>
                                  {index + 1}
                                </td>

                                <td>
                                  <div className="return-product">

                                    <div className="return-product-icon">
                                      <i className="bi bi-capsule"></i>
                                    </div>

                                    <div>
                                      <strong>
                                        {productName}
                                      </strong>

                                      {product.itemCode && (
                                        <small>
                                          {
                                            product.itemCode
                                          }
                                        </small>
                                      )}
                                    </div>

                                  </div>
                                </td>

                                <td>
                                  <strong>
                                    {batch}
                                  </strong>
                                </td>

                                <td>
                                  <span
                                    className={`return-badge ${getExpiryBadgeClass(
                                      expiryInfo
                                    )}`}
                                  >
                                    <i className="bi bi-calendar-event"></i>
                                    {formatDate(
                                      expiryDate
                                    )}
                                  </span>
                                </td>

                                <td>
                                  {quantity}
                                </td>

                                <td>
                                  {formatCurrency(
                                    mrp
                                  )}
                                </td>

                                <td>
                                  <strong>
                                    {formatCurrency(
                                      amount
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  <span
                                    className={`return-badge ${
                                      expiryInfo?.days <=
                                      0
                                        ? "expired"
                                        : "upcoming"
                                    }`}
                                  >
                                    <i className="bi bi-circle-fill"></i>

                                    {
                                      expiryInfo?.status
                                    }
                                  </span>
                                </td>

                                <td>

                                  {actionStatus ? (
                                    <button
                                      type="button"
                                      className="return-action-btn"
                                      onClick={() =>
                                        openActionModal(
                                          product
                                        )
                                      }
                                    >
                                      <span
                                        className={`return-badge ${getActionBadgeClass(
                                          actionStatus
                                        )}`}
                                      >
                                        {
                                          actionStatus
                                        }
                                      </span>

                                      <i className="bi bi-pencil-square"></i>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="return-action-btn"
                                      onClick={() =>
                                        openActionModal(
                                          product
                                        )
                                      }
                                    >
                                      <i className="bi bi-gear"></i>
                                      {" "}
                                      Select Action
                                    </button>
                                  )}

                                </td>

                              </tr>
                            );
                          }
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="return-empty"
                          >
                            <i className="bi bi-box-seam"></i>

                            <strong>
                              No expired or near-expiry
                              items found
                            </strong>

                            <span>
                              Try changing the search or
                              expiry filters.
                            </span>
                          </td>
                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </section>
            )}

          </main>

          {/* =================================================
              EXPIRY ACTION MODAL
              ================================================= */}

          {showActionModal &&
            selectedProduct && (
              <div
                className="return-modal-overlay"
                onClick={closeActionModal}
              >
                <div
                  className="return-modal"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  <div className="return-modal-head">

                    <div>
                      <h3>
                        Expiry Stock Action
                      </h3>

                      <small>
                        Choose how this batch should
                        be handled.
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={closeActionModal}
                      disabled={saving}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>

                  </div>

                  <div className="return-modal-body">

                    <div className="return-detail-grid">

                      <div className="return-detail">
                        <small>
                          Product
                        </small>

                        <strong>
                          {selectedProduct.productName ||
                            selectedProduct.name ||
                            "Unknown"}
                        </strong>
                      </div>

                      <div className="return-detail">
                        <small>
                          Batch
                        </small>

                        <strong>
                          {selectedProduct.batchNumber ||
                            selectedProduct.batch ||
                            selectedProduct.batchNo ||
                            "—"}
                        </strong>
                      </div>

                      <div className="return-detail">
                        <small>
                          Expiry
                        </small>

                        <strong>
                          {formatDate(
                            selectedProduct.expiryDate ||
                              selectedProduct.expiry ||
                              selectedProduct.batchExpiry
                          )}
                        </strong>
                      </div>

                    </div>

                    <label className="return-form-label">
                      Action
                    </label>

                    <select
                      className="return-form-select"
                      value={selectedAction}
                      onChange={(e) =>
                        setSelectedAction(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Action
                      </option>

                      <option value="Returned">
                        Returned to Vendor
                      </option>

                      <option value="No Stock">
                        No Stock / Written Off
                      </option>
                    </select>

                  </div>

                  <div className="return-modal-foot">

                    <button
                      type="button"
                      className="return-cancel"
                      onClick={closeActionModal}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="return-save"
                      onClick={saveActionStatus}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          {" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle"></i>
                          {" "}
                          Save Action
                        </>
                      )}
                    </button>

                  </div>

                </div>
              </div>
            )}

          {/* =================================================
              SALES RETURN MODAL
              ================================================= */}

          {showSalesReturnModal &&
            selectedSale && (
              <div
                className="return-modal-overlay"
                onClick={closeSalesReturnModal}
              >
                <div
                  className="return-modal"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  <div className="return-modal-head">

                    <div>
                      <h3>
                        Process Sales Return
                      </h3>

                      <small>
                        Review the invoice before
                        submitting the return.
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={closeSalesReturnModal}
                      disabled={returnSaving}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>

                  </div>

                  <div className="return-modal-body">

                    <div className="return-detail-grid">

                      <div className="return-detail">
                        <small>
                          Bill Number
                        </small>

                        <strong>
                          {getBillNumber(
                            selectedSale
                          )}
                        </strong>
                      </div>

                      <div className="return-detail">
                        <small>
                          Customer
                        </small>

                        <strong>
                          {getCustomerName(
                            selectedSale
                          )}
                        </strong>
                      </div>

                      <div className="return-detail">
                        <small>
                          Available Qty
                        </small>

                        <strong>
                          {Math.max(
                            0,
                            getSaleQuantity(
                              selectedSale
                            ) -
                              getReturnQuantity(
                                selectedSale
                              )
                          )}
                        </strong>
                      </div>

                    </div>

                    <label className="return-form-label">
                      Return Quantity
                    </label>

                    <input
                      className="return-form-input"
                      type="number"
                      min="1"
                      max={Math.max(
                        0,
                        getSaleQuantity(
                          selectedSale
                        ) -
                          getReturnQuantity(
                            selectedSale
                          )
                      )}
                      value={returnQty}
                      onChange={(e) =>
                        setReturnQty(
                          e.target.value
                        )
                      }
                    />

                    <label className="return-form-label">
                      Return Reason
                    </label>

                    <select
                      className="return-form-select"
                      value={returnReason}
                      onChange={(e) =>
                        setReturnReason(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Reason
                      </option>

                      <option value="Damaged Product">
                        Damaged Product
                      </option>

                      <option value="Wrong Product">
                        Wrong Product
                      </option>

                      <option value="Customer Request">
                        Customer Request
                      </option>

                      <option value="Quality Issue">
                        Quality Issue
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                  </div>

                  <div className="return-modal-foot">

                    <button
                      type="button"
                      className="return-cancel"
                      onClick={closeSalesReturnModal}
                      disabled={returnSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="return-save"
                      onClick={saveSalesReturn}
                      disabled={returnSaving}
                    >
                      {returnSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          {" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-return-left"></i>
                          {" "}
                          Process Return
                        </>
                      )}
                    </button>

                  </div>

                </div>
              </div>
            )}

        </div>
      </div>
    </>
  );
};

export default ExpiryReturn;