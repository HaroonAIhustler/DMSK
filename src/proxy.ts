import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/SURVEY") {
    const url = request.nextUrl.clone();
    url.pathname = "/survey";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
