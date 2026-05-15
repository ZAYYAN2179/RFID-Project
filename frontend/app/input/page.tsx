"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3000/api";

interface User {
  id: string;
  Tag: string;
  nama: string;
}

type Status = { type: "success" | "error"; message: string } | null;

export default function InputPage() {
  const router = useRouter();

  const [tag, setTag] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-hide status after 4s
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimTag = tag.trim().toUpperCase();
    const trimNama = nama.trim();

    if (!trimTag || !trimNama) {
      setStatus({ type: "error", message: "Tag dan Nama tidak boleh kosong." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Tag: trimTag, nama: trimNama }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Gagal menyimpan data." });
      } else {
        setStatus({ type: "success", message: `✅ Berhasil! "${trimNama}" berhasil ditambahkan.` });
        setTag("");
        setNama("");
        fetchUsers();
      }
    } catch {
      setStatus({ type: "error", message: "Koneksi ke server gagal. Pastikan backend berjalan." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, tagVal: string) {
    if (!confirm(`Hapus tag "${tagVal}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setStatus({ type: "success", message: `🗑️ Tag "${tagVal}" berhasil dihapus.` });
      } else {
        const data = await res.json();
        setStatus({ type: "error", message: data.error || "Gagal menghapus." });
      }
    } catch {
      setStatus({ type: "error", message: "Koneksi ke server gagal." });
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.Tag.toLowerCase().includes(search.toLowerCase()) ||
      u.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .ip-root {
          min-height: 100vh;
          background: #030712;
          color: #f1f5f9;
          font-family: 'Inter', sans-serif;
          padding: 2rem 1rem;
        }

        .ip-container {
          max-width: 720px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .ip-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .ip-back-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ip-back-btn:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }

        .ip-title-block h1 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.2rem;
          line-height: 1.2;
        }
        .ip-title-block p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        /* ── Card ── */
        .ip-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          backdrop-filter: blur(8px);
          margin-bottom: 1.5rem;
        }
        .ip-card-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #475569;
          margin: 0 0 1.25rem;
        }

        /* ── Form ── */
        .ip-form { display: flex; flex-direction: column; gap: 1rem; }

        .ip-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .ip-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.03em;
        }
        .ip-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #f1f5f9;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
        }
        .ip-input::placeholder { color: #334155; }
        .ip-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .ip-input-mono { font-family: 'Courier New', monospace; letter-spacing: 0.05em; }

        .ip-hint { font-size: 0.75rem; color: #475569; margin-top: 0.2rem; }

        .ip-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 0.25rem;
        }
        .ip-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .ip-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .ip-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Spinner ── */
        .ip-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Status alert ── */
        .ip-status {
          border-radius: 10px;
          padding: 0.85rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
          margin-bottom: 1.5rem;
        }
        .ip-status-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
        }
        .ip-status-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Stats bar ── */
        .ip-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .ip-stats-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 999px;
          padding: 0.35rem 0.85rem;
          font-size: 0.82rem;
          color: #60a5fa;
          font-weight: 600;
        }

        /* ── Search ── */
        .ip-search {
          flex: 1;
          min-width: 160px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 0.45rem 0.85rem;
          color: #f1f5f9;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .ip-search::placeholder { color: #334155; }
        .ip-search:focus { border-color: #3b82f6; }

        /* ── Table ── */
        .ip-table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        thead th {
          text-align: left;
          padding: 0.6rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #475569;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        tbody tr:hover { background: rgba(255,255,255,0.03); }
        tbody td { padding: 0.75rem 0.85rem; vertical-align: middle; }

        .ip-tag-chip {
          display: inline-block;
          font-family: 'Courier New', monospace;
          font-size: 0.78rem;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          color: #c4b5fd;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }
        .ip-name { font-weight: 500; color: #e2e8f0; }

        .ip-delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          background: transparent;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 7px;
          color: #ef4444;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .ip-delete-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); }
        .ip-delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Empty / loading ── */
        .ip-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #334155;
          font-size: 0.9rem;
        }
        .ip-empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }

        /* ── Skeleton shimmer ── */
        .ip-skeleton {
          height: 44px;
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 0.5rem;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }
      `}</style>

      <main className="ip-root">
        <div className="ip-container">

          {/* Header */}
          <div className="ip-header">
            <button className="ip-back-btn" onClick={() => router.push("/")}>
              ← Kembali
            </button>
            <div className="ip-title-block">
              <h1>Input Data RFID</h1>
              <p>Daftarkan Tag UHF dan nama pengguna ke database</p>
            </div>
          </div>

          {/* Status Alert */}
          {status && (
            <div className={`ip-status ${status.type === "success" ? "ip-status-success" : "ip-status-error"}`}>
              {status.message}
            </div>
          )}

          {/* Form Card */}
          <div className="ip-card">
            <p className="ip-card-title">Tambah Pengguna Baru</p>
            <form className="ip-form" onSubmit={handleSubmit} autoComplete="off">

              <div className="ip-field">
                <label className="ip-label" htmlFor="input-tag">Tag RFID (EPC)</label>
                <input
                  id="input-tag"
                  className="ip-input ip-input-mono"
                  type="text"
                  placeholder="Contoh: E28011702000005D0830F0B7"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  maxLength={64}
                  spellCheck={false}
                />
                <span className="ip-hint">Masukkan kode EPC dari kartu RFID (akan dikonversi ke huruf kapital)</span>
              </div>

              <div className="ip-field">
                <label className="ip-label" htmlFor="input-nama">Nama Pengguna</label>
                <input
                  id="input-nama"
                  className="ip-input"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  maxLength={100}
                />
              </div>

              <button
                id="submit-user-btn"
                type="submit"
                className="ip-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><div className="ip-spinner" /> Menyimpan...</>
                ) : (
                  <>＋ Simpan ke Database</>
                )}
              </button>
            </form>
          </div>

          {/* User List Card */}
          <div className="ip-card">
            <div className="ip-stats">
              <p className="ip-card-title" style={{ margin: 0 }}>Daftar Pengguna Terdaftar</p>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                <div className="ip-stats-badge">
                  <span>👤</span>
                  <span>{users.length} pengguna</span>
                </div>
                <input
                  className="ip-search"
                  type="text"
                  placeholder="🔍 Cari tag atau nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="search-user-input"
                />
              </div>
            </div>

            {fetching ? (
              <>
                <div className="ip-skeleton" />
                <div className="ip-skeleton" style={{ opacity: 0.6 }} />
                <div className="ip-skeleton" style={{ opacity: 0.3 }} />
              </>
            ) : filtered.length === 0 ? (
              <div className="ip-empty">
                <div className="ip-empty-icon">{search ? "🔍" : "📭"}</div>
                {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada pengguna terdaftar."}
              </div>
            ) : (
              <div className="ip-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama</th>
                      <th>Tag RFID</th>
                      <th style={{ textAlign: "center" }}>Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, idx) => (
                      <tr key={user.id}>
                        <td style={{ color: "#475569", width: "2.5rem" }}>{idx + 1}</td>
                        <td><span className="ip-name">{user.nama}</span></td>
                        <td><span className="ip-tag-chip">{user.Tag}</span></td>
                        <td style={{ textAlign: "center", width: "3rem" }}>
                          <button
                            className="ip-delete-btn"
                            id={`delete-btn-${user.id}`}
                            onClick={() => handleDelete(user.id, user.Tag)}
                            disabled={deletingId === user.id}
                            title="Hapus pengguna"
                          >
                            {deletingId === user.id ? (
                              <div className="ip-spinner" style={{ borderColor: "rgba(239,68,68,0.3)", borderTopColor: "#ef4444" }} />
                            ) : "✕"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}