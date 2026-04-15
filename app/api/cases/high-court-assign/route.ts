import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { toCanonicalRole } from "@/lib/roles"
import { assignHighCourtCase } from "@/lib/server/cases"

const allowedRoles = new Set([
  "high_court_registry",
  "high_court_registry_assistant",
  "court_admin",
  "admin",
  "registry",
])

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  const role = toCanonicalRole(sessionUser?.role)

  if (!sessionUser || !allowedRoles.has(role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const caseId = String(body?.caseId || "").trim()
    const judgeId = String(body?.judgeId || "").trim()
    const judgeName = String(body?.judgeName || "").trim()
    const clerkId = String(body?.clerkId || "").trim()
    const clerkName = String(body?.clerkName || "").trim()

    if (!caseId || !judgeId || !judgeName) {
      return NextResponse.json({ ok: false, error: "caseId, judgeId, and judgeName are required." }, { status: 400 })
    }

    const result = await assignHighCourtCase({
      caseId,
      user: sessionUser,
      judge: { id: judgeId, name: judgeName },
      clerk: clerkId ? { id: clerkId, name: clerkName || "Assigned clerk" } : null,
    })

    return NextResponse.json({ ok: true, result })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.shortMessage || error?.message || "Failed to assign High Court case." },
      { status: 500 }
    )
  }
}
