import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  getHistory
} from "../services/attendanceService";

import {
  formatDate,
  formatDateTime
} from "../utils/formatDate";

import {
  getProfile
} from "../services/authService";

function AttendanceHistory() {

  const [histories, setHistories] =
    useState([]);

  useEffect(() => {

    checkFaceRegistration();

  }, []);

  const checkFaceRegistration =
    async () => {

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

        loadHistory();

      } catch (error) {

        console.log(error);
      }
    };

  const loadHistory = async () => {
    

    try {

      const result =
        await getHistory();

      setHistories(
        result.data
      );

    } catch (error) {

      console.log(error);
    }
  };

  const hadirCount =
    histories.filter(
      (item) =>
        item.status === "HADIR"
    ).length;

  const avgSimilarity =
    histories.length > 0
      ? (
          histories.reduce(
            (acc, item) =>
              acc +
              (
                item.similarity_score || 0
              ),
            0
          ) /
          histories.length
        ) * 100
      : 0;

  return (

    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="card">

          <h1>
            Riwayat Absensi Saya
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "10px"
            }}
          >
            Monitoring seluruh riwayat
            kehadiran pegawai
          </p>

        </div>

        <div className="admin-stats">

          <div className="admin-card bg-green">

            <h4>
              ✅ Hadir
            </h4>

            <h2>
              {hadirCount}
            </h2>

          </div>

          <div className="admin-card bg-blue">

            <h4>
              📋 Total Data
            </h4>

            <h2>
              {histories.length}
            </h2>

          </div>

          <div className="admin-card bg-orange">

            <h4>
              📸 Avg Similarity
            </h4>

            <h2>
              {avgSimilarity.toFixed(1)}%
            </h2>

          </div>

        </div>

        <div className="card">

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}
          >

            <h2>
              Detail Kehadiran
            </h2>

            <strong>
              {histories.length}
              {" "}
              Data
            </strong>

          </div>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Tanggal</th>

                  <th>Check In</th>

                  <th>Check Out</th>

                  <th>Status</th>

                  <th>Similarity</th>

                </tr>

              </thead>

              <tbody>

                {
                  histories.length > 0
                  ? (

                    histories.map((item) => (

                      <tr key={item.id}>

                        <td>
                          {item.id}
                        </td>

                        <td>
                          {
                            formatDate(
                              item.tanggal
                            )
                          }
                        </td>

                        <td>
                          {
                            formatDateTime(
                              item.jam_masuk
                            )
                          }
                        </td>

                        <td>
                          {
                            formatDateTime(
                              item.jam_pulang
                            )
                          }
                        </td>

                        <td>

                          <span
                            className={
                              item.status === "HADIR"
                                ? "history-badge-success"
                                : "history-badge-warning"
                            }
                          >
                            {item.status}
                          </span>

                        </td>

                        <td>

                          {
                            item.similarity_score
                              ? (
                                  item.similarity_score * 100
                                ).toFixed(2) + "%"
                              : "-"
                          }

                        </td>

                      </tr>

                    ))

                  )
                  : (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          padding: "30px"
                        }}
                      >

                        Belum ada data absensi

                      </td>

                    </tr>

                  )
                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );
}

export default AttendanceHistory;