import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "../services/authService";
import Sidebar from "../components/Sidebar";
import { getSystemSettings } from "../services/systemSettingService";

import {
  getTodayAttendance,
  checkOut
} from "../services/attendanceService";

import { formatDateTime } from "../utils/formatDate";
import { showSuccess, showError } from "../utils/alert";

function DashboardUser() {

  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [setting, setSetting]         = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance]   = useState(null);

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const profile = await getProfile();

      if (!profile.user.face_registered) {
        navigate("/register-face");
        return;
      }

      const today       = await getTodayAttendance();
      const settingData = await getSystemSettings();

      setUser(profile.user);
      setAttendance(today);
      setSetting(settingData.data);

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
      if (error.response?.data) {
        showError(error.response.data.message);
      } else {
        showError("Check Out gagal");
      }
    }
  };

  const getInitials = (nama) => {
    if (!nama) return "?";
    return nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  const getTodayDate = (time) => {
    const d = new Date();
    const [h, m] = time.split(":");
    d.setHours(Number(h));
    d.setMinutes(Number(m));
    d.setSeconds(0);
    return d;
  };

  // ── Data turunan dari attendance — HARUS sebelum dipakai di bawah ──
  const faceScore     = attendance?.data ? (attendance.data.similarity_score * 100).toFixed(1) : null;
  const sudahCheckIn  = attendance?.checked_in;
  const sudahCheckOut = attendance?.checked_out;

  // ── Status realtime ──────────────────────────────────
  let statusTitle = "";
  let statusColor = "";
  let countdown   = null;

  if (setting) {
    const now     = currentTime;
    const open    = getTodayDate(setting.checkin_open);
    const close   = getTodayDate(setting.checkin_close);
    const workEnd = getTodayDate(setting.work_end);

    if (now < open) {
      statusTitle = "Check-in belum dibuka";
      statusColor = "warning";
      countdown   = formatCountdown(Math.floor((open - now) / 1000));

    } else if (!sudahCheckIn && now <= close) {
      statusTitle = "Check-in sedang dibuka";
      statusColor = "success";
      countdown   = formatCountdown(Math.floor((close - now) / 1000));

    } else if (!sudahCheckIn && now > close) {
      statusTitle = "Jam check-in telah berakhir";
      statusColor = "danger";

    } else if (sudahCheckIn && !sudahCheckOut && now < workEnd) {
      statusTitle = `Check out tersedia pukul ${setting.work_end}`;
      statusColor = "info";
      countdown   = formatCountdown(Math.floor((workEnd - now) / 1000));

    } else if (sudahCheckIn && !sudahCheckOut) {
      statusTitle = "Saatnya check out";
      statusColor = "checkout";
      countdown   = null;
    }
  }

  const pad2 = (n) => String(n).padStart(2, "0");

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
              <h1 className="db-hero-name">{user.nama || user.nip}</h1>
              <p className="db-hero-sub">{today}</p>
            </div>
            {sudahCheckIn && (
              <span className="db-hero-badge">✅ Hadir</span>
            )}
          </div>
        )}

        {/* STATUS REALTIME + COUNTDOWN — digabung jadi satu card */}
        {setting && statusTitle && (
          <div className={`db-status-card db-status-${statusColor}`}>
            <div className="db-status-top">
              <div>
                <p className="db-status-label">Status saat ini</p>
                <p className="db-status-title">
                  <span className={`db-status-dot db-dot-${statusColor}`} />
                  {statusTitle}
                </p>
              </div>
            </div>

            {countdown && (
              <div className="db-countdown-row">
                <div className="db-cd-box">
                  <span className="db-cd-num">{pad2(countdown.h)}</span>
                  <span className="db-cd-unit">Jam</span>
                </div>
                <div className="db-cd-box">
                  <span className="db-cd-num">{pad2(countdown.m)}</span>
                  <span className="db-cd-unit">Menit</span>
                </div>
                <div className="db-cd-box">
                  <span className="db-cd-num">{pad2(countdown.s)}</span>
                  <span className="db-cd-unit">Detik</span>
                </div>
              </div>
            )}

            {statusColor === "checkout" && (
              <button className="db-status-checkout-btn" onClick={handleCheckOut}>
                🚪 Check out sekarang
              </button>
            )}
          </div>
        )}

        {/* JADWAL HARI INI — grid flat tanpa header section berat */}
        {setting && (
          <div className="db-work-grid">
            <div className="db-work-item">
              <span className="db-work-icon">🕒</span>
              <span className="db-work-label">Jam Kerja</span>
              <span className="db-work-val">{setting.work_start}–{setting.work_end}</span>
            </div>
            <div className="db-work-item">
              <span className="db-work-icon">📍</span>
              <span className="db-work-label">Check In</span>
              <span className="db-work-val">{setting.checkin_open}–{setting.checkin_close}</span>
            </div>
            <div className="db-work-item">
              <span className="db-work-icon">⏱</span>
              <span className="db-work-label">Toleransi</span>
              <span className="db-work-val">{setting.late_tolerance} menit</span>
            </div>
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
              <span className="db-badge-ok">{attendance.data.status}</span>
            </div>
          </div>
        )}

        {/* TOMBOL CHECK OUT — fallback HANYA jika setting gagal dimuat (status card tidak bisa tampil) */}
        {!setting && attendance && sudahCheckIn && !sudahCheckOut && (
          <div className="card db-checkout-card">
            <p className="db-checkout-hint">Kamu belum check out hari ini.</p>
            <button className="btn db-btn-checkout" onClick={handleCheckOut}>
              🚪 Check Out Sekarang
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardUser;