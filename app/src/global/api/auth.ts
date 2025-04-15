import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_ORIGIN as string,
});

export const TOKEN = window.localStorage.getItem("token");
export let USERID: string;

type RefreshTokenResponse = {
  token: string;
  role: string;
  userId: string;
};

export const refreshToken = async (): Promise<
  RefreshTokenResponse | { error: string }
> => {
  try {
    const response = await API.get<RefreshTokenResponse>("/refresh", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    window.localStorage.setItem("token", response.data.token);
    USERID = response.data.userId;
    return response.data;
  } catch (error) {
    window.localStorage.removeItem("token");
    window.location.href = "/login";
    return { error: "Error refreshing token" };
  }
};
