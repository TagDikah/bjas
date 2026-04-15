import { NextRequest, NextResponse } from "next/server"
import { createAndSubmitCase, listCases } from "@/lib/server/cases"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"

export async function GET(request: NextRequest) {
  // Presentation note: this endpoint returns the case list for authenticated users.
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  const cases = await listCases()
  return NextResponse.json({ ok: true, cases })
}

export async function POST(request: NextRequest) {
  // Presentation note: this endpoint receives a new case from the UI and hands it to the full submit-and-anchor workflow.
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await createAndSubmitCase({
      caseData: body?.caseData ?? {},
      user: sessionUser,
    })

    return NextResponse.json({
      ok: true,
      case: result.caseData,
      anchor: result.anchor,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.shortMessage || error?.message || "Failed to create and submit case.",
      },
      { status: 500 }
    )
  }
}
