import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../api/apiClient";

import "../CSS/Dashboard.css";
import "../CSS/ExpiryReturn.css";

import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

const ExpiryReturn = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Returnable");
  const [supplierFilter, setSupplierFilter] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [returnForm, setReturnForm] = useState({
    quantity: "",
    reason: "Expired Stock",
    supplier: "",
    purchaseInvoice: "",
    returnDate: new Date().toISOString().split("T")[0],
    note: "",
  });

  /* =========================================================
     LOAD EXPIRY STOCK
     ========================================================= */

  useEffect(() => {
    loadExpiryStock();
  }, []);

  const loadExpiryStock = async () => {
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
  };

  /* =========================================================
     HELPER FUNCTIONS
     ========================================================= */

  const getProductName = (product) =>
    product.productName ||
    product.name ||
    product.product ||
    "Unknown Product";

  const getProductCode = (product) =>
    product.productCode ||
    product.code ||
    product.sku ||
    "—";

  const getBatch = (product) =>
    product.batchNumber ||
    product.batch ||
    product.batchNo ||
    "—";

  const getExpiryDate = (product) =>
    product.expiryDate ||
    product.expiry ||
    product.batchExpiry ||
    product.expirationDate ||
    null;

  const getQuantity = (product) =>
    Number(
      product.availableQty ??
        product.stock ??
        product.quantity ??
        product.currentStock ??
        0
    );

  const getPurchaseRate = (product) =>
    Number(
      product.purchaseRate ??
        product.costPrice ??
        product.rate ??
        product.price ??
        0
    );

  const getSupplier = (product) =>
    product.supplierName ||
    product.supplier ||
    product.vendor ||
    "—";

  /* =========================================================
     DATE HANDLING
     ========================================================= */

  const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    const parts = String(value).split(/[/-]/);

    if (parts.length === 3) {
      const [day, month, year] = parts;

      const fallbackDate = new Date(
        `${year}-${month}-${day}`
      );

      if (!Number.isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }
    }

    return null;
  };

  const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) return value || "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     EXPIRY STATUS
     ========================================================= */

  const getExpiryInfo = (product) => {
    const expiry = parseDate(getExpiryDate(product));

    if (!expiry) {
      return {
        days: null,
        status: "Unknown",
        label: "Date unavailable",
        className: "unknown",
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const days = Math.ceil(
      (expiry.getTime() - today.getTime()) / 86400000
    );

    if (days < 0) {
      return {
        days,
        status: "Expired",
        label: `Expired ${Math.abs(days)}d ago`,
        className: "expired",
      };
    }

    if (days <= 30) {
      return {
        days,
        status: "Critical",
        label: `${days}d remaining`,
        className: "critical",
      };
    }

    if (days <= 90) {
      return {
        days,
        status: "Near Expiry",
        label: `${days}d remaining`,
        className: "near-expiry",
      };
    }

    return {
      days,
      status: "Safe",
      label: `${days}d remaining`,
      className: "safe",
    };
  };

  /* =========================================================
     RETURN STATUS
     ========================================================= */

  const getReturnStatus = (product) => {
    const expiryInfo = getExpiryInfo(product);

    if (
      product.returned === true ||
      product.returnStatus === "Returned"
    ) {
      return "Returned";
    }

    if (getQuantity(product) <= 0) {
      return "No Stock";
    }

    if (
      expiryInfo.status === "Expired" ||
      expiryInfo.status === "Critical"
    ) {
      return "Returnable";
    }

    if (expiryInfo.status === "Near Expiry") {
      return "Review";
    }

    return "Safe";
  };

  /* =========================================================
     SUPPLIER LIST
     ========================================================= */

  const suppliers = useMemo(() => {
    const supplierList = products
      .map((product) => getSupplier(product))
      .filter(
        (supplier) =>
          supplier &&
          supplier !== "—"
      );

    return ["All", ...new Set(supplierList)];
  }, [products]);

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const expiryInfo = getExpiryInfo(product);
      const returnStatus = getReturnStatus(product);

      const productName = getProductName(product);
      const batch = getBatch(product);
      const supplier = getSupplier(product);

      const matchesSearch =
        !keyword ||
        String(productName)
          .toLowerCase()
          .includes(keyword) ||
        String(batch)
          .toLowerCase()
          .includes(keyword) ||
        String(supplier)
          .toLowerCase()
          .includes(keyword);

      let matchesExpiry = true;

      if (expiryFilter === "Expired") {
        matchesExpiry =
          expiryInfo.status === "Expired";
      }

      if (expiryFilter === "30") {
        matchesExpiry =
          expiryInfo.days !== null &&
          expiryInfo.days >= 0 &&
          expiryInfo.days <= 30;
      }

      if (expiryFilter === "90") {
        matchesExpiry =
          expiryInfo.days !== null &&
          expiryInfo.days >= 0 &&
          expiryInfo.days <= 90;
      }

      const matchesStatus =
        statusFilter === "All" ||
        returnStatus === statusFilter;

      const matchesSupplier =
        supplierFilter === "All" ||
        supplier === supplierFilter;

      return (
        matchesSearch &&
        matchesExpiry &&
        matchesStatus &&
        matchesSupplier
      );
    });
  }, [
    products,
    searchTerm,
    expiryFilter,
    statusFilter,
    supplierFilter,
  ]);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const summary = useMemo(() => {
    let expiredProducts = 0;
    let criticalProducts = 0;
    let nearExpiryProducts = 0;
    let returnQty = 0;
    let returnValue = 0;

    products.forEach((product) => {
      const expiryInfo = getExpiryInfo(product);

      const quantity = getQuantity(product);
      const rate = getPurchaseRate(product);

      if (expiryInfo.status === "Expired") {
        expiredProducts++;
        returnQty += quantity;
        returnValue += quantity * rate;
      }

      if (expiryInfo.status === "Critical") {
        criticalProducts++;
        returnQty += quantity;
        returnValue += quantity * rate;
      }

      if (expiryInfo.status === "Near Expiry") {
        nearExpiryProducts++;
      }
    });

    return {
      expiredProducts,
      criticalProducts,
      nearExpiryProducts,
      returnQty,
      returnValue,
    };
  }, [products]);

  /* =========================================================
     CURRENCY
     ========================================================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /* =========================================================
     OPEN RETURN MODAL
     ========================================================= */

  const openReturnModal = (product) => {
    const expiryInfo = getExpiryInfo(product);

    setSelectedProduct(product);

    setReturnForm({
      quantity:
        getQuantity(product) > 0
          ? String(getQuantity(product))
          : "",

      reason:
        expiryInfo.status === "Expired"
          ? "Expired Stock"
          : "Near Expiry",

      supplier:
        getSupplier(product) === "—"
          ? ""
          : getSupplier(product),

      purchaseInvoice:
        product.purchaseInvoice ||
        product.invoiceNumber ||
        product.billNumber ||
        "",

      returnDate:
        new Date()
          .toISOString()
          .split("T")[0],

      note: "",
    });

    setShowReturnModal(true);
  };

  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  const closeReturnModal = () => {
    if (saving) return;

    setShowReturnModal(false);
    setSelectedProduct(null);
  };

  /* =========================================================
     SUBMIT RETURN
     ========================================================= */

  const submitReturn = async () => {
    if (!selectedProduct) return;

    const quantity = Number(
      returnForm.quantity
    );

    const availableQuantity =
      getQuantity(selectedProduct);

    if (!quantity || quantity <= 0) {
      toast.warning(
        "Enter a valid return quantity"
      );
      return;
    }

    if (quantity > availableQuantity) {
      toast.warning(
        `Return quantity cannot exceed available stock (${availableQuantity})`
      );
      return;
    }

    if (!returnForm.supplier.trim()) {
      toast.warning(
        "Enter supplier name"
      );
      return;
    }

    if (!returnForm.returnDate) {
      toast.warning(
        "Select return date"
      );
      return;
    }

    setSaving(true);

    try {
      const productId =
        selectedProduct.id ||
        selectedProduct._id ||
        selectedProduct.productId ||
        selectedProduct.code ||
        selectedProduct.productCode;

      const payload = {
        productId,

        productName:
          getProductName(selectedProduct),

        batchNumber:
          getBatch(selectedProduct),

        quantity,

        supplier:
          returnForm.supplier.trim(),

        purchaseInvoice:
          returnForm.purchaseInvoice.trim(),

        reason:
          returnForm.reason,

        returnDate:
          returnForm.returnDate,

        note:
          returnForm.note.trim(),
      };

      const response = await apiFetch(
        "/stock/expiry-return",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.message ||
            "Expiry return failed"
        );
      }

      toast.success(
        `${quantity} unit${
          quantity > 1 ? "s" : ""
        } marked for expiry return`
      );

      setShowReturnModal(false);
      setSelectedProduct(null);

      await loadExpiryStock();
    } catch (error) {
      console.error(
        "Expiry return error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to create expiry return"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-wrapper">

        <Header />

        <main className="dashboard-content expiry-return-page">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="expiry-page-header">

            <div className="expiry-title-row">

              <div className="expiry-title-icon">
                <i className="bi bi-arrow-return-left"></i>
              </div>

              <div>
                <h2>
                  Expiry Return
                </h2>

                <p>
                  Manage expired and
                  near-expiry stock returns
                </p>
              </div>

            </div>

            <button
              className="expiry-refresh-btn"
              onClick={loadExpiryStock}
              disabled={loading}
            >
              <i
                className={`bi ${
                  loading
                    ? "bi-arrow-repeat expiry-spin"
                    : "bi-arrow-clockwise"
                }`}
              ></i>

              Refresh Stock
            </button>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <section className="expiry-summary-grid">

            <div className="expiry-summary-card expired-card">

              <div className="expiry-summary-icon">
                <i className="bi bi-calendar-x-fill"></i>
              </div>

              <div>
                <span>
                  Expired Products
                </span>

                <strong>
                  {summary.expiredProducts}
                </strong>

                <small>
                  Immediate attention
                </small>
              </div>

            </div>

            <div className="expiry-summary-card critical-card">

              <div className="expiry-summary-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>

              <div>
                <span>
                  Within 30 Days
                </span>

                <strong>
                  {summary.criticalProducts}
                </strong>

                <small>
                  Critical expiry window
                </small>
              </div>

            </div>

            <div className="expiry-summary-card near-card">

              <div className="expiry-summary-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>

              <div>
                <span>
                  Within 90 Days
                </span>

                <strong>
                  {summary.nearExpiryProducts}
                </strong>

                <small>
                  Review for return
                </small>
              </div>

            </div>

            <div className="expiry-summary-card value-card">

              <div className="expiry-summary-icon">
                <i className="bi bi-box-arrow-up"></i>
              </div>

              <div>
                <span>
                  Returnable Quantity
                </span>

                <strong>
                  {summary.returnQty}
                </strong>

                <small>
                  {formatCurrency(
                    summary.returnValue
                  )} stock value
                </small>
              </div>

            </div>

          </section>

          {/* =================================================
              ALERT
          ================================================= */}

          <section className="expiry-alert">

            <div className="expiry-alert-icon">
              <i className="bi bi-shield-exclamation"></i>
            </div>

            <div>

              <strong>
                Expiry Control
              </strong>

              <p>
                Verify product, batch,
                expiry date and available
                quantity before confirming
                a supplier return.
              </p>

            </div>

          </section>

          {/* =================================================
              SEARCH & FILTER
          ================================================= */}

          <section className="expiry-toolbar-card">

            <div className="expiry-search">

              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search product, batch or supplier..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
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

            <div className="expiry-filters">

              <select
                value={expiryFilter}
                onChange={(event) =>
                  setExpiryFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Expiry
                </option>

                <option value="Expired">
                  Expired
                </option>

                <option value="30">
                  Within 30 Days
                </option>

                <option value="90">
                  Within 90 Days
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Returnable">
                  Returnable
                </option>

                <option value="Review">
                  Review
                </option>

                <option value="Returned">
                  Returned
                </option>

                <option value="Safe">
                  Safe
                </option>

                <option value="No Stock">
                  No Stock
                </option>
              </select>

              <select
                value={supplierFilter}
                onChange={(event) =>
                  setSupplierFilter(
                    event.target.value
                  )
                }
              >
                {suppliers.map(
                  (supplier) => (
                    <option
                      key={supplier}
                      value={supplier}
                    >
                      {supplier === "All"
                        ? "All Suppliers"
                        : supplier}
                    </option>
                  )
                )}
              </select>

            </div>

          </section>

          {/* =================================================
              TABLE
          ================================================= */}

          <section className="expiry-table-card">

            <div className="expiry-table-header">

              <div>

                <h4>
                  Expiry Stock Register
                </h4>

                <p>
                  {filteredProducts.length}{" "}
                  products shown
                </p>

              </div>

              <div className="expiry-legend">

                <span>
                  <i className="bi bi-circle-fill legend-expired"></i>
                  Expired
                </span>

                <span>
                  <i className="bi bi-circle-fill legend-critical"></i>
                  ≤ 30 Days
                </span>

                <span>
                  <i className="bi bi-circle-fill legend-near"></i>
                  ≤ 90 Days
                </span>

              </div>

            </div>

            <div className="table-responsive">

              <table className="dashboard-table expiry-table">

                <thead>

                  <tr>
                    <th>Sl.</th>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Expiry Date</th>
                    <th>Available</th>
                    <th>Purchase Rate</th>
                    <th>Supplier</th>
                    <th>Expiry Status</th>
                    <th>Return Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="10"
                        className="expiry-loading"
                      >

                        <div className="spinner-border spinner-border-sm text-success"></div>

                        <span>
                          Loading expiry stock...
                        </span>

                      </td>

                    </tr>

                  ) : filteredProducts.length > 0 ? (

                    filteredProducts.map(
                      (product, index) => {

                        const expiryInfo =
                          getExpiryInfo(
                            product
                          );

                        const returnStatus =
                          getReturnStatus(
                            product
                          );

                        const quantity =
                          getQuantity(
                            product
                          );

                        return (

                          <tr
                            key={
                              product.id ||
                              product._id ||
                              `${getProductName(
                                product
                              )}-${getBatch(
                                product
                              )}-${index}`
                            }
                          >

                            <td className="text-center">
                              {index + 1}
                            </td>

                            <td>

                              <div className="expiry-product-cell">

                                <div className="expiry-product-icon">
                                  <i className="bi bi-capsule"></i>
                                </div>

                                <div>

                                  <strong>
                                    {getProductName(
                                      product
                                    )}
                                  </strong>

                                  <small>
                                    {getProductCode(
                                      product
                                    )}
                                  </small>

                                </div>

                              </div>

                            </td>

                            <td>
                              <span className="batch-pill">
                                {getBatch(
                                  product
                                )}
                              </span>
                            </td>

                            <td>

                              <div
                                className={`expiry-date ${expiryInfo.className}`}
                              >

                                <strong>
                                  {formatDate(
                                    getExpiryDate(
                                      product
                                    )
                                  )}
                                </strong>

                                <small>
                                  {
                                    expiryInfo.label
                                  }
                                </small>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`stock-qty ${
                                  quantity <= 0
                                    ? "zero"
                                    : ""
                                }`}
                              >
                                {quantity}
                              </span>

                            </td>

                            <td className="expiry-rate">
                              {formatCurrency(
                                getPurchaseRate(
                                  product
                                )
                              )}
                            </td>

                            <td>
                              {getSupplier(
                                product
                              )}
                            </td>

                            <td>

                              <span
                                className={`expiry-status ${expiryInfo.className}`}
                              >

                                <i className="bi bi-circle-fill"></i>

                                {
                                  expiryInfo.status
                                }

                              </span>

                            </td>

                            <td>

                              <span
                                className={`return-status ${returnStatus
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                              >
                                {
                                  returnStatus
                                }
                              </span>

                            </td>

                            <td>

                              {returnStatus ===
                                "Returnable" &&
                              quantity > 0 ? (

                                <button
                                  className="expiry-return-btn"
                                  onClick={() =>
                                    openReturnModal(
                                      product
                                    )
                                  }
                                >
                                  <i className="bi bi-arrow-return-left"></i>
                                  Return
                                </button>

                              ) : returnStatus ===
                                  "Review" &&
                                quantity > 0 ? (

                                <button
                                  className="expiry-review-btn"
                                  onClick={() =>
                                    openReturnModal(
                                      product
                                    )
                                  }
                                >
                                  <i className="bi bi-eye"></i>
                                  Review
                                </button>

                              ) : (

                                <span className="no-action">
                                  —
                                </span>

                              )}

                            </td>

                          </tr>

                        );
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="10"
                        className="expiry-empty-state"
                      >

                        <div className="expiry-empty-icon">
                          <i className="bi bi-box-seam"></i>
                        </div>

                        <h5>
                          No expiry stock found
                        </h5>

                        <p>
                          Try changing your
                          search or filters.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

        {/* =================================================
            RETURN MODAL
        ================================================= */}

        {showReturnModal &&
          selectedProduct && (

            <div
              className="expiry-modal-overlay"
              onClick={
                closeReturnModal
              }
            >

              <div
                className="expiry-return-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div className="expiry-modal-top">

                  <div className="expiry-modal-icon">
                    <i className="bi bi-arrow-return-left"></i>
                  </div>

                  <button
                    className="expiry-close-btn"
                    onClick={
                      closeReturnModal
                    }
                    disabled={saving}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                </div>

                <div className="expiry-modal-heading">

                  <span>
                    STOCK RETURN
                  </span>

                  <h3>
                    {getProductName(
                      selectedProduct
                    )}
                  </h3>

                  <p>
                    Batch:{" "}
                    {getBatch(
                      selectedProduct
                    )}
                  </p>

                </div>

                {/* STOCK INFO */}

                <div className="return-stock-info">

                  <div>

                    <small>
                      Expiry Date
                    </small>

                    <strong>
                      {formatDate(
                        getExpiryDate(
                          selectedProduct
                        )
                      )}
                    </strong>

                  </div>

                  <div>

                    <small>
                      Available Stock
                    </small>

                    <strong>
                      {getQuantity(
                        selectedProduct
                      )}{" "}
                      units
                    </strong>

                  </div>

                  <div>

                    <small>
                      Purchase Rate
                    </small>

                    <strong>
                      {formatCurrency(
                        getPurchaseRate(
                          selectedProduct
                        )
                      )}
                    </strong>

                  </div>

                </div>

                {/* FORM */}

                <div className="expiry-return-form">

                  <div className="return-form-row">

                    <div>

                      <label>
                        Return Quantity
                      </label>

                      <div className="return-quantity-input">

                        <i className="bi bi-box-arrow-up"></i>

                        <input
                          type="number"
                          min="1"
                          max={getQuantity(
                            selectedProduct
                          )}
                          value={
                            returnForm.quantity
                          }
                          onChange={(event) =>
                            setReturnForm(
                              (previous) => ({
                                ...previous,
                                quantity:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          placeholder="Enter quantity"
                        />

                        <span>
                          units
                        </span>

                      </div>

                    </div>

                    <div>

                      <label>
                        Return Reason
                      </label>

                      <select
                        value={
                          returnForm.reason
                        }
                        onChange={(event) =>
                          setReturnForm(
                            (previous) => ({
                              ...previous,
                              reason:
                                event.target
                                  .value,
                            })
                          )
                        }
                      >

                        <option>
                          Expired Stock
                        </option>

                        <option>
                          Near Expiry
                        </option>

                        <option>
                          Damaged Packaging
                        </option>

                        <option>
                          Supplier Recall
                        </option>

                        <option>
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                  <div className="return-form-row">

                    <div>

                      <label>
                        Supplier
                      </label>

                      <input
                        type="text"
                        value={
                          returnForm.supplier
                        }
                        onChange={(event) =>
                          setReturnForm(
                            (previous) => ({
                              ...previous,
                              supplier:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="Supplier name"
                      />

                    </div>

                    <div>

                      <label>
                        Purchase Invoice
                      </label>

                      <input
                        type="text"
                        value={
                          returnForm.purchaseInvoice
                        }
                        onChange={(event) =>
                          setReturnForm(
                            (previous) => ({
                              ...previous,
                              purchaseInvoice:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="Invoice number"
                      />

                    </div>

                  </div>

                  <div className="return-form-row">

                    <div>

                      <label>
                        Return Date
                      </label>

                      <input
                        type="date"
                        value={
                          returnForm.returnDate
                        }
                        onChange={(event) =>
                          setReturnForm(
                            (previous) => ({
                              ...previous,
                              returnDate:
                                event.target
                                  .value,
                            })
                          )
                        }
                      />

                    </div>

                    <div>

                      <label>
                        Estimated Return Value
                      </label>

                      <div className="return-value-box">

                        {formatCurrency(
                          Number(
                            returnForm.quantity ||
                              0
                          ) *
                            getPurchaseRate(
                              selectedProduct
                            )
                        )}

                      </div>

                    </div>

                  </div>

                  <label>
                    Notes{" "}
                    <span>
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    rows="3"
                    value={
                      returnForm.note
                    }
                    onChange={(event) =>
                      setReturnForm(
                        (previous) => ({
                          ...previous,
                          note:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Add any return notes..."
                  ></textarea>

                </div>

                {/* FOOTER */}

                <div className="expiry-return-footer">

                  <button
                    className="expiry-cancel-btn"
                    onClick={
                      closeReturnModal
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    className="expiry-confirm-btn"
                    onClick={
                      submitReturn
                    }
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

                        Confirm Return
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
};

export default ExpiryReturn;