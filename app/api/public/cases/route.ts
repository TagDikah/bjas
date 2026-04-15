import { NextRequest, NextResponse } from "next/server"
import {
  getPublicTimeline,
  toPublicCaseView,
  toPublicCases,
  type CaseActivity,
} from "@/lib/public-case-tracking"
import { getCaseById, listAuditEntriesForCase, listCases } from "@/lib/server/cases"
import { getRejectionInfo, safePublicReason } from "@/lib/rejection-tracking"

function toPublicActivityType(actionRaw: string): CaseActivity["type"] {
  const action = String(actionRaw || "").toUpperCase()
  if (action.includes("PUBLIC_APPEAL")) return "public_appeal"
  if (action.includes("PUBLIC_ADDITIONAL_INFO")) return "public_additional_info"
  if (action.includes("PUBLIC_REVIEW_REQUEST")) return "public_review_request"
  if (action.includes("PUBLIC_CORRECTION_REQUEST")) return "public_correction_request"
  return "public_comment"
}

function sanitizeInvolvedUsers(caseData: any) {
  const names = [
    caseData?.policeOfficerName,
    caseData?.policeSections?.sectionA?.openedByName,
    caseData?.policeSections?.sectionB?.investigatorName,
    caseData?.policeSections?.sectionC?.submittedToCommissionerByName,
    caseData?.commissionerDecision?.byName,
    caseData?.dppReview?.registeredByName,
    caseData?.dppReview?.assignedProsecutorName,
    caseData?.prosecutionAction?.filedByName,
    caseData?.courtRegistry?.intakeByName,
    caseData?.courtRegistry?.assignedJudgeName,
    caseData?.correctional?.receivedByName,
    caseData?.appeal?.filedByName,
    caseData?.appeal?.decidedByName,
    ...(Array.isArray(caseData?.usersInvolved) ? caseData.usersInvolved : []),
  ]

  return Array.from(new Set(names.map((v) => String(v || "").trim()).filter(Boolean))).filter(
    (name) => !name.toLowerCase().includes("judge")
  )
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const caseId = String(url.searchParams.get("caseId") || "").trim()

    if (caseId) {
      const caseData = await getCaseById(caseId)
      if (!caseData) {
        return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 })
      }

      const audits = await listAuditEntriesForCase(caseId)
      const publicActivities: CaseActivity[] = audits
        .filter((entry) => String(entry.action || "").toUpperCase().startsWith("PUBLIC_"))
        .map((entry) => ({
          id: `audit-${entry.id}`,
          caseId: entry.caseId,
          type: toPublicActivityType(entry.action),
          actorName: entry.performedByName || "Public User",
          actorRole: "public" as const,
          message: String(entry.detailsJson?.message || ""),
          createdAt: entry.timestamp,
          metadata: {
            source: "public_portal",
            submissionType: entry.detailsJson?.submissionType || "",
          },
        }))
        .filter((item) => item.message)

      const rejectionInfo = getRejectionInfo(caseData)
      const resumed = Boolean(rejectionInfo.resubmittedAt || rejectionInfo.resumedFlag)

      return NextResponse.json({
        ok: true,
        case: toPublicCaseView(caseData),
        timeline: getPublicTimeline(caseData, publicActivities),
        involvedUsers: sanitizeInvolvedUsers(caseData),
        rejection: {
          hadRejection: Boolean(rejectionInfo.rejectedAt),
          previousStatus: rejectionInfo.rejectedAt ? "Rejected" : "",
          publicReason: safePublicReason(rejectionInfo),
          update: resumed
            ? "Additional required information has now been provided."
            : "Awaiting additional required information.",
          currentPosition: resumed
            ? "Case is continuing through the process."
            : "Case is waiting for correction.",
        },
      })
    }

    const publicCases = toPublicCases(await listCases())
    return NextResponse.json({ ok: true, publicCases })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load public cases.",
      },
      { status: 500 }
    )
  }
}
