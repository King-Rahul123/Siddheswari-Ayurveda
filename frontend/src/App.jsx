import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { lazy, Suspense } from "react";
import Loader from "./Components/Loader";
// import { useState } from "react";

import Login from "./Pages/Login";
import Landing from "./Pages/Landing";

import Dashboard from "./Pages/Dashboard";
import Customer from "./Pages/Customer";
import Sales from "./Pages/Sale";
import Purchase from "./Pages/Purchase";
import SaleInvoice from "./Components/SaleInvoice";
import PrintInvoice from "./Components/PrintFormate";
import EditSale from "./Components/EditBill";
import Stock from "./Pages/Stock";
import StaffReport from "./Pages/StaffReport";
import Analytics from "./Pages/Analytics";
import Appointment from "./Pages/Appointment";
import ProtectedRoute from "./Components/ProtectedRoute";
import Remedies from "./Pages/Remedies.jsx"
import Outstanding from "./Pages/Outstanding.jsx";
import ExpiryReturn from "./Pages/ExpiryReturn.jsx";

const PurchaseEntry = lazy(() => import("./Components/PurchaseEntry"));
// import EditPurchase from "./Components/EditPurchase";

/* ---------- APP ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/remedies" element={<Remedies />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/customer" element={<Customer />} />
          <Route path="/dashboard/sales" element={<Sales />} />
          <Route path="/dashboard/sale-report" element={<Sales />} />
          <Route path="/dashboard/sales/sale-invoice" element={<SaleInvoice />} />
          <Route path="/print-invoice" element={<PrintInvoice />} />
          <Route path="/dashboard/sales/edit/*" element={<EditSale />} />
          <Route path="/dashboard/purchase" element={<Purchase />} />
          <Route path="/dashboard/purchase-report" element={<Purchase />} />
          <Route path="/dashboard/stock-report" element={<Stock />} />
          <Route path="/dashboard/purchase/purchase-entry" element={<Suspense fallback={<Loader />}><PurchaseEntry /></Suspense>} />
          <Route path="/dashboard/staff-report" element={<StaffReport />} />
          <Route path="/dashboard/analytics" element={<Suspense fallback={<Loader />}><Analytics /></Suspense>} />
          <Route path="/dashboard/appointments" element={<Suspense fallback={<Loader />}><Appointment /></Suspense>} />
          <Route path="/dashboard/outstanding" element={<Suspense fallback={<Loader />}><Outstanding /></Suspense>} />
          <Route path="/dashboard/expiry-return" element={<Suspense fallback={<Loader />}><ExpiryReturn /></Suspense>} />
        </Route>
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </BrowserRouter>
  );
}