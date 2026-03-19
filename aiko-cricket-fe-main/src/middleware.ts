import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { pathname } = req.nextUrl;

  // Check for maintenance mode first (before auth checks)
  const isMaintenanceMode = process.env.SHOW_MAINTENANCE === "true";

  // Set CSP frame-ancestors header for embed routes (runtime env var)
  if (pathname.startsWith("/embed")) {
    const frameAncestors = process.env.ALLOWED_FRAME_ANCESTORS || "'none'";
    const response = NextResponse.next();
    response.headers.set(
      "Content-Security-Policy",
      `frame-ancestors ${frameAncestors}`
    );
    return response;
  }

  // Allow access to maintenance page, static files, and
  // the API endpoints embeds depend on during maintenance
  // (embed routes bypass via early return above)
  const isMaintenanceAllowed =
    pathname === "/maintenance" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/auth") || // Keep auth API accessible
    pathname.startsWith("/api/tips") ||
    pathname.startsWith("/api/match-summary") ||
    pathname.startsWith("/api/tts");

  if (isMaintenanceMode && !isMaintenanceAllowed) {
    return NextResponse.redirect(new URL("/maintenance", req.nextUrl.origin));
  }

  // Skip auth checks during maintenance mode (unless accessing maintenance page)
  if (isMaintenanceMode && isMaintenanceAllowed) {
    return NextResponse.next();
  }

  // Normal auth flow when not in maintenance mode
  const isAuthenticated = !!req.auth;

  const isPublic =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname.startsWith("/embed");
  if (isPublic) return NextResponse.next();

  if (!isAuthenticated) {
    // Redirect to Auth0 universal login
    const loginUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    loginUrl.searchParams.set("prompt", "login");
    return NextResponse.redirect(loginUrl);
  }

  // // Environment-based role checking
  // const environment = process.env.ENVIRONMENT;
  // const userRoles = req.auth?.user?.["http://localhost:3000/roles"] || [];

  // if (environment === "dev" && !userRoles.includes("aiko-core")) {
  //   // Redirect to demo site for access denied
  //   return NextResponse.redirect("https://demo.aiko.cricket");
  // }

  // if (
  //   environment === "test" &&
  //   !userRoles.includes("aiko-core") &&
  //   !userRoles.includes("aiko-testing")
  // ) {
  //   // Redirect to demo site for access denied 
  //   return NextResponse.redirect("https://demo.aiko.cricket");
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except static and auth endpoints
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
