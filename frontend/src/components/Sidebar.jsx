import { Link, useLocation } from "react-router-dom";
import { getProfile } from "../services/authService";
import { useEffect, useState } from "react";

function Sidebar() {

  const location = useLocation();
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const profile = await getProfile();
      setUser(profile.user);
    } catch (error) { console.log(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const close = () => setMenuOpen(false);

  const getInitials = (nama) => {
    if (!nama) return "?";
    return nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  };

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Dashboard"       },
    { to: "/checkin",   icon: "📍", label: "Check In"        },
    { to: "/history",   icon: "📋", label: "Riwayat Absensi" },
  ];

  return (
    <>
      {!menuOpen && (
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
      )}

      {menuOpen && <div className="mobile-overlay" onClick={close} />}

      <div className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <button className="sidebar-close" onClick={close}>✕</button>

        <div>
          <div className="sidebar-logo">
            <div className="logo-icon">📸</div>
            <div>
              <h2>Smart Attendance</h2>
              <p>Face Recognition</p>
            </div>
          </div>

          <nav className="sidebar-menu">
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`sidebar-link ${location.pathname === to ? "active-link" : ""}`}
                onClick={close}
              >
                <span className="sb-nav-icon">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar sb-avatar-initials">
              {user ? getInitials(user.nama || user.nip) : "?"}
            </div>
            <div>
              <h4>{user?.nama || user?.nip || "User"}</h4>
              <p>{user?.role || "—"}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;