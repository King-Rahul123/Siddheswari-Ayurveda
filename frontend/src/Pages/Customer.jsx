import { useState } from "react";
import "../Dashboard.css";
import "../Customer.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

export default function Customer() {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: "CUS001",
      name: "Rahul Adak",
      age: 24,
      gender: "Male",
      phone: "9876543210",
      medicine: "Ashwagandha",
      followUp: "20 Jun 2026",
      status: "Active",
    },
    {
      id: "CUS002",
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      phone: "8765432109",
      medicine: "Triphala",
      followUp: "18 Jun 2026",
      status: "Follow-up",
    },
    {
      id: "CUS003",
      name: "Amit Kumar",
      age: 45,
      gender: "Male",
      phone: "7654321098",
      medicine: "Brahmi",
      followUp: "25 Jun 2026",
      status: "Active",
    },
    {
      id: "CUS004",
      name: "Sneha Das",
      age: 28,
      gender: "Female",
      phone: "6543210987",
      medicine: "Neem Capsules",
      followUp: "22 Jun 2026",
      status: "Inactive",
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        <Header />

        <main className="dashboard-content">
          {/* Page Header */}
          <div className="customer-header">
            <div>
              <h2>Customer Management</h2>
              <p>Manage all your Ayurveda customers efficiently.</p>
            </div>

            <button className="add-customer-btn">
              <i className="bi bi-person-plus-fill"></i>
              Add Customer
            </button>
          </div>

          {/* Statistics */}
          <section className="customer-stats">
            <div className="customer-stat-card">
              <i className="bi bi-people-fill"></i>
              <div>
                <h3>{customers.length}</h3>
                <span>Total Customers</span>
              </div>
            </div>

            <div className="customer-stat-card">
              <i className="bi bi-heart-pulse-fill"></i>
              <div>
                <h3>
                  {
                    customers.filter(
                      (customer) => customer.status === "Active"
                    ).length
                  }
                </h3>
                <span>Active Customers</span>
              </div>
            </div>

            <div className="customer-stat-card">
              <i className="bi bi-calendar-check-fill"></i>
              <div>
                <h3>
                  {
                    customers.filter(
                      (customer) => customer.status === "Follow-up"
                    ).length
                  }
                </h3>
                <span>Follow-ups</span>
              </div>
            </div>

            <div className="customer-stat-card">
              <i className="bi bi-capsule-pill"></i>
              <div>
                <h3>12</h3>
                <span>Medicines Prescribed</span>
              </div>
            </div>
          </section>

          {/* Search Section */}
          <div className="customer-toolbar">
            <div className="search-box">
              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="export-btn">
              <i className="bi bi-download"></i>
              Export
            </button>
          </div>

          {/* Customer Table */}
          <div className="customer-table-card">
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Customer ID</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Medicine</th>
                    <th>Follow-up</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">
                            {customer.name.charAt(0)}
                          </div>

                          <div>
                            <h6>{customer.name}</h6>
                            <small>Ayurveda Customer</small>
                          </div>
                        </div>
                      </td>

                      <td>{customer.id}</td>

                      <td>{customer.age}</td>

                      <td>{customer.gender}</td>

                      <td>{customer.phone}</td>

                      <td>
                        <span className="medicine-badge">
                          {customer.medicine}
                        </span>
                      </td>

                      <td>{customer.followUp}</td>

                      <td>
                        <span
                          className={`customer-status ${customer.status
                            .toLowerCase()
                            .replace("-", "")}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button className="action-btn view">
                            <i className="bi bi-eye-fill"></i>
                          </button>

                          <button className="action-btn edit">
                            <i className="bi bi-pencil-fill"></i>
                          </button>

                          <button className="action-btn delete">
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan="9" className="empty-state">
                        <i className="bi bi-search"></i>
                        <p>No customers found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="customer-bottom-grid">
            <div className="card">
              <h5>Upcoming Follow-ups</h5>

              <div className="follow-up-list">
                {customers.slice(0, 3).map((customer) => (
                  <div key={customer.id} className="follow-up-item">
                    <div className="customer-avatar">
                      {customer.name.charAt(0)}
                    </div>

                    <div>
                      <h6>{customer.name}</h6>
                      <small>{customer.followUp}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h5>Health Tips</h5>

              <div className="tips-list">
                <div className="tip-item">
                  🌿 Drink warm water daily for better digestion.
                </div>

                <div className="tip-item">
                  🍃 Include Triphala for natural detoxification.
                </div>

                <div className="tip-item">
                  🧘 Practice yoga for overall wellness.
                </div>

                <div className="tip-item">
                  🥗 Maintain a balanced Ayurvedic diet.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}