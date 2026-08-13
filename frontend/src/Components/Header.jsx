// import React from "react";

export default function Header() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

  const displayName =
    loggedInUser?.role?.toLowerCase() === "admin"
      ? capitalize(loggedInUser.role)
      : capitalize(loggedInUser?.username);

  // Get first letter of full name
  const avatarLetter =
    loggedInUser?.fullName?.trim()?.charAt(0).toUpperCase() ||
    loggedInUser?.username?.trim()?.charAt(0).toUpperCase();

  return (
    <header className="dashboard-header text-center">
      <h3 className="text-black">Welcome to the Dashboard, <span className="text-primary">{displayName}</span></h3>

      <div className="profile">
        <i className="bi bi-bell-fill notification-icon hidden md:block"></i>

        <div className="avatar">
          <span className="avatar-letter">
            {avatarLetter
          </span>
        </div>
      </div>
    </header>
  );
}