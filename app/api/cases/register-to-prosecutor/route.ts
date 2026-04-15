import { NextRequest, NextResponse } from "next/server"
import { getSessionUserFromRequest } from "@/lib/server/auth-session"
import { registerAndSendCaseToProsecutor } from "@/lib/server/cases"

export async function POST(request: NextRequest) {
  const sessionUser = getSessionUserFromRequest(request)
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const caseId = String(body?.caseId || "").trim()
    const prosecutorId = String(body?.prosecutorId || "").trim() || undefined
    const prosecutorName = String(body?.prosecutorName || "").trim() || undefined

    if (!caseId) {
      return NextResponse.json(
        { ok: false, error: "caseId is required." },
        { status: 400 }
      )
    }

    const result = await registerAndSendCaseToProsecutor({
      caseId,
      prosecutorId,
      prosecutorName,
      user: sessionUser,
    })

    return NextResponse.json({ ok: true, case: result.caseData, anchor: result.anchor })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to register and send case to prosecutor." },
      { status: 500 }
    )
  }
}
