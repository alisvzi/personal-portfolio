import { type Locale, defaultLocale, isLocale } from "./config";

/**
 * The `states` slice of each dictionary, for framework-rendered boundaries.
 *
 * `loading.tsx`, `error.tsx` and `not-found.tsx` are rendered by Next.js
 * without route params, so they cannot receive a dictionary slice as a prop
 * the way ordinary components do. This module carries only the handful of
 * strings those screens need — importing the full dictionaries here would ship
 * every translation to the client for three short messages.
 */

export interface StateStrings {
  loading: string;
  loadingPortfolio: string;
  errorTitle: string;
  errorBody: string;
  errorRef: string;
  retry: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
}

const statesByLocale: Record<Locale, StateStrings> = {
  en: {
    loading: "Loading…",
    loadingPortfolio: "Loading portfolio…",
    errorTitle: "Something went wrong",
    errorBody:
      "This page could not be loaded. Please try again — if the problem continues, come back a little later.",
    errorRef: "Reference",
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you are looking for does not exist or has moved.",
    backHome: "Back to home",
  },
  fa: {
    loading: "در حال بارگذاری…",
    loadingPortfolio: "در حال بارگذاری نمونهکارها…",
    errorTitle: "مشکلی پیش آمد",
    errorBody:
      "بارگذاری این صفحه ممکن نشد. لطفاً دوباره تلاش کنید؛ اگر مشکل ادامه داشت، کمی بعد سر بزنید.",
    errorRef: "کد خطا",
    retry: "تلاش دوباره",
    notFoundTitle: "صفحه پیدا نشد",
    notFoundBody: "صفحهای که دنبالش هستید وجود ندارد یا جابهجا شده است.",
    backHome: "بازگشت به صفحه اصلی",
  },
};

/** Extracts the locale from a pathname, falling back to the default locale. */
export function localeFromPathname(pathname: string | null): Locale {
  const first = pathname?.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

export function stateStrings(locale: Locale): StateStrings {
  return statesByLocale[locale];
}
