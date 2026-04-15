import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { toCanonicalRole } from "@/lib/roles"
import { markHighCourtRegistryIntake } from "@/lib/server/cases"

const allowedRoles = new Set([
  "high_court_registry",
  "court_registry",
  "admin",
  "court_admin",
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
    const courtCaseNumber = String(body?.courtCaseNumber || "").trim()
    const notes = String(body?.notes || "").trim()
    const intakeFormData =
      body?.intakeFormData && typeof body.intakeFormData === "object" ? body.intakeFormData : undefined

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 400 })
    }

    const result = await markHighCourtRegistryIntake({
      caseId,
      user: sessionUser,
      courtCaseNumber,
      notes,
      intakeFormData,
    })

    return NextResponse.json({ ok: true, result })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.shortMessage || error?.message || "Failed to process High Court intake.",
      },
      { status: 500 }
    )
  }
}
