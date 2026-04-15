import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { checkpointPoliceCaseStep } from "@/lib/server/cases"

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const stepIndex = Number(body?.stepIndex ?? -1)
    const stepKey = String(body?.stepKey || "").trim()
    const caseId = String(body?.caseId || "").trim() || undefined
    const caseData = body?.caseData ?? {}

    if (!stepKey || stepIndex < 0) {
      return NextResponse.json({ ok: false, error: "stepIndex and stepKey are required." }, { status: 400 })
    }

    const result = await checkpointPoliceCaseStep({
      caseId,
      stepIndex,
      stepKey,
      caseData,
      user: sessionUser,
    })

    return NextResponse.json({ ok: true, result })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to checkpoint case step." },
      { status: 500 }
    )
  }
}

