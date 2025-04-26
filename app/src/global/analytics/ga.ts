import ReactGA from "react-ga4";

// initialize GA once
export const initGA = () => {
  try {
    ReactGA.initialize([
      {
        trackingId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? "",
        gaOptions: undefined, // Add options here if needed
        gtagOptions: undefined, // Add tag options here if needed
      },
    ]);
  } catch (error) {
    console.error("Error initializing Google Analytics:", error);
  }
};

// log a pageview
export const logPageView = (path: string, title: string = "page") => {
  if (
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED") === -1 ||
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED=false") !== -1
  )
    return;
  console.log("Logging page view:", path, title);
  ReactGA.send({ hitType: "pageview", page: path, title });
};

// log a custom event
export const logEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED") === -1 ||
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED=false") !== -1
  )
    return;
  ReactGA.event({ category, action, label, value });
};
