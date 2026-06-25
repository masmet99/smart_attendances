import { useState } from "react";
import { login, getProfile } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { showError } from "../utils/alert";

function Login() {

  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!nip || !password) {
      showError("NIP dan Password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const result = await login(nip, password);
      localStorage.setItem("token", result.access_token);

      const profile = await getProfile();

      if (profile.user.role === "admin") {
        navigate("/admin");
      } else if (!profile.user.face_registered) {
        navigate("/register-face");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      showError("NIP atau Password salah");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT */}
        <div className="login-left">
          <div>
            <div className="login-logo-circle">📸</div>

            <h1 style={{ fontSize: "38px", fontWeight: 700, lineHeight: 1.2, marginBottom: "12px" }}>
              Smart Attendance
            </h1>

            <p style={{ fontSize: "16px", opacity: 0.8, marginBottom: "36px", lineHeight: 1.6 }}>
              Sistem Absensi Pegawai Berbasis
              Face Recognition dan Geofence
            </p>

            <div className="login-features">
              <div className="login-feature-item">
                <span>📷</span> Face Recognition
              </div>
              <div className="login-feature-item">
                <span>📍</span> Geofence Validation
              </div>
              <div className="login-feature-item">
                <span>⏱</span> Real-Time Attendance
              </div>
              <div className="login-feature-item">
                <span>🔒</span> Secure Authentication
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">

          <div className="login-form-header">
            <h2>Selamat Datang 👋</h2>
            <p>Login menggunakan NIP dan Password kamu</p>
          </div>

          <div className="login-field">
            <label>NIP</label>
            <input
              type="text"
              placeholder="Masukkan NIP"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="login-pass-toggle"
                onClick={() => setShowPass(!showPass)}
                type="button"
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            className="btn login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "⏳ Masuk..." : "🔐 Login"}
          </button>

          <p className="login-version">Smart Attendance v1.0</p>

        </div>
      </div>
    </div>
  );
}

export default Login;