import { NextRequest, NextResponse } from "next/server"

import {
  createPublicSubmission,
  listPortalSubmissions,
  type PublicSubmissionKind,
} from "@/lib/server/public-portal"

const allowedKinds = new Set<PublicSubmissionKind>([
  "public_comment",
  "service_complaint",
  "discrepancy_report",
  "service_suggestion",
  "help_request",
])

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const kind = String(url.searchParams.get("kind") || "").trim()
    const moderationStatus = String(url.searchParams.get("status") || "").trim()
    const publishedOnly = url.searchParams.get("publishedOnly") === "1"
    const submissions = await listPortalSubmissions({
      kind: kind || undefined,
      moderationStatus: moderationStatus || undefined,
      publishedOnly,
    })
    return NextResponse.json({ ok: true, submissions })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to load submissions." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const kind = String(body?.kind || "").trim() as PublicSubmissionKind
    const message = String(body?.message || "").trim()

    if (!allowedKinds.has(kind)) {
      return NextResponse.json({ ok: false, error: "Invalid submission kind." }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 })
    }

    const created = await createPublicSubmission({
      kind,
      title: String(body?.title || "").trim(),
      message,
      personName: String(body?.personName || "").trim(),
      email: String(body?.email || "").trim(),
      caseReference: String(body?.caseReference || "").trim(),
      relatedCaseId: String(body?.relatedCaseId || "").trim(),
      language: String(body?.language || "en").trim(),
      metadata: typeof body?.metadata === "object" && body?.metadata ? body.metadata : {},
    })

    return NextResponse.json({ ok: true, submission: created })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to save submission." }, { status: 500 })
  }
}
