import type { CaseData } from "@/lib/blockchain"

export type CaseWorkflowStatus =
  | "opened"
  | "under_investigation"
  | "pending_review"
  | "rejected"
  | "rejected_awaiting_additional_information"
  | "re_submitted"
  | "back_in_process"
  | "approved_after_correction"
  | "delivered"
  | "docket_complete"
  | "closed"

export type CrimeType =
  | "theft"
  | "assault"
  | "murder"
  | "fraud"
  | "cybercrime"
  | "domestic_violence"
  | "corruption"
  | "robbery"
  | "gender_based_violence"
  | "property_damage"
  | "missing_person"
  | "drug_related_offence"
  | "traffic_offence"
  | "sexual_offence"
  | "other"

export type SeverityLevel = "low" | "medium" | "high" | "critical"

export type RejectionInfo = {
  rejectedByUserId?: string
  rejectedByName?: string
  rejectedByRole?: string
  rejectionReason?: string
  rejectionReasonPublic?: string
  rejectionIsConfidential?: boolean
  rejectedAt?: string
  rejectionStage?: string
  followUpRequired?: boolean
  resubmittedAt?: string
  resubmittedBy?: string
  resumeReason?: string
  resumedFlag?: boolean
}

export type CaseClassificationInfo = {
  crimeType?: CrimeType
  crimeSubCategory?: string
  severityLevel?: SeverityLevel
  areaStation?: string
  district?: string
  townArea?: string
  placeOfOccurrence?: string
}

export type RejectionCaseView = {
  caseId: string
  caseNumber: string
  docketNumber: string
  title: string
  crimeType: string
  crimeSubCategory: string
  severityLevel: string
  location: string
  currentPhase: string
  currentStatus: string
  rejectionStatus: string
  rejectionReason: string
  rejectionReasonPublic: string
  rejectedBy: string
  rejectedByRole: string
  rejectedAt: string
  notes: string
  newInfoAdded: boolean
  resumed: boolean
  resumedAt: string
  resumeReason: string
  chainReference: string
}

export const TRACKABLE_PUBLIC_STATUSES: Record<string, string> = {
  opened: "Opened",
  draft_police: "Opened",
  pending_investigation: "Under Investigation",
  in_investigation: "Under Investigation",
  pending_commissioner: "Pending Review",
  commissioner_clarification: "Rejected - Awaiting Additional Information",
  rejected: "Rejected",
  re_submitted: "Re-Submitted",
  back_in_process: "Back In Process",
  approved_after_correction: "Approved After Correction",
  approved: "Approved After Correction",
  submitted_to_dpp: "Delivered",
  dpp_registry_intake: "Delivered",
  filed_to_high_court: "Delivered",
  first_appearance: "Delivered",
  trial_in_progress: "Delivered",
  sentenced: "Delivered",
  transferred_to_correctional_services: "Delivered",
  serving_sentence: "Delivered",
  parole_review: "Delivered",
  released: "Delivered",
  appealed: "Delivered",
  appeal_in_progress: "Delivered",
  appeal_decided: "Delivered",
  case_closed: "Closed",
  case_archived: "Closed",
  docket_complete: "Docket Complete",
  completed: "Docket Complete",
  closed: "Closed",
}

export function safePublicReason(info: RejectionInfo) {
  if (!info.rejectedAt) return ""

  if (info.rejectionIsConfidential) {
    if (info.resumedFlag || info.resubmittedAt) {
      return "Rejected due to confidential review findings. Required confidential information was later satisfied. Case is now continuing."
    }
    return "Rejected due to confidential review findings."
  }

  const reason = String(info.rejectionReasonPublic || info.rejectionReason || "").trim()
  if (!reason) {
    return "Required information was incomplete."
  }

  if (info.resumedFlag || info.resubmittedAt) {
    return `${reason} Additional required information has now been provided. Case is now back in process.`
  }
  return reason
}

function normalizeStatus(statusRaw?: string) {
  const key = String(statusRaw || "").trim().toLowerCase()
  return TRACKABLE_PUBLIC_STATUSES[key] || key.replace(/_/g, " ")
}

