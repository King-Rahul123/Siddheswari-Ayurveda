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
  const [actionFilter, setActionFilter] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [saving, setSaving] = useState(false);

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
     DATE HANDLING
     ========================================================= */

  const parseDate = (value) => {
    if (!value || value === "—" || value === "-") return null;

    const str = String(value).trim();

    // 1. Prioritize MM/YY or MM/YYYY format (e.g. "01/28", "03/28", "06/27", "02/28", "12/2028")
    const mmyyMatch = str.match(/^(0[1-9]|1[0-2])[\/-](\d{2}|\d{4})$/);
    if (mmyyMatch) {
      const month = parseInt(mmyyMatch[1], 10);
      let year = parseInt(mmyyMatch[2], 10);
      if (year < 100) {
        year += 2000;
      }
      const lastDay = new Date(year, month, 0).getDate();
      return new Date(year, month - 1, lastDay);
    }

    // 2. Check DD/MM/YYYY or DD-MM-YYYY format (e.g. "28/01/2028")
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10);
      const year = parseInt(ddmmyyyyMatch[3], 10);
      return new Date(year, month - 1, day);
    }

    // 3. Check YYYY-MM-DD format (e.g. "2028-01-31")
    const yyyymmddMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if (yyyymmddMatch) {
      const year = parseInt(yyyymmddMatch[1], 10);
      const month = parseInt(yyyymmddMatch[2], 10);
      const day = parseInt(yyyymmddMatch[3], 10);
      return new Date(year, month - 1, day);
    }

    // 4. Fallback for valid full dates (only if year is > 2005)
    const date = new Date(str);
    if (!Number.isNaN(date.getTime()) && date.getFullYear() > 2005) {
      return date;
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
     EXPIRY STATUS COMPUTATION (Only Expired & ≤60 Days)
     ========================================================= */

  const getExpiryInfo = (product) => {
    const expiryDateStr = product.expiryDate || product.expiry || product.batchExpiry || null;
    const expiry = parseDate(expiryDateStr);

    if (!expiry) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);

    if (days <= 0) {
      return {
        days,
        status: "Expired",
        label: "Expired",
        className: "expired",
      };
    }

    if (days <= 30) {
      return {
        days,
        status: "Expire in 30 days",
        label: "Expire in 30 days",
        className: "critical",
      };
    }

    if (days <= 60) {
      return {
        days,
        status: "Expire in 60 days",
        label: "Expire in 60 days",
        className: "near-expiry",
      };
    }

    return null; // Exclude safe products (>60 days)
  };

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const expiryInfo = getExpiryInfo(product);
      if (!expiryInfo) return false; // Show ONLY expired or <= 60 days

      const productName = product.productName || product.name || "Unknown Product";
      const batch = product.batchNumber || product.batch || product.batchNo || "—";
      const actionStatus = product.actionStatus || "";

      const matchesSearch =
        !keyword ||
        String(productName).toLowerCase().includes(keyword) ||
        String(batch).toLowerCase().includes(keyword);

      let matchesExpiry = true;
      if (expiryFilter === "Expired") {
        matchesExpiry = expiryInfo.days <= 0;
      } else if (expiryFilter === "30") {
        matchesExpiry = expiryInfo.days > 0 && expiryInfo.days <= 30;
      } else if (expiryFilter === "60") {
        matchesExpiry = expiryInfo.days > 30 && expiryInfo.days <= 60;
      }

      let matchesAction = true;
      if (actionFilter === "Pending") {
        matchesAction = !actionStatus;
      } else if (actionFilter === "Returned") {
        matchesAction = actionStatus === "Returned";
      } else if (actionFilter === "No Stock") {
        matchesAction = actionStatus === "No Stock";
      }

      return matchesSearch && matchesExpiry && matchesAction;
    });
  }, [products, searchTerm, expiryFilter, actionFilter]);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const summary = useMemo(() => {
    let expiredCount = 0;
    let expire30Count = 0;
    let expire60Count = 0;

    products.forEach((product) => {
      const info = getExpiryInfo(product);
      if (!info) return;

      if (info.days <= 0) expiredCount++;
      else if (info.days <= 30) expire30Count++;
      else if (info.days <= 60) expire60Count++;
    });

    return {
      expiredCount,
      expire30Count,
      expire60Count,
      totalCount: expiredCount + expire30Count + expire60Count,
    };
  }, [products]);

  /* =========================================================
     ACTION MODAL HANDLERS
     ========================================================= */

  const openActionModal = (product) => {
    setSelectedProduct(product);
    setSelectedAction(product.actionStatus || "Returned");
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (saving) return;
    setShowActionModal(false);
    setSelectedProduct(null);
  };

  const saveActionStatus = async () => {
    if (!selectedProduct) return;
    if (!selectedAction) {
      toast.warning("Please choose an action option");
      return;
    }

    setSaving(true);

    try {
      const targetId =
        selectedProduct.id ||
        selectedProduct._id ||
        selectedProduct.stockId;

      const res = await apiFetch(`/stock/${targetId}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionStatus: selectedAction }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update action status");
      }

      toast.success(`Action updated to "${selectedAction}"`);
      closeActionModal();
      await loadExpiryStock();
    } catch (error) {
      console.error("Save action error:", error);
      toast.error(error.message || "Unable to save action status");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CURRENCY FORMATTER
     ========================================================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        <Header />

        <main className="dashboard-content expiry-return-page">
          {/* PAGE HEADER */}
          <div className="expiry-page-header">
            <div className="expiry-title-row">
              <div className="expiry-title-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div>
                <h2>Expiry Control</h2>
                <p>Track expired products and items expiring in 30 or 60 days</p>
              </div>
            </div>

            <button
              className="expiry-refresh-btn"
              onClick={loadExpiryStock}
              disabled={loading}
            >
              <i
                className={`bi ${
                  loading ? "bi-arrow-repeat expiry-spin" : "bi-arrow-clockwise"
                }`}
              ></i>
              Refresh Stock
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <section className="expiry-summary-grid">
            <div className="expiry-summary-card expired-card">
              <div className="expiry-summary-icon">
                <i className="bi bi-calendar-x-fill"></i>
              </div>
              <div>
                <span>Expired Products</span>
                <strong>{summary.expiredCount}</strong>
                <small>Immediate action needed</small>
              </div>
            </div>

            <div className="expiry-summary-card critical-card">
              <div className="expiry-summary-icon">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <span>Expire in 30 Days</span>
                <strong>{summary.expire30Count}</strong>
                <small>Critical window</small>
              </div>
            </div>

            <div className="expiry-summary-card near-card">
              <div className="expiry-summary-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <span>Expire in 60 Days</span>
                <strong>{summary.expire60Count}</strong>
                <small>Review & plan return</small>
              </div>
            </div>

            <div className="expiry-summary-card value-card">
              <div className="expiry-summary-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <span>Total Expiring Items</span>
                <strong>{summary.totalCount}</strong>
                <small>Products tracked</small>
              </div>
            </div>
          </section>

          {/* SEARCH & FILTERS */}
          <section className="expiry-toolbar-card">
            <div className="expiry-search">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search product or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <div className="expiry-filters">
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
              >
                <option value="All">All Expiry Windows</option>
                <option value="Expired">Expired Only</option>
                <option value="30">Expire in 30 Days</option>
                <option value="60">Expire in 60 Days</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="All">All Action Status</option>
                <option value="Pending">Pending Action</option>
                <option value="Returned">Returned</option>
                <option value="No Stock">No Stock</option>
              </select>
            </div>
          </section>

          {/* TABLE */}
          <section className="expiry-table-card">
            <div className="expiry-table-header">
              <div>
                <h4>Expiry Stock Register</h4>
                <p>{filteredProducts.length} items shown</p>
              </div>

              <div className="expiry-legend">
                <span>
                  <i className="bi bi-circle-fill legend-expired"></i> Expired
                </span>
                <span>
                  <i className="bi bi-circle-fill legend-critical"></i> Expire in 30 days
                </span>
                <span>
                  <i className="bi bi-circle-fill legend-near"></i> Expire in 60 days
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dashboard-table expiry-table">
                <thead>
                  <tr>
                    <th>Sl No.</th>
                    <th>Product Name</th>
                    <th>Batch</th>
                    <th>Expiry Date</th>
                    <th>MRP</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="expiry-loading">
                        <div className="spinner-border spinner-border-sm text-success"></div>
                        <span>Loading expiry stock...</span>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => {
                      const expiryInfo = getExpiryInfo(product);
                      const productName =
                        product.productName || product.name || "Unknown Product";
                      const batch =
                        product.batchNumber || product.batch || product.batchNo || "—";
                      const expiryDateStr =
                        product.expiryDate || product.expiry || product.batchExpiry || "—";
                      const mrp = Number(product.mrp || product.rate || 0);

                      return (
                        <tr
                          key={
                            product.id ||
                            product._id ||
                            product.stockId ||
                            `${productName}-${batch}-${index}`
                          }
                        >
                          <td className="text-center">{index + 1}</td>

                          <td>
                            <div className="expiry-product-cell">
                              <div className="expiry-product-icon">
                                <i className="bi bi-capsule"></i>
                              </div>
                              <div>
                                <strong>{productName}</strong>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="batch-pill">{batch}</span>
                          </td>

                          <td>
                            <div className={`expiry-date ${expiryInfo?.className}`}>
                              <strong>{formatDate(expiryDateStr)}</strong>
                            </div>
                          </td>

                          <td className="expiry-rate">
                            {formatCurrency(mrp)}
                          </td>

                          <td>
                            <span className={`expiry-status ${expiryInfo?.className}`}>
                              <i className="bi bi-circle-fill"></i>
                              {expiryInfo?.status}
                            </span>
                          </td>

                          <td>
                            {product.actionStatus ? (
                              <button
                                type="button"
                                className={`btn-action-badge ${product.actionStatus.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => openActionModal(product)}
                                title="Click to edit action"
                              >
                                <span>{product.actionStatus}</span>
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-select-action"
                                onClick={() => openActionModal(product)}
                              >
                                <i className="bi bi-gear"></i> Select Action
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="expiry-empty-state">
                        <div className="expiry-empty-icon">
                          <i className="bi bi-box-seam"></i>
                        </div>
                        <h5>No expired or near-expiry items found</h5>
                        <p>Try changing your search or filter options.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* ACTION MODAL */}
        {showActionModal && selectedProduct && (
          <div className="expiry-modal-overlay" onClick={closeActionModal}>
            <div
              className="expiry-action-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="expiry-modal-top">
                <div className="expiry-modal-icon">
                  <i className="bi bi-gear-wide-connected"></i>
                </div>
                <button
                  className="expiry-close-btn"
                  onClick={closeActionModal}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="expiry-modal-heading">
                <span>CHOOSE PRODUCT ACTION</span>
                <h3>{selectedProduct.productName || selectedProduct.name || "Unknown Product"}</h3>
                <p>Batch: {selectedProduct.batch || selectedProduct.batchNumber || "—"}</p>
              </div>

              <div className="expiry-stock-info">
                <div>
                  <small>Expiry Date</small>
                  <strong>{formatDate(selectedProduct.expiryDate || selectedProduct.expiry)}</strong>
                </div>
                <div>
                  <small>MRP</small>
                  <strong>{formatCurrency(selectedProduct.mrp || 0)}</strong>
                </div>
                <div>
                  <small>Status</small>
                  <strong>{getExpiryInfo(selectedProduct)?.status || "—"}</strong>
                </div>
              </div>

              <div className="action-options-grid">
                <label
                  className={`action-option-card ${
                    selectedAction === "Returned" ? "selected returned" : ""
                  }`}
                  onClick={() => setSelectedAction("Returned")}
                >
                  <input
                    type="radio"
                    name="stockAction"
                    value="Returned"
                    checked={selectedAction === "Returned"}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  />
                  <div className="option-content">
                    <i className="bi bi-box-arrow-left icon-returned"></i>
                    <div>
                      <strong>Returned</strong>
                      <span>Mark product batch as returned to vendor</span>
                    </div>
                  </div>
                </label>

                <label
                  className={`action-option-card ${
                    selectedAction === "No Stock" ? "selected nostock" : ""
                  }`}
                  onClick={() => setSelectedAction("No Stock")}
                >
                  <input
                    type="radio"
                    name="stockAction"
                    value="No Stock"
                    checked={selectedAction === "No Stock"}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  />
                  <div className="option-content">
                    <i className="bi bi-slash-circle icon-nostock"></i>
                    <div>
                      <strong>No Stock</strong>
                      <span>Mark product as no stock / written off</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="expiry-modal-footer">
                <button
                  type="button"
                  className="expiry-cancel-btn"
                  onClick={closeActionModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="expiry-confirm-btn"
                  onClick={saveActionStatus}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i> Save Action
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