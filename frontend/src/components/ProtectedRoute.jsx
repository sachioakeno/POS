import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Jika belum login, tendang ke halaman login
  if (!token) return <Navigate to="/login" replace />;

  // Jika jabatan tidak diizinkan, tendang ke POS
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Akses Ditolak: Anda tidak memiliki izin untuk halaman ini.");
    return <Navigate to="/" replace />;
  }

  return children;
}