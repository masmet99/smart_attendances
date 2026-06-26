import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function AdminSidebar() {

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const close = () => setMenuOpen(false);

  const navItems = [
    { to: "/admin/dashboard",  icon: "📊", label: "Dashboard"   },
    { to: "/admin/attendance", icon: "📋", label: "Attendance"  },
    { to: "/admin/geofence",   icon: "📍", label: "Geofence"    },
    { to: "/admin/users",      icon: "👥", label: "Kelola Akun" },
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
            <div className="logo-icon sb-admin-icon">🛠️</div>
            <div>
              <h2>Admin Panel</h2>
              <p>Smart Attendance</p>
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
            <div className="avatar sb-admin-avatar">🛠️</div>
            <div>
              <h4>Administrator</h4>
              <p>System Admin</p>
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

export default AdminSidebar;