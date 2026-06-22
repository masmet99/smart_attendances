import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import api from "../utils/api";
import Swal from "sweetalert2";

function UserManagement() {

const [search, setSearch] =
  useState("");

  const [users, setUsers] =
    useState([]);

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

const openEdit = (user) => {

  setEditingUser(user);

  setEditForm({

    nama: user.nama || "",

    jabatan:
      user.jabatan || "",

    unit_kerja:
      user.unit_kerja || "",

    role:
      user.role || "user"

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

  return (

    <div className="dashboard-container">

      <AdminSidebar />

      <div className="dashboard-content">

        <h1>
          Kelola Akun
        </h1>

        <div
            style={{
                display: "flex",
                gap: "20px",
                marginBottom: "20px"
            }}
            >

            <div>

                <h2>
                {users.length}
                </h2>

                <p>
                Total User
                </p>

            </div>

            <div>

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

            <div>

                <h2>
                {
                    users.filter(
                    user =>
                        user.role ===
                        "admin"
                    ).length
                }
                </h2>

                <p>
                Admin
                </p>

            </div>

            </div>

        <form
          onSubmit={
            handleSubmit
          }
          style={{
            marginBottom:
              "30px"
          }}
        >

          <input
            type="text"
            name="nip"
            placeholder="NIP"
            value={form.nip}
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="nama"
            placeholder="Nama"
            value={form.nama}
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="jabatan"
            placeholder="Jabatan"
            value={form.jabatan}
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="unit_kerja"
            placeholder="Unit Kerja"
            value={
              form.unit_kerja
            }
            onChange={
              handleChange
            }
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              form.password
            }
            onChange={
              handleChange
            }
          />

            <select
            name="role"
            value={form.role}
            onChange={handleChange}
            >
            <option value="user">
                User
            </option>

            <option value="admin">
                Admin
            </option>
            </select>

          <button
            type="submit"
          >
            Tambah User
          </button>

        </form>

        <input
        type="text"
        placeholder="Cari nama user..."
        value={search}
        onChange={(e) =>
            setSearch(e.target.value)
        }
        style={{
            marginBottom: "20px",
            width: "300px"
        }}
        />

        {
        editingUser && (

        <div
        style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd"
        }}
        >

        <h3>
            Edit User
        </h3>

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
            value={
            editForm.unit_kerja
            }
            onChange={(e) =>
            setEditForm({
                ...editForm,
                unit_kerja:
                e.target.value
            })
            }
            placeholder="Unit Kerja"
        />

        <select
            value={editForm.role}
            onChange={(e) =>
            setEditForm({
                ...editForm,
                role: e.target.value
            })
            }
        >

            <option value="user">
            User
            </option>

            <option value="admin">
            Admin
            </option>

        </select>

        <button
        type="button"
            onClick={saveEdit}
        >
            Simpan
        </button>

        <button
        type="button"
            onClick={() =>
            setEditingUser(null)
            }
        >
            Batal
        </button>

        </div>

        )}

        <table
          border="1"
          width="100%"
        >

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
            .filter((user) =>

            (user.nama || "")
                .toLowerCase()
                .includes(
                search.toLowerCase()
                )

            )
            .map(
              (user) => (

              <tr
                key={user.id}
              >

                <td>
                  {user.nip}
                </td>

                <td>
                  {user.nama}
                </td>

                <td>
                  {user.jabatan}
                </td>

                <td>
                  {user.unit_kerja}
                </td>

                <td>
                  {user.role}
                </td>

                <td>
                  {user.is_active
                    ? "Aktif"
                    : "Nonaktif"}
                </td>

                <td>

                {user.is_active ? (

                    <button
                    type="button"
                    onClick={() =>
                        disableUser(
                        user.id
                        )
                    }
                    >
                    Disable
                    </button>

                ) : (

                    <button
                    type="button"
                    onClick={() =>
                        enableUser(
                        user.id
                        )
                    }
                    >
                    Enable
                    </button>

                )}

                <button
                type="button"
                onClick={() =>
                    openEdit(user)
                }
                >
                Edit
                </button>

                <button
                type="button"
                    onClick={() =>
                    deleteUser(
                        user.id
                    )
                    }
                >
                    Hapus
                </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


    </div>

  );

}

export default UserManagement;