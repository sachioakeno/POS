import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const ROLE_COLORS = {
  admin: { bg: "bg-primary-container", text: "text-primary" },
  cashier: { bg: "bg-tertiary-container", text: "text-tertiary" },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch users ──
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // Menggunakan apiFetch, jauh lebih bersih
      const res = await apiFetch("/users");
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Gagal memuat data pengguna.");
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Open create modal ──
  const openCreate = () => {
    setForm({ name: "", email: "", password: "", role: "cashier" });
    setFormError("");
    setModal("create");
  };

  // ── Open edit modal ──
  const openEdit = (user) => {
    setSelected(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormError("");
    setModal("edit");
  };

  // ── Submit create ──
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat pengguna.");
      setModal(null);
      fetchUsers();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit edit ──
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const payload = { name: form.name, role: form.role };
      const res = await apiFetch(`/users/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui pengguna.");
      setModal(null);
      fetchUsers();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus pengguna.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Shared modal form fields ──
  const ModalForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {formError && (
        <div className="flex items-center gap-2 bg-error-container/20 text-error text-sm font-semibold px-3 py-2.5 rounded-xl border border-error/20">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {formError}
        </div>
      )}

      <Field label="Nama" icon="person">
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-base"
          placeholder="Nama lengkap"
        />
      </Field>

      {!isEdit && (
        <Field label="Email" icon="mail">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-base"
            placeholder="email@toko.com"
          />
        </Field>
      )}

      {!isEdit && (
        <Field label="Password" icon="lock">
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-base"
            placeholder="Minimal 6 karakter"
            minLength={6}
          />
        </Field>
      )}

      <Field label="Role" icon="badge">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="input-base"
        >
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setModal(null)}
          className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-surface-container-lowest p-4 md:p-8">
      <style>{`
        .input-base {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
          border-radius: 12px;
          font-size: 14px;
          background: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: var(--md-sys-color-primary, #1b1d85);
          box-shadow: 0 0 0 3px rgba(27,29,133,0.08);
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 mt-10 md:mt-0">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">User Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola akun staff dan akses sistem
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span className="hidden sm:inline">Tambah Pengguna</span>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-error-container/20 text-error text-sm font-semibold px-4 py-3 rounded-xl border border-error/20">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Pengguna", value: users.length, icon: "group" },
          { label: "Admin", value: users.filter((u) => u.role === "admin").length, icon: "admin_panel_settings" },
          { label: "Cashier", value: users.filter((u) => u.role === "cashier").length, icon: "point_of_sale" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── User table/cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          Memuat data...
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined text-5xl text-outline">group_off</span>
          <p className="text-sm">Belum ada pengguna. Tambahkan staff pertama Anda.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bergabung</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-on-surface">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[user.role]?.bg} ${ROLE_COLORS[user.role]?.text}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-2 rounded-lg hover:bg-error-container/20 text-error transition-all"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[user.role]?.bg} ${ROLE_COLORS[user.role]?.text}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg hover:bg-error-container/20 text-error transition-all">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Create Modal ── */}
      {modal === "create" && (
        <Modal title="Tambah Pengguna Baru" icon="person_add" onClose={() => setModal(null)}>
          <ModalForm onSubmit={handleCreate} isEdit={false} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {modal === "edit" && (
        <Modal title="Edit Pengguna" icon="edit" onClose={() => setModal(null)}>
          <ModalForm onSubmit={handleEdit} isEdit={true} />
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <Modal title="Hapus Pengguna" icon="delete" onClose={() => setDeleteTarget(null)} danger>
          <p className="text-sm text-on-surface-variant mb-6">
            Yakin ingin menghapus akun <span className="font-bold text-on-surface">{deleteTarget.name}</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Reusable Modal wrapper ──
function Modal({ title, icon, onClose, children, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 ${danger ? "bg-error-container/10" : "bg-surface-container-lowest"}`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[20px] ${danger ? "text-error" : "text-primary"}`}>{icon}</span>
            <h2 className="font-bold text-on-surface">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Form field wrapper ──
function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}