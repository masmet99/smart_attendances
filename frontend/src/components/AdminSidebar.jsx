import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function AdminSidebar() {

  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    window.location.href = "/";
  };

return (

  <>

    {!menuOpen && (

      <button
        className="mobile-menu-btn"
        onClick={() =>
          setMenuOpen(true)
        }
      >
        ☰
      </button>

    )}

    {
      menuOpen && (

        <div
          className="mobile-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />

      )
    }

    <div
      className={
        menuOpen
          ? "sidebar sidebar-open"
          : "sidebar"
      }
    >

      <button
        className="sidebar-close"
        onClick={() =>
          setMenuOpen(false)
        }
      >
        ✕
      </button>

      <div>

        <div className="sidebar-logo">

          <div className="logo-icon">
            🛠️
          </div>

          <div>

            <h2>
              Admin Panel
            </h2>

            <p>
              Smart Attendance
            </p>

          </div>

        </div>

        <div className="sidebar-menu">

          <Link
            to="/admin/dashboard"
            className={
              location.pathname ===
              "/admin/dashboard"
                ? "sidebar-link active-link"
                : "sidebar-link"
            }
            onClick={() =>
              setMenuOpen(false)
            }
          >
            📊 Dashboard
          </Link>

          <Link
            to="/admin/attendance"
            className={
              location.pathname ===
              "/admin/attendance"
                ? "sidebar-link active-link"
                : "sidebar-link"
            }
            onClick={() =>
              setMenuOpen(false)
            }
          >
            📋 Attendance
          </Link>

          <Link
          to="/admin/geofence"
          className={
            location.pathname ===
            "/admin/geofence"
              ? "sidebar-link active-link"
              : "sidebar-link"
          }
        >
          📍 Geofence
        </Link>

        </div>

      </div>

      <div className="sidebar-footer">

        <div className="user-card">

          <div className="avatar">
            🛠️
          </div>

          <div>

            <h4>
              Administrator
            </h4>

            <p>
              System Admin
            </p>

          </div>

        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

    </div>

  </>

);
}

export default AdminSidebar;