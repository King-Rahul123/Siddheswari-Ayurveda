import { apiFetch } from "../api/apiClient";

// Generate Next Product Code
export const getNextProductCode = async () => {
  const res = await apiFetch("/products/next-code");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate product code");
  return data.code;
};

// Add Product
export const addProduct = async (product) => {
  const res = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(product)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add product");
  return data;
};

// Real-time Products
export const subscribeProducts = (callback) => {
  let isMounted = true;

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("/products");
      if (res.ok) {
        const products = await res.json();
        if (isMounted) {
          callback(products.map((p) => ({ docId: p.itemCode || p._id, ...p })));
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  fetchProducts();
  const interval = setInterval(fetchProducts, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};