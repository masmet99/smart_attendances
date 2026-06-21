import Swal from "sweetalert2";

export const showSuccess = (message) => {

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor: "#2563eb"
  });

};

export const showError = (message) => {

  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#dc2626"
  });

};

export const showWarning = (message) => {

  Swal.fire({
    icon: "warning",
    title: "Perhatian",
    text: message,
    confirmButtonColor: "#f59e0b"
  });

};