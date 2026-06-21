import { useEffect, useState } from "react";

import { getProfile } from "../services/authService";
import Sidebar from "../components/Sidebar";

import {
  getTodayAttendance,
  checkOut
} from "../services/attendanceService";

import {
  formatDateTime
} from "../utils/formatDate";

function DashboardUser() {

  const [user, setUser] = useState(null);

  const [attendance, setAttendance] =
    useState(null);

  useEffect(() => {

    loadData();

  }, []);

const loadData = async () => {

  try {

    const profile =
      await getProfile();

    if (
      !profile.user.face_registered
    ) {

      window.location.href =
        "/register-face";

      return;
    }

    const today =
      await getTodayAttendance();

    setUser(
      profile.user
    );

    setAttendance(
      today
    );

  } catch (error) {

    console.log(error);
  }
};

  const handleCheckOut = async () => {

    try {

      const result =
        await checkOut();

      alert(result.message);

      loadData();

    } catch (error) {

      console.log(error);

      if (
        error.response &&
        error.response.data
      ) {

        alert(
          error.response.data.message
        );

      } else {

        alert(
          "Check Out gagal"
        );
      }
    }
  };

return (

  <div className="layout">

    <Sidebar />

    <div className="main-content">

      <div className="card">

        {user && (

          <>

            <h1>
              Selamat Datang 👋
            </h1>

            <h2>
              {user.nama || user.nip}
            </h2>

            <p
              style={{
                color: "#666"
              }}
            >
              Smart Attendance System
            </p>

          </>

        )}

      </div>

      {attendance && (

        <>

          <div className="stats-grid">

            <div className="status-card">

              <h4>
                Check In
              </h4>

              <h2>
                {
                  attendance.checked_in
                    ? "✅"
                    : "❌"
                }
              </h2>

            </div>

            <div className="status-card">

              <h4>
                Check Out
              </h4>

              <h2>
                {
                  attendance.checked_out
                    ? "✅"
                    : "❌"
                }
              </h2>

            </div>

            <div className="status-card">

              <h4>
                Face Match
              </h4>

              <h2>

                {
                  attendance.data
                  ? (
                      attendance.data
                        .similarity_score * 100
                    ).toFixed(2)
                  : "0"
                }

                %

              </h2>

            </div>

          </div>

          {attendance.data && (

            <div className="card">

              <h3>
                Detail Absensi Hari Ini
              </h3>

              <br />

              <p>
                Jam Masuk :
                {" "}
                {
                  formatDateTime(
                    attendance.data.jam_masuk
                  )
                }
              </p>

              <br />

              <p>
                Jam Pulang :
                {" "}
                {
                  formatDateTime(
                    attendance.data.jam_pulang
                  )
                }
              </p>

              <br />

              <p>

                Status :
                {" "}

                <span
                  className="status-success"
                >
                  {
                    attendance.data.status
                  }
                </span>

              </p>

            </div>

          )}

        </>

      )}

      {
        attendance &&
        attendance.checked_in &&
        !attendance.checked_out && (

          <button
            className="btn btn-danger"
            onClick={
              handleCheckOut
            }
            style={{
              marginTop: "20px"
            }}
          >
            Check Out
          </button>

        )
      }

    </div>

  </div>

);
}

export default DashboardUser;