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

  const token = req.cookies.get("cashbid_token")?.value;

  // Admin pages: only verify token is valid — role check is done by admin API routes (requireAdmin)
  // and client-side layout. Checking role in JWT here causes issues when role is updated in DB
  // but the old JWT cookie hasn't been refreshed yet (user didn't re-login after role change).
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !pathname.startsWith("/api")) {
    console.log(`[proxy] Admin route hit: ${pathname}`);
    console.log(`[proxy] Token present: ${!!token}`);

    if (!token) {
      console.log(`[proxy] No token → redirecting to /login`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      const payload = await verifyJWT(token);
      console.log(`[proxy] JWT valid — userId: ${payload.userId} | email: ${payload.email} | JWT role: "${payload.role}" (actual role checked by layout via /api/auth/me)`);
      // Note: role check happens client-side (admin layout) and in each admin API route (requireAdmin)
    } catch (err) {
      console.error(`[proxy] JWT verify failed:`, err);
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
