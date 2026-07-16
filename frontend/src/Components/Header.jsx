// import React from "react";

export default function Header() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

  const displayName =
    loggedInUser?.role?.toLowerCase() === "admin"
      ? capitalize(loggedInUser.role)
      : capitalize(loggedInUser?.username);

  return (
    <header className="dashboard-header text-center">
      <h3 className="text-black">Welcome to the Dashboard, <span className="text-primary">{displayName}</span></h3>

      <div className="profile">
        <i className="bi bi-bell-fill notification-icon"></i>

        <div className="avatar">
          <img src="https://i.pravatar.cc/50" alt="Profile" />
        </div>
      </div>
    </header>
  );
}