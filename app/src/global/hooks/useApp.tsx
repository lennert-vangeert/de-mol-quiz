import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type AppState = {
  appTitle: string;
  author: string;
  theme: string;
  setTheme: (theme: string) => void;
  apiOrigin: string;

  //SEO
  keyWords: string;
  image: string;

  //USER
  userRole: "ADMIN" | "REGULAR" | null;
  setUserRole: (role: "ADMIN" | "REGULAR" | null) => void;
};

export default create<AppState>()(
  subscribeWithSelector((set) => ({
    appTitle: "APP",
    author: "Lennert Van Geert",
    theme: "light",
    setTheme: (theme: string) =>
      set({
        theme,
      }),
    apiOrigin: import.meta.env.VITE_API_URL || "http://localhost:9300",

    //SEO
    keyWords: "app, react, zustand, mantine",
    image: "default-image-url.jpg",

    //USER
    userRole: null,
    setUserRole: (role: "ADMIN" | "REGULAR" | null) =>
      set({
        userRole: role,
      }),
  }))
);
