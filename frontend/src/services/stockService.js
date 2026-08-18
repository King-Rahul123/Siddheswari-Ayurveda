import { apiFetch } from "../api/apiClient";

// Generate Stock ID
export const getNextStockId = async () => {
  const res = await apiFetch("/stock/next-id");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate stock ID");
  return data.stockId;
};

// Add Stock Batch
export const addStock = async (stock) => {
  const res = await apiFetch("/stock", {
    method: "POST",
    body: JSON.stringify(stock)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add stock");
  return data;
};

// Subscribe Stock
export const subscribeStock = (callback) => {
  let isMounted = true;

  const fetchStock = async () => {
    try {
      const res = await apiFetch("/stock");
      if (res.ok) {
        const stockList = await res.json();
        if (isMounted && Array.isArray(stockList)) {
          callback(stockList.map((s) => ({ docId: s.stockId || s._id, ...s })));
        }
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  fetchStock();
  const interval = setInterval(fetchStock, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};