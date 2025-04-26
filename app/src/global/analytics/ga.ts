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
export const logPageView = (path: string, customTitle?: string): void => {
  // 1) Respect the user's cookie preferences
  if (
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED") === -1 ||
    document.cookie.indexOf("ANALYTICAL_COOKIES_ENABLED=false") !== -1
  ) {
    return;
  }

  // 2) Strip leading "/<lang>" segment from path
  //    e.g. "/nl/scoreboard"  → ["", "nl", "scoreboard"]
  //          remove index 1      → rest = ["scoreboard"]
  const segments = path.split("/");
  const [, maybeLang, ...rest] = segments;

  // If the second segment is exactly two letters, drop it; otherwise keep everything
  const isLangCode = /^[a-z]{2}$/i.test(maybeLang || "");
  const pagePath = isLangCode ? "/" + rest.join("/") : path;

  // 3) Compute title: either your customTitle, or the first segment after the language
  const computedTitle =
    customTitle ||
    (isLangCode && rest.length > 0
      ? rest[0]
      : // fallback: last segment of the original path (minus any leading slash)
        path.replace(/^.*\//, "") || "page");

  console.log("Logging page view:", pagePath, computedTitle);

  ReactGA.send({
    hitType: "pageview",
    page: pagePath,
    title: computedTitle,
  });
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
