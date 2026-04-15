import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { finalizePoliceCaseSubmission } from "@/lib/server/cases"

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const caseId = String(body?.caseId || "").trim()
    const caseData = body?.caseData ?? {}

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 400 })
    }

    const result = await finalizePoliceCaseSubmission({
      caseId,
      caseData,
      user: sessionUser,
    })

    return NextResponse.json({ ok: true, case: result.caseData, anchor: result.anchor })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to finalize case submission." },
      { status: 500 }
    )
  }
}

