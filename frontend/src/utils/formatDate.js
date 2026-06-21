// src/utils/formatDate.js

export const formatDate = (dateString) => {

  if (!dateString) return "-";

  return new Date(dateString)
    .toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );
};

export const formatDateTime = (dateString) => {

  if (!dateString) return "-";

  return new Date(dateString)
    .toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
};