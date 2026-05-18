import { useState, useEffect } from "react";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("menu");
  const [menus, setMenus] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modals Toggle
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showIngModal, setShowIngModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // POIN 1: State untuk Custom Delete Modal
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, type: "", title: "", message: "" });

  // States Form
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({ id: "", name: "", category: "", price: "", hpp: "", image: "" });
  const [ingFormData, setIngFormData] = useState({ id: "", name: "", unit: "gram", current_stock: 0 });
  const [addedStock, setAddedStock] = useState("");

  // POIN 2: State untuk Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const storeName = localStorage.getItem("storeName") || "Toko";

  const fetchData = async () => {
    const [m, i, o] = await Promise.all([
      fetch("http://localhost:8000/api/menus").then(res => res.json()),
      fetch("http://localhost:8000/api/ingredients").then(res => res.json()),
      fetch("http://localhost:8000/api/orders").then(res => res.json())
    ]);
    setMenus(m); setIngredients(i); setOrders(o);
  };

  useEffect(() => { fetchData(); }, []);

  // Reset pencarian dan halaman setiap kali pindah tab
  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, [activeTab]);

  const existingCategories = [...new Set(menus.map(item => item.category))];

  // --- LOGIKA FILTER PENCARIAN (POIN 2) ---
  const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOrdersForPagination = orders.filter(o => o.id.toString().includes(searchQuery) || (o.payment_method || "").toLowerCase().includes(searchQuery.toLowerCase()));

  // --- LOGIKA CUSTOM DELETE (POIN 1) ---
  const requestDelete = (id, type, name) => {
    let title, message;
    if (type === "menu") {
      title = "Hapus Menu"; message = `Yakin ingin menghapus ${name} dari katalog?`;
    } else if (type === "ingredient") {
      title = "Hapus Bahan Baku"; message = `Yakin ingin menghapus bahan ${name} secara permanen?`;
    } else if (type === "order") {
      title = "Void Transaksi"; message = `Batalkan transaksi #ORD-${id}? Stok akan dikembalikan ke gudang.`;
    }
    setConfirmDelete({ show: true, id, type, title, message });
  };

  const executeDelete = async () => {
    const { id, type } = confirmDelete;
    if (type === "menu") await fetch(`http://localhost:8000/api/menus/${id}`, { method: "DELETE" });
    else if (type === "ingredient") await fetch(`http://localhost:8000/api/ingredients/${id}`, { method: "DELETE" });
    else if (type === "order") await fetch(`http://localhost:8000/api/orders/${id}/void`, { method: "DELETE" });

    setConfirmDelete({ show: false, id: null, type: "", title: "", message: "" });
    fetchData();
  };

  // --- LOGIKA FORM SUBMIT ---
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `http://localhost:8000/api/menus/${menuFormData.id}` : "http://localhost:8000/api/menus";
    await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(menuFormData) });
    setShowMenuModal(false); fetchData();
  };

  const handleIngSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `http://localhost:8000/api/ingredients/${ingFormData.id}` : "http://localhost:8000/api/ingredients";
    await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ingFormData) });
    setShowIngModal(false); fetchData();
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:8000/api/ingredients/${selectedItem.id}/restock`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ added_stock: addedStock })
    });
    setShowRestockModal(false); setAddedStock(""); fetchData();
  };

  // Fitur Download CSV
  const downloadCSV = () => {
    const headers = "ID Struk,Waktu Transaksi,Total Pembayaran,Metode Pembayaran\n";
    const csvData = orders.map(order => {
      const time = new Date(order.created_at).toLocaleString('id-ID').replace(/,/g, '');
      return `#ORD-${order.id},${time},${order.total_price},${order.payment_method}`;
    }).join("\n");
    const blob = new Blob([headers + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Transaksi_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // Perhitungan Pagination Transaksi
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrdersForPagination.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrdersForPagination.length / ordersPerPage);

  const lowStockCount = ingredients.filter(i => i.current_stock < 500).length;
  const todayRevenue = orders.reduce((acc, o) => acc + Number(o.total_price), 0);
  const categoryColors = { Coffee: "bg-amber-50 text-amber-700 border-amber-200", Tea: "bg-emerald-50 text-emerald-700 border-emerald-200", Pastry: "bg-pink-50 text-pink-700 border-pink-200" };

  const tabs = [
    { id: "menu", label: "Daftar Menu", icon: "restaurant_menu" },
    { id: "ingredients", label: "Stok Bahan", icon: "inventory_2", alert: lowStockCount > 0 },
    { id: "orders", label: "Transaksi", icon: "receipt_long" },
  ];

  return (
    <div className="bg-surface-container-lowest min-h-screen font-body text-on-surface flex w-full">

      {/* Top Header - Mobile Responsive */}
      <header className="fixed top-0 right-0 left-0 md:left-56 z-20 bg-surface/80 backdrop-blur-md shadow-sm flex items-center justify-between h-14 pl-14 pr-4 md:px-6">
        <div className="flex items-center bg-surface-container-low rounded-full px-3 py-1.5 border border-outline-variant/30 w-full max-w-[200px] md:max-w-[288px] focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 outline-none w-full text-xs placeholder-outline"
            placeholder={`Cari di ${activeTab}...`}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1 bg-error-container/40 text-error px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border border-error/20 whitespace-nowrap">
              <span className="material-symbols-outlined text-[12px] md:text-[14px]">warning</span>
              <span className="hidden sm:inline">{lowStockCount} menipis</span>
              <span className="sm:hidden">{lowStockCount}</span>
            </div>
          )}
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary-container border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-sm uppercase flex-shrink-0">A</div>
        </div>
      </header>

      {/* Main - Mobile Responsive */}
      <main className="ml-0 md:ml-56 mt-14 flex-grow p-4 md:p-6 max-w-full w-full">
        <div className="max-w-5xl mx-auto">

          {/* Page Title & Stats */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-lg md:text-xl font-bold font-headline text-on-surface">Inventory Management</h1>
            <p className="text-[11px] md:text-xs text-on-surface-variant mt-0.5">Kelola menu, stok bahan baku, dan riwayat transaksi</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl border border-outline-variant/30 p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 md:mb-3"><p className="text-[10px] md:text-[11px] font-medium text-on-surface-variant">Total Menu</p><div className="h-6 w-6 md:h-7 md:w-7 bg-primary/10 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-primary text-[14px] md:text-[16px]">restaurant_menu</span></div></div>
              <p className="text-lg md:text-2xl font-bold font-headline text-on-surface">{menus.length}</p><p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1">item aktif</p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant/30 p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 md:mb-3"><p className="text-[10px] md:text-[11px] font-medium text-on-surface-variant">Bahan Baku</p><div className="h-6 w-6 md:h-7 md:w-7 bg-secondary/10 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-secondary text-[14px] md:text-[16px]">inventory_2</span></div></div>
              <p className="text-lg md:text-2xl font-bold font-headline text-on-surface">{ingredients.length}</p><p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1">jenis bahan</p>
            </div>
            <div className={`rounded-xl border p-3 md:p-4 shadow-sm ${lowStockCount > 0 ? 'bg-error-container/20 border-error/20' : 'bg-white border-outline-variant/30'}`}>
              <div className="flex items-center justify-between mb-2 md:mb-3"><p className="text-[10px] md:text-[11px] font-medium text-on-surface-variant">Stok Menipis</p><div className={`h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center ${lowStockCount > 0 ? 'bg-error/15' : 'bg-surface-variant'}`}><span className={`material-symbols-outlined text-[14px] md:text-[16px] ${lowStockCount > 0 ? 'text-error' : 'text-on-surface-variant'}`}>warning</span></div></div>
              <p className={`text-lg md:text-2xl font-bold font-headline ${lowStockCount > 0 ? 'text-error' : 'text-on-surface'}`}>{lowStockCount}</p><p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1">perlu restok</p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant/30 p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2 md:mb-3"><p className="text-[10px] md:text-[11px] font-medium text-on-surface-variant">Total Transaksi</p><div className="h-6 w-6 md:h-7 md:w-7 bg-tertiary/10 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-tertiary text-[14px] md:text-[16px]">receipt_long</span></div></div>
              <p className="text-lg md:text-2xl font-bold font-headline text-on-surface truncate">{orders.length}</p><p className="text-[9px] md:text-[10px] text-on-surface-variant mt-1 truncate">Rp {todayRevenue.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Tabs + Action Button - Mobile Responsive */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <div className="flex bg-surface-container-low p-1 rounded-xl gap-1 overflow-x-auto w-full md:w-auto" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); }}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined text-[14px]">{tab.icon}</span> {tab.label}
                  {tab.alert && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-error rounded-full border border-surface-container-low" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
              {activeTab === 'menu' && (
                <button onClick={() => { setMenuFormData({ id: "", name: "", category: "", price: "", hpp: "", image: "" }); setIsEditing(false); setShowMenuModal(true); }} className="bg-primary text-on-primary px-3 md:px-4 py-2 rounded-lg font-bold text-[11px] md:text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px] md:text-[15px]">add</span> Tambah Menu
                </button>
              )}
              {activeTab === 'ingredients' && (
                <button onClick={() => { setIngFormData({ id: "", name: "", unit: "gram", current_stock: 0 }); setIsEditing(false); setShowIngModal(true); }} className="bg-primary text-on-primary px-3 md:px-4 py-2 rounded-lg font-bold text-[11px] md:text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px] md:text-[15px]">add</span> Tambah Bahan
                </button>
              )}
              {activeTab === 'orders' && orders.length > 0 && (
                <button onClick={downloadCSV} className="bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-[11px] md:text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition-colors whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px] md:text-[15px]">download</span> Export CSV
                </button>
              )}
            </div>
          </div>

          {/* ── MENU TABLE ── */}
          {activeTab === 'menu' && (
            <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="p-3 text-on-surface-variant font-semibold">Item</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Kategori</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Modal (HPP)</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Harga Jual</th>
                      <th className="p-3 text-on-surface-variant font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenus.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-on-surface-variant">Pencarian tidak ditemukan.</td></tr>
                    ) : filteredMenus.map(menu => (
                      <tr key={menu.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors lg:group">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0 border border-outline-variant/20">
                              <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                            <span className="font-semibold text-on-surface whitespace-nowrap">{menu.name}</span>
                          </div>
                        </td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryColors[menu.category] || 'bg-gray-50 text-gray-600 border-gray-200'} whitespace-nowrap`}>{menu.category}</span></td>
                        <td className="p-3 font-bold text-on-surface-variant whitespace-nowrap">Rp {Number(menu.hpp || 0).toLocaleString('id-ID')}</td>
                        <td className="p-3 font-bold text-primary whitespace-nowrap">Rp {Number(menu.price).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center flex justify-center gap-2">
                          <button onClick={() => { setMenuFormData(menu); setIsEditing(true); setShowMenuModal(true); }} className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-surface-container px-3 py-1 rounded-md text-on-surface hover:bg-primary hover:text-on-primary font-semibold border border-outline-variant/20">Edit</button>
                          <button onClick={() => requestDelete(menu.id, "menu", menu.name)} className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-error-container/20 px-3 py-1 rounded-md text-error border border-error/20 hover:bg-error hover:text-white font-semibold">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INGREDIENTS TABLE ── */}
          {activeTab === 'ingredients' && (
            <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="p-3 text-on-surface-variant font-semibold">Nama Bahan</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Satuan</th>
                      <th className="p-3 text-on-surface-variant font-semibold text-center">Stok Saat Ini</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Status</th>
                      <th className="p-3 text-on-surface-variant font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredients.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-on-surface-variant">Pencarian tidak ditemukan.</td></tr>
                    ) : filteredIngredients.map(ing => {
                      const isLow = ing.current_stock < 500;
                      return (
                        <tr key={ing.id} className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest lg:group ${isLow ? 'bg-error-container/5' : ''}`}>
                          <td className="p-3 font-semibold text-on-surface flex items-center gap-2 whitespace-nowrap">{isLow && <span className="material-symbols-outlined text-error text-[14px]">warning</span>} {ing.name}</td>
                          <td className="p-3 text-on-surface-variant whitespace-nowrap">{ing.unit}</td>
                          <td className="p-3 text-center whitespace-nowrap"><span className={`font-bold text-sm ${isLow ? 'text-error' : 'text-on-surface'}`}>{ing.current_stock.toLocaleString('id-ID')}</span></td>
                          <td className="p-3 whitespace-nowrap">{isLow ? <span className="bg-error-container/50 text-error px-2 py-0.5 rounded-full text-[10px] font-bold border border-error/20">Stok Rendah</span> : <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">Cukup</span>}</td>
                          <td className="p-3 text-center flex justify-center gap-2">
                              <button onClick={() => { setSelectedItem(ing); setShowRestockModal(true); }} className="bg-emerald-50 text-emerald-700 px-2 md:px-3 py-1 rounded-md border border-emerald-200 font-bold hover:bg-emerald-600 hover:text-white transition-all text-[10px]">Restok</button>
                              <button onClick={() => { setIngFormData(ing); setIsEditing(true); setShowIngModal(true); }} className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-surface-container px-2.5 py-1 rounded-md text-on-surface border border-outline-variant/20 hover:bg-primary hover:text-on-primary font-semibold text-[10px]">Edit</button>
                              <button onClick={() => requestDelete(ing.id, "ingredient", ing.name)} className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-error-container/20 px-2.5 py-1 rounded-md text-error border border-error/20 hover:bg-error hover:text-white font-semibold text-[10px]">Hapus</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ORDERS TABLE DENGAN PAGINATION ── */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm w-full flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/20">
                      <th className="p-3 text-on-surface-variant font-semibold">ID Struk</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Waktu</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Total Pembayaran</th>
                      <th className="p-3 text-on-surface-variant font-semibold">Metode</th>
                      <th className="p-3 text-on-surface-variant font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-on-surface-variant text-xs">Pencarian tidak ditemukan.</td></tr>
                    ) : currentOrders.map(order => (
                      <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors lg:group">
                        <td className="p-3 whitespace-nowrap"><span className="font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-md">#ORD-{order.id}</span></td>
                        <td className="p-3 text-on-surface-variant whitespace-nowrap">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                        <td className="p-3 font-bold text-on-surface whitespace-nowrap">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                        <td className="p-3 whitespace-nowrap"><span className="bg-surface-container px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant border border-outline-variant/20">{order.payment_method}</span></td>
                        <td className="p-3 text-center">
                          <button onClick={() => requestDelete(order.id, "order", order.id)} className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200 font-bold hover:bg-red-600 hover:text-white text-[10px]">
                            VOID
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrdersForPagination.length > 0 && (
                <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-2">
                  <p className="text-[10px] md:text-[11px] text-on-surface-variant font-medium text-center sm:text-left">
                    Menampilkan {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrdersForPagination.length)} dari {filteredOrdersForPagination.length}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 md:p-1.5 rounded bg-white border border-outline-variant/30 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"><span className="material-symbols-outlined text-[14px] md:text-[16px]">chevron_left</span></button>
                    <span className="px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold text-on-surface flex items-center whitespace-nowrap">Hal {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-1 md:p-1.5 rounded bg-white border border-outline-variant/30 text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"><span className="material-symbols-outlined text-[14px] md:text-[16px]">chevron_right</span></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL CUSTOM DELETE (POIN 1) ── */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white p-5 md:p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl border border-error/20">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-error-container text-error rounded-full flex items-center justify-center mb-3 md:mb-4">
                <span className="material-symbols-outlined text-2xl md:text-3xl">warning</span>
              </div>
              <h3 className="text-base md:text-lg font-bold font-headline text-on-surface mb-2">{confirmDelete.title}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant mb-5 md:mb-6">{confirmDelete.message}</p>

              <div className="flex gap-2 md:gap-3 w-full">
                <button
                  onClick={() => setConfirmDelete({ show: false, id: null, type: "", title: "", message: "" })}
                  className="flex-1 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-highest transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-white bg-error hover:bg-error/90 shadow-md transition-all active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS (FORM MENU & BAHAN BAKU) ── */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-5 md:p-6 rounded-2xl w-full max-w-[320px] shadow-2xl border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <div className="h-8 w-8 md:h-9 md:w-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-200"><span className="material-symbols-outlined text-emerald-600 text-[16px] md:text-[18px]">add_box</span></div>
              <div><h3 className="font-bold text-xs md:text-sm text-on-surface">Restok Bahan Baku</h3><p className="text-[10px] md:text-[11px] text-on-surface-variant">{selectedItem?.name}</p></div>
            </div>
            <form onSubmit={handleRestockSubmit}>
              <input required type="number" value={addedStock} onChange={(e) => setAddedStock(e.target.value)} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/10 mb-4 md:mb-5" placeholder="Jumlah Masuk" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowRestockModal(false)} className="flex-1 py-1.5 md:py-2 text-[11px] md:text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-xl border border-outline-variant/30 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-1.5 md:py-2 bg-emerald-600 text-white text-[11px] md:text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors">Simpan Restok</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIngModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white p-5 md:p-6 rounded-2xl w-full max-w-[320px] shadow-2xl border border-outline-variant/30">
            <h3 className="font-bold text-xs md:text-sm text-on-surface mb-3 md:mb-4">{isEditing ? "Edit Bahan" : "Tambah Bahan Baru"}</h3>
            <form onSubmit={handleIngSubmit} className="flex flex-col gap-2.5 md:gap-3">
              <input required type="text" placeholder="Nama Bahan" value={ingFormData.name} onChange={(e) => setIngFormData({ ...ingFormData, name: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none" />
              <select value={ingFormData.unit} onChange={(e) => setIngFormData({ ...ingFormData, unit: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none bg-white">
                <option value="gram">gram</option><option value="ml">ml</option><option value="pcs">pcs</option>
              </select>
              {!isEditing && <input required type="number" placeholder="Stok Awal" value={ingFormData.current_stock} onChange={(e) => setIngFormData({ ...ingFormData, current_stock: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none" />}
              <div className="flex gap-2 mt-1 md:mt-2">
                <button type="button" onClick={() => setShowIngModal(false)} className="flex-1 py-1.5 md:py-2 text-[11px] md:text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-xl border border-outline-variant/30 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-1.5 md:py-2 bg-primary text-on-primary text-[11px] md:text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MENU FORM (HPP & KATEGORI FLEKSIBEL) */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-5 md:p-6 rounded-2xl w-full max-w-[380px] max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30">
            <h3 className="font-bold text-xs md:text-sm text-on-surface mb-3 md:mb-4">{isEditing ? "Edit Menu" : "Tambah Menu Baru"}</h3>
            <form onSubmit={handleMenuSubmit} className="flex flex-col gap-2.5 md:gap-3">
              
              <div>
                <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Nama Menu</label>
                <input required type="text" placeholder="mis. Iced Latte" value={menuFormData.name} onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3">
                <div className="flex-1">
                  <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Modal / HPP (Rp)</label>
                  <input required type="number" placeholder="mis. 8000" value={menuFormData.hpp} onChange={(e) => setMenuFormData({ ...menuFormData, hpp: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm outline-none focus:border-primary bg-surface-container-lowest" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Harga Jual (Rp)</label>
                  <input required type="number" placeholder="mis. 25000" value={menuFormData.price} onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })} className="w-full p-2 md:p-2.5 border border-emerald-200 rounded-xl text-xs md:text-sm outline-none focus:border-emerald-500 bg-emerald-50" />
                </div>
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Kategori</label>
                <input required list="category-options" placeholder="Pilih atau ketik kategori baru..." value={menuFormData.category} onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none" />
                <datalist id="category-options">
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase block mb-1">URL Gambar</label>
                <input type="text" placeholder="https://..." value={menuFormData.image} onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })} className="w-full p-2 md:p-2.5 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none" />
              </div>

              <div className="flex gap-2 mt-1 md:mt-2">
                <button type="button" onClick={() => setShowMenuModal(false)} className="flex-1 py-1.5 md:py-2 text-[11px] md:text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-xl border border-outline-variant/30 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-1.5 md:py-2 bg-primary text-on-primary text-[11px] md:text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}