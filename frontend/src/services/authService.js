import api from "../utils/api";

export const login = async (nip, password) => {

  const response = await api.post(
    "/auth/login",
    {
      nip,
      password
    }
  );

  return response.data;
};

export const getProfile = async () => {

  const response = await api.get(
    "/auth/profile"
  );

  return response.data;
};