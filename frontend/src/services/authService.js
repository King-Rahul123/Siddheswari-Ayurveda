import { API_BASE_URL } from "../api/config";

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Save login session
  localStorage.setItem(
    "loggedInUser",
    JSON.stringify({
      username: data.username,
      ...data
    })
  );

  return data;
};

export const logout = () => {
  localStorage.removeItem("loggedInUser");
  sessionStorage.clear();
};

export const changePassword = async (username, currentPassword, newPassword) => {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, currentPassword, newPassword })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  localStorage.setItem(
    "loggedInUser",
    JSON.stringify({
      ...loggedInUser,
      password: newPassword
    })
  );

  return true;
};

export const getStaffList = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/staff`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch staff list");
  }
  return data;
};

export const addStaff = async (staff) => {
  const res = await fetch(`${API_BASE_URL}/auth/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staff)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to add staff");
  }
  return true;
};

export const updateStaff = async (staff) => {
  const res = await fetch(`${API_BASE_URL}/auth/staff/${staff.username}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staff)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update staff");
  }
  return true;
};

export const deleteStaff = async (username) => {
  const res = await fetch(`${API_BASE_URL}/auth/staff/${username}`, {
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