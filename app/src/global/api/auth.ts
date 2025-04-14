import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_ORIGIN as string,
});

type RefreshTokenResponse = {
  token: string;
  role: string;
};

export const refreshToken = async (): Promise<
  RefreshTokenResponse | { error: string }
> => {
  try {
    const token = window.localStorage.getItem("token");
    const response = await API.get<RefreshTokenResponse>("/refresh", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    window.localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    window.location.href = "/login";
    return { error: "Error refreshing token" };
  }
};
