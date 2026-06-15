import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useState } from "react";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Customer from "./Pages/Customer";


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
          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="products" element={<Products />} /> */}
          {/* <Route path="purchase&sale" element={<Purchase_Sale />} /> */}
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}