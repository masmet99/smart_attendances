import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

import {
  getDashboard,
  getUsers,
  disableUser,
  enableUser
} from "../services/adminService";

import Swal from "sweetalert2";

import {
  showSuccess,
  showError
} from "../utils/alert";

import AttendanceChart
from "../components/AttendanceChart";

import {
  getWeeklyAttendance
} from "../services/adminService";

function DashboardAdmin() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  useEffect(() => {loadData();}, []);

  const [chartData, setChartData] =
  useState([]);

  const loadData = async () => {

    try {

      const dashboard =
        await getDashboard();

      const userData =
        await getUsers();

      setStats(dashboard.data);

      setUsers(userData.data);

    } catch (error) {

      console.log(error);
    }

    const weekly =
      await getWeeklyAttendance();

    setChartData(
      weekly.data
    );
  };

  const handleDisable = async (id) => {

  const resultConfirm =
    await Swal.fire({

      title: "Nonaktifkan User?",

      text:
        "User tidak akan bisa melakukan absensi.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Ya, Disable",

      cancelButtonText: "Batal",

      confirmButtonColor: "#dc2626"
    });

  if (!resultConfirm.isConfirmed)
    return;

  try {

    const result =
      await disableUser(id);

    showSuccess(
      result.message
    );

    loadData();

  } catch (error) {

    console.log(error);

    showError(
      "Gagal menonaktifkan user"
    );
  }
};

  const handleEnable = async (id) => {

  try {

    const result =
      await enableUser(id);

    showSuccess(
      result.message
    );

    loadData();

  } catch (error) {

    console.log(error);

    showError(
      "Gagal mengaktifkan user"
    );
  }
};

  const filteredUsers =
    users.filter((user) =>
      user.nama
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      user.nip
        .toString()
        .includes(search)
    );

const attendanceData = [

  {
    day: "Sen",
    total: 24
  },

  {
    day: "Sel",
    total: 29
  },

  {
    day: "Rab",
    total: 21
  },

  {
    day: "Kam",
    total: 35
  },

  {
    day: "Jum",
    total: 31
  }

];

  return (

    <div className="layout">

      <AdminSidebar />

      <div className="main-content">

        <div className="mobile-dashboard-header">

          <div>

            <h1>
              Dashboarda
            </h1>

          </div>

        </div>

{stats && (

  <>

    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginTop: "20px",
        marginBottom: "10px"
      }}
    >

    <div className="section-title">

      <div className="section-icon">
        📈
      </div>

      <div>

        <h2>
          Ringkasan Hari Ini
        </h2>

        <p>
          Statistik sistem secara realtime
        </p>

      </div>

    </div>

    </div>

    <div className="admin-stats">

      <div className="admin-card bg-blue">

        <h4>
          👥 Total User
        </h4>

        <h2>
          {stats.total_users}
        </h2>

      </div>

      <div className="admin-card bg-green">

        <h4>
          📸 Face Registered
        </h4>

        <h2>
          {stats.registered_faces}
        </h2>

      </div>

      <div className="admin-card bg-orange">

        <h4>
          ✅ Hadir Hari Ini
        </h4>

        <h2>
          {stats.hadir_hari_ini}
        </h2>

      </div>

      <div className="admin-card bg-red">

        <h4>
          ⏳ Belum Absen
        </h4>

        <h2>
          {stats.belum_absen_hari_ini}
        </h2>

      </div>

    </div>

    <p
      className="swipe-indicator"
    >
      👉 Geser ke samping untuk melihat statistik lainnya
    </p>

  </>

)}

<div className="card">

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    }}
  >

    <div>

      <h2>
        📈 Statistik Kehadiran
      </h2>

      <p
        style={{
          color: "#64748b"
        }}
      >
        Tren kehadiran pegawai
      </p>

    </div>

    <div
      style={{
        textAlign: "right"
      }}
    >

      <h2
        style={{
          color: "#16a34a",
          margin: 0
        }}
      >
        87%
      </h2>

      <small
        style={{
          color: "#64748b"
        }}
      >
        Tingkat Kehadiran
      </small>

    </div>

  </div>

      <AttendanceChart
        data={chartData}
      />
</div>
        <div
          style={{
            marginTop: "20px"
          }}
        >

        <div
          className="quick-menu-card"
          onClick={() =>
            navigate("/admin/attendance")
          }
        >

          <div>

            <h3>
              📊 Data Absensi
            </h3>

            <p>
              Lihat seluruh data absensi pegawai
            </p>

          </div>

          <span>
            →
          </span>

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
              Daftar Pegawai
            </h2>

            <strong>
              Total {users.length} Pegawai
            </strong>

          </div>

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <input
              type="text"
              placeholder="🔍 Cari Nama atau NIP..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>ID</th>
                  <th>NIP</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Role</th>
                  <th>Face</th>
                  <th>Status</th>
                  <th>Aksi</th>

                </tr>

              </thead>

              <tbody>

                {users.length > 0 ? (

                  filteredUsers.map((user) => (

                    <tr key={user.id}>

                      <td>{user.id}</td>

                      <td>{user.nip}</td>

                      <td>{user.nama}</td>

                      <td>{user.jabatan}</td>

                      <td>

                      <span
                        className={
                          user.role === "admin"
                            ? "role-admin"
                            : "role-user"
                        }
                      >
                        {user.role.toUpperCase()}
                      </span>

                     </td>

                      <td>
                        {
                          user.face_registered
                            ? "✅"
                            : "❌"
                        }
                      </td>

                      <td>

                        <span
                          className={
                            user.is_active
                              ? "status-success"
                              : "status-fail"
                          }
                        >
                          {
                            user.is_active
                              ? "Aktif"
                              : "Nonaktif"
                          }
                        </span>

                      </td>

                      <td>

                        {
                          user.is_active
                          ? (

                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleDisable(
                                  user.id
                                )
                              }
                            >
                              Disable
                            </button>

                          )
                          : (

                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleEnable(
                                  user.id
                                )
                              }
                            >
                              Enable
                            </button>

                          )
                        }

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan="8">

                      Tidak ada data pegawai

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );
}

export default DashboardAdmin;