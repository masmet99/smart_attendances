import api from "../utils/api";

export const registerFace = async (
  file,
  pose
) => {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "pose",
    pose
  );

  const response = await api.post(
    "/face/register",
    formData
  );

  return response.data;
};