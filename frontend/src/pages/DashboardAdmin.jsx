import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AttendanceChart from "../components/AttendanceChart";

import {
  getDashboard,
  getUsers,
  getWeeklyAttendance,
  getActivityLogs
} from "../services/adminService";

import { showSuccess, showError } from "../utils/alert";

function DashboardAdmin() {

  const navigate = useNavigate();

  const [stats, setStats]       = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => { loadData(); }, []);

const loadData = async () => {

  try {
    const dashboard =
      await getDashboard();
    setStats(
      dashboard.data
    );

    const weekly =
      await getWeeklyAttendance();
    setChartData(
      weekly.data
    );

    const activity =
      await getActivityLogs();
    setActivityLogs(
      activity.data
    );
  }

  catch(error){
    console.log(error);
  }

};

  const quickMenus = [
    {
      icon: "📋",
      title: "Data Absensi",
      desc: "Lihat & kelola seluruh data absensi pegawai",
      to: "/admin/attendance",
      color: "#3b82f6",
    },
    {
      icon: "📍",
      title: "Geofence",
      desc: "Atur radius dan lokasi area absensi",
      to: "/admin/geofence",
      color: "#10b981",
    },
    {
      icon: "👥",
      title: "Kelola Akun",
      desc: "Tambah, edit, dan nonaktifkan akun pegawai",
      to: "/admin/users",
      color: "#7c3aed",
    },
  ];

  // Hitung persentase kehadiran
  const attendanceRate =
    stats && stats.total_users > 0
      ? ((stats.hadir_hari_ini / stats.total_users) * 100).toFixed(0)
      : 0;

  return (
    <div className="layout">
      <AdminSidebar />

      <div className="main-content">

        {/* HERO */}
        <div className="da-hero-card">
          <div>
            <h1 className="da-hero-title">Dashboard Admin</h1>
            <p className="da-hero-sub">Statistik sistem secara realtime</p>
          </div>
          <div className="da-hero-rate">
            <span className="da-rate-val">{attendanceRate}%</span>
            <span className="da-rate-label">Kehadiran hari ini</span>
          </div>
        </div>

        {/* STAT CARDS */}
        {stats && (
          <div className="admin-stats">
            <div className="admin-card bg-blue">
              <h4>👥 Total User</h4>
              <h2>{stats.total_users}</h2>
            </div>
            <div className="admin-card bg-green">
              <h4>📸 Face Registered</h4>
              <h2>{stats.registered_faces}</h2>
            </div>
            <div className="admin-card bg-orange">
              <h4>✅ Hadir Hari Ini</h4>
              <h2>{stats.hadir_hari_ini}</h2>
            </div>
            <div className="admin-card bg-red">
              <h4>⏳ Belum Absen</h4>
              <h2>{stats.belum_absen_hari_ini}</h2>
            </div>
          </div>
        )}

        {/* CHART */}
        <div className="card da-chart-card">
          <div className="da-chart-header">
            <div>
              <h2 className="da-chart-title">📈 Statistik Kehadiran</h2>
              <p className="da-chart-sub">Tren kehadiran pegawai minggu ini</p>
            </div>
          </div>
          <AttendanceChart data={chartData} />
        </div>

        {/* QUICK MENUS */}
        <div className="da-section-label">Menu Cepat</div>
        <div className="da-quick-grid">
          {quickMenus.map(({ icon, title, desc, to, color }) => (
            <div
              key={to}
              className="da-quick-card"
              onClick={() => navigate(to)}
            >
              <div className="da-quick-icon" style={{ background: color + "18", color }}>
                {icon}
              </div>
              <div className="da-quick-body">
                <h3 className="da-quick-title">{title}</h3>
                <p className="da-quick-desc">{desc}</p>
              </div>
              <span className="da-quick-arrow">→</span>
            </div>
          ))}
        </div>

{/* LOG AKTIVITAS */}
<div className="card da-activity-card">
  <div className="da-activity-header">
    <div>
      <h2 className="da-chart-title">📝 Aktivitas Terbaru</h2>
      <p className="da-chart-sub">Aktivitas pengguna terbaru</p>
    </div>

    <span className="da-activity-count">
      {activityLogs.length} aktivitas
    </span>
  </div>

  {activityLogs.length === 0 ? (
    <p className="da-activity-empty">Belum ada aktivitas.</p>
  ) : (
    <div className="da-activity-list">
      {activityLogs.map((log, index) => {
        const activityInfo =
          log.activity === "LOGIN"
            ? {
                icon: "🔑",
                iconClass: "da-icon-login",
                badgeClass: "da-badge-login",
                label: "Login",
              }
            : log.activity === "CHECK_IN"
            ? {
                icon: "🟢",
                iconClass: "da-icon-checkin",
                badgeClass: "da-badge-checkin",
                label: "Check In",
              }
            : {
                icon: "🔴",
                iconClass: "da-icon-checkout",
                badgeClass: "da-badge-checkout",
                label: "Check Out",
              };

        return (
          <div key={index} className="da-activity-item">
            <div className={`da-activity-icon ${activityInfo.iconClass}`}>
              {activityInfo.icon}
            </div>

            <div className="da-activity-body">
              <div className="da-activity-name">
                {log.nama}

                <span className={`da-activity-badge ${activityInfo.badgeClass}`}>
                  {activityInfo.label}
                </span>
              </div>

              <p className="da-activity-label">
                Aktivitas pengguna
              </p>

              <small className="da-activity-time">
                {new Date(log.created_at).toLocaleString("id-ID")}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

      </div>
    </div>
  );
}

export default DashboardAdmin;