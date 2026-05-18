const BASE_URL = "http://localhost:8000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // Header bawaan (selalu digunakan)
  const defaultHeaders = {
    "Accept": "application/json",
  };

  // Jika ada token, otomatis tempelkan
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Handle format data (hindari set Content-Type manual jika kirim gambar/FormData)
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Gabungkan semua pengaturan
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Eksekusi pemanggilan API
  return fetch(`${BASE_URL}${endpoint}`, config);
};