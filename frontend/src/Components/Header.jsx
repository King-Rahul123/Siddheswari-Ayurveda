// import React from "react";

export default function Header() {
  return (
    <header className="dashboard-header text-center">
      <h3 className="text-black">Welcome to the Dashboard</h3>

      <div className="profile">
        <i className="bi bi-bell-fill notification-icon"></i>

        <div className="avatar">
          <img src="https://i.pravatar.cc/50" alt="Profile" />
        </div>
      </div>
    </header>
  );
}