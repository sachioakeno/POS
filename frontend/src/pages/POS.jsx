import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export default function POS() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransactionTotal, setLastTransactionTotal] = useState(0);
  const [storeSettings, setStoreSettings] = useState({ store_name: "Toko", tax_percentage: 0 });
  const [menuItems, setMenuItems] = useState([]);
  const storeName = localStorage.getItem("storeName") || "Toko";

  // Mobile: toggle between catalog and cart views
  const [mobileView, setMobileView] = useState("catalog");

  useEffect(() => {
    // 1. Fetch Menus menggunakan apiFetch (jauh lebih bersih)
    apiFetch("/menus")
      .then(res => res.json())
      .then(data => setMenuItems(data.map(item => ({ ...item, price: Number(item.price) }))))
      .catch(err => console.error("Gagal mengambil data menu: ", err));

    // 2. Fetch Settings menggunakan apiFetch
    apiFetch("/settings")
      .then(res => res.json())
      .then(data => setStoreSettings(data))
      .catch(err => console.error("Gagal mengambil setting: ", err));
  }, []);

  const categories = ["All", ...new Set(menuItems.map(item => item.category))];

  const filteredMenus = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(x => x.menu_id === item.id || x.menu_id === item.menu_id);
      if (existing) {
        return prev.map(x => x.menu_id === (item.id || item.menu_id) ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...prev, { menu_id: item.id || item.menu_id, name: item.name, price: item.price, img: item.img || item.image, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(x => x.menu_id === id);
      if (existing?.quantity === 1) return prev.filter(x => x.menu_id !== id);
      return prev.map(x => x.menu_id === id ? { ...x, quantity: x.quantity - 1 } : x);
    });
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = storeSettings.tax_percentage / 100;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    setIsLoading(true);

    try {
      const payload = {
        total_price: total,
        payment_method: paymentMethod,
        items: cart.map(item => ({ menu_id: item.menu_id, quantity: item.quantity, price: item.price })),
      };

      // 3. Post Checkout menggunakan apiFetch
      const response = await apiFetch("/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Terjadi kesalahan server.");

      setLastTransactionTotal(total);
      setShowSuccessModal(true);
      setCart([]);
      setMobileView("catalog");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body antialiased min-h-screen flex flex-col">
      {/* Page Header */}
      <header className="sticky top-14 lg:top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between h-14 px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center bg-surface-container-low rounded-full px-3 py-1.5 border border-outline-variant/30 flex-1 max-w-xs focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 outline-none w-full text-xs placeholder-outline"
            placeholder="Search products..."
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-container border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-sm cursor-pointer uppercase">
            {user.name ? user.name.charAt(0) : "U"}
          </div>
          <span className="text-xs font-bold text-on-surface hidden md:block">{user.name || "Unknown User"}</span>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex flex-shrink-0 bg-surface border-b border-outline-variant/20 sticky top-28 z-10">
        {[
          { id: "catalog", label: "Menu", icon: "restaurant_menu" },
          { id: "cart", label: "Cart", icon: "shopping_cart" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileView(tab.id)}
            className={`relative flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${mobileView === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
            {tab.id === "cart" && cartItemCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-28px)] h-[18px] min-w-[18px] px-1 bg-error rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row lg:gap-5 lg:p-5 lg:overflow-hidden lg:h-[calc(100vh-3.5rem)]">

        {/* Catalog Section */}
        <section className={`${mobileView === "cart" ? "hidden" : "flex"} lg:flex flex-col flex-grow min-w-0 p-4 lg:p-0 lg:overflow-hidden`}>
          {/* Category filter row */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface hidden lg:block flex-shrink-0">
              Menu Catalog
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: "none" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-colors whitespace-nowrap flex-shrink-0 ${selectedCategory === cat ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface hover:bg-surface-container-highest"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div className="overflow-y-auto pb-6" style={{ scrollbarWidth: "thin" }}>
            {filteredMenus.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                <p className="text-sm">Tidak ada menu yang sesuai pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {filteredMenus.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3 shadow-sm hover:shadow hover:border-primary/40 transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    <div className="h-24 lg:h-28 rounded-lg overflow-hidden mb-3 bg-surface-variant relative">
                      <img
                        src={item.image || item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <span className="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm text-[10px] font-semibold px-1.5 py-0.5 rounded text-on-surface">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline font-bold text-xs text-on-surface mb-0.5 line-clamp-2">{item.name}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="font-bold text-xs text-primary">Rp {item.price.toLocaleString("id-ID")}</span>
                      <button className="h-7 w-7 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cart Section */}
        <section className={`${mobileView === "catalog" ? "hidden" : "flex"} lg:flex flex-col w-full lg:w-[320px] lg:flex-shrink-0 bg-surface-container-lowest border-t lg:border border-outline-variant/30 lg:rounded-2xl lg:shadow-sm lg:overflow-hidden`}>
          <div className="p-4 border-b border-outline-variant/20 bg-surface-bright flex justify-between items-center flex-shrink-0">
            <h2 className="font-headline text-base font-bold text-on-surface">Current Order</h2>
            <button
              onClick={() => setCart([])}
              className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-1 rounded-md hover:bg-error hover:text-white transition-colors"
            >
              CLEAR
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4" style={{ scrollbarWidth: "thin" }}>
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-outline text-sm py-10">
                Pilih menu di samping
              </div>
            ) : (
              cart.map(item => (
                <div key={item.menu_id} className="flex gap-3 items-start">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-semibold text-on-surface text-xs line-clamp-1 pr-2">{item.name}</h4>
                      <span className="font-bold text-xs text-on-surface whitespace-nowrap">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-surface-container rounded-md border border-outline-variant/30">
                        <button
                          onClick={() => removeFromCart(item.menu_id)}
                          className="h-7 w-7 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="h-7 w-7 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary + payment + checkout */}
          <div className="bg-surface-container-low p-4 border-t border-outline-variant/20 flex-shrink-0">
            <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
              <span>Subtotal</span>
              <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant mb-3 pb-3 border-b border-outline-variant/20">
              <span>Tax {storeSettings.tax_percentage}%</span>
              <span className="font-medium">Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-bold text-on-surface">Total</span>
              <span className="font-headline text-lg font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {["Cash", "QRIS", "Card"].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${paymentMethod === method ? "border-2 border-primary bg-primary-container/10 text-primary font-bold" : "border border-outline-variant/30 bg-surface text-on-surface-variant hover:border-primary"}`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {method === "Cash" ? "payments" : method === "QRIS" ? "qr_code_scanner" : "credit_card"}
                  </span>
                  <span className="text-[10px]">{method}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading || cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${cart.length === 0 ? "bg-surface-variant text-outline cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90 shadow-sm active:scale-95"}`}
            >
              {isLoading ? "Memproses..." : `Charge Rp ${total.toLocaleString("id-ID")}`}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </section>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-[320px] shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
            </div>
            <h2 className="text-xl font-bold font-headline text-on-surface mb-1">Transaksi Berhasil!</h2>
            <p className="text-sm text-on-surface-variant mb-4">Pembayaran via {paymentMethod} telah diterima.</p>
            <div className="w-full bg-surface-container-low p-3 rounded-xl mb-6 border border-outline-variant/30">
              <p className="text-xs text-on-surface-variant mb-1">Total Dibayar</p>
              <p className="text-2xl font-bold text-primary">Rp {lastTransactionTotal.toLocaleString("id-ID")}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}