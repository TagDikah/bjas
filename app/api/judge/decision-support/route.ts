import { NextRequest, NextResponse } from "next/server"
import { buildJudicialDecisionSupport } from "@/lib/legal/judicial-decision-support"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { getCaseById } from "@/lib/server/cases"

const ALLOWED_ROLES = new Set(["judge", "high_court_judge", "small_court_judge", "appeal_judge"])

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)

  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  if (!ALLOWED_ROLES.has(String(sessionUser.role || ""))) {
    return NextResponse.json({ ok: false, error: "This endpoint is available only to judicial roles." }, { status: 403 })
  }

  try {
    const body = await request.json()
    const caseId = String(body?.caseId || "").trim()

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "Case ID is required." }, { status: 400 })
    }

    const caseData = await getCaseById(caseId)
    if (!caseData) {
      return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 })
    }

    const assignedJudgeId = String(caseData?.court?.assignedJudgeId || caseData?.courtRegistry?.assignedJudgeId || "").trim()
    const isAssignedJudge = assignedJudgeId ? assignedJudgeId === sessionUser.id : true
    if (!isAssignedJudge) {
      return NextResponse.json({ ok: false, error: "This case is not assigned to the current judge." }, { status: 403 })
    }

    const support = await buildJudicialDecisionSupport({
      caseData,
      defenseSummary: body?.defenseSummary,
      prosecutionSummary: body?.prosecutionSummary,
      requestedRelief: body?.requestedRelief,
      judgeQuestion: body?.judgeQuestion,
    })

    return NextResponse.json({ ok: true, support })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to build judicial decision support.",
      },
      { status: 500 }
    )
  }
}
