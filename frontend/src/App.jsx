import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { lazy, Suspense } from "react";
import Loader from "./Components/Loader";
// import { useState } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
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

const PurchaseEntry = lazy(() => import("./Components/PurchaseEntry"));
// import EditPurchase from "./Components/EditPurchase";



/* ---------- DASHBOARD LAYOUT (FIXED) ---------- */
/* function DashboardLayout() {
  const location = useLocation();
  const [mobileMenubarOpen, setMobileMenubarOpen] = useState(false);

  // Show header ONLY
  const showHeader = ["/dashboard", "/dashboard/analytics", "/dashboard/profile"].includes(location.pathname);

  return (
    <div className="flex bg-green-200">                 
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-10">
        <p className="text-[90px] font-bold text-slate-800 rotate-[-30deg] select-none">Siddheswari & Gita</p>
      </div>
      <D_Menubar mobileMenubarOpen={mobileMenubarOpen} setMobileMenubarOpen={setMobileMenubarOpen} />
      <div className="flex-1 relative z-10">                                    
        {showHeader && <D_Header setMobileMenubarOpen={setMobileMenubarOpen} />}
        <div className="md:ml-72 px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
} */

/* ---------- APP ---------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        {/* <Route path="/dashboard" element={<DashboardLayout />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/customer" element={<Customer />} />
          <Route path="/dashboard/sales" element={<Sales />} />
          <Route path="/dashboard/sales/sale-invoice" element={<SaleInvoice />} />
          <Route path="/print-invoice" element={<PrintInvoice />} />
          <Route path="/dashboard/sales/edit/:billnumber" element={<EditSale />} />
          <Route path="/dashboard/purchase" element={<Purchase />} />
          {/* <Route path="/dashboard/purchase/edit/:billNumber" element={<EditPurchase />} /> */}
          <Route path="/dashboard/stock-report" element={<Stock />} />
          <Route path="/dashboard/purchase/purchase-entry" element={<Suspense fallback={<Loader />}><PurchaseEntry /></Suspense>} />
          <Route path="/dashboard/staff-report" element={<StaffReport />} />
          <Route path="/dashboard/analytics" element={<Suspense fallback={<Loader />}><Analytics /></Suspense>} />
          <Route path="/dashboard/appointments" element={<Suspense fallback={<Loader />}><Appointment /></Suspense>} />
        </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </BrowserRouter>
  );
}