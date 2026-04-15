import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest, isAdminRole } from "@/lib/server/auth-session"
import { listCases } from "@/lib/server/cases"
import { filterRejectedCases, toRejectedCases } from "@/lib/rejection-tracking"

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const q = url.searchParams.get("q") || ""
    const rejectedBy = url.searchParams.get("rejectedBy") || ""
    const rejectedByRole = url.searchParams.get("rejectedByRole") || ""
    const reason = url.searchParams.get("reason") || ""
    const from = url.searchParams.get("from") || ""
    const to = url.searchParams.get("to") || ""

    const cases = await listCases()
    const rejected = toRejectedCases(cases)
    const filtered = filterRejectedCases(rejected, {
      q,
      rejectedBy,
      rejectedByRole,
      reason,
      from,
      to,
    })

    return NextResponse.json({
      ok: true,
      total: filtered.length,
      rows: filtered,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to load rejected cases." },
      { status: 500 }
    )
  }
}

