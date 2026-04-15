import type { CaseData } from "@/lib/blockchain"

export type PublicActivityType =
  | "case_opened"
  | "submitted_to_investigation"
  | "investigation_started"
  | "submitted_to_commissioner"
  | "commissioner_approved"
  | "commissioner_rejected"
  | "commissioner_clarification"
  | "delivered_to_dpp"
  | "dpp_registered"
  | "prosecutor_assigned"
  | "returned_to_police"
  | "delivered_to_court"
  | "court_registry_intake"
  | "judge_assigned"
  | "first_appearance_recorded"
  | "bail_decided"
  | "trial_started"
  | "judgment_delivered"
  | "sentence_imposed"
  | "offender_admitted"
  | "parole_review_scheduled"
  | "offender_released"
  | "appeal_filed"
  | "appeal_decided"
  | "case_archived"
  | "docket_completed"
  | "case_closed"
  | "public_comment"
  | "public_appeal"
  | "public_additional_info"
  | "public_review_request"
  | "public_correction_request"

export type PublicSubmissionType =
  | "comment"
  | "appeal"
  | "additional_info"
  | "review_request"
  | "correction_request"

export type CaseActivity = {
  id: string
  caseId: string
  type: PublicActivityType
  actorName: string
  actorRole: "public" | "internal" | "system"
  message: string
  createdAt: string
  metadata?: Record<string, any>
}

export type PublicCaseView = {
  caseId: string
  caseNumber: string
  title: string
  shortDescription: string
  department: string
  status: string
  statusLabel: string
  phase: PublicPhase
  phaseLabel: string
  docketPhase: string
  createdAt: string
  updatedAt: string
  openedAt: string
  progressSummary: string
  canReceivePublicFeedback: boolean
}

export type PublicPhase =
  | "case_opening"
  | "investigation"
  | "review_approval"
  | "prosecution_routing"
  | "court_hearing"
  | "correctional_services"
  | "appeal"
  | "complete_docket"

type StatusConfig = {
  label: string
  phase: PublicPhase
  dashboardGroup:
    | "opened"
    | "pending"
    | "under_investigation"
    | "pending_commissioner"
    | "approved"
    | "rejected"
    | "delivered"
    | "court_active"
    | "correctional"
    | "appeal"
    | "docket_complete"
    | "closed"
    | "archived"
}

const FALLBACK_SUMMARY = "Progress is being updated by the responsible department."

