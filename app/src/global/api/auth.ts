import axios from "axios";
import useApp from "../hooks/useApp";

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
    useApp.getState().setUserRole(response.data.role as "ADMIN" | "REGULAR");
    return response.data;
  } catch {
    window.localStorage.removeItem("token");
    window.location.href = "/login";
    return { error: "Error refreshing token" };
  }
};
