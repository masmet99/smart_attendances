import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import api from "../utils/api";
import Swal from "sweetalert2";

function UserManagement() {

const [search, setSearch] =
  useState("");

const [users, setUsers] =
  useState([]);

const [excelFile, setExcelFile] =
  useState(null);

const [showForm, setShowForm] =
  useState(false);

const [roleDropdownOpen, setRoleDropdownOpen] =
  useState(false);

const [
  editRoleOpen,
  setEditRoleOpen
] = useState(false);

const [
  showAddModal,
  setShowAddModal
] = useState(false);

const [form, setForm] =
  useState({
    nip: "",
    nama: "",
    jabatan: "",
    unit_kerja: "",
    password: "",
    role: "user"
  });

  const [editingUser, setEditingUser] =
  useState(null);

  const [editForm, setEditForm] =
  useState({

    id: null,

    nip: "",

    nama: "",

    jabatan: "",

    unit_kerja: "",

    role: "user"

  });

  useEffect(() => {

    loadUsers();

  }, []);

  const loadUsers = async () => {

    try {

      const res =
        await api.get(
          "/admin/users"
        );

      setUsers(
        res.data.data
      );

    } catch (err) {

      console.log(err);

    }

  };

  const handleChange = (e) => {

    setForm({

      form,

      [e.target.name]:
        e.target.value

    });

  };

  const handleSubmit =
    async (e) => {

    e.preventDefault();

    try {

        console.log(form);

      await api.post(
        "/admin/users",
        form
      );

      setForm({
        nip: "",
        nama: "",
        jabatan: "",
        unit_kerja: "",
        password: "",
        role: "user"
      });

      loadUsers();

    Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "User berhasil ditambahkan"
    });

    } catch (err) {

      console.log(err);

    Swal.fire({
    icon: "error",
    title: "Gagal",
    text: "Gagal menambah user"
    });

    }

  };

const disableUser =
  async (id) => {

  const result =
    await Swal.fire({

      title:
        "Nonaktifkan User?",

      icon:
        "question",

      showCancelButton:
        true

    });

  if (!result.isConfirmed)
    return;

  await api.put(
    `/admin/users/${id}/disable`
  );

  loadUsers();

};

const enableUser =
  async (id) => {

  const result =
    await Swal.fire({

      title:
        "Aktifkan User?",

      icon:
        "question",

      showCancelButton:
        true

    });

  if (!result.isConfirmed)
    return;

  await api.put(
    `/admin/users/${id}/enable`
  );

  loadUsers();

};

const deleteUser =
  async (id) => {

  const result =
    await Swal.fire({

      title:
        "Hapus User?",

      text:
        "Data yang dihapus tidak dapat dikembalikan",

      icon:
        "warning",

      showCancelButton:
        true,

      confirmButtonText:
        "Ya, Hapus",

      cancelButtonText:
        "Batal"

    });

  if (!result.isConfirmed)
    return;

  try {

    await api.delete(
      `/admin/users/${id}`
    );

    loadUsers();

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "User berhasil dihapus"
    });

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Gagal menghapus user"
    });

  }

};

const resetPassword =
  async (id) => {

  const result =
    await Swal.fire({

      title:
        "Reset Password",

      input:
        "password",

      inputLabel:
        "Password Baru",

      inputPlaceholder:
        "Masukkan password baru",

      showCancelButton:
        true

    });

  if (!result.value)
    return;

  try {

    await api.put(

      `/admin/users/${id}/reset-password`,

      {
        password:
          result.value
      }

    );

    Swal.fire({

      icon:
        "success",

      title:
        "Berhasil",

      text:
        "Password berhasil direset"

    });

  } catch (err) {

    Swal.fire({

      icon:
        "error",

      title:
        "Gagal",

      text:
        "Reset password gagal"

    });

  }

};

const exportUsers = async () => {

  try {

    const response =
      await api.get(
        "/admin/users/export",
        {
          responseType:
            "blob"
        }
      );

    const url =
      window.URL.createObjectURL(
        new Blob([
          response.data
        ])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "data_user.xlsx"
    );

    document.body.appendChild(
      link
    );

    link.click();

  } catch (err) {

    console.log(err);

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text:
        "Export gagal"
    });

  }

};

const openEdit = (user) => {

  setEditingUser(user);

  setEditForm({

    id: user.id,

    nip: user.nip,

    nama: user.nama,

    jabatan:
      user.jabatan || "",

    unit_kerja:
      user.unit_kerja || "",

    role: user.role

  });

};

const saveEdit =
  async () => {

  try {

    await api.put(

      `/admin/users/${editingUser.id}`,

      editForm

    );

    setEditingUser(null);

    loadUsers();

    Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "User berhasil diperbarui"
    });

  } catch (err) {

    console.log(err);

    alert(
      "Gagal update user"
    );

  }

};