export const PUBLIC_STATUS_CONFIG: Record<string, StatusConfig> = {
  opened: { label: "Opened", phase: "case_opening", dashboardGroup: "opened" },
  pending_intake: { label: "Pending Intake", phase: "case_opening", dashboardGroup: "pending" },
  draft_police: { label: "Opened", phase: "case_opening", dashboardGroup: "opened" },
  pending_investigation: {
    label: "Pending Investigation",
    phase: "investigation",
    dashboardGroup: "pending",
  },
  under_investigation: {
    label: "Under Investigation",
    phase: "investigation",
    dashboardGroup: "under_investigation",
  },
  in_investigation: {
    label: "Under Investigation",
    phase: "investigation",
    dashboardGroup: "under_investigation",
  },
  evidence_collection: {
    label: "Evidence Collection",
    phase: "investigation",
    dashboardGroup: "under_investigation",
  },
  pending_review: {
    label: "Pending Review",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  pending_commissioner: {
    label: "Pending Commissioner Review",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  submitted_to_commissioner: {
    label: "Pending Commissioner Review",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  commissioner_clarification: {
    label: "Sent Back for Correction",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  rejected_awaiting_additional_information: {
    label: "Rejected - Awaiting Additional Information",
    phase: "review_approval",
    dashboardGroup: "rejected",
  },
  re_submitted: {
    label: "Re-Submitted",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  back_in_process: {
    label: "Back In Process",
    phase: "investigation",
    dashboardGroup: "under_investigation",
  },
  approved_after_correction: {
    label: "Approved After Correction",
    phase: "review_approval",
    dashboardGroup: "approved",
  },
  sent_back_for_correction: {
    label: "Sent Back for Correction",
    phase: "review_approval",
    dashboardGroup: "pending_commissioner",
  },
  approved: { label: "Approved", phase: "review_approval", dashboardGroup: "approved" },
  submitted_to_dpp: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  submitted_to_prosecution_registry: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  dpp_registry_intake: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  registered_by_prosecution_registry: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  assigned_to_prosecutor: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  returned_to_police: {
    label: "Returned to Police",
    phase: "investigation",
    dashboardGroup: "under_investigation",
  },
  delivered_to_dpp: {
    label: "Delivered to DPP",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  delivered_to_court: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  filed_to_small_court: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  filed_to_high_court: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  high_court_registry_intake: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  assigned_to_court: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  assigned_to_judge: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  assigned_to_small_court_judge: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  assigned_to_high_court_judge: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  first_appearance: {
    label: "First Appearance",
    phase: "court_hearing",
    dashboardGroup: "court_active",
  },
  bail_stage: {
    label: "Bail Stage",
    phase: "court_hearing",
    dashboardGroup: "court_active",
  },
  trial_in_progress: {
    label: "Trial In Progress",
    phase: "court_hearing",
    dashboardGroup: "court_active",
  },
  judgment_delivered: {
    label: "Judgment Delivered",
    phase: "court_hearing",
    dashboardGroup: "court_active",
  },
  sentenced: {
    label: "Sentenced",
    phase: "court_hearing",
    dashboardGroup: "court_active",
  },
  transferred_to_correctional_services: {
    label: "Transferred to Correctional Services",
    phase: "correctional_services",
    dashboardGroup: "correctional",
  },
  serving_sentence: {
    label: "Serving Sentence",
    phase: "correctional_services",
    dashboardGroup: "correctional",
  },
  parole_review: {
    label: "Parole Review",
    phase: "correctional_services",
    dashboardGroup: "correctional",
  },
  released: {
    label: "Released",
    phase: "correctional_services",
    dashboardGroup: "correctional",
  },
  appealed: {
    label: "Appeal Filed",
    phase: "appeal",
    dashboardGroup: "appeal",
  },
  appeal_in_progress: {
    label: "Appeal In Progress",
    phase: "appeal",
    dashboardGroup: "appeal",
  },
  appeal_decided: {
    label: "Appeal Decided",
    phase: "appeal",
    dashboardGroup: "appeal",
  },
  high_court_in_progress: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  in_progress: {
    label: "Delivered to Court",
    phase: "prosecution_routing",
    dashboardGroup: "delivered",
  },
  docket_complete: {
    label: "Docket Complete",
    phase: "complete_docket",
    dashboardGroup: "docket_complete",
  },
  completed: {
    label: "Docket Complete",
    phase: "complete_docket",
    dashboardGroup: "docket_complete",
  },
  high_court_completed: {
    label: "Docket Complete",
    phase: "complete_docket",
    dashboardGroup: "docket_complete",
  },
  small_court_completed: {
    label: "Docket Complete",
    phase: "complete_docket",
    dashboardGroup: "docket_complete",
  },
  rejected: {
    label: "Rejected",
    phase: "review_approval",
    dashboardGroup: "rejected",
  },
  closed: {
    label: "Closed",
    phase: "complete_docket",
    dashboardGroup: "closed",
  },
  case_closed: {
    label: "Closed",
    phase: "complete_docket",
    dashboardGroup: "closed",
  },
  case_archived: {
    label: "Archived",
    phase: "complete_docket",
    dashboardGroup: "archived",
  },
}

function statusConfig(statusRaw?: string | null): StatusConfig {
  const key = String(statusRaw || "").trim().toLowerCase()
  return (
    PUBLIC_STATUS_CONFIG[key] ?? {
      label: key ? key.replace(/_/g, " ") : "Unknown",
      phase: "case_opening",
      dashboardGroup: "pending",
    }
  )
}

function phaseLabel(phase: PublicPhase) {
  if (phase === "case_opening") return "Case Opening"
  if (phase === "investigation") return "Investigation"
  if (phase === "review_approval") return "Review / Commissioner / Approval"
  if (phase === "prosecution_routing") return "Prosecution / Court Routing"
  if (phase === "court_hearing") return "Court Hearing"
  if (phase === "correctional_services") return "Correctional Services"
  if (phase === "appeal") return "Appeal"
  return "Complete Docket"
}

function normalizedStatus(statusRaw?: string | null) {
  return String(statusRaw || "").trim().toLowerCase()
}

function progressSummary(caseData: CaseData): string {
  const commissionerNote = String(caseData?.commissionerDecision?.notes || "").trim()
  const sectionSummary = String(caseData?.policeSections?.sectionA?.summary || "").trim()
  const description = String(caseData?.description || "").trim()
  return commissionerNote || sectionSummary || description || FALLBACK_SUMMARY
}

function stageDepartment(caseData: CaseData, phase: PublicPhase) {
  const current = normalizedStatus(caseData.status)

  if (["opened", "draft_police", "open", "pending_intake"].includes(current)) {
    return caseData.district || caseData.policeSections?.sectionA?.station || "HQ"
  }

  if (["pending_investigation"].includes(current)) {
    return "Investigation Queue"
  }

  if (["in_investigation", "under_investigation", "evidence_collection", "back_in_process", "returned_to_police"].includes(current)) {
    return "Investigation Department"
  }

  if (["pending_review", "pending_commissioner", "submitted_to_commissioner", "commissioner_clarification", "re_submitted", "sent_back_for_correction", "rejected"].includes(current)) {
    return "Commissioner Review"
  }

  if (["approved", "submitted_to_dpp", "submitted_to_prosecution_registry", "delivered_to_dpp"].includes(current)) {
    return "DPP Office"
  }

  if (["dpp_registry_intake", "registered_by_prosecution_registry"].includes(current)) {
    return "DPP Registry"
  }

  if (["assigned_to_prosecutor"].includes(current)) {
    return "DPP Prosecutor"
  }

  if (["filed_to_high_court", "filed_to_small_court", "delivered_to_court"].includes(current)) {
    return "Prosecutor Filing Desk"
  }

  if (["high_court_registry_intake", "assigned_to_court"].includes(current)) {
    return "Court Registry"
  }

  if (["assigned_to_high_court_judge", "high_court_in_progress"].includes(current)) {
    return caseData?.courtRegistry?.assignedJudgeName
      ? `High Court Judge - ${caseData.courtRegistry.assignedJudgeName}`
      : "High Court Judge"
  }

  if (["assigned_to_small_court_judge", "in_progress"].includes(current)) {
    return caseData?.courtRegistry?.assignedJudgeName
      ? `Magistrate - ${caseData.courtRegistry.assignedJudgeName}`
      : "Magistrate Court"
  }

  if (["first_appearance", "bail_stage", "trial_in_progress", "judgment_delivered", "sentenced"].includes(current)) {
    return caseData?.courtRegistry?.assignedJudgeName
      ? `Court Hearing - ${caseData.courtRegistry.assignedJudgeName}`
      : "Court Hearing"
  }

  if (["transferred_to_correctional_services", "serving_sentence", "parole_review", "released"].includes(current)) {
    return "Correctional Services"
  }

  if (["appealed", "appeal_in_progress", "appeal_decided"].includes(current)) {
    return "Appeal / High Court"
  }

  if (["case_closed", "case_archived"].includes(current)) {
    return "Archive / Closed Case"
  }

  if (["high_court_completed", "small_court_completed", "docket_complete", "completed", "closed"].includes(current)) {
    return "Records and Docket Management"
  }

  if (phase === "investigation") {
    return "Investigation Department"
  }

  if (phase === "review_approval") {
    return "Commissioner Review"
  }

  if (phase === "prosecution_routing") {
    if (String(caseData.status || "").includes("dpp")) return "DPP / Prosecution"
    if (String(caseData.status || "").includes("court")) return "Court Registry"
    return "Prosecution / Registry"
  }

  if (phase === "complete_docket") {
    return "Records and Docket Management"
  }

  return caseData.district || caseData.policeSections?.sectionA?.station || "Police Intake"
}

export function toPublicCaseView(caseData: CaseData): PublicCaseView {
  const cfg = statusConfig(caseData.status)
  const openedAt =
    caseData?.dateOpened ||
    caseData?.policeSections?.sectionA?.openedAt ||
    caseData?.createdAt ||
    new Date().toISOString()

  return {
    caseId: caseData.caseId,
    caseNumber: caseData.caseNumber || caseData.caseId,
    title: caseData.charge || caseData.parties || "Public case record",
    shortDescription: String(caseData.description || "").slice(0, 300),
    department: stageDepartment(caseData, cfg.phase),
    status: caseData.status,
    statusLabel: cfg.label,
    phase: cfg.phase,
    phaseLabel: phaseLabel(cfg.phase),
    docketPhase: phaseLabel(cfg.phase),
    createdAt: caseData.createdAt || openedAt,
    updatedAt: caseData.updatedAt || openedAt,
    openedAt,
    progressSummary: progressSummary(caseData),
    canReceivePublicFeedback: true,
  }
}

export function toPublicCases(cases: CaseData[]) {
  return (cases || []).map(toPublicCaseView)
}

export function mergePublicCases(...collections: Array<PublicCaseView[] | null | undefined>) {
  const merged = new Map<string, PublicCaseView>()

  for (const collection of collections) {
    for (const item of collection || []) {
      const key = String(item.caseId || item.caseNumber || "").trim()
      if (!key) continue

      const previous = merged.get(key)
      if (!previous) {
        merged.set(key, item)
        continue
      }

      const currentTime = Date.parse(item.updatedAt || item.createdAt || "")
      const previousTime = Date.parse(previous.updatedAt || previous.createdAt || "")
      merged.set(key, Number.isNaN(currentTime) || currentTime < previousTime ? previous : item)
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  )
}

function contains(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase())
}

export function filterPublicCases(
  cases: PublicCaseView[],
  filters: {
    query?: string
    status?: string
    phase?: string
    department?: string
    fromDate?: string
    toDate?: string
  }
) {
  const q = String(filters.query || "").trim().toLowerCase()
  const status = String(filters.status || "").trim().toLowerCase()
  const phase = String(filters.phase || "").trim().toLowerCase()
  const department = String(filters.department || "").trim().toLowerCase()
  const fromDate = filters.fromDate ? Date.parse(filters.fromDate) : Number.NaN
  const toDate = filters.toDate ? Date.parse(filters.toDate) : Number.NaN

  return cases.filter((item) => {
    const searchable = [
      item.caseNumber,
      item.title,
      item.statusLabel,
      item.phaseLabel,
      item.department,
      item.progressSummary,
    ]

    const matchesQuery = !q || searchable.some((value) => contains(String(value || ""), q))
    const matchesStatus = !status || item.status.toLowerCase() === status
    const matchesPhase = !phase || item.phase === phase
    const matchesDepartment = !department || item.department.toLowerCase() === department

    const itemTime = Date.parse(item.openedAt || item.createdAt)
    const matchesFrom = Number.isNaN(fromDate) || itemTime >= fromDate
    const matchesTo = Number.isNaN(toDate) || itemTime <= toDate

    return (
      matchesQuery &&
      matchesStatus &&
      matchesPhase &&
      matchesDepartment &&
      matchesFrom &&
      matchesTo
    )
  })
}

export type PublicDashboardStats = {
  totalCasesOpened: number
  totalPendingCases: number
  totalUnderInvestigation: number
  totalPendingCommissioner: number
  totalApproved: number
  totalRejected: number
  totalDelivered: number
  totalCompletedDockets: number
  totalClosed: number
  byPhase: Array<{ phase: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
}

export function computePublicDashboardStats(cases: PublicCaseView[]): PublicDashboardStats {
  const byPhaseMap: Record<string, number> = {}
  const byStatusMap: Record<string, number> = {}

  let totalPendingCases = 0
  let totalUnderInvestigation = 0
  let totalPendingCommissioner = 0
  let totalApproved = 0
  let totalRejected = 0
  let totalDelivered = 0
  let totalCompletedDockets = 0
  let totalClosed = 0

  for (const item of cases) {
    byPhaseMap[item.phaseLabel] = (byPhaseMap[item.phaseLabel] || 0) + 1
    byStatusMap[item.statusLabel] = (byStatusMap[item.statusLabel] || 0) + 1

    const cfg = statusConfig(item.status)
    if (cfg.dashboardGroup === "pending") totalPendingCases += 1
    if (cfg.dashboardGroup === "under_investigation") totalUnderInvestigation += 1
    if (cfg.dashboardGroup === "pending_commissioner") totalPendingCommissioner += 1
    if (cfg.dashboardGroup === "approved") totalApproved += 1
    if (cfg.dashboardGroup === "rejected") totalRejected += 1
    if (cfg.dashboardGroup === "delivered") totalDelivered += 1
    if (cfg.dashboardGroup === "docket_complete") totalCompletedDockets += 1
    if (cfg.dashboardGroup === "closed" || cfg.dashboardGroup === "archived") totalClosed += 1
  }

  return {
    totalCasesOpened: cases.length,
    totalPendingCases,
    totalUnderInvestigation,
    totalPendingCommissioner,
    totalApproved,
    totalRejected,
    totalDelivered,
    totalCompletedDockets,
    totalClosed,
    byPhase: Object.entries(byPhaseMap).map(([phase, count]) => ({ phase, count })),
    byStatus: Object.entries(byStatusMap).map(([status, count]) => ({ status, count })),
  }
}

export function publicSubmissionToActivityType(type: PublicSubmissionType): PublicActivityType {
  if (type === "appeal") return "public_appeal"
  if (type === "additional_info") return "public_additional_info"
  if (type === "review_request") return "public_review_request"
  if (type === "correction_request") return "public_correction_request"
  return "public_comment"
}

export function makeActivityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `act-${crypto.randomUUID()}`
  }
  return `act-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export function getPublicTimeline(caseData: CaseData, activities: CaseActivity[]) {
  const systemEvents: CaseActivity[] = []
  const openedAt = caseData?.policeSections?.sectionA?.openedAt || caseData?.createdAt

  if (openedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-opened`,
      caseId: caseData.caseId,
      type: "case_opened",
      actorName: caseData?.policeOfficerName || "Opening officer",
      actorRole: "internal",
      message: "Case was opened and recorded.",
      createdAt: openedAt,
    })
  }

  const investigationStartedAt = caseData?.policeSections?.sectionB?.investigationStartedAt
  if (investigationStartedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-inv-start`,
      caseId: caseData.caseId,
      type: "investigation_started",
      actorName: caseData?.policeSections?.sectionB?.investigatorName || "Investigation unit",
      actorRole: "internal",
      message: "Investigation started.",
      createdAt: investigationStartedAt,
    })
  }

  const submittedToCommissionerAt = caseData?.policeSections?.sectionC?.submittedToCommissionerAt
  if (submittedToCommissionerAt) {
    systemEvents.push({
      id: `${caseData.caseId}-commissioner-submit`,
      caseId: caseData.caseId,
      type: "submitted_to_commissioner",
      actorName: caseData?.policeSections?.sectionC?.submittedToCommissionerByName || "Investigation unit",
      actorRole: "internal",
      message: "Case submitted for commissioner review.",
      createdAt: submittedToCommissionerAt,
    })
  }

  const commissionerAt = caseData?.commissionerDecision?.at
  const decision = String(caseData?.commissionerDecision?.decision || "").toLowerCase()
  if (commissionerAt && decision) {
    systemEvents.push({
      id: `${caseData.caseId}-commissioner-${decision}`,
      caseId: caseData.caseId,
      type:
        decision === "approved"
          ? "commissioner_approved"
          : decision === "rejected"
            ? "commissioner_rejected"
            : "commissioner_clarification",
      actorName: caseData?.commissionerDecision?.byName || "Commissioner",
      actorRole: "internal",
      message:
        decision === "approved"
          ? "Commissioner approved this case."
          : decision === "rejected"
            ? "Commissioner rejected this case."
            : "Commissioner requested clarification.",
      createdAt: commissionerAt,
      metadata: {
        reason: caseData?.commissionerDecision?.notes || "",
      },
    })
  }

  const forwardedToDppAt = caseData?.dppReview?.forwardedAt
  if (forwardedToDppAt) {
    systemEvents.push({
      id: `${caseData.caseId}-dpp-forwarded`,
      caseId: caseData.caseId,
      type: "delivered_to_dpp",
      actorName: caseData?.dppReview?.forwardedByName || "Commissioner",
      actorRole: "internal",
      message: "Case delivered to the DPP pipeline.",
      createdAt: forwardedToDppAt,
    })
  }

  const dppRegisteredAt = caseData?.dppReview?.registeredAt
  if (dppRegisteredAt) {
    systemEvents.push({
      id: `${caseData.caseId}-dpp-registered`,
      caseId: caseData.caseId,
      type: "dpp_registered",
      actorName: caseData?.dppReview?.registeredByName || "DPP registry",
      actorRole: "internal",
      message: "Case registered by the DPP office.",
      createdAt: dppRegisteredAt,
    })
  }

  const prosecutorAssignedAt = caseData?.dppReview?.assignedAt
  if (prosecutorAssignedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-prosecutor-assigned`,
      caseId: caseData.caseId,
      type: "prosecutor_assigned",
      actorName: caseData?.dppReview?.assignedByName || "DPP registry",
      actorRole: "internal",
      message: `Case assigned to prosecutor ${caseData?.dppReview?.assignedProsecutorName || ""}`.trim(),
      createdAt: prosecutorAssignedAt,
    })
  }

  const returnedToPoliceAt = caseData?.dppReview?.returnedAt || caseData?.prosecutionAction?.returnedAt
  if (returnedToPoliceAt) {
    systemEvents.push({
      id: `${caseData.caseId}-returned-to-police`,
      caseId: caseData.caseId,
      type: "returned_to_police",
      actorName:
        caseData?.dppReview?.returnedByName ||
        caseData?.prosecutionAction?.returnedByName ||
        "DPP / Prosecution",
      actorRole: "internal",
      message: "Case returned to police for further action.",
      createdAt: returnedToPoliceAt,
    })
  }

  const deliveredToCourtAt = caseData?.prosecutionAction?.filedAt
  if (deliveredToCourtAt) {
    systemEvents.push({
      id: `${caseData.caseId}-delivered-to-court`,
      caseId: caseData.caseId,
      type: "delivered_to_court",
      actorName: caseData?.prosecutionAction?.filedByName || "Prosecutor",
      actorRole: "internal",
      message: "Case filed to court registry.",
      createdAt: deliveredToCourtAt,
    })
  }

  const courtRegistryIntakeAt = caseData?.courtRegistry?.intakeAt
  if (courtRegistryIntakeAt) {
    systemEvents.push({
      id: `${caseData.caseId}-court-registry-intake`,
      caseId: caseData.caseId,
      type: "court_registry_intake",
      actorName: caseData?.courtRegistry?.intakeByName || "Court registry",
      actorRole: "internal",
      message: "Court registry intake completed.",
      createdAt: courtRegistryIntakeAt,
    })
  }

  const judgeAssignedAt = caseData?.courtRegistry?.assignedAt
  if (judgeAssignedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-judge-assigned`,
      caseId: caseData.caseId,
      type: "judge_assigned",
      actorName: caseData?.courtRegistry?.assignedJudgeName || "Court registry",
      actorRole: "internal",
      message: "Case assigned for court handling.",
      createdAt: judgeAssignedAt,
    })
  }

  const firstAppearanceAt = caseData?.courtProcess?.firstAppearanceAt
  if (firstAppearanceAt) {
    systemEvents.push({
      id: `${caseData.caseId}-first-appearance`,
      caseId: caseData.caseId,
      type: "first_appearance_recorded",
      actorName: caseData?.courtProcess?.firstAppearanceByName || caseData?.courtRegistry?.assignedJudgeName || "Court",
      actorRole: "internal",
      message: "First appearance recorded.",
      createdAt: firstAppearanceAt,
    })
  }

  const bailDecisionAt = caseData?.courtProcess?.bailDecisionAt
  if (bailDecisionAt) {
    systemEvents.push({
      id: `${caseData.caseId}-bail-decision`,
      caseId: caseData.caseId,
      type: "bail_decided",
      actorName: caseData?.courtProcess?.bailDecisionByName || caseData?.courtRegistry?.assignedJudgeName || "Court",
      actorRole: "internal",
      message: caseData?.courtProcess?.bailDecisionLabel || "Bail decision recorded.",
      createdAt: bailDecisionAt,
    })
  }

  const trialStartedAt = caseData?.courtProcess?.trialStartedAt
  if (trialStartedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-trial-started`,
      caseId: caseData.caseId,
      type: "trial_started",
      actorName: caseData?.courtRegistry?.assignedJudgeName || "Court",
      actorRole: "internal",
      message: "Trial started.",
      createdAt: trialStartedAt,
    })
  }

  const judgmentAt = caseData?.courtProcess?.judgmentAt
  if (judgmentAt) {
    systemEvents.push({
      id: `${caseData.caseId}-judgment`,
      caseId: caseData.caseId,
      type: "judgment_delivered",
      actorName: caseData?.courtProcess?.judgmentByName || caseData?.courtRegistry?.assignedJudgeName || "Court",
      actorRole: "internal",
      message: "Judgment delivered.",
      createdAt: judgmentAt,
    })
  }

  const sentenceAt = caseData?.courtProcess?.sentenceAt
  if (sentenceAt) {
    systemEvents.push({
      id: `${caseData.caseId}-sentence`,
      caseId: caseData.caseId,
      type: "sentence_imposed",
      actorName: caseData?.courtProcess?.sentenceByName || caseData?.courtRegistry?.assignedJudgeName || "Court",
      actorRole: "internal",
      message: "Sentence imposed.",
      createdAt: sentenceAt,
    })
  }

  const admittedAt = caseData?.correctional?.admittedAt
  if (admittedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-correctional-admitted`,
      caseId: caseData.caseId,
      type: "offender_admitted",
      actorName: caseData?.correctional?.receivedByName || "Correctional Services",
      actorRole: "internal",
      message: "Offender admitted to correctional services.",
      createdAt: admittedAt,
    })
  }

  const paroleReviewAt = caseData?.correctional?.paroleReviewAt
  if (paroleReviewAt) {
    systemEvents.push({
      id: `${caseData.caseId}-parole-review`,
      caseId: caseData.caseId,
      type: "parole_review_scheduled",
      actorName: caseData?.correctional?.paroleReviewByName || "Correctional Services",
      actorRole: "internal",
      message: "Parole review scheduled.",
      createdAt: paroleReviewAt,
    })
  }

  const releasedAt = caseData?.correctional?.releasedAt
  if (releasedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-released`,
      caseId: caseData.caseId,
      type: "offender_released",
      actorName: caseData?.correctional?.releasedByName || "Correctional Services",
      actorRole: "internal",
      message: "Offender released.",
      createdAt: releasedAt,
    })
  }

  const appealFiledAt = caseData?.appeal?.filedAt
  if (appealFiledAt) {
    systemEvents.push({
      id: `${caseData.caseId}-appeal-filed`,
      caseId: caseData.caseId,
      type: "appeal_filed",
      actorName: caseData?.appeal?.filedByName || "Appeal Registry",
      actorRole: "internal",
      message: "Appeal filed.",
      createdAt: appealFiledAt,
    })
  }

  const appealDecidedAt = caseData?.appeal?.decidedAt
  if (appealDecidedAt) {
    systemEvents.push({
      id: `${caseData.caseId}-appeal-decided`,
      caseId: caseData.caseId,
      type: "appeal_decided",
      actorName: caseData?.appeal?.decidedByName || "Appeal Judge",
      actorRole: "internal",
      message: "Appeal decision recorded.",
      createdAt: appealDecidedAt,
    })
  }

  const normalizedStatus = String(caseData?.status || "").toLowerCase()
  if (caseData?.updatedAt && ["docket_complete", "completed", "high_court_completed", "small_court_completed"].includes(normalizedStatus)) {
    systemEvents.push({
      id: `${caseData.caseId}-docket-complete`,
      caseId: caseData.caseId,
      type: "docket_completed",
      actorName: "System",
      actorRole: "system",
      message: "Docket processing completed.",
      createdAt: caseData.updatedAt,
    })
  }

  if (caseData?.updatedAt && normalizedStatus === "closed") {
    systemEvents.push({
      id: `${caseData.caseId}-closed`,
      caseId: caseData.caseId,
      type: "case_closed",
      actorName: "System",
      actorRole: "system",
      message: "Case closed.",
      createdAt: caseData.updatedAt,
    })
  }

  if (caseData?.updatedAt && normalizedStatus === "case_closed") {
    systemEvents.push({
      id: `${caseData.caseId}-case-closed`,
      caseId: caseData.caseId,
      type: "case_closed",
      actorName: "System",
      actorRole: "system",
      message: "Case closed.",
      createdAt: caseData.updatedAt,
    })
  }

  if (caseData?.updatedAt && normalizedStatus === "case_archived") {
    systemEvents.push({
      id: `${caseData.caseId}-archived`,
      caseId: caseData.caseId,
      type: "case_archived",
      actorName: "System",
      actorRole: "system",
      message: "Case archived.",
      createdAt: caseData.updatedAt,
    })
  }

  const caseActivities = (activities || []).filter((a) => a.caseId === caseData.caseId)
  return [...systemEvents, ...caseActivities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
