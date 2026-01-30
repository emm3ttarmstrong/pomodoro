import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow access to auth API route
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("pomo-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    // If this is an API request, return 401
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For page requests, redirect to login (but we'll handle this client-side)
    // by checking the cookie in the layout
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
