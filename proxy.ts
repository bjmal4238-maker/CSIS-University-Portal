import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internal chunks, and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/settings") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  ) {
    return NextResponse.next();
  }

  // Read JWT cookie
  const token = request.cookies.get("csis_auth_token")?.value;
  let userPayload: { userId: string; email: string; role: string; status: string } | null = null;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
        userPayload = JSON.parse(payloadStr);
      }
    } catch {
      userPayload = null;
    }
  }

  const isAdmin = userPayload?.role === "ADMIN";
  const isAuthenticated = !!userPayload && userPayload.status === "ACTIVE";

  // Check Maintenance Mode (Server-side Enforcement)
  const isMaintenance = request.cookies.get("csis_maintenance_mode")?.value === "1";

  if (isMaintenance) {
    // Admin always has full access during maintenance
    if (!isAdmin) {
      // Allow access only to /maintenance, /login (to allow Admin login), and public auth endpoints
      const allowedPaths = ["/maintenance", "/login"];
      const isAllowed = allowedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

      if (!isAllowed) {
        const url = new URL("/maintenance", request.url);
        return NextResponse.redirect(url);
      }
    }
  } else {
    // If not in maintenance mode, redirect away from /maintenance to home
    if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check route protections
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || !isAdmin) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (
    pathname.startsWith("/dashboard/faculty") ||
    pathname.startsWith("/attendance/session") ||
    pathname.startsWith("/attendance/report")
  ) {
    if (!isAuthenticated || !["DOCTOR", "TA", "ADMIN"].includes(userPayload?.role || "")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard/student") || pathname.startsWith("/attendance/scan")) {
    if (!isAuthenticated || !["STUDENT", "ADMIN"].includes(userPayload?.role || "")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

