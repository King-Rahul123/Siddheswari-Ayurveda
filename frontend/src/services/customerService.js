import { API_BASE_URL } from "../api/config";

// Generate next Customer Code
export const getNextCustomerCode = async () => {
  const res = await fetch(`${API_BASE_URL}/customers/next-code`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate customer code");
  return data.code;
};

// Add Customer
export const addCustomer = async (customer) => {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add customer");
  return data;
};

// Check customer by phone number
export const checkCustomerPhone = async (phone) => {
  const res = await fetch(`${API_BASE_URL}/customers/check-phone/${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to check phone");
  return data;
};

// Update Customer
export const updateCustomer = async (customerCode, customerData) => {
  const res = await fetch(`${API_BASE_URL}/customers/${encodeURIComponent(customerCode)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update customer");
  return data;
};

// Delete Customer
export const deleteCustomer = async (customerCode) => {
  const res = await fetch(`${API_BASE_URL}/customers/${encodeURIComponent(customerCode)}`, {
    method: "DELETE"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete customer");
  return data;
};

// Real-time customers (polling wrapper)
export const subscribeCustomers = (callback) => {
  let isMounted = true;

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (res.ok) {
        const customers = await res.json();
        if (isMounted) {
          callback(customers.map((c) => ({ docId: c.customerCode || c._id, ...c })));
        }
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  fetchCustomers();
  const interval = setInterval(fetchCustomers, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};