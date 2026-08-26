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

// Update Product
export const updateProduct = async (productId, product) => {
  if (!productId) {
    throw new Error("Product ID is required for update");
  }

  const res = await apiFetch(`/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update product");
  }

  return data;
};

// Delete Product
export const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required for deletion");
  }

  const res = await apiFetch(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete product");
  }

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
        if (isMounted && Array.isArray(products)) {
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