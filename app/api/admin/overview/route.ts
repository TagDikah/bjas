import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest, isAdminRole } from "@/lib/server/auth-session"
import { getUserOverview } from "@/lib/server/users"

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  const overview = await getUserOverview()
  return NextResponse.json({ ok: true, ...overview })
}
