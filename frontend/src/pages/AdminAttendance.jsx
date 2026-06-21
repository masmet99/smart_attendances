import { useEffect, useState } from "react";

import AdminSidebar from "../components/AdminSidebar";

import Swal from "sweetalert2";

import {
  getAttendance,
  exportAttendance
} from "../services/adminService";

import {
  formatDate,
  formatDateTime
} from "../utils/formatDate";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  showSuccess,
  showError
} from "../utils/alert";

function AdminAttendance() {

  const [attendances, setAttendances] =
    useState([]);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  useEffect(() => {

    loadAttendance();

  }, []);

  const handleResetFilter = () => {

  setStartDate("");
  setEndDate("");

  getAttendance()
    .then((result) => {

      setAttendances(
        result.data
      );

    })
    .catch((error) => {

      console.log(error);

    });

};

  const loadAttendance = async () => {

    try {

      const result =
        await getAttendance(
          startDate,
          endDate
        );

      setAttendances(
        result.data
      );

    } catch (error) {

      console.log(error);
    }
  };

  const handleExportExcel = async () => {

  try {

    const file =
      await exportAttendance();

    const url =
      window.URL.createObjectURL(
        new Blob([file])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "Laporan_Absensi.xlsx";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(
      url
    );

    showSuccess(
      "Export Excel berhasil"
    );

  } catch (error) {

    console.log(error);

    showError(
      "Export Excel gagal"
    );

  }

};


  const handleExportMenu = async () => {

  const result = await Swal.fire({

  title: "Export Data",

  text: "Pilih format export",

  icon: "question",

  showDenyButton: true,

  showCancelButton: true,

  confirmButtonText: "📊 Excel",

  denyButtonText: "📄 PDF",

  cancelButtonText: "Batal"

});

if (result.isConfirmed) {

  handleExportExcel();

}

else if (result.isDenied) {

  handleExportPDF();

}

};

const handleExportPDF = () => {

  const doc = new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "LAPORAN ABSENSI PEGAWAI",
    14,
    20
  );

  doc.setFontSize(10);

  doc.text(
    `Tanggal Cetak : ${
      new Date().toLocaleDateString("id-ID")
    }`,
    14,
    30
  );

  doc.text(
    `Total Data : ${
      attendances.length
    }`,
    14,
    36
  );

  doc.line(
    14,
    42,
    195,
    42
  );

autoTable(doc, {

  startY: 50,

  head: [[
    "NIP",
    "Nama",
    "Tanggal",
    "Check In",
    "Check Out",
    "Status"
  ]],

  body: attendances.map(
    (item) => [

      item.nip,

      item.nama,

      formatDate(
        item.tanggal
      ),

      formatDateTime(
        item.jam_masuk
      ),

      formatDateTime(
        item.jam_pulang
      ),

      item.status

    ]
  )

});

   const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let i = 1;
    i <= pageCount;
    i++
  ) {

    doc.setPage(i);

    doc.setFontSize(9);

    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      170,
      290
    );

  }

  doc.save(
    "Laporan_Absensi.pdf"
  );

};

return (

  <div className="layout">

    <AdminSidebar />

    <div className="main-content">

      <div className="card">

        <h1>
          Data Absensi Pegawai
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#666"
          }}
        >
          Monitoring seluruh data
          kehadiran pegawai.
        </p>

      </div>

<div className="card">

  <h3>
    Filter Data Absensi
  </h3>

  <p
    style={{
      color: "#64748b",
      marginTop: "5px",
      marginBottom: "20px"
    }}
  >
    Pilih rentang tanggal untuk menampilkan data absensi.
  </p>

  {/* QUICK FILTER */}

<div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px"
  }}
>

  <button
    className="btn"
    onClick={() => {

      const today =
        new Date();

      const date =
        today
          .toISOString()
          .split("T")[0];

      setStartDate(date);
      setEndDate(date);

    }}
  >
    Hari Ini
  </button>

  <button
    className="btn"
    onClick={() => {

      const today =
        new Date();

      const firstDay =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

      const formatDate = (date) => {

        const year =
          date.getFullYear();

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            date.getDate()
          ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };

      setStartDate(
        formatDate(firstDay)
      );

      setEndDate(
        formatDate(today)
      );

    }}
  >
    Bulan Ini
  </button>

  <button
    className="btn btn-danger"
    onClick={handleResetFilter}
  >
    🔄 Reset Filter
  </button>

</div>

  {/* DATE FILTER */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px"
    }}
  >

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          color: "#334155"
        }}
      >
        📅 Dari Tanggal
      </label>

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(
            e.target.value
          )
        }
      />

    </div>

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          color: "#334155"
        }}
      >
        📅 Sampai Tanggal
      </label>

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(
            e.target.value
          )
        }
      />

    </div>

  </div>

  {/* ACTION BUTTON */}

  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    }}
  >

    <button
      className="btn"
      onClick={loadAttendance}
    >
      🔍 Filter Data
    </button>

    <button
      className="btn btn-success"
      onClick={handleExportMenu}
    >
      📥 Export Data
    </button>

  </div>

</div>

      <div
        className="card"
        id="print-area"
      >

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
            Riwayat Absensi
          </h2>

          <strong>
            Total Data :
            {" "}
            {attendances.length}
          </strong>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>ID</th>
                <th>NIP</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Similarity</th>

              </tr>

            </thead>

            <tbody>

              {
                attendances.length > 0
                ? (

                  attendances.map((item) => (

                    <tr key={item.id}>

                      <td>{item.id}</td>

                      <td>{item.nip}</td>

                      <td>{item.nama}</td>

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
                              ? "status-success"
                              : "status-fail"
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

                    <td colSpan="8">

                      Tidak ada data absensi

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

export default AdminAttendance;