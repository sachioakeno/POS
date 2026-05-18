import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [storeName, setStoreName] = useState("Toko");
  const [storeLogo, setStoreLogo] = useState("null");

  // Close drawer whenever the route changes (user tapped a link on mobile)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfile = () => {
      const savedName = localStorage.getItem("storeName");
      const savedLogo = localStorage.getItem("storeLogo");
      
      if (savedName) setStoreName(savedName);
      if (savedLogo) setStoreLogo(savedLogo);

      fetch("http://localhost:8000/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.store_name) {
            setStoreName(data.store_name);
            localStorage.setItem("storeName", data.store_name);
            document.title = `${data.store_name} - POS`; 
          }
          if (data.logo_url) {
            setStoreLogo(data.logo_url);
            localStorage.setItem("storeLogo", data.logo_url);
          }
        });
    };

    fetchProfile();
    // Ganti nama event agar selaras dengan file Settings.jsx
    window.addEventListener("storeProfileUpdated", fetchProfile);
    return () => window.removeEventListener("storeProfileUpdated", fetchProfile);
  }, []);
  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { path: "/", name: "POS Cashier", icon: "point_of_sale", roles: ["admin", "cashier"] },
    { path: "/inventory", name: "Inventory", icon: "inventory_2", roles: ["admin"] },
    { path: "/dashboard", name: "Smart Dashboard", icon: "monitoring", roles: ["admin"] },
    { path: "/settings", name: "Store Settings", icon: "settings", roles: ["admin"] },
  ];

  const filtered = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* ── Mobile backdrop overlay ──
          Shown only on mobile when sidebar is open.
          Clicking it closes the drawer.
      ── */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        style={{ backdropFilter: isOpen ? "blur(2px)" : "none" }}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ──
          Mobile:  slides in from the left as a drawer (z-50, above overlay)
          Desktop: always visible, fixed on the left (translate-x-0 always)
      ── */}
      <nav
        className={`
          bg-surface h-screen w-56 fixed left-0 top-0 z-50
          flex flex-col py-6 px-3
          border-r border-outline-variant
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Close button — mobile only, top-right corner of sidebar */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden absolute top-3.5 right-3 p-1.5 rounded-lg
                     hover:bg-surface-container-high active:bg-surface-container-high
                     transition-all text-on-surface-variant"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>

        {/* ── Brand ── */}
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary text-sm">storefront</span>
          </div>
          <h1 className="font-bold text-xl text-primary truncate max-w-[150px]">{storeName}</h1>
        </div>

        {/* ── Nav links ── */}
        <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {filtered.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${isActive
                    ? "bg-primary text-on-primary shadow-md"
                    : "text-on-surface-variant hover:bg-surface-container-high active:bg-surface-container-high"
                  }
                `}
              >
                <span
                  className="material-symbols-outlined text-[18px] flex-shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* ── User info + logout ── */}
        <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-2">
          <div className="px-3 flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-[11px] text-primary flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">{user.name}</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-error text-xs font-bold
                       hover:bg-error-container/20 active:bg-error-container/30 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}