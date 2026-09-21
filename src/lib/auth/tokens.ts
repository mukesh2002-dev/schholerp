"use client";

/**
 * Token persistence for the browser.
 *
 * The backend issues an opaque refresh token (rotated on every use) and a
 * short-lived JWT access token as JSON — it does not manage cookies, so the
 * SPA keeps them in localStorage and mirrors a lightweight `erp_logged_in`
 * cookie that middleware reads for a fast first-pass route gate.
 */

const ACCESS_KEY = "school_erp_access_token_v1";
const REFRESH_KEY = "school_erp_refresh_token_v1";
export const SESSION_COOKIE = "erp_logged_in";

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    setSessionCookie();
  } catch {
    // storage unavailable — session-only login still works
    setSessionCookie();
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
  clearSessionCookie();
}

function setSessionCookie(): void {
  try {
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
  } catch {
    // ignore (SSR / privacy mode)
  }
}

function clearSessionCookie(): void {
  try {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Remove every cookie this app owns (auth gate, theme, etc.) without touching
 * cookies that other apps on the same origin may rely on.
 */
export function clearAppCookies(): void {
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const name = (cookie.split("=")[0] ?? "").trim();
      if (!name) continue;
      const isAppCookie =
        name === SESSION_COOKIE ||
        name.startsWith("school_erp_") ||
        name.startsWith("erp_") ||
        name.startsWith("theme") ||
        name.startsWith("next");
      if (!isAppCookie) continue;
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
  } catch {
    // ignore (SSR / privacy mode)
  }
}

/**
 * Nuke every piece of persisted app state on signout: tokens, session,
 * mock-DB data, settings, caches, sessionStorage and app cookies.
 */
export function clearAllAppData(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore (SSR / privacy mode)
  }
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
  clearAppCookies();
}
