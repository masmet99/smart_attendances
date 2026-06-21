import api from "../utils/api";

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAttendance = async (
  startDate = "",
  endDate = ""
) => {

  const params = {};

  if (startDate) {
    params.start_date = startDate;
  }

  if (endDate) {
    params.end_date = endDate;
  }

  const response = await api.get(
    "/admin/attendance",
    {
      params
    }
  );

  return response.data;
};

export const disableUser = async (userId) => {

  const response = await api.put(
    `/admin/users/${userId}/disable`
  );

  return response.data;
};

export const enableUser = async (userId) => {

  const response = await api.put(
    `/admin/users/${userId}/enable`
  );

  return response.data;
};

export const exportAttendance = async () => {

  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  try {

    const response = await api.get(
      "/admin/attendance/export",
      {
        responseType: "blob"
      }
    );

    return response.data;

  } catch (error) {

    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);

    throw error;
  }
};

export const getWeeklyAttendance =
async () => {

  const response =
    await api.get(
      "/admin/attendance-weekly"
    );

  return response.data;

};

export const getGeofence =
async () => {

  const response =
    await api.get(
      "/admin/geofence"
    );

  return response.data;
};

export const updateGeofence =
async (data) => {

  const response =
    await api.put(
      "/admin/geofence",
      data
    );

  return response.data;
};