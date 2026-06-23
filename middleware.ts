import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/staff") && pathname !== "/staff/login") {
    const hasSession = SESSION_COOKIE_NAMES.some((n) => req.cookies.get(n)?.value);
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/staff/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