const importUsers =
  async () => {

  if (!excelFile)
    return;

  const formData =
    new FormData();

  formData.append(
    "file",
    excelFile
  );

  try {

    const res =
      await api.post(

        "/admin/users/import",

        formData,

        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }

      );

    loadUsers();

    Swal.fire({

      icon: "success",

      title: "Berhasil",

      text:
        `${res.data.inserted} user berhasil ditambahkan`

    });

  } catch (err) {

    Swal.fire({

      icon: "error",

      title: "Gagal",

      text:
        "Import gagal"

    });

  }

};

const downloadTemplate =
  async () => {

  try {

    const response =
      await api.get(
        "/admin/users/template",
        {
          responseType: "blob"
        }
      );

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "template_user.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (err) {

    console.log(err);

  }

};

return (

  <div className="dashboard-container">

    <AdminSidebar />

    <div className="dashboard-content">

      {/* HEADER */}

      <div className="page-header-card">

        <h1>
          👥 Kelola Akun Pegawai
        </h1>

        <p>
          Monitoring dan manajemen akun pengguna sistem.
        </p>

      </div>

      {/* STATISTIK */}

      <div className="user-stats-grid">

        <div className="stat-card">

          <h2>
            {users.length}
          </h2>

          <p>
            Total User
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {
              users.filter(
                user =>
                  user.is_active
              ).length
            }
          </h2>

          <p>
            User Aktif
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {
              users.filter(
                user =>
                  user.role === "admin"
              ).length
            }
          </h2>

          <p>
            Admin
          </p>

        </div>

      </div>

{/* FORM */}

<div className="attendance-filter-card">

  <div className="quick-action-header">

    <div>

    <h3>
      👥 Manajemen Data Pegawai
    </h3>

    <p>
      Kelola akun dan data pegawai dalam sistem.
    </p>

    </div>

    <button
      className="open-add-btn"
      onClick={() =>
        setShowAddModal(true)
      }
    >
      ➕ Tambah Akun
    </button>

  </div>

  <div className="bulk-data-card">

  <h4>
    📂 Data Massal
  </h4>

  <p>
    Pilih berkas untuk menambahkan banyak data pegawai sekaligus.
  </p>

</div>

  <div className="account-tools">

  <div className="file-upload-box">

    <label className="file-picker">

      📁 Pilih Berkas

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) =>
          setExcelFile(
            e.target.files[0]
          )
        }
      />

    </label>

    <p className="selected-file">

      {
        excelFile
          ? `📄 ${excelFile.name}`
          : "Belum ada berkas dipilih"
      }

    </p>

</div>

    <button
      type="button"
      onClick={importUsers}
      className="tool-btn import-btn"
    >
      📤 Impor Data
    </button>

    <button
      type="button"
      onClick={exportUsers}
      className="tool-btn export-btn"
    >
      📥 Unduh Data
    </button>

    <button
      type="button"
      onClick={downloadTemplate}
      className="tool-btn template-btn"
    >
      📄 Format Data
    </button>

  </div>

</div>

{showAddModal && (

  <div
    className="modal-overlay"
    onClick={() =>
      setShowAddModal(false)
    }
  >

    <div
      className="edit-user-modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <button
        className="modal-close"
        onClick={() =>
          setShowAddModal(false)
        }
      >
        ✕
      </button>

      <div className="section-title">

        <div className="section-icon">
          ➕
        </div>

        <div>

          <h2>
            Tambah Akun Baru
          </h2>

          <p>
            Tambah akun pengguna sistem.
          </p>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="edit-user-form"
      >

        <input
          type="text"
          name="nip"
          placeholder="NIP"
          value={form.nip}
          onChange={handleChange}
        />

        <input
          type="text"
          name="nama"
          placeholder="Nama"
          value={form.nama}
          onChange={handleChange}
        />

        <input
          type="text"
          name="jabatan"
          placeholder="Jabatan"
          value={form.jabatan}
          onChange={handleChange}
        />

        <input
          type="text"
          name="unit_kerja"
          placeholder="Unit Kerja"
          value={form.unit_kerja}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="custom-select">

          <div
            className="custom-select-trigger"
            onClick={() =>
              setRoleDropdownOpen(
                !roleDropdownOpen
              )
            }
          >

            <span>

              {
                form.role === "admin"
                  ? "🛠️ Administrator"
                  : "👤 User"
              }

            </span>

            <span>

              {
                roleDropdownOpen
                  ? "▲"
                  : "▼"
              }

            </span>

          </div>

          {

            roleDropdownOpen && (

              <div className="custom-select-menu">

                <div
                  className="custom-option"
                  onClick={() => {

                    setForm({
                      ...form,
                      role: "user"
                    });

                    setRoleDropdownOpen(false);

                  }}
                >
                  👤 User
                </div>

                <div
                  className="custom-option"
                  onClick={() => {

                    setForm({
                      ...form,
                      role: "admin"
                    });

                    setRoleDropdownOpen(false);

                  }}
                >
                  🛠️ Administrator
                </div>

              </div>

            )

          }

        </div>

        <button
          type="submit"
          className="modal-save-btn"
        >
          ➕ Tambah User
        </button>

      </form>

    </div>

  </div>

)}


