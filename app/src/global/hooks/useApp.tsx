import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type AppState = {
  appTitle: string;
  author: string;
  apiOrigin: string;

  //SEO
  keyWords: string;
  image: string;

  //USER
  userRole: "ADMIN" | "REGULAR" | null;
  setUserRole: (role: "ADMIN" | "REGULAR" | null) => void;

  //QUIZ STATE
  isQuizClosed: boolean;
  setIsQuizClosed: (value: boolean) => void;
};

export default create<AppState>()(
  subscribeWithSelector((set) => ({
    appTitle: "De mol quiz",
    author: "Lennert Van Geert",
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

    //QUIZ STATE
    isQuizClosed: false,
    setIsQuizClosed: (value: boolean) => set({ isQuizClosed: value }),
  }))
);
