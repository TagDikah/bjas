import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest, isAdminRole } from "@/lib/server/auth-session"
import { listCases } from "@/lib/server/cases"
import { computeRejectionAnalytics, toRejectedCases } from "@/lib/rejection-tracking"

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const cases = await listCases()
    const rejected = toRejectedCases(cases)
    const analytics = computeRejectionAnalytics(rejected)

    return NextResponse.json({
      ok: true,
      ...analytics,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to load rejection analytics." },
      { status: 500 }
    )
  }
}