function phaseFromCase(caseData: CaseData): string {
  const status = String(caseData.status || "").toLowerCase()
  if (status.includes("investigation")) return "Investigation"
  if (status.includes("commissioner") || status.includes("rejected")) return "Review / Commissioner"
  if (status.includes("dpp") || status.includes("court") || status.includes("filed")) return "Prosecution / Court Routing"
  if (status.includes("appearance") || status.includes("trial") || status.includes("judgment") || status.includes("sentence")) return "Court Hearing"
  if (status.includes("correctional") || status.includes("parole") || status.includes("released")) return "Correctional Services"
  if (status.includes("appeal")) return "Appeal"
  if (status.includes("docket") || status.includes("complete") || status.includes("closed")) return "Complete Docket"
  return "Case Opening"
}

export function getRejectionInfo(caseData: CaseData): RejectionInfo {
  const explicit = (caseData as any)?.rejectionInfo || {}
  const commissioner = caseData?.commissionerDecision || {}

  const rejected = String(caseData?.status || "").toLowerCase() === "rejected" || String(commissioner?.decision || "").toLowerCase() === "rejected"
  const clarification = String(caseData?.status || "").toLowerCase() === "commissioner_clarification"
  const resumed = ["back_in_process", "re_submitted", "approved_after_correction"].includes(String(caseData?.status || "").toLowerCase()) || Boolean(explicit.resubmittedAt || explicit.resumedFlag)

  return {
    rejectedByUserId: explicit.rejectedByUserId || commissioner?.byId || "",
    rejectedByName: explicit.rejectedByName || commissioner?.byName || "",
    rejectedByRole: explicit.rejectedByRole || "commissioner",
    rejectionReason: explicit.rejectionReason || commissioner?.notes || "",
    rejectionReasonPublic: explicit.rejectionReasonPublic || "",
    rejectionIsConfidential: Boolean(explicit.rejectionIsConfidential),
    rejectedAt: explicit.rejectedAt || commissioner?.at || (rejected || clarification ? caseData.updatedAt : ""),
    rejectionStage: explicit.rejectionStage || "review_commissioner",
    followUpRequired: explicit.followUpRequired ?? (rejected || clarification),
    resubmittedAt: explicit.resubmittedAt || "",
    resubmittedBy: explicit.resubmittedBy || "",
    resumeReason: explicit.resumeReason || "",
    resumedFlag: explicit.resumedFlag ?? resumed,
  }
}

export function getClassificationInfo(caseData: CaseData): CaseClassificationInfo {
  const explicit = (caseData as any)?.classification || {}
  return {
    crimeType: explicit.crimeType || "",
    crimeSubCategory: explicit.crimeSubCategory || "",
    severityLevel: explicit.severityLevel || "",
    areaStation: explicit.areaStation || caseData?.policeSections?.sectionA?.station || "",
    district: explicit.district || caseData.district || "",
    townArea: explicit.townArea || "",
    placeOfOccurrence: explicit.placeOfOccurrence || caseData?.policeSections?.sectionA?.location || "",
  }
}

export function toRejectionCaseView(caseData: CaseData): RejectionCaseView {
  const rejection = getRejectionInfo(caseData)
  const classInfo = getClassificationInfo(caseData)
  const hasRejection = Boolean(rejection.rejectedAt)

  return {
    caseId: caseData.caseId,
    caseNumber: caseData.caseNumber || caseData.caseId,
    docketNumber: caseData.citation || "",
    title: caseData.charge || caseData.parties || "Case Record",
    crimeType: classInfo.crimeType || caseData.charge || "other",
    crimeSubCategory: classInfo.crimeSubCategory || "",
    severityLevel: classInfo.severityLevel || "medium",
    location: [classInfo.district || "", classInfo.townArea || "", classInfo.areaStation || ""].filter(Boolean).join(" / "),
    currentPhase: phaseFromCase(caseData),
    currentStatus: normalizeStatus(caseData.status),
    rejectionStatus: hasRejection
      ? rejection.resumedFlag || rejection.resubmittedAt
        ? "Back In Process"
        : "Rejected"
      : "Not Rejected",
    rejectionReason: rejection.rejectionReason || "",
    rejectionReasonPublic: safePublicReason(rejection),
    rejectedBy: rejection.rejectedByName || "",
    rejectedByRole: rejection.rejectedByRole || "",
    rejectedAt: rejection.rejectedAt || "",
    notes: String((caseData as any)?.reviewNotes || ""),
    newInfoAdded: Boolean(rejection.resubmittedAt || rejection.resumeReason),
    resumed: Boolean(rejection.resumedFlag || rejection.resubmittedAt),
    resumedAt: rejection.resubmittedAt || "",
    resumeReason: rejection.resumeReason || "",
    chainReference: String(
      (caseData as any)?.chainAnchor?.transactionId || (caseData as any)?.chainAnchor?.txHash || ""
    ),
  }
}

