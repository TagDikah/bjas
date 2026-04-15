import { NextRequest, NextResponse } from "next/server"
import { addPublicSubmission, getCaseById } from "@/lib/server/cases"

const allowedTypes = new Set([
  "comment",
  "appeal",
  "additional_info",
  "review_request",
  "correction_request",
])

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params
    const existingCase = await getCaseById(caseId)
    if (!existingCase) {
      return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const type = String(body?.type || "comment").trim().toLowerCase()
    const message = String(body?.message || "").trim()
    const submitterName = String(body?.submitterName || "").trim()

    if (!allowedTypes.has(type)) {
      return NextResponse.json({ ok: false, error: "Invalid submission type." }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "Submission message is required." }, { status: 400 })
    }

    await addPublicSubmission({
      caseId,
      type,
      message,
      submitterName,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to save public submission.",
      },
      { status: 500 }
    )
  }
}
