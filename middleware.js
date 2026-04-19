import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  const publicPaths = ["/login", "/api/login"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If the path is public but user is logged in, redirect to home (except for API)
  if (isPublicPath && token && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the path is private and user is not logged in, redirect to login
  if (!isPublicPath && !token && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
