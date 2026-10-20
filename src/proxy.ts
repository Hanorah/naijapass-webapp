import { NextResponse, type NextRequest } from "next/server";

/**
 * Pass-through. Auth is handled by the Express API (JWT in localStorage), so
 * route gating is done by the client-side shells rather than at the edge.
 */
export function proxy(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Everything except static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
