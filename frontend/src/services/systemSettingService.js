import api from "../utils/api";

export const getSystemSettings =
async () => {

    const response =
        await api.get(
            "/admin/system-settings"
        );

    return response.data;
};

export const updateSystemSettings =
async (data) => {

    const response =
        await api.put(
            "/admin/system-settings",
            data
        );

    return response.data;
};