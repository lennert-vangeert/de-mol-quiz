// i18n.tsx
import React, { useCallback } from "react";
import i18next from "i18next";
import {
  initReactI18next,
  I18nextProvider,
  useTranslation,
  Trans,
} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

// Import your translation files and assets
import en from "./_en.json";
import nl from "./_nl.json";

// Define supported locales and their types
export type Locale = "en" | "nl";

export type LocaleInfo = {
  id: Locale;
  label: string;
  translations: object;
};

export const locales: LocaleInfo[] = [
  { id: "en", label: "English", translations: en },
  { id: "nl", label: "Nederlands", translations: nl },
];

// Set the default locale
const defaultLocale: Locale = "nl";

// Type guard for locales
function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((l) => l.id === value);
}

// URL localization utilities
const extractLocale = (relURL: string) => {
  const pathComponents = relURL.split("/");
  if (isLocale(pathComponents[1])) {
    const locale = pathComponents[1] as Locale;
    pathComponents.splice(0, 2);
    return { locale, rest: `/${pathComponents.join("/")}` };
  } else {
    return { locale: null, rest: relURL };
  }
};

export const localizeURL = (locale: string, relURL: string) => {
  const { rest } = extractLocale(relURL);
  return `/${locale}${rest}`;
};

export const delocalizeURL = (relURL: string) => {
  const { rest } = extractLocale(relURL);
  return rest;
};

// Initialize i18next
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ["path"],
    },
    supportedLngs: locales.map((l) => l.id),
    resources: locales.reduce((acc, locale) => {
      acc[locale.id] = { translation: locale.translations };
      return acc;
    }, {} as Record<string, { translation: object }>),
    fallbackLng: defaultLocale,
    defaultNS: "translation",
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    debug: false,
  });

// I18nProvider component that wraps your app with i18next context
export const I18nProvider = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
);

// A handy translation component leveraging react-i18next's Trans component
export const T = ({
  translationKey,
  textSubstitutions,
  componentSubstitutions,
}: {
  translationKey: string;
  textSubstitutions?: Record<string, string>;
  componentSubstitutions?: Record<string, React.ReactElement>;
}) => (
  <Trans
    i18nKey={translationKey}
    values={textSubstitutions}
    components={componentSubstitutions}
  />
);

// The useTranslate hook exposes t and tL (among other goodies)
export const useTranslate = (): UseTranslateResult => {
  const { i18n, t } = useTranslation();
  const { language: locale } = i18n;
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale.");
  }
  const changeLocale = useCallback(
    (locale: string) => {
      (async () => {
        await i18n.changeLanguage(locale);
      })();
    },
    [i18n]
  );
  const tL = useCallback(
    (URL: string, localeId: string | undefined | null = undefined) => {
      if (localeId === undefined) {
        return localizeURL(locale, URL);
      } else if (localeId === null) {
        return delocalizeURL(URL);
      } else {
        return localizeURL(localeId, URL);
      }
    },
    [locale]
  );
  return {
    _i18n: i18next,
    t,
    T,
    tL,
    locale,
    changeLocale,
    locales,
  };
};

export type UseTranslateResult = {
  /** Lookup a translation by its key. */
  t: (key: string, substitutions?: Record<number, string>) => string;
  /** React component for translation using the Trans component. */
  T: React.FC<{
    translationKey: string;
    textSubstitutions?: Record<string, string>;
    componentSubstitutions?: Record<string, React.ReactElement>;
  }>;
  /**
   * Localize an internal URL:
   * - If localeId is undefined, it localizes for the current locale.
   * - If localeId is provided, it localizes for that locale.
   * - If localeId is null, it removes the locale from the URL.
   */
  tL: (URL: string, localeId?: string | null) => string;
  /** The current locale as a BCP 47 language tag. */
  locale: Locale;
  /** Function to change the current locale. */
  changeLocale: (language: Locale) => void;
  /** List of supported locales with their details. */
  locales: LocaleInfo[];
  /** The internal i18next instance. */
  _i18n: typeof i18next;
};

// This component ensures that the URL and the i18n instance are in sync.
export function PushLocaleToRoute() {
  const { maybeLang } = useParams();
  const { pathname, ...locationWithoutPathname } = useLocation();
  const { locale } = useTranslate();

  // If there's no locale in the URL or it's invalid, inject the current locale
  if (!maybeLang || !isLocale(maybeLang)) {
    return (
      <Navigate
        to={{
          ...locationWithoutPathname,
          pathname: `/${locale}${pathname}`,
        }}
        replace
      />
    );
  }

  // If the URL's locale doesn't match the current locale, update it
  if (maybeLang !== locale) {
    return (
      <Navigate
        to={{
          ...locationWithoutPathname,
          pathname: `/${locale}${pathname.replace(maybeLang + "/", "")}`,
        }}
        replace
      />
    );
  }

  // All good? Render nested routes.
  return <Outlet />;
}