export function toRejectedCases(cases: CaseData[]) {
  return (cases || [])
    .map(toRejectionCaseView)
    .filter((c) => c.rejectionStatus !== "Not Rejected")
}

export function filterRejectedCases(
  rows: RejectionCaseView[],
  filters: {
    q?: string
    rejectedBy?: string
    rejectedByRole?: string
    from?: string
    to?: string
    reason?: string
  }
) {
  const q = String(filters.q || "").trim().toLowerCase()
  const by = String(filters.rejectedBy || "").trim().toLowerCase()
  const role = String(filters.rejectedByRole || "").trim().toLowerCase()
  const reason = String(filters.reason || "").trim().toLowerCase()
  const from = filters.from ? Date.parse(filters.from) : Number.NaN
  const to = filters.to ? Date.parse(filters.to) : Number.NaN

  return rows.filter((row) => {
    const matchesQ =
      !q ||
      [
        row.caseNumber,
        row.docketNumber,
        row.title,
        row.crimeType,
        row.location,
        row.currentStatus,
        row.rejectionReason,
        row.rejectedBy,
        row.rejectedByRole,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)

    const matchesBy = !by || row.rejectedBy.toLowerCase().includes(by)
    const matchesRole = !role || row.rejectedByRole.toLowerCase().includes(role)
    const matchesReason = !reason || row.rejectionReason.toLowerCase().includes(reason)

    const ts = row.rejectedAt ? Date.parse(row.rejectedAt) : Number.NaN
    const matchesFrom = Number.isNaN(from) || (!Number.isNaN(ts) && ts >= from)
    const matchesTo = Number.isNaN(to) || (!Number.isNaN(ts) && ts <= to)

    return matchesQ && matchesBy && matchesRole && matchesReason && matchesFrom && matchesTo
  })
}

export function computeRejectionAnalytics(rows: RejectionCaseView[]) {
  const totalRejected = rows.length
  const resumed = rows.filter((r) => r.resumed).length
  const pendingCorrection = rows.filter((r) => !r.resumed).length

  const byReviewer: Record<string, number> = {}
  const byRole: Record<string, number> = {}
  const byReason: Record<string, number> = {}
  const byCrimeType: Record<string, number> = {}
  const byDistrict: Record<string, number> = {}

  for (const row of rows) {
    const reviewer = row.rejectedBy || "Unknown Reviewer"
    const role = row.rejectedByRole || "Unknown Role"
    const reason = row.rejectionReason || "No reason captured"
    const crime = row.crimeType || "other"
    const district = row.location.split("/")[0]?.trim() || "Unknown District"

    byReviewer[reviewer] = (byReviewer[reviewer] || 0) + 1
    byRole[role] = (byRole[role] || 0) + 1
    byReason[reason] = (byReason[reason] || 0) + 1
    byCrimeType[crime] = (byCrimeType[crime] || 0) + 1
    byDistrict[district] = (byDistrict[district] || 0) + 1
  }

  return {
    totalRejected,
    resumed,
    pendingCorrection,
    rejectionRateResumed: totalRejected > 0 ? Math.round((resumed / totalRejected) * 100) : 0,
    byReviewer: Object.entries(byReviewer).map(([name, count]) => ({ name, count })),
    byRole: Object.entries(byRole).map(([role, count]) => ({ role, count })),
    byReason: Object.entries(byReason).map(([reason, count]) => ({ reason, count })),
    byCrimeType: Object.entries(byCrimeType).map(([crimeType, count]) => ({ crimeType, count })),
    byDistrict: Object.entries(byDistrict).map(([district, count]) => ({ district, count })),
  }
}
