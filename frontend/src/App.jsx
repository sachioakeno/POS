import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 2. Ubah storeName & logo menjadi STATE
  const [storeName, setStoreName] = useState(localStorage.getItem("storeName") || "Toko");
  const [storeLogo, setStoreLogo] = useState(localStorage.getItem("storeLogo")); // Ambil logo URL dari storage

  // 3. Tambah listener agar header berubah real-time saat Settings disimpan
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Ambil data terbaru dari storage dan update state
      setStoreName(localStorage.getItem("storeName") || "Toko");
      setStoreLogo(localStorage.getItem("storeLogo"));
    };

    // Dengarkan event kustom "storeProfileUpdated" (dipancarkan oleh Settings.jsx)
    window.addEventListener("storeProfileUpdated", handleProfileUpdate);

    // Bersihkan listener saat komponen tidak digunakan
    return () => {
      window.removeEventListener("storeProfileUpdated", handleProfileUpdate);
    };
  }, []);

  return (
    <>
      {/* ── Sidebar ── */}
      {!isLoginPage && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile top bar (Hanya muncul jika sudah login) ── */}
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

          {/* Logo center - SEKARANG DINAMIS */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            {/* 4. Implementasi Logika Gambar Dinamis */}
            {storeLogo ? (
              // Kondisi A: Jika User SUDAH mengupload logo di Settings
              <img 
                src={storeLogo} 
                alt="Store Logo" 
                className="h-7 w-7 rounded-lg object-cover flex-shrink-0" // Styling agar ukurannya pas
              />
            ) : (
              // Kondisi B: Jika User BELUM mengupload logo (Gunakan Placeholder lama)
              <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 15 }}>
                  storefront
                </span>
              </div>
            )}
            
            <span className="font-display text-[15px] font-bold text-primary tracking-tight truncate max-w-[120px]">
              {storeName}
            </span>
          </div>

          {/* User avatar right */}
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-[11px] text-primary select-none uppercase">
            {user.name?.charAt(0)}
          </div>
        </header>
      )}

      {/* ── Page content ── */}
      <div className={!isLoginPage ? "lg:ml-56 pt-14 lg:pt-0 min-h-screen" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute allowedRoles={["admin", "cashier"]}><POS /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={["admin"]}><Inventory /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
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