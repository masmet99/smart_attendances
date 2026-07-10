import { useEffect, useState, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar";
import api from "../utils/api";
import Swal from "sweetalert2";

function RoleSelect({ value, open, onToggle, onSelect }) {
  return (
    <div className="custom-select">
      <div
        className="custom-select-trigger"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value === "admin" ? "🛠️ Administrator" : "👤 User"}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="custom-select-menu" role="listbox">
          <div
            className="custom-option"
            role="option"
            aria-selected={value === "user"}
            onClick={() => onSelect("user")}
          >
            👤 User
          </div>
          <div
            className="custom-option"
            role="option"
            aria-selected={value === "admin"}
            onClick={() => onSelect("admin")}
          >
            🛠️ Administrator
          </div>
        </div>
      )}
    </div>
  );
}

function UserManagement() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [excelFile, setExcelFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [form, setForm] = useState({
    nip: "",
    nama: "",
    jabatan: "",
    unit_kerja: "",
    password: "",
    role: "user",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    id: null,
    nip: "",
    nama: "",
    jabatan: "",
    unit_kerja: "",
    role: "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: err.response?.data?.detail || "Tidak dapat memuat daftar user.",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Apakah form "Tambah Akun" punya isi yang belum disimpan?
  const addFormHasContent = () =>
    Object.entries(form).some(
      ([key, val]) => key !== "role" && val.trim() !== ""
    );

  const closeAddModal = async ({ force = false } = {}) => {
    if (!force && addFormHasContent()) {
      const result = await Swal.fire({
        title: "Batalkan Perubahan?",
        text: "Data yang sudah diisi belum disimpan dan akan hilang.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Tutup",
        cancelButtonText: "Lanjutkan Isi",
      });

      if (!result.isConfirmed) return;
    }

    setShowAddPassword(false);
    setShowAddModal(false);
    setRoleDropdownOpen(false);
    setForm({
      nip: "",
      nama: "",
      jabatan: "",
      unit_kerja: "",
      password: "",
      role: "user",
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditRoleOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nip.trim()) {
      Swal.fire({
        icon: "warning",
        title: "NIP Kosong",
        text: "Silakan masukkan NIP.",
      });
      return;
    }

    if (!form.nama.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama Kosong",
        text: "Silakan masukkan nama.",
      });
      return;
    }

    if (!form.password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Password Kosong",
        text: "Silakan masukkan password.",
      });
      return;
    }

    if (form.password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Terlalu Pendek",
        text: "Password minimal 6 karakter.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/admin/users", form);

      await loadUsers();

      setShowAddPassword(false);
      setShowAddModal(false);
      setForm({
        nip: "",
        nama: "",
        jabatan: "",
        unit_kerja: "",
        password: "",
        role: "user",
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User berhasil ditambahkan",
      });
    } catch (err) {
      console.log(err);

      const message = err.response?.data?.detail || "Gagal menambah user";

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableUser = async (id) => {
    const result = await Swal.fire({
      title: "Nonaktifkan User?",
      icon: "question",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/users/${id}/disable`);
      loadUsers();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Gagal menonaktifkan user.",
      });
    }
  };

  const enableUser = async (id) => {
    const result = await Swal.fire({
      title: "Aktifkan User?",
      icon: "question",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/users/${id}/enable`);
      loadUsers();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Gagal mengaktifkan user.",
      });
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin/users/${id}`);

      loadUsers();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User berhasil dihapus",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Gagal menghapus user",
      });
    }
  };

  const resetPassword = async (id) => {
    const result = await Swal.fire({
      title: "Reset Password",
      html: `
          <div style="text-align:left">
            <label
              for="reset-password-input"
              style="display:block;margin-bottom:8px;font-weight:600;color:#334155"
            >
              Password Baru
            </label>

            <div style="display:flex;gap:8px">
              <input
                id="reset-password-input"
                type="password"
                placeholder="Masukkan password baru"
                autocomplete="new-password"
                name="reset_new_password"
                style="flex:1;padding:12px;border:1px solid #dcdcdc;border-radius:8px"
              />

              <button
                id="toggle-reset-password"
                type="button"
                style="padding:0 12px;border:1px solid #dcdcdc;border-radius:8px;background:#fff;cursor:pointer;font-weight:600"
              >
                Lihat
              </button>
            </div>
          </div>
        `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Batal",
      didOpen: () => {
        const popup = Swal.getPopup();
        if (!popup) return;

        const input = popup.querySelector("#reset-password-input");
        const toggleButton = popup.querySelector("#toggle-reset-password");

        if (!input || !toggleButton) return;

        input.focus();

        toggleButton.addEventListener("click", () => {
          const visible = input.type === "text";
          input.type = visible ? "password" : "text";
          toggleButton.textContent = visible ? "Lihat" : "Sembunyikan";
        });
      },
      preConfirm: () => {
        const password = document
          .getElementById("reset-password-input")
          ?.value.trim();

        if (!password) {
          Swal.showValidationMessage("Password baru wajib diisi");
          return false;
        }

        if (password.length < 6) {
          Swal.showValidationMessage("Password minimal 6 karakter");
          return false;
        }

        return password;
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/users/${id}/reset-password`, {
        password: result.value,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil direset",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Reset password gagal",
      });
    }
  };

  const exportUsers = async () => {
    setIsExporting(true);

    try {
      const response = await api.get("/admin/users/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_user.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Export gagal",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      id: user.id,
      nip: user.nip,
      nama: user.nama,
      jabatan: user.jabatan || "",
      unit_kerja: user.unit_kerja || "",
      role: user.role,
    });
  };

  const saveEdit = async () => {
    const payload = {
      nip: editForm.nip.trim(),
      nama: editForm.nama.trim(),
      jabatan: editForm.jabatan.trim(),
      unit_kerja: editForm.unit_kerja.trim(),
      role: editForm.role,
    };

    if (!payload.nip) {
      Swal.fire({
        icon: "warning",
        title: "NIP Kosong",
        text: "Silakan masukkan NIP.",
      });
      return;
    }

    if (!payload.nama) {
      Swal.fire({
        icon: "warning",
        title: "Nama Kosong",
        text: "Silakan masukkan nama.",
      });
      return;
    }

    setIsSavingEdit(true);

    try {
      await api.put(`/admin/users/${editingUser.id}`, payload);

      setEditingUser(null);
      await loadUsers();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User berhasil diperbarui",
      });
    } catch (err) {
      console.log(err);

      const message =
        err.response?.data?.detail || "Gagal memperbarui user.";

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const importUsers = async () => {
    if (!excelFile) return;

    const formData = new FormData();
    formData.append("file", excelFile);

    setIsImporting(true);

    try {
      const res = await api.post("/admin/users/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      loadUsers();
      setExcelFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `${res.data.inserted} user berhasil ditambahkan`,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Import gagal",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = async () => {
    setIsDownloadingTemplate(true);

    try {
      const response = await api.get("/admin/users/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_user.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Gagal mengunduh template",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      user.nama?.toLowerCase().includes(keyword) ||
      user.nip?.toLowerCase().includes(keyword) ||
      user.jabatan?.toLowerCase().includes(keyword) ||
      user.unit_kerja?.toLowerCase().includes(keyword) ||
      user.role?.toLowerCase().includes(keyword);

    const matchRole = roleFilter === "all" || user.role === roleFilter;

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );

  // Jaga currentPage tetap valid kalau filter mengurangi jumlah halaman
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Bikin daftar nomor halaman yang dipotong (max 5 nomor + ellipsis)
  const getPageNumbers = () => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, currentPage]);

    if (currentPage - 1 > 1) pages.add(currentPage - 1);
    if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

    const sorted = [...pages].sort((a, b) => a - b);

    const withEllipsis = [];
    let prev = null;

    for (const page of sorted) {
      if (prev !== null && page - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(page);
      prev = page;
    }

    return withEllipsis;
  };

  const deleteFace = async (userId) => {
    const result = await Swal.fire({
      title: "Hapus Face ID?",
      text: "User harus registrasi wajah ulang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/admin/users/${userId}/face`);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Face ID berhasil dihapus",
      });

      loadUsers();
      setEditingUser(null);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.detail || "Tidak dapat menghapus Face ID",
      });
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="dashboard-content">
        {/* HEADER */}
        <div className="page-header-card">
          <h1>👥 Kelola Akun Pegawai Cikong</h1>
          <p>Monitoring dan manajemen akun pengguna sistem.</p>

          <div className="header-stats">
            <span>👥 {users.length} User</span>
            <span>
              🟢 {users.filter((user) => user.is_active).length} Aktif
            </span>
            <span>
              🛠️ {users.filter((user) => user.role === "admin").length} Admin
            </span>
          </div>
        </div>

        {/* FORM */}
        <div className="attendance-filter-card">
          <div className="quick-action-header">
            <div>
              <h3>👥 Manajemen Data Pegawai</h3>
              <p>Kelola akun dan data pegawai dalam sistem.</p>
            </div>

            <button
              className="open-add-btn"
              onClick={() => {
                setShowAddPassword(false);
                setShowAddModal(true);
              }}
            >
              ➕ Tambah Akun
            </button>
          </div>

          <div className="bulk-data-card">
            <h4>📂 Data Massal</h4>
            <p>Pilih berkas untuk menambahkan banyak data pegawai sekaligus.</p>
          </div>

          <div className="account-tools">
            <div className="file-upload-box">
              <label className="file-picker">
                📁 Pilih Berkas
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  aria-label="Pilih berkas Excel untuk impor data pegawai"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                />
              </label>

              <p className="selected-file">
                {excelFile
                  ? `📄 ${excelFile.name}`
                  : "Belum ada berkas dipilih (.xlsx)"}
              </p>
            </div>

            <button
              type="button"
              onClick={importUsers}
              className="tool-btn import-btn"
              disabled={!excelFile || isImporting}
            >
              {isImporting ? "⏳ Mengimpor..." : "📤 Impor Data"}
            </button>

            <button
              type="button"
              onClick={exportUsers}
              className="tool-btn export-btn"
              disabled={isExporting}
            >
              {isExporting ? "⏳ Mengunduh..." : "📥 Unduh Data"}
            </button>

            <button
              type="button"
              onClick={downloadTemplate}
              className="tool-btn template-btn"
              disabled={isDownloadingTemplate}
            >
              {isDownloadingTemplate ? "⏳ Menyiapkan..." : "📄 Format Data"}
            </button>
          </div>
        </div>

        {showAddModal && (
          <div className="modal-overlay" onClick={() => closeAddModal()}>
            <div
              className="edit-user-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                aria-label="Tutup form tambah akun"
                onClick={() => closeAddModal()}
              >
                ✕
              </button>

              <div className="section-title">
                <div className="section-icon">➕</div>

                <div>
                  <h2>Tambah Akun Baru</h2>
                  <p>Tambah akun pengguna sistem.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="edit-user-form">
                <div>
                  <label htmlFor="add-nip" className="sr-only">
                    NIP
                  </label>
                  <input
                    id="add-nip"
                    type="text"
                    name="nip"
                    placeholder="NIP"
                    value={form.nip}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="add-nama" className="sr-only">
                    Nama
                  </label>
                  <input
                    id="add-nama"
                    type="text"
                    name="nama"
                    placeholder="Nama"
                    value={form.nama}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="add-jabatan" className="sr-only">
                    Jabatan
                  </label>
                  <input
                    id="add-jabatan"
                    type="text"
                    name="jabatan"
                    placeholder="Jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="add-unit-kerja" className="sr-only">
                    Unit Kerja
                  </label>
                  <input
                    id="add-unit-kerja"
                    type="text"
                    name="unit_kerja"
                    placeholder="Unit Kerja"
                    value={form.unit_kerja}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <label htmlFor="add-password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="add-password"
                    type={showAddPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    autoComplete="new-password"
                    onChange={handleChange}
                    style={{ flex: 1 }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    aria-label={
                      showAddPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    style={{
                      padding: "0 12px",
                      border: "1px solid #dbe2ea",
                      borderRadius: "12px",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {showAddPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>

                <RoleSelect
                  value={form.role}
                  open={roleDropdownOpen}
                  onToggle={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  onSelect={(role) => {
                    setForm({ ...form, role });
                    setRoleDropdownOpen(false);
                  }}
                />

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "⏳ Menyimpan..." : "➕ Tambah User"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* EDIT USER */}
        {editingUser && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div
              className="edit-user-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                aria-label="Tutup form edit user"
                onClick={closeEditModal}
              >
                ✕
              </button>

              <div className="section-title">
                <div className="section-icon">✏️</div>

                <div>
                  <h2>Edit User</h2>
                  <p>Perbarui informasi akun pengguna.</p>
                </div>
              </div>

              <div className="face-status-box">
                <h4>Face ID</h4>

                <span
                  className={
                    editingUser.face_registered
                      ? "face-registered"
                      : "face-not-registered"
                  }
                >
                  {editingUser.face_registered
                    ? "✅ Terdaftar"
                    : "❌ Belum Terdaftar"}
                </span>
              </div>

              {editingUser.face_registered && (
                <button
                  type="button"
                  className="remove-face-btn"
                  onClick={() => deleteFace(editingUser.id)}
                >
                  🗑️ Hapus Face ID
                </button>
              )}

              <div className="edit-user-form">
                <label htmlFor="edit-nip" className="sr-only">
                  NIP
                </label>
                <input
                  id="edit-nip"
                  type="text"
                  value={editForm.nip}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nip: e.target.value })
                  }
                  placeholder="NIP"
                />

                <label htmlFor="edit-nama" className="sr-only">
                  Nama
                </label>
                <input
                  id="edit-nama"
                  type="text"
                  value={editForm.nama}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nama: e.target.value })
                  }
                  placeholder="Nama"
                />

                <label htmlFor="edit-jabatan" className="sr-only">
                  Jabatan
                </label>
                <input
                  id="edit-jabatan"
                  type="text"
                  value={editForm.jabatan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, jabatan: e.target.value })
                  }
                  placeholder="Jabatan"
                />

                <label htmlFor="edit-unit-kerja" className="sr-only">
                  Unit Kerja
                </label>
                <input
                  id="edit-unit-kerja"
                  type="text"
                  value={editForm.unit_kerja}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      unit_kerja: e.target.value,
                    })
                  }
                  placeholder="Unit Kerja"
                />

                <RoleSelect
                  value={editForm.role}
                  open={editRoleOpen}
                  onToggle={() => setEditRoleOpen(!editRoleOpen)}
                  onSelect={(role) => {
                    setEditForm({ ...editForm, role });
                    setEditRoleOpen(false);
                  }}
                />
              </div>

              <div className="edit-user-actions">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="modal-save-btn"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
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
            <div className="table-tools">
              <label htmlFor="user-search" className="sr-only">
                Cari user
              </label>
              <input
                type="search"
                id="user-search"
                name="user_search"
                autoComplete="off"
                placeholder="Cari user..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <label htmlFor="role-filter" className="sr-only">
                Filter role
              </label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              <label htmlFor="status-filter" className="sr-only">
                Filter status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>NIP</th>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Role</th>
                <th>Face ID</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={8} className="table-empty-state">
                    ⏳ Memuat data user...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-state">
                    {users.length === 0
                      ? "😕 Belum ada data user."
                      : "🔍 Tidak ada user yang cocok dengan pencarian/filter."}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nip}</td>
                    <td>{user.nama}</td>
                    <td>{user.jabatan}</td>
                    <td>{user.unit_kerja}</td>

                    <td>
                      <span
                        className={
                          user.role === "admin" ? "role-admin" : "role-user"
                        }
                      >
                        {user.role === "admin" ? "🛠️ Admin" : "👤 User"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.face_registered
                            ? "face-registered"
                            : "face-not-registered"
                        }
                      >
                        {user.face_registered ? "✅ Terdaftar" : "❌ Belum"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active ? "status-active" : "status-inactive"
                        }
                      >
                        {user.is_active ? "🟢 Aktif" : "🔴 Nonaktif"}
                      </span>
                    </td>

                    <td>
                      <div className="action-group">
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          title="Edit user"
                          aria-label={`Edit user ${user.nama}`}
                          onClick={() => openEdit(user)}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="action-btn reset-btn"
                          title="Reset password"
                          aria-label={`Reset password ${user.nama}`}
                          onClick={() => resetPassword(user.id)}
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
                          title={user.is_active ? "Nonaktifkan user" : "Aktifkan user"}
                          aria-label={
                            user.is_active
                              ? `Nonaktifkan user ${user.nama}`
                              : `Aktifkan user ${user.nama}`
                          }
                          onClick={() =>
                            user.is_active
                              ? disableUser(user.id)
                              : enableUser(user.id)
                          }
                        >
                          {user.is_active ? "⛔" : "✅"}
                        </button>

                        <button
                          type="button"
                          className="action-btn delete-btn"
                          title="Hapus user"
                          aria-label={`Hapus user ${user.nama}`}
                          onClick={() => deleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination-container">
            <div className="pagination-info">
              Menampilkan{" "}
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              -{Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
              dari {filteredUsers.length} data
            </div>

            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ←
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    className={currentPage === page ? "active-page" : ""}
                    aria-label={`Halaman ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;