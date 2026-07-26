import { apiFetch } from "../api/apiClient";

// Generate next companies Code
export const getNextcompaniesCode = async () => {
  const res = await apiFetch("/companies/next-code");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate company code");
  return data.code;
};

// Add companies
export const addcompanies = async (companies) => {
  const res = await apiFetch("/companies", {
    method: "POST",
    body: JSON.stringify(companies)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add company");
  return data;
};

// Real-time companiess
export const subscribecompanies = (callback) => {
  let isMounted = true;

  const fetchCompanies = async () => {
    try {
      const res = await apiFetch("/companies");
      if (res.ok) {
        const companies = await res.json();
        if (isMounted) {
          callback(companies.map((c) => ({ docId: c.companiesCode || c._id, ...c })));
        }
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  fetchCompanies();
  const interval = setInterval(fetchCompanies, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};