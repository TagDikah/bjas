import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function isBridgeOnlyEnabled() {
  return String(process.env.FABRIC_BRIDGE_ONLY || "")
    .trim()
    .toLowerCase() === "true"
}

export function proxy(request: NextRequest) {
  if (!isBridgeOnlyEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const allowed =
    pathname.startsWith("/api/fabric-bridge/") ||
    pathname === "/api/fabric-bridge" ||
    pathname === "/api/health/blockchain"

  if (allowed) {
    return NextResponse.next()
  }

  return new NextResponse("Not Found", { status: 404 })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
