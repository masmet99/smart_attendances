import api from "../utils/api"; //menggunakan objek api untuk melakukan komunikasi HTTP dengan backend.

export const getTodayAttendance = async () => {

  const response = await api.get(
    "/attendance/today"
  );

  return response.data;
};

export const checkIn = async (
  file,
  latitude,
  longitude
) => {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "latitude",
    latitude
  );

  formData.append(
    "longitude",
    longitude
  );

  const response = await api.post(
    "/attendance/checkin",
    formData
  );

  return response.data;
};

export const checkOut = async (

    latitude,

    longitude

) => {

    const formData = new FormData();

    formData.append(
        "latitude",
        latitude
    );

    formData.append(
        "longitude",
        longitude
    );

    const response = await api.post(

        "/attendance/checkout",

        formData

    );

    return response.data;
};;

export const getHistory = async () => {

  const response = await api.get(
    "/attendance/history"
  );

  return response.data;
};

export const getGeofence =
  async () => {

    const response =
      await api.get(
        "/attendance/geofence"
      );

    return response.data;
  };

  export const validateCheckoutLocation = async (
  latitude,
  longitude
) => {

  const formData = new FormData();

  formData.append(
    "latitude",
    latitude
  );

  formData.append(
    "longitude",
    longitude
  );

  const response = await api.post(
    "/attendance/checkout/location",
    formData
  );

  return response.data;

};