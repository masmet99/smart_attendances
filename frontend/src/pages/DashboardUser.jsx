import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "../services/authService";
import Sidebar from "../components/Sidebar";

import {
  getTodayAttendance,
  checkOut
} from "../services/attendanceService";

import { formatDateTime } from "../utils/formatDate";
import { showSuccess, showError } from "../utils/alert";

function DashboardUser() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await getProfile();

      if (!profile.user.face_registered) {
        navigate("/register-face");
        return;
      }

      const today = await getTodayAttendance();
      setUser(profile.user);
      setAttendance(today);

    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await checkOut();
      showSuccess(result.message);
      loadData();
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        showError(error.response.data.message);
      } else {
        showError("Check Out gagal");
      }
    }
  };

  // Ambil inisial nama untuk avatar
  const getInitials = (nama) => {
    if (!nama) return "?";
    return nama
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  // Tanggal hari ini
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const faceScore = attendance?.data
    ? (attendance.data.similarity_score * 100).toFixed(1)
    : null;

  const sudahCheckIn  = attendance?.checked_in;
  const sudahCheckOut = attendance?.checked_out;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">

        {/* HERO CARD */}
        {user && (
          <div className="db-hero-card">
            <div className="db-avatar">
              {getInitials(user.nama || user.nip)}
            </div>
            <div className="db-hero-info">
              <h1 className="db-hero-name">
                {user.nama || user.nip}
              </h1>
              <p className="db-hero-sub">
                {today}
              </p>
            </div>
            {sudahCheckIn && (
              <span className="db-hero-badge">
                ✅ Hadir
              </span>
            )}
          </div>
        )}

        {/* STAT CARDS */}
        {attendance && (
          <div className="db-stats-grid">

            <div className="db-stat-card">
              <span className="db-stat-label">🟢 Check In</span>
              <span className={`db-stat-val ${sudahCheckIn ? "val-green" : "val-muted"}`}>
                {sudahCheckIn
                  ? (attendance.data?.jam_masuk
                      ? new Date(attendance.data.jam_masuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                      : "✅")
                  : "—"}
              </span>
            </div>

            <div className="db-stat-card">
              <span className="db-stat-label">🔴 Check Out</span>
              <span className={`db-stat-val ${sudahCheckOut ? "val-green" : "val-muted"}`}>
                {sudahCheckOut
                  ? (attendance.data?.jam_pulang
                      ? new Date(attendance.data.jam_pulang).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                      : "✅")
                  : "—"}
              </span>
            </div>

            <div className="db-stat-card">
              <span className="db-stat-label">🔵 Face Match</span>
              <span className={`db-stat-val ${faceScore ? "val-blue" : "val-muted"}`}>
                {faceScore ? `${faceScore}%` : "—"}
              </span>
            </div>

          </div>
        )}

        {/* DETAIL ABSENSI */}
        {attendance?.data && (
          <div className="card db-detail-card">
            <p className="db-section-label">Detail Absensi Hari Ini</p>

            <div className="db-detail-row">
              <span className="db-detail-label">🕐 Jam Masuk</span>
              <span className="db-detail-val">
                {formatDateTime(attendance.data.jam_masuk) || "—"}
              </span>
            </div>

            <div className="db-detail-row">
              <span className="db-detail-label">🕔 Jam Pulang</span>
              <span className={`db-detail-val ${!attendance.data.jam_pulang ? "val-muted" : ""}`}>
                {attendance.data.jam_pulang
                  ? formatDateTime(attendance.data.jam_pulang)
                  : "Belum check out"}
              </span>
            </div>

            <div className="db-detail-row">
              <span className="db-detail-label">🏷 Status</span>
              <span className="db-badge-ok">
                {attendance.data.status}
              </span>
            </div>
          </div>
        )}

        {/* TOMBOL CHECK OUT */}
        {attendance && sudahCheckIn && !sudahCheckOut && (
          <div className="card db-checkout-card">
            <p className="db-checkout-hint">
              Kamu belum check out hari ini.
            </p>
            <button
              className="btn db-btn-checkout"
              onClick={handleCheckOut}
            >
              🚪 Check Out Sekarang
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardUser;
