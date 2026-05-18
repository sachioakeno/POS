import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api"; // Pastikan path ini sesuai dengan lokasi folder utils kamu

export default function Settings() {
  const [formData, setFormData] = useState({ store_name: "", tax_percentage: 0, logo_url: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Menggunakan apiFetch, tidak perlu tulis full URL dan Token lagi
    apiFetch("/settings")
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        if (data.logo_url) setLogoPreview(data.logo_url);
      })
      .catch(err => console.error("Gagal memuat:", err));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const dataToSend = new FormData();
    dataToSend.append("store_name", formData.store_name);
    dataToSend.append("tax_percentage", formData.tax_percentage);
    if (logoFile) dataToSend.append("logo", logoFile);

    try {
      // Menggunakan apiFetch untuk FormData
      const response = await apiFetch("/settings", {
        method: "POST",
        body: dataToSend
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage({ text: "Pengaturan berhasil disimpan!", type: "success" });
        
        localStorage.setItem("storeName", formData.store_name);
        if (result.data.logo_url) localStorage.setItem("storeLogo", result.data.logo_url);
        window.dispatchEvent(new Event("storeProfileUpdated"));

      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (error) {
      setMessage({ text: "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-surface-container-lowest min-h-screen font-body text-on-surface ml-0 md:ml-56 flex flex-col items-center mt-14 md:mt-0 overflow-x-hidden">
      <div className="w-full max-w-2xl mt-2 md:mt-10">
        
        <div className="mb-6 md:mb-8 text-center sm:text-left">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary mb-1">Store Settings</h1>
          <p className="text-[11px] md:text-sm text-on-surface-variant">Sesuaikan identitas, logo, dan aturan pajak toko.</p>
        </div>

        {message.text && (
          <div className={`p-3 md:p-4 rounded-xl mb-4 md:mb-6 font-bold text-xs md:text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <span className="material-symbols-outlined text-[18px] md:text-[24px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white p-5 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4 md:gap-6">
          
          {/* FOTO LOGO SECTION */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30">
            <div className="h-24 w-24 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30 flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-outline">storefront</span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full text-center sm:text-left">
              <label className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wide">Logo Toko (Opsional)</label>
              <p className="text-[10px] text-on-surface-variant mb-1">Rekomendasi rasio 1:1 (Kotak). Maksimal 2MB.</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5 md:mb-2">Nama Toko / UMKM</label>
            <input required type="text" value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} className="w-full p-2.5 md:p-3 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5 md:mb-2">Tarif Pajak (PPN / PB1) %</label>
            <input required type="number" step="0.1" value={formData.tax_percentage} onChange={(e) => setFormData({...formData, tax_percentage: e.target.value})} className="w-full p-2.5 md:p-3 border border-outline-variant rounded-xl text-xs md:text-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/10" />
          </div>

          <div className="border-t border-outline-variant/30 pt-4 md:pt-6 flex justify-end mt-2">
            <button disabled={isLoading} type="submit" className="w-full sm:w-auto justify-center bg-primary text-on-primary px-4 md:px-6 py-2.5 md:py-2 rounded-xl font-bold text-xs md:text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
              {isLoading ? "Menyimpan..." : <><span className="material-symbols-outlined text-[16px] md:text-[18px]">save</span> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}