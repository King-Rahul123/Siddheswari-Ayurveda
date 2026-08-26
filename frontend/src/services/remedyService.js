import { apiFetch } from "../api/apiClient";

// Fetch all remedies
export const getRemedies = async () => {
  const res = await apiFetch("/remedies");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch remedies");
  return data;
};

// Add new remedy (supports FormData for image file upload or JSON object)
export const addRemedy = async (remedyData) => {
  let body;
  if (remedyData instanceof FormData) {
    body = remedyData;
  } else {
    body = JSON.stringify(remedyData);
  }

  const res = await apiFetch("/remedies", {
    method: "POST",
    body: body,
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw || "Server returned an invalid response" };
  }

  if (!res.ok) throw new Error(data.message || "Failed to save remedy");
  return data;
};

// Real-time subscription to remedies collection
export const subscribeRemedies = (callback) => {
  let isMounted = true;

  const fetchRemediesList = async () => {
    try {
      const res = await apiFetch("/remedies");
      if (res.ok) {
        const remedies = await res.json();
        if (isMounted && Array.isArray(remedies)) {
          callback(remedies);
        }
      }
    } catch (err) {
      console.error("Error fetching remedies subscription:", err);
    }
  };

  fetchRemediesList();
  const interval = setInterval(fetchRemediesList, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
};
