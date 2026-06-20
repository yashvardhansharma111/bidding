import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_PATHS = ["/admin"];
const AUTH_PATHS = ["/dashboard", "/api/user", "/api/payment"];

async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; email: string; role: string };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("bidkart_token")?.value;

  // Admin pages: require admin role
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !pathname.startsWith("/api")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const payload = await verifyJWT(token);
      if (payload.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protected user routes
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await verifyJWT(token);
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