{/* EDIT USER */}

{editingUser && (

  <div
    className="modal-overlay"
    onClick={() =>
      setEditingUser(null)
    }
  >

    <div
      className="edit-user-modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <button
        className="modal-close"
        onClick={() =>
          setEditingUser(null)
        }
      >
        ✕
      </button>

      <div className="section-title">

        <div className="section-icon">
          ✏️
        </div>

        <div>

          <h2>
            Edit User
          </h2>

          <p>
            Perbarui informasi akun pengguna.
          </p>

        </div>

      </div>

      <div className="edit-user-form">

        <input
          type="text"
          value={editForm.nip}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              nip: e.target.value
            })
          }
          placeholder="NIP"
        />

        <input
          type="text"
          value={editForm.nama}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              nama: e.target.value
            })
          }
          placeholder="Nama"
        />

        <input
          type="text"
          value={editForm.jabatan}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              jabatan: e.target.value
            })
          }
          placeholder="Jabatan"
        />

        <input
          type="text"
          value={editForm.unit_kerja}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              unit_kerja:
                e.target.value
            })
          }
          placeholder="Unit Kerja"
        />

        <div className="custom-select">

          <div
            className="custom-select-trigger"
            onClick={() =>
              setEditRoleOpen(
                !editRoleOpen
              )
            }
          >

            <span>

              {
                editForm.role ===
                "admin"
                  ? "🛠️ Administrator"
                  : "👤 User"
              }

            </span>

            <span>

              {
                editRoleOpen
                  ? "▲"
                  : "▼"
              }

            </span>

          </div>

          {

            editRoleOpen && (

              <div
                className="custom-select-menu"
              >

                <div
                  className="custom-option"
                  onClick={() => {

                    setEditForm({
                      ...editForm,
                      role: "user"
                    });

                    setEditRoleOpen(
                      false
                    );

                  }}
                >
                  👤 User
                </div>

                <div
                  className="custom-option"
                  onClick={() => {

                    setEditForm({
                      ...editForm,
                      role: "admin"
                    });

                    setEditRoleOpen(
                      false
                    );

                  }}
                >
                  🛠️ Administrator
                </div>

              </div>

            )

          }

        </div>

      </div>

      <div
        className="edit-user-actions"
      >

        <button
          type="button"
          onClick={saveEdit}
          className="modal-save-btn"
        >
          💾 Simpan Perubahan
        </button>

        <button
          type="button"
          onClick={() =>
            setEditingUser(null)
          }
          className="modal-cancel-btn"
        >
          Tutup
        </button>

      </div>

    </div>

  </div>

)}

      {/* TABEL USER */}

      <div className="attendance-table-card">

        <div className="table-header">

          <h3>
            Daftar Akun
          </h3>

          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <table>

          <thead>

            <tr>

              <th>NIP</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>

            </tr>

          </thead>

          <tbody>

            {users
              .filter(
                (user) =>
                  (user.nama || "")
                    .toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
              )
              .map((user) => (

                <tr key={user.id}>

                  <td>{user.nip}</td>

                  <td>{user.nama}</td>

                  <td>{user.jabatan}</td>

                  <td>{user.unit_kerja}</td>

                  <td>

                  <span
                    className={
                      user.role === "admin"
                        ? "role-admin"
                        : "role-user"
                    }
                  >

                    {
                      user.role === "admin"
                        ? "🛠️ Admin"
                        : "👤 User"
                    }

                  </span>

                </td>

                <td>

                  <span
                    className={
                      user.is_active
                        ? "status-active"
                        : "status-inactive"
                    }
                  >

                    {
                      user.is_active
                        ? "🟢 Aktif"
                        : "🔴 Nonaktif"
                    }

                  </span>

                </td>

                <td>

                  <div className="action-group">

                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() =>
                      openEdit(user)
                    }
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    className="action-btn reset-btn"
                    onClick={() =>
                      resetPassword(
                        user.id
                      )
                    }
                  >
                    🔑
                  </button>

                  <button
                    type="button"
                    className={
                      user.is_active
                        ? "action-btn disable-btn"
                        : "action-btn enable-btn"
                    }
                    onClick={() =>
                      user.is_active
                        ? disableUser(user.id)
                        : enableUser(user.id)
                    }
                  >
                      {
                        user.is_active
                          ? "⛔"
                          : "✅"
                      }
                    </button>

                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() =>
                        deleteUser(
                          user.id
                        )
                      }
                    >
                      🗑️
                    </button>

                  </div>

                </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>

);

}

export default UserManagement;