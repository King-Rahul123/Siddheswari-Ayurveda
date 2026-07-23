import { API_BASE_URL } from "../api/config";

// Generate Purchase ID
export const getNextPurchaseId = async () => {
  const res = await fetch(`${API_BASE_URL}/purchases/next-id`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate purchase ID");
  return data.purchaseId;
};

// Save Purchase with Items
export const addPurchase = async (purchaseData, items) => {
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purchaseData, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save purchase");
  return data;
};

// Real-time Purchase List
export const subscribePurchases = (callback) => {
  let isMounted = true;

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases`);
      if (res.ok) {
        const purchases = await res.json();
        if (isMounted) {
          callback(purchases.map((p) => ({ docId: p.purchaseId || p._id, ...p })));
        }
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
    }
  };

  fetchPurchases();
  const interval = setInterval(fetchPurchases, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};