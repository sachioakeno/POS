import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const storeName = localStorage.getItem("storeName") || "Toko";

  return (
    <>
      {/* ── Sidebar (drawer on mobile, fixed on desktop) ── */}
      {!isLoginPage && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile top bar (hidden on lg+) ── */}
      {!isLoginPage && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-outline-variant z-30 flex items-center justify-between px-4">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-1 rounded-xl hover:bg-surface-container-high active:bg-surface-container-high transition-all text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
          </button>

          {/* Logo center */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 15 }}>
                storefront
              </span>
            </div>
            <span className="font-display text-[15px] font-bold text-primary tracking-tight">
              {storeName}
            </span>
          </div>

          {/* User avatar right */}
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-[11px] text-primary select-none">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
        </header>
      )}

      {/* ── Page content ──
          lg:ml-56  → offset for the fixed desktop sidebar
          pt-14     → clear the mobile top bar (14 = 56px)
          lg:pt-0   → no top padding needed on desktop
          NOTE: If your individual page files still have their own ml-56 or pl-56,
          remove it from them — this wrapper now handles the offset globally.
      ── */}
      <div className={!isLoginPage ? "lg:ml-56 pt-14 lg:pt-0 min-h-screen" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                <POS />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}