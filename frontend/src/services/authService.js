import { API_BASE_URL } from "../api/config";
import { apiFetch } from "../api/apiClient";

export const login = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      const fallbackMsg = res.status === 404
        ? "Username is not listed"
        : res.status === 400
        ? "Incorrect password"
        : "Login failed";
      throw new Error(data.message || fallbackMsg);
    }

    // Save token and user details
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.user) {
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
    } else {
      localStorage.setItem("loggedInUser", JSON.stringify(data));
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && (error.message.includes("fetch") || error.message.includes("Failed"))) {
      throw new Error("Unable to connect to server. Please check your network connection.");
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  sessionStorage.clear();
};

export const changePassword = async (username, currentPassword, newPassword) => {
  const res = await apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ username, currentPassword, newPassword })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  return true;
};

export const getStaffList = async () => {
  const res = await apiFetch("/auth/staff");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch staff list");
  }
  return data;
};

export const addStaff = async (staff) => {
  const res = await apiFetch("/auth/staff", {
    method: "POST",
    body: JSON.stringify(staff)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to add staff");
  }
  return true;
};

export const updateStaff = async (staff) => {
  const res = await apiFetch(`/auth/staff/${staff.username}`, {
    method: "PUT",
    body: JSON.stringify(staff)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update staff");
  }
  return true;
};

export const deleteStaff = async (username) => {
  const res = await apiFetch(`/auth/staff/${username}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete staff");
  }
  return true;
};

export const resetPassword = () => {
  throw new Error("Reset password is not implemented.");
};