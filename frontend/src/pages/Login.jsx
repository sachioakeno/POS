import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const storeName = localStorage.getItem("storeName") || "Toko";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Login gagal, periksa email/password");
      }
    } catch (err) {
      setError("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body overflow-hidden" style={{ background: "#0C0C0A" }}>

      {/* ── LEFT PANEL · Brand / Visual ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative flex-col overflow-hidden">

        {/* Base photo */}
        <img
          src="https://images.unsplash.com/photo-1704615359136-a12297ec95cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGNsZWFuJTIwY2FmZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
          alt="Coffee shop"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />

        {/* Layered depth overlays */}
        <div className="absolute inset-0" style={{ background: "rgba(10,10,8,0.55)" }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(10,10,8,0.40) 50%, rgba(10,10,8,0.97) 100%)",
          }}
        />
        {/* Subtle right-edge fade into the form panel */}
        <div
          className="absolute inset-y-0 right-0 w-24"
          style={{ background: "linear-gradient(to right, transparent, rgba(10,10,8,0.60))" }}
        />

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "180px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10 xl:px-16 xl:py-12">

          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 20px rgba(27, 29, 133, 0.35)" }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>
                storefront
              </span>
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight font-headline">
              {storeName}
            </span>
          </div>

          {/* Hero headline — center of gravity */}
          <div className="flex-1 flex flex-col justify-center">

            {/* Display headline */}
            <h1
              className="text-white font-headline font-bold leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(42px, 5vw, 62px)" }}
            >
              Your café,
              <br />
              <span className="text-primary">smarter</span> every
              <br />
              month.
            </h1>

            <p
              className="mt-6 leading-relaxed"
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.42)",
                maxWidth: 360,
                fontWeight: 400,
              }}
            >
              Analyze F&B sales trends and receive precise ingredient restock
              recommendations — fully automated, zero guesswork.
            </p>
          </div>

          {/* Bottom signature — minimal, no borders */}
          <div className="flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,0.10)" }}
            />
            <span
              className="font-medium tracking-widest uppercase"
              style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.18em" }}
            >
              © 2026 RestockIQ Solutions
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL · Form ────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-h-screen relative"
        style={{ background: "#F5F4F0" }}
      >
        {/* Top-right decorative dot grid — very subtle */}
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Mobile logo (hidden on large screens) */}
        <div className="flex lg:hidden items-center gap-2.5 px-7 pt-7 pb-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 17 }}>
              storefront
            </span>
          </div>
          <span className="text-stone-800 font-bold text-[15px] tracking-tight font-headline">
            {storeName}
          </span>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
          <div className="w-full" style={{ maxWidth: 368 }}>

            {/* Form eyebrow + headline */}
            <div className="mb-10">
              <p
                className="font-bold tracking-widest uppercase text-primary mb-4"
                style={{ fontSize: 10, letterSpacing: "0.16em" }}
              >
                Terminal Access
              </p>
              <h2
                className="font-headline font-bold text-stone-900 leading-[1.08] tracking-tight"
                style={{ fontSize: 36, letterSpacing: "-0.6px" }}
              >
                Welcome
                <br />
                back.
              </h2>
              <p
                className="mt-3 text-stone-400 font-body"
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                Enter your credentials to access the dashboard.
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3.5"
                style={{
                  background: "#FEF2F2",
                  border: "0.5px solid rgba(220,38,38,0.20)",
                }}
              >
                <span
                  className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5"
                  style={{ fontSize: 16 }}
                >
                  error
                </span>
                <p className="text-red-600 text-sm font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block font-bold text-stone-400 tracking-widest uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.14em" }}
                >
                  Email Address
                </label>
                <input
                  required
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restock.com"
                  className="w-full bg-white text-stone-800 rounded-xl transition-all outline-none placeholder:text-stone-300"
                  style={{
                    height: 48,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: 14,
                    border: "0.5px solid rgba(0,0,0,0.14)",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#719e1d";
                    e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0,0,0,0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block font-bold text-stone-400 tracking-widest uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.14em" }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-primary transition-opacity hover:opacity-70"
                    style={{ fontSize: 12, fontWeight: 500 }}
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  required
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-stone-800 rounded-xl transition-all outline-none placeholder:text-stone-300"
                  style={{
                    height: 48,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: 14,
                    border: "0.5px solid rgba(0,0,0,0.14)",
                    boxSizing: "border-box",
                    letterSpacing: "0.1em",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1D9E75";
                    e.target.style.boxShadow = "0 0 0 3px rgba(29,158,117,0.10)";
                    e.target.style.letterSpacing = "0.1em";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0,0,0,0.14)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{
                    height: 50,
                    fontSize: 14,
                    letterSpacing: "-0.1px",
                    boxShadow: isLoading
                      ? "none"
                      : "0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(44, 158, 29, 0.28)",
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = "0.90" }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
                >
                  {isLoading ? (
                    <>
                      {/* CSS spinner */}
                      <span
                        style={{
                          display: "inline-block",
                          width: 16,
                          height: 16,
                          border: "2px solid rgba(255,255,255,0.25)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                          flexShrink: 0,
                        }}
                      />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign in to terminal
                      <span
                        className="material-symbols-outlined flex-shrink-0"
                        style={{ fontSize: 18 }}
                      >
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider + footer links */}
            <div
              className="mt-10 pt-8 flex flex-col items-center gap-5"
              style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center gap-6">
                {["Help", "Terms", "Privacy"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-stone-400 transition-colors hover:text-stone-600 font-medium"
                    style={{ fontSize: 12 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.22)" }}>
                © 2026 RestockIQ Solutions. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Global keyframes ──────────────────────────────────────────── */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 6px rgba(29,158,117,0.9); }
          50%       { opacity: 0.55; transform: scale(0.80); box-shadow: 0 0 3px rgba(0, 39, 27, 0.4); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="password"]::placeholder {
          letter-spacing: 0;
        }
      `}</style>
    </div>
  );
}