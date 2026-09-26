import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("session")?.value;
  const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET !== "change-me"
    ? process.env.AUTH_SECRET : "dev-only-secret-not-for-production";
  try {
    if (!token) throw new Error();
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = { matcher: ["/account/:path*"] };
