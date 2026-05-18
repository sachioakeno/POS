import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../utils/api";

export default function Dashboard() {
  const [data, setData] = useState({
    kpis: { gross_revenue: 0, net_profit: 0, transactions: 0, items_sold: 0, low_stock: 0 },
    revenueTrend: [],
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const storeName = localStorage.getItem("storeName") || "Toko";

  const fetchAiInsights = () => {
    setIsAiLoading(true);
    setAiInsight(null);
    
    // Menggunakan apiFetch
    apiFetch("/ai-insights")
      .then(res => res.json())
      .then(fetchedData => {
        setAiInsight(fetchedData.insight);
        setIsAiLoading(false);
      })
      .catch(err => {
        console.error("Gagal memanggil AI:", err);
        setAiInsight("Ups, koneksi ke Groq AI gagal. Pastikan GROQ_API_KEY sudah benar di .env Laravel.");
        setIsAiLoading(false);
      });
  };

  useEffect(() => {
    // Menggunakan apiFetch
    apiFetch("/analytics")
      .then(res => res.json())
      .then(fetchedData => {
        const formattedTrend = fetchedData.revenueTrend.map(item => ({
          date: item.date,
          revenue: Number(item.revenue)
        }));
        const formattedTop = fetchedData.topProducts.map(item => ({
          name: item.name,
          sold: Number(item.sold)
        }));

        setData({
          kpis: fetchedData.kpis,
          revenueTrend: formattedTrend,
          topProducts: formattedTop
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data analitik:", err);
        setIsLoading(false);
      });
  }, []);

  // Class margin usang dihapus agar tidak bentrok dengan App.jsx
  if (isLoading) return <div className="p-10 flex justify-center text-on-surface-variant text-sm w-full h-screen items-center">Memuat data analitik...</div>;

  return (
    // Class margin (ml-0 md:ml-56 mt-14 md:mt-0) dihapus karena sudah diatur secara global di Layout App.jsx
    <div className="p-4 md:p-6 bg-surface-container-lowest min-h-screen font-body text-on-surface flex flex-col gap-4 md:gap-6 w-full box-border overflow-x-hidden">

      {/* Header */}
      <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-headline mb-1 text-primary">Smart Dashboard</h1>
          <p className="text-[11px] md:text-sm text-on-surface-variant">Membaca data langsung dari database transaksi.</p>
        </div>
      </div>

      {/* KPI Cards - Responsive Grid */}
      {/* Di HP: 2 kolom, Tablet: 3 kolom, PC: 5 kolom */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {[
          { title: "Pendapatan Kotor", value: `Rp ${Number(data.kpis.gross_revenue).toLocaleString('id-ID')}`, icon: "payments", color: "text-emerald-600" },
          { title: "Pendapatan Bersih", value: `Rp ${Number(data.kpis.net_profit).toLocaleString('id-ID')}`,icon: "account_balance_wallet", color: "text-emerald-600" },
          { title: "Total Transaksi", value: data.kpis.transactions, icon: "receipt_long", color: "text-blue-600" },
          { title: "Menu Terjual", value: data.kpis.items_sold || 0, icon: "local_cafe", color: "text-orange-600" },
          { title: "Bahan Menipis", value: data.kpis.low_stock, icon: "warning", color: "text-error" }
        ].map((kpi, index) => (
          <div key={index} className="bg-white p-3 md:p-5 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-3 md:gap-4">
            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
              <span className="material-symbols-outlined text-[18px] md:text-[24px]">{kpi.icon}</span>
            </div>
            <div className="min-w-0 flex-1"> {/* min-w-0 penting agar teks bisa di-truncate */}
              <p className="text-[10px] md:text-xs text-on-surface-variant font-bold whitespace-nowrap">{kpi.title}</p>
              <h3 className="text-sm md:text-lg font-bold tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Responsive Grid */}
      {/* Di HP menumpuk 1 kolom, Di PC bersebelahan (2/3 dan 1/3) */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl border border-outline-variant/30 shadow-sm">
          <h3 className="font-bold text-sm md:text-base mb-4 md:mb-6 text-on-surface">Tren Pendapatan (7 Hari Terakhir)</h3>
          <div className="h-56 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e2dd" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666354' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666354' }} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} cursor={{ stroke: '#cfc7a1', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#645f40" strokeWidth={3} dot={{ r: 3, fill: '#645f40', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col">
          <h3 className="font-bold text-sm md:text-base mb-4 md:mb-6 text-on-surface">Top 5 Menu Terlaris</h3>
          <div className="h-56 md:h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e6e2dd" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1c1b19', fontWeight: 600 }} width={80} />
                <Tooltip cursor={{ fill: '#f7f3ee' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Bar dataKey="sold" fill="#cfc7a1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Kolom AI Insights (On-Demand) */}
      <div className="max-w-6xl mx-auto w-full bg-gradient-to-r from-primary-container/40 to-surface rounded-xl border border-primary/20 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-3 md:gap-4 items-start mb-10">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-on-primary flex-shrink-0 shadow-md transition-all ${isAiLoading ? 'bg-surface-variant animate-pulse' : 'bg-primary'}`}>
          <span className={`material-symbols-outlined text-[20px] md:text-[24px] ${isAiLoading ? 'text-outline animate-spin' : ''}`}>
            {isAiLoading ? 'sync' : 'auto_awesome'}
          </span>
        </div>
        
        <div className="flex-grow w-full">
          <h3 className="font-bold text-primary mb-1 text-sm md:text-base">{storeName} AI Business Insights</h3>
          
          {/* Kondisi 1: Belum ditekan */}
          {!aiInsight && !isAiLoading && (
            <div className="mt-1 md:mt-2">
              <p className="text-[11px] md:text-sm text-on-surface-variant mb-3 md:mb-4">
                AI siap membaca data Market Basket Analysis. Dapatkan rekomendasi strategi promo berdasarkan pola keranjang belanja pelanggan hari ini.
              </p>
              <button 
                onClick={fetchAiInsights}
                className="w-full sm:w-auto justify-center bg-primary text-on-primary px-4 py-2.5 md:py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">magic_button</span>
                Generate Strategi Bisnis
              </button>
            </div>
          )}

          {/* Kondisi 2: Sedang Loading */}
          {isAiLoading && (
            <p className="text-[11px] md:text-sm text-on-surface-variant italic animate-pulse mt-1 md:mt-2 font-medium">
              Menghubungi Groq AI untuk menganalisis jutaan kemungkinan Market Basket...
            </p>
          )}

          {/* Kondisi 3: Selesai / Error */}
          {aiInsight && !isAiLoading && (
            <div className="mt-2 animate-fade-in">
              <p className="text-[11px] md:text-sm text-on-surface-variant leading-relaxed font-medium mb-3">
                {aiInsight}
              </p>
              <button 
                onClick={fetchAiInsights}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline w-full sm:w-auto justify-center sm:justify-start py-2 sm:py-0"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Analisis Ulang
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}