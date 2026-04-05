import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public paths
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/s/") ||
    pathname.startsWith("/offline") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/icons") ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  if (!req.auth) {
    // Let API routes handle their own auth via requireAuth()
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Prevent CDN from caching authenticated pages
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
