import { useState } from "react";
import { login, getProfile } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login() {

  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const result = await login(
        nip,
        password
      );

      localStorage.setItem(
        "token",
        result.access_token
      );

      const profile =
        await getProfile();

    if (profile.user.role === "admin") {

      navigate("/admin");

    } else if (
      !profile.user.face_registered
    ) {

      navigate("/register-face");

    } else {

      navigate("/dashboard");

    }

    } catch (error) {

      alert(
        "NIP atau Password salah"
      );

      console.log(error);
    }
  };

return (

  <div className="login-page">

    <div className="login-card">

      {/* LEFT SIDE */}

      <div className="login-left">

        <div>

          <div
            style={{
              fontSize: "60px",
              marginBottom: "20px"
            }}
          >
            📸
          </div>

          <h1
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "15px",
              lineHeight: "1.2"
            }}
          >
            Smart Attendance
          </h1>

          <p
            style={{
              fontSize: "18px",
              opacity: "0.9",
              marginBottom: "40px"
            }}
          >
            Sistem Absensi Pegawai
            Berbasis Face Recognition
            dan Geofence
          </p>

          <div
            style={{
              lineHeight: "2.2",
              fontSize: "15px"
            }}
          >

            <p>
              📷 Face Recognition
            </p>

            <p>
              📍 Geofence Validation
            </p>

            <p>
              ⏱ Real-Time Attendance
            </p>

            <p>
              🔒 Secure Authentication
            </p>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="login-right">

        <div
          style={{
            marginBottom: "30px"
          }}
        >

          <h2
            style={{
              fontSize: "32px",
              marginBottom: "10px"
            }}
          >
            Selamat Datang
          </h2>

          <p
            style={{
              color: "#64748b"
            }}
          >
            Login menggunakan NIP dan Password
          </p>

        </div>

        <div
          style={{
            marginBottom: "20px"
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600"
            }}
          >
            NIP
          </label>

          <input
            type="text"
            placeholder="Masukkan NIP"
            value={nip}
            onChange={(e) =>
              setNip(e.target.value)
            }
          />

        </div>

        <div
          style={{
            marginBottom: "25px"
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600"
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Masukkan Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

        </div>

        <button
          className="btn"
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px"
          }}
        >
          Login
        </button>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "13px"
          }}
        >
          Smart Attendance v1.0
        </p>

      </div>

    </div>

  </div>

);
}

export default Login;