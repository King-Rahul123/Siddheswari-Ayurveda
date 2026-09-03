import { apiFetch } from "../api/apiClient";

// Show next bill number without incrementing
export const getCurrentSaleId = async () => {
  const res = await apiFetch("/sales/current-id");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch current sale ID");
  return data.saleId;
};

// Generate Next Sale ID
export const getNextSaleId = async () => {
  const res = await apiFetch("/sales/next-id");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate sale ID");
  return data.saleId;
};

// Save Sale with Items
export const addSale = async (saleData, items) => {
  const res = await apiFetch("/sales", {
    method: "POST",
    body: JSON.stringify({ saleData, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save sale");
  return data;
};

export const updateSale = async (saleId, saleData, items) => {
  const res = await apiFetch(`/sales/${encodeURIComponent(saleId)}`, {
    method: "PUT",
    body: JSON.stringify({ saleData, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update sale");
  return data;
};

// Real-time Sales
export const subscribeSales = (callback) => {
  let isMounted = true;

  const fetchSales = async () => {
    try {
      const res = await apiFetch("/sales");
      if (res.ok) {
        const sales = await res.json();
        if (isMounted) {
          callback(sales.map((s) => ({ docId: s.saleId || s._id, ...s })));
        }
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  fetchSales();
  const interval = setInterval(fetchSales, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};