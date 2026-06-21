import { Link, useLocation } from "react-router-dom";
import { getProfile } from "../services/authService";
import { useEffect, useState } from "react";

function Sidebar() {

  const location = useLocation();

  const [user, setUser] =
    useState(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {

    loadUser();

  }, []);

  const loadUser = async () => {

    try {

      const profile =
        await getProfile();

      setUser(
        profile.user
      );

    } catch (error) {

      console.log(error);
    }
  };

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
            📸
          </div>

          <div>

            <h2>
              Smart Attendance
            </h2>

            <p>
              Face Recognition
            </p>

          </div>

        </div>

        <div className="sidebar-menu">

          <Link
            to="/dashboard"
            className={
              location.pathname === "/dashboard"
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
            to="/checkin"
            className={
              location.pathname === "/checkin"
                ? "sidebar-link active-link"
                : "sidebar-link"
            }
            onClick={() =>
              setMenuOpen(false)
            }
          >
            📍 Check In
          </Link>

          <Link
            to="/history"
            className={
              location.pathname === "/history"
                ? "sidebar-link active-link"
                : "sidebar-link"
            }
            onClick={() =>
              setMenuOpen(false)
            }
          >
            📋 Riwayat Absensi
          </Link>

        </div>

      </div>

      <div className="sidebar-footer">

        <div className="user-card">

          <div className="avatar">
            👤
          </div>

          <div>

            <h4>
              {
                user?.nama ||
                user?.nip ||
                "User"
              }
            </h4>

            <p>
              {
                user?.role ||
                "-"
              }
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

export default Sidebar;