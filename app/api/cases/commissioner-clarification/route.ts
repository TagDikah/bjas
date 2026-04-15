import { NextRequest, NextResponse } from "next/server"
import { markCommissionerClarification } from "@/lib/server/cases"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const caseId = String(body?.caseId || "").trim()
    const statement = String(body?.statement || "").trim()

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 400 })
    }
    if (!statement) {
      return NextResponse.json({ ok: false, error: "Clarification statement is required." }, { status: 400 })
    }

    const result = await markCommissionerClarification({
      caseId,
      user: sessionUser,
      statement,
    })

    return NextResponse.json({
      ok: true,
      caseId: result.caseId,
      status: result.status,
      case: result.caseData,
      anchor: result.anchor,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.shortMessage ||
          error?.message ||
          "Failed to request clarification.",
      },
      { status: 500 }
    )
  }
}

