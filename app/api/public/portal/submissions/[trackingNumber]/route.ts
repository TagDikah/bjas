import { NextRequest, NextResponse } from "next/server"

import {
  getPublicSubmissionByTrackingNumber,
  updatePortalSubmissionModeration,
  type PublicSubmissionStatus,
} from "@/lib/server/public-portal"

const allowedStatuses = new Set<PublicSubmissionStatus>([
  "submitted",
  "under_review",
  "published",
  "resolved",
  "rejected",
])

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await context.params
    const submission = await getPublicSubmissionByTrackingNumber(trackingNumber)
    if (!submission) {
      return NextResponse.json({ ok: false, error: "Tracking number not found." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, submission })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to load tracking entry." }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await context.params
    const body = await request.json().catch(() => ({}))
    const moderationStatus = String(body?.moderationStatus || "").trim() as PublicSubmissionStatus
    if (!allowedStatuses.has(moderationStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid moderation status." }, { status: 400 })
    }

    const updated = await updatePortalSubmissionModeration({
      trackingNumber,
      moderationStatus,
      moderationNotes: String(body?.moderationNotes || "").trim(),
      publishedPublicly: Boolean(body?.publishedPublicly),
    })

    return NextResponse.json({ ok: true, submission: updated })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to update moderation." }, { status: 500 })
  }
}
