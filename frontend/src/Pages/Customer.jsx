import { useState, useEffect } from "react";
import "../CSS/Dashboard.css";
import "../CSS/Customer.css";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import AddCustomer from "../Popup/AddCustomer";
import * as XLSX from "xlsx";
import { subscribeCustomers, deleteCustomer } from "../services/customerService";


export default function Customer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
  });

  const exportToCSV = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Gender",
      "Phone",
      "Created On",
    ];

    const formatCustomerDate = (dt) => {
      if (!dt) return "-";
      if (typeof dt.toDate === "function") return dt.toDate().toLocaleDateString("en-IN");
      try { return new Date(dt).toLocaleDateString("en-IN"); } catch(e) { return "-"; }
    };

    const rows = filteredCustomers.map((customer) => [
      customer.customerCode || "",
      customer.name || customer.customerName || "",
      customer.gender || "",
      customer.phone || "",
      formatCustomerDate(customer.createdAt),
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
    const formatCustomerDate = (dt) => {
      if (!dt) return "-";
      if (typeof dt.toDate === "function") return dt.toDate().toLocaleDateString("en-IN");
      try { return new Date(dt).toLocaleDateString("en-IN"); } catch(e) { return "-"; }
    };

    const excelData = filteredCustomers.map((customer, index) => ({
      Sl: index + 1,
      "Customer ID": customer.customerCode || "",
      Name: customer.name || customer.customerName || "",
      Gender: customer.gender || "",
      Phone: customer.phone || "",
      "Created On": formatCustomerDate(customer.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customers"
    );

    XLSX.writeFile(workbook, "Customers.xlsx");

    setShowExportPopup(false);
  };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeCustomers((data) => {
      setCustomers(data || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCustomers = (customers || []).filter((customer) => {
    const custName = (customer.name || customer.customerName || "").toLowerCase();
    const custPhone = (customer.phone || "").toString();
    const term = (searchTerm || "").toLowerCase();
    return custName.includes(term) || custPhone.includes(term);
  });

  const handleDelete = async (customerCode) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCustomer(customerCode);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (customer) => {
    setCustomerForm({
        customerCode: customer.customerCode,
        name: customer.name || "",
        age: customer.age || "",
        gender: customer.gender || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
    });

    setEditMode(true);
    setShowCustomerPopup(true);
  };

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
              <p className="text-gray-600 text-sm">Manage all your Ayurveda customers efficiently</p>
            </div>

            <button className="add-customer-btn" onClick={() => {
              setEditMode(false);
              setCustomerForm({
                name: "",
                age: "",
                gender: "",
                phone: "",
                email: "",
                address: "",
                city: "",
                state: "",
              });
              setShowCustomerPopup(true);
            }} >
              <i className="bi bi-person-plus-fill"></i>
              Add Customer
            </button>
          </div>

          {/* Search Section */}
          <div className="customer-toolbar">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input type="text" placeholder="Search by customer name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <button className="export-btn" onClick={() => setShowExportPopup(true)}>
              <i className="bi bi-download"></i>
              Export
            </button>
          </div>

          {/* Customer Table */}
          <div className="customer-table-card">
            <p className="text-muted text-xs text-right mb-1"><b>Total:</b> {filteredCustomers.length}</p>
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th className="text-center">Sl.</th>
                    <th className="text-center">Customer</th>
                    <th className="text-center">Customer ID</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Phone</th>
                    <th className="text-center">Created On</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="flex justify-center items-center gap-2">
                          <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                          <span>Loading customers...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer, index) => (
                      <tr key={customer.docId}>
                        <td className="text-center text-sm">{index + 1}.</td>

                        <td className="text-center">
                          <div className="customer-info">
                            <h6>{customer.name || customer.customerName || "-"}</h6>
                          </div>
                        </td>

                        <td className="text-center text-sm">{customer.customerCode || "-"}</td>
                        <td className="text-center text-sm">{customer.gender || "-"}</td>
                        <td className="text-center text-sm">{customer.phone || "-"}</td>
                        <td className="text-center text-sm">
                          {customer.createdAt
                            ? (typeof customer.createdAt.toDate === "function" ? customer.createdAt.toDate().toLocaleDateString("en-IN") : new Date(customer.createdAt).toLocaleDateString("en-IN"))
                            : "-"}
                        </td>

                        <td className="text-center">
                          <div className="grid grid-cols-2 gap-1 justify-center items-center">
                            <button className="action-btn edit" onClick={() => handleEdit(customer)}>
                              <i className="bi bi-pencil-fill"></i>
                            </button>

                            <button className="action-btn delete" onClick={() => handleDelete(customer.customerCode)}>
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state text-center">
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
              className="customer-export-modal-overlay"
              onClick={() => setShowExportPopup(false)}
            >
              <div
                className="customer-export-modal"
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
            key={editMode ? customerForm.customerCode : "new"}
            show={showCustomerPopup}
            onClose={() => {
                setShowCustomerPopup(false);
                setEditMode(false);
            }}
            editMode={editMode}
            customerForm={customerForm}
            setCustomerForm={setCustomerForm}
          />
        </main>
      </div>
    </div>
  );
}