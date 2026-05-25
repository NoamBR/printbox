import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/panel/:path*", "/api/panel/:path*"],
};

export function middleware(req: NextRequest) {
  const user = process.env.PANEL_USER;
  const pass = process.env.PANEL_PASS;
  if (!user || !pass) {
    return new NextResponse(
      "PANEL_USER / PANEL_PASS לא מוגדרים ב-.env.local",
      { status: 500 }
    );
  }
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (
      idx !== -1 &&
      decoded.slice(0, idx) === user &&
      decoded.slice(idx + 1) === pass
    ) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PrintBox Panel"' },
  });
}
