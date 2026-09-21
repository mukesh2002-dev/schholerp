import { NextResponse, type NextRequest } from "next/server";

/** Keep in sync with SESSION_COOKIE in src/lib/auth/tokens.ts. */
const SESSION_COOKIE = "erp_logged_in";

/**
 * First-pass route gate: any protected page requires the session cookie that
 * is set on successful login. Full token validation still happens client-side
 * against the backend (/auth/me) — this only avoids flashing protected pages
 * to anonymous visitors and keeps authenticated users off the login pages.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");
  const authed = request.cookies.get(SESSION_COOKIE)?.value === "1";

  if (!authed && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (authed && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and API routes; everything else passes through the gate.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)"],
};
