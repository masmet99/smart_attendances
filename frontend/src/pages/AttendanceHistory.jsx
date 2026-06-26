import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getHistory } from "../services/attendanceService";
import { formatDate, formatDateTime } from "../utils/formatDate";
import { getProfile } from "../services/authService";

function AttendanceHistory() {

  const navigate = useNavigate();

  const [histories, setHistories] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    checkFaceRegistration();
  }, []);

  const checkFaceRegistration = async () => {
    try {
      const profile = await getProfile();
      if (!profile.user.face_registered) {
        navigate("/register-face");
        return;
      }
      loadHistory();
    } catch (error) {
      console.log(error);
    }
  };

  const loadHistory = async () => {
    try {
      const result = await getHistory();
      setHistories(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ── stats ─────────────────────────────────────────────
  const hadirCount = histories.filter(i => i.status === "HADIR").length;
  const telatCount = histories.filter(i => i.status !== "HADIR" && i.status).length;
  const avgSimilarity =
    histories.length > 0
      ? (histories.reduce((acc, i) => acc + (i.similarity_score || 0), 0) / histories.length) * 100
      : 0;

  // ── filter ────────────────────────────────────────────
  const filtered = histories.filter(i =>
    formatDate(i.tanggal)?.toLowerCase().includes(search.toLowerCase()) ||
    i.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">

        {/* HEADER */}
        <div className="ah-hero-card">
          <div>
            <h1 className="ah-hero-title">Riwayat Absensi</h1>
            <p className="ah-hero-sub">Monitoring seluruh riwayat kehadiranmu</p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="ah-stats-row">
          <div className="ah-stat-card">
            <span className="ah-stat-label">✅ Hadir</span>
            <span className="ah-stat-val val-green">{hadirCount}</span>
          </div>
          <div className="ah-stat-card">
            <span className="ah-stat-label">⚠️ Terlambat / Lainnya</span>
            <span className="ah-stat-val val-amber">{telatCount}</span>
          </div>
          <div className="ah-stat-card">
            <span className="ah-stat-label">📋 Total Data</span>
            <span className="ah-stat-val" style={{ color: "#2563eb" }}>{histories.length}</span>
          </div>
          <div className="ah-stat-card">
            <span className="ah-stat-label">📸 Avg Similarity</span>
            <span className="ah-stat-val" style={{ color: "#7c3aed" }}>{avgSimilarity.toFixed(1)}%</span>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="card ah-table-card">
          <div className="ah-table-header">
            <h2 className="ah-table-title">Detail Kehadiran</h2>
            <input
              className="ah-search"
              type="text"
              placeholder="🔍 Cari tanggal atau status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="ah-empty">⏳ Memuat data...</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Similarity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{formatDate(item.tanggal)}</td>
                        <td>{formatDateTime(item.jam_masuk) || "—"}</td>
                        <td>{formatDateTime(item.jam_pulang) || "—"}</td>
                        <td>
                          <span className={item.status === "HADIR" ? "history-badge-success" : "history-badge-warning"}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#2563eb" }}>
                          {item.similarity_score
                            ? (item.similarity_score * 100).toFixed(2) + "%"
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="ah-empty">
                          {search ? "Tidak ada data yang cocok" : "Belum ada data absensi"}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <p className="ah-count-info">
              Menampilkan {filtered.length} dari {histories.length} data
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default AttendanceHistory;