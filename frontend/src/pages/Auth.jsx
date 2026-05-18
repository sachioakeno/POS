import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/login" : "/api/register";

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan "KTP" (Token) ke memori browser
        localStorage.setItem("token", data.access_token);
        
        // Simpan nama toko default jika ini proses register baru
        if (!isLogin) {
            localStorage.setItem("storeName", "Toko " + formData.name);
        }
        
        // Refresh dan arahkan ke Dashboard
        window.location.href = "/"; 
      } else {
        setError(data.message || "Email atau password salah.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4 font-body">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">{isLogin ? 'lock_open' : 'person_add'}</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            {isLogin ? "Selamat Datang" : "Daftar Toko Baru"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            {isLogin ? "Masuk untuk mengelola kasir dan inventaris Anda." : "Buat akun untuk mulai menggunakan sistem POS."}
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 text-error p-3 rounded-xl text-sm font-bold border border-error/20 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Nama Pemilik</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none" placeholder="Misal: Budi Santoso" />
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Email</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none" placeholder="admin@toko.com" />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase mb-1 block">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:border-primary outline-none" placeholder="Minimal 6 karakter" minLength="6" />
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-primary text-on-primary p-3 rounded-xl font-bold mt-2 hover:opacity-90 transition-all flex justify-center items-center gap-2">
            {isLoading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar Sekarang")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          {isLogin ? "Belum punya akun toko? " : "Sudah punya akun? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-primary font-bold hover:underline">
            {isLogin ? "Daftar di sini" : "Login di sini"}
          </button>
        </div>

      </div>
    </div>
  );
}