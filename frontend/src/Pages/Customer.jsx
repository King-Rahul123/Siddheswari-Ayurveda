import { useState } from "react";
import "../Dashboard.css";
import "../Customer.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import AddCustomer from "../Components/AddCustomer";

export default function Customer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  const exportToCSV = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Age",
      "Gender",
      "Phone",
      "Created On",
    ];

    const rows = filteredCustomers.map((customer) => [
      customer.id,
      customer.name,
      customer.age,
      customer.gender,
      customer.phone,
      customer.createdOn,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "customers.csv";
    link.click();

    setShowExportPopup(false);
  };

  const exportToExcel = () => {
    // Install xlsx package
    // npm install xlsx

    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Customers"
      );

      XLSX.writeFile(workbook, "customers.xlsx");

      setShowExportPopup(false);
    });
  };

  const customers = [
    {
      id: "CUS001",
      name: "Rahul Adak",
      age: 24,
      gender: "Male",
      phone: "8145322318",
      createdOn: "20 Jun 2026",
    },
    {
      id: "CUS002",
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      phone: "8348765905",
      createdOn: "18 Jun 2026",
    },
    {
      id: "CUS003",
      name: "Amit Kumar",
      age: 45,
      gender: "Male",
      phone: "7654321098",
      createdOn: "25 Jun 2026",
    },
    {
      id: "CUS004",
      name: "Sneha Das",
      age: 28,
      gender: "Female",
      phone: "6543210987",
      createdOn: "22 Jun 2026",
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

            <button className="add-customer-btn" onClick={() => setShowCustomerPopup(true)} >
              <i className="bi bi-person-plus-fill"></i>
              Add Customer
            </button>
          </div>

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

            <button className="export-btn" onClick={() => setShowExportPopup(true)}>
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
                    <th className="text-center">Sl.</th>
                    <th className="text-center">Customer</th>
                    <th className="text-center">Customer ID</th>
                    <th className="text-center">Age</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Phone</th>
                    <th className="text-center">Created On</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="text-center text-sm">{filteredCustomers.indexOf(customer) + 1}.</td>
                      <td className="text-center">
                        <div className="customer-info">
                          <div>
                            <h6>{customer.name}</h6>
                          </div>
                        </div>
                      </td>

                      <td className="text-center">{customer.id}</td>

                      <td className="text-center">{customer.age}</td>

                      <td className="text-center">{customer.gender}</td>

                      <td className="text-center">{customer.phone}</td>

                      <td className="text-center">{customer.createdOn}</td>

                      <td className="text-center">
                        <div className="customer-actions">
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
                      <td colSpan="9" className="empty-state text-center">
                        <i className="bi bi-search"></i>
                        <p>No customers found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showExportPopup && (
            <div
              className="export-modal-overlay"
              onClick={() => setShowExportPopup(false)}
            >
              <div
                className="export-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="export-header">
                  <h5>Export Customers</h5>

                  <button
                    className="close-btn"
                    onClick={() => setShowExportPopup(false)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <p>Select export format:</p>

                <div className="export-options">
                  <button
                    className="export-option excel"
                    onClick={exportToExcel}
                  >
                    <i className="bi bi-file-earmark-excel-fill"></i>
                    Excel (.xlsx)
                  </button>

                  <button
                    className="export-option csv"
                    onClick={exportToCSV}
                  >
                    <i className="bi bi-filetype-csv"></i>
                    CSV (.csv)
                  </button>
                </div>
              </div>
            </div>
          )}

          <AddCustomer
            show={showCustomerPopup}
            onClose={() => setShowCustomerPopup(false)}
          />
        </main>
      </div>
    </div>
  );
}