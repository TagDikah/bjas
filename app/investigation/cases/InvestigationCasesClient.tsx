"use client"

import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BellRing, Clock3, Search, SearchCheck } from "lucide-react"
import { InvestigationShell } from "@/components/investigation-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  district?: string
  charge?: string
  status: string
  createdAt?: string
  updatedAt?: string
  policeSections?: {
    sectionA?: Record<string, any>
    sectionB?: Record<string, any>
    sectionC?: Record<string, any>
    [key: string]: any
  }
}

type InvestigationEntry = {
  id: string
  type: string
  title: string
  summary?: string
  createdAt: string
  createdById?: string
  createdByName?: string
  data: Record<string, any>
}

type UploadedAttachment = {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  lastModified: number
  dataUrl: string
}

function statusLabel(s: string) {
  switch (s) {
    case "pending_investigation":
      return "Pending Intake"
    case "in_investigation":
      return "In Investigation"
    case "pending_commissioner":
      return "Pending Commissioner"
    case "submitted_to_commissioner":
      return "Submitted to Commissioner"
    case "commissioner_clarification":
      return "Clarification"
    case "rejected":
      return "Rejected"
    default:
      return s
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function parseLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function prettyDate(value?: string) {
  if (!value) return "N/A"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

function visibleCaseReference(caseData: AppCase | null | undefined) {
  return caseData?.caseNumber || "Protected reference"
}

function getLatestInvestigationUpdateTime(caseData: AppCase | null | undefined) {
  const sectionB = caseData?.policeSections?.sectionB || {}
  const sectionC = caseData?.policeSections?.sectionC || {}
  const appendEntries = (sectionB?.appendEntries || []) as InvestigationEntry[]
  const documentationEntries = (sectionC?.documentationEntries || []) as InvestigationEntry[]

  const timestamps = [
    sectionB?.initialCapture?.savedAt,
    sectionC?.lastDocumentationAt,
    sectionC?.latestClarificationResponseAt,
    ...appendEntries.map((entry) => entry.createdAt),
    ...documentationEntries.map((entry) => entry.createdAt),
  ]
    .filter(Boolean)
    .map((value) => new Date(String(value)).getTime())
    .filter((value) => Number.isFinite(value))

  return timestamps.length > 0 ? Math.max(...timestamps) : 0
}

function getRouteMeta(status: string) {
  if (status === "pending_investigation") {
    return {
      label: "Ready for initial intake",
      icon: BellRing,
      panelClass: "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.12))]",
      badgeClass: "bg-cyan-400/18 text-cyan-100",
    }
  }

  if (status === "in_investigation") {
    return {
      label: "Active investigation in progress",
      icon: SearchCheck,
      panelClass: "border-fuchsia-200/18 bg-[linear-gradient(135deg,rgba(111,109,255,0.18),rgba(203,93,240,0.12))]",
      badgeClass: "bg-fuchsia-400/18 text-fuchsia-100",
    }
  }

  return {
    label: "Available for review and follow-up",
    icon: Clock3,
    panelClass: "border-amber-300/18 bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(245,158,11,0.1))]",
    badgeClass: "bg-amber-400/18 text-amber-100",
  }
}

function getCommissionerReadiness(caseData: AppCase) {
  const sectionB = caseData?.policeSections?.sectionB || {}
  const sectionC = caseData?.policeSections?.sectionC || {}
  const appendEntries = (sectionB?.appendEntries || []) as InvestigationEntry[]
  const documentationEntries = (sectionC?.documentationEntries || []) as InvestigationEntry[]
  const caseStatus = String(caseData?.status || "")

  const hasInitialCapture = Boolean(sectionB?.initialCapture)
  const hasWitness = appendEntries.some((entry) => entry.type === "witness")
  const hasEvidence = appendEntries.some((entry) => entry.type === "evidence")
  const hasAction = appendEntries.some((entry) => entry.type === "action")
  const hasDocumentationReport = documentationEntries.length > 0
  const hasClarificationResponse = appendEntries.some((entry) => entry.type === "clarification_response")
  const inReturnFlow = caseStatus === "commissioner_clarification" || caseStatus.includes("rejected")

  const checks = [
    {
      key: "report",
      label: inReturnFlow
        ? "Section C documentation report added (Optional in clarification/rejected flow)"
        : "Section C documentation report added (Required)",
      ok: hasDocumentationReport || inReturnFlow,
    },
    ...(inReturnFlow
      ? [
          {
            key: "clarification",
            label: "Clarification response/new update saved",
            ok: hasClarificationResponse || hasDocumentationReport,
          },
        ]
      : []),
    { key: "initial", label: "Section B initial investigation saved", ok: hasInitialCapture },
    { key: "witness", label: "At least one witness entry added (Optional)", ok: hasWitness },
    { key: "evidence", label: "At least one evidence entry added (Optional)", ok: hasEvidence },
    { key: "action", label: "At least one investigation action added (Optional)", ok: hasAction },
  ]

  return {
    // Normal flow: Section C required. Clarification/rejected return flow: Section C optional.
    ready: inReturnFlow ? hasClarificationResponse || hasDocumentationReport : hasDocumentationReport,
    checks,
  }
}

function HistoryEntryCard({ entry }: { entry: InvestigationEntry }) {
  return (
    <div className="rounded-[0.95rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.96),rgba(11,20,40,0.98))] p-3 shadow-[0_12px_26px_rgba(4,10,28,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-semibold text-white">{entry.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-400/14 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
              {entry.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
          Record
        </div>
      </div>

      <div className="mt-2.5 line-clamp-2 rounded-[0.85rem] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-white/78">
        {entry.summary || "No summary"}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/50">
        <span>{prettyDate(entry.createdAt)}</span>
        <span className="text-white/25">•</span>
        <span>{entry.createdByName || "Unknown"}</span>
      </div>
    </div>
  )
}

export default function InvestigationCasesClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const tab = sp.get("tab") || "pending"
  const selectedCaseId = sp.get("caseId") || ""
  const stageParam = sp.get("stage") || ""

  const [q, setQ] = React.useState("")
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null)

  const store = useStore() as any
  const getAllCases = store.getAllCases ?? (() => [])
  const startInvestigation = store.startInvestigation ?? (() => {})
  const submitToCommissioner = store.submitToCommissioner ?? (() => {})
  const updateCase = store.updateCase ?? (() => {})
  const appendCaseActivity = store.appendCaseActivity ?? (() => {})
  const currentUser = store.currentUser
  const all = (getAllCases() ?? []) as AppCase[]
  const isCaseOwnedByCurrentInvestigator = React.useCallback(
    (caseData: AppCase) => {
      if (!currentUser?.id) return false
      const sectionB = caseData?.policeSections?.sectionB || {}
      const sectionC = caseData?.policeSections?.sectionC || {}
      const lastClar = Array.isArray(sectionC?.clarificationRequests) ? sectionC.clarificationRequests[0] : null
      const ownerId = String(
        sectionC?.submittedToCommissionerById ||
          sectionB?.investigatorId ||
          sectionB?.initialCapture?.savedById ||
          ""
      ).trim()
      const targetClarificationId = String(
        sectionC?.latestClarificationTargetInvestigatorId ||
          lastClar?.targetInvestigatorId ||
          ""
      ).trim()
      return ownerId === currentUser.id || targetClarificationId === currentUser.id
    },
    [currentUser?.id]
  )

  const [sectionBForm, setSectionBForm] = React.useState({
    incidentSummary: "",
    incidentDescription: "",
    modusOperandi: "",
    dateOfOffence: "",
    timeOfOffence: "",
    placeOfOffence: "",
    district: "",
    villageTownArea: "",
    exactSceneDescription: "",
    sceneVisited: "",
    sceneVisitDate: "",
    sceneVisitTime: "",
  })

  const [personsOfInterestText, setPersonsOfInterestText] = React.useState("")
  const [propertyExhibitsText, setPropertyExhibitsText] = React.useState("")

  const [witnessForm, setWitnessForm] = React.useState({
    fullName: "",
    contactNumber: "",
    relationshipToCase: "",
    statementSummary: "",
  })
  const [evidenceForm, setEvidenceForm] = React.useState({
    itemNumber: "",
    evidenceType: "",
    description: "",
    whereFound: "",
    chainRef: "",
  })
  const [uploadForm, setUploadForm] = React.useState({
    fileName: "",
    fileType: "",
    category: "",
    shortDescription: "",
    confidentiality: "public_safe",
    uploadedFiles: [] as UploadedAttachment[],
  })
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [noteForm, setNoteForm] = React.useState("")
  const [actionForm, setActionForm] = React.useState({
    actionTaken: "",
    result: "",
    nextStep: "",
    remarks: "",
  })
  const [suspectUpdateForm, setSuspectUpdateForm] = React.useState({
    suspectName: "",
    suspectStatus: "",
    suspectNote: "",
  })

  const [sectionCForm, setSectionCForm] = React.useState({
    processDocumentation: "",
    budgetUsed: "",
    budgetBreakdown: "",
    reportRemarks: "",
    recommendation: "",
  })
  const [clarificationReply, setClarificationReply] = React.useState("")

  const [quickPanel, setQuickPanel] = React.useState("overview")
  const [focusSendCase, setFocusSendCase] = React.useState(false)
  const [sectionBStep, setSectionBStep] = React.useState(0)
  const [sectionBLockedThrough, setSectionBLockedThrough] = React.useState(-1)
  const [sectionBNextArmed, setSectionBNextArmed] = React.useState(false)
  const [sectionBStepMessage, setSectionBStepMessage] = React.useState<string | null>(null)
  const seededCaseIdRef = React.useRef<string>("")
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null)
  const sectionBSteps = ["Identification", "Incident", "Scene", "Persons & Property"]
  const hasInvestigationData = (caseData: AppCase) => {
    const sectionB = caseData?.policeSections?.sectionB || {}
    const sectionC = caseData?.policeSections?.sectionC || {}
    return Boolean(
      sectionB?.initialCapture ||
      sectionB?.investigationStartedAt ||
      (Array.isArray(sectionB?.appendEntries) && sectionB.appendEntries.length > 0) ||
      (Array.isArray(sectionC?.documentationEntries) && sectionC.documentationEntries.length > 0)
    )
  }
  const effectiveStatus = (caseData: AppCase) =>
    (caseData.status === "pending_investigation" && hasInvestigationData(caseData)) ||
    caseData.status === "commissioner_clarification"
      ? "in_investigation"
      : caseData.status

  const filteredByTab = all.filter((c: AppCase) => {
    if (tab === "pending") return c.status === "pending_investigation" && !hasInvestigationData(c)
    if (tab === "active") {
      return (
        ((c.status === "in_investigation" || (c.status === "pending_investigation" && hasInvestigationData(c))) &&
          isCaseOwnedByCurrentInvestigator(c)) ||
        (c.status === "commissioner_clarification" && isCaseOwnedByCurrentInvestigator(c))
      )
    }
    if (tab === "sent") {
      return (
        (c.status === "pending_commissioner" || c.status === "submitted_to_commissioner") &&
          isCaseOwnedByCurrentInvestigator(c)
      )
    }
    if (tab === "clarifications") {
      return c.status === "commissioner_clarification" && isCaseOwnedByCurrentInvestigator(c)
    }
    if (tab === "rejected") {
      return String(c.status || "").includes("rejected") && isCaseOwnedByCurrentInvestigator(c)
    }
    return true
  })

  const filtered = filteredByTab.filter((c: AppCase) => {
    const a = c.policeSections?.sectionA || {}
    const hay = [
      c.caseNumber,
      c.caseId,
      a.crimeNo,
      a.aggrievedFullName,
      a.reportingPersonFullName,
      a.suspectDetails,
      a.whereCommitted,
      a.whereCommittedSpecify,
      a.modusOperandi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(q.toLowerCase())
  })

  const selectedCase =
    all.find((c) => c.caseId === selectedCaseId) ||
    filtered.find((c) => c.caseId === selectedCaseId) ||
    null
  const visibleCases = selectedCase ? filtered.filter((c) => c.caseId === selectedCase.caseId) : filtered

  const sectionA = selectedCase?.policeSections?.sectionA || {}
  const sectionB = selectedCase?.policeSections?.sectionB || {}
  const sectionC = selectedCase?.policeSections?.sectionC || {}
  const clarificationRequests = Array.isArray(sectionC?.clarificationRequests) ? sectionC.clarificationRequests : []
  const latestClarification = clarificationRequests[0] || null
  const selectedCaseStatus = selectedCase ? effectiveStatus(selectedCase) : ""

  const initialInvestigationLocked = !!sectionB?.initialCapture
  const appendedEntries = (sectionB?.appendEntries || []) as InvestigationEntry[]
  const sectionCEntries = (sectionC?.documentationEntries || []) as InvestigationEntry[]
  const rejectionInfo = (selectedCase as any)?.rejectionInfo || {}
  const rejectionReason =
    String(
      rejectionInfo?.rejectionReasonPublic ||
      rejectionInfo?.rejectionReason ||
      (selectedCase as any)?.commissionerDecision?.notes ||
      ""
    ).trim() || "No rejection reason was recorded."
  const readiness = selectedCase ? getCommissionerReadiness(selectedCase) : null
  const lastSubmittedToCommissionerAt = new Date(String(sectionC?.submittedToCommissionerAt || 0)).getTime()
  const latestInvestigationUpdateAt = getLatestInvestigationUpdateTime(selectedCase)
  const hasUpdatesAfterCommissionerSubmission =
    latestInvestigationUpdateAt > 0 &&
    lastSubmittedToCommissionerAt > 0 &&
    latestInvestigationUpdateAt > lastSubmittedToCommissionerAt
  const canSendToCommissioner = Boolean(
    selectedCase &&
      (
        selectedCaseStatus === "in_investigation" ||
        String(selectedCase?.status || "").includes("rejected") ||
        ((selectedCaseStatus === "pending_commissioner" || selectedCaseStatus === "submitted_to_commissioner") &&
          hasUpdatesAfterCommissionerSubmission)
      )
  )
  const nextStepLabel = !selectedCase
    ? ""
    : !initialInvestigationLocked
      ? "Finish Section B and save the initial investigation record."
      : latestClarification
        ? "Add clarification or Section C, then send the case back to Police Commissioner."
        : !(readiness?.ready)
          ? "Complete Section C report, then send the case to Police Commissioner."
          : canSendToCommissioner
            ? hasUpdatesAfterCommissionerSubmission
              ? "New investigation information was added after the last submission. Re-send the updated docket to Police Commissioner."
              : "Case is ready. Send it to Police Commissioner now."
            : "Case has already moved beyond the send step."

  React.useEffect(() => {
    if (!selectedCase) {
      seededCaseIdRef.current = ""
      setFocusSendCase(false)
      return
    }
    if (initialInvestigationLocked) return
    if (seededCaseIdRef.current === selectedCase.caseId) return

    seededCaseIdRef.current = selectedCase.caseId
    setSectionBForm((prev) => ({
      ...prev,
      incidentSummary: prev.incidentSummary || sectionA.summary || sectionA.modusOperandi || "",
      incidentDescription: prev.incidentDescription || sectionA.complainantStatement || "",
      modusOperandi: prev.modusOperandi || sectionA.modusOperandi || "",
      dateOfOffence: prev.dateOfOffence || sectionA.whenFromDate || "",
      timeOfOffence: prev.timeOfOffence || sectionA.whenFromTime || "",
      placeOfOffence: prev.placeOfOffence || sectionA.whereCommittedSpecify || sectionA.whereCommitted || "",
      district: prev.district || selectedCase.district || "",
      villageTownArea: prev.villageTownArea || "",
      exactSceneDescription: prev.exactSceneDescription || "",
      sceneVisited: prev.sceneVisited || "",
      sceneVisitDate: prev.sceneVisitDate || "",
      sceneVisitTime: prev.sceneVisitTime || "",
    }))
  }, [selectedCaseId, selectedCase, initialInvestigationLocked, sectionA, selectedCase?.district])

  React.useEffect(() => {
    setSectionBStep(0)
    setSectionBLockedThrough(-1)
    setSectionBNextArmed(false)
    setSectionBStepMessage(null)
  }, [selectedCaseId])

  React.useEffect(() => {
    if (!selectedCase) return
    if (initialInvestigationLocked) return
    if (selectedCaseStatus !== "in_investigation") return
    if (stageParam !== "4") return

    // Continue flow: jump straight to Part 4 and keep earlier parts locked.
    setSectionBStep(3)
    setSectionBLockedThrough(2)
    setSectionBNextArmed(false)
    setSectionBStepMessage("Continue mode: opened at Part 4.")
  }, [selectedCaseId, selectedCase, selectedCaseStatus, initialInvestigationLocked, stageParam])

  React.useEffect(() => {
    if (!selectedCase) return
    if (selectedCaseStatus === "in_investigation" && initialInvestigationLocked) {
      if (focusSendCase) return
      setFocusSendCase(false)
      setQuickPanel("witness")
    }
  }, [selectedCaseId, selectedCase, selectedCaseStatus, initialInvestigationLocked, focusSendCase])

  React.useEffect(() => {
    if (!selectedCase) return
    if (selectedCaseStatus !== "in_investigation") return
    if (initialInvestigationLocked) return
    if (!currentUser) return

    const now = new Date().toISOString()
    withCasePatch(selectedCase.caseId, (fresh) => {
      const sections = fresh.policeSections || {}
      const sA = sections.sectionA || {}
      const sB = sections.sectionB || {}
      if (sB?.initialCapture) return {}
      return {
        policeSections: {
          ...sections,
          sectionB: {
            ...sB,
            initialCapture: {
              incidentSummary: sA.summary || sA.modusOperandi || "",
              incidentDescription: sA.complainantStatement || "",
              modusOperandi: sA.modusOperandi || "",
              dateOfOffence: sA.whenFromDate || "",
              timeOfOffence: sA.whenFromTime || "",
              placeOfOffence: sA.whereCommittedSpecify || sA.whereCommitted || "",
              district: fresh.district || "",
              villageTownArea: "",
              exactSceneDescription: "",
              sceneVisited: "",
              sceneVisitDate: "",
              sceneVisitTime: "",
              personsOfInterest: [],
              propertyExhibits: [],
              investigationStartDate: now,
              investigatingOfficerName: currentUser.name,
              investigatingOfficerNumber: currentUser.badge || currentUser.badgeNumber || "",
              policeStationDepartment: currentUser.station || currentUser.department || "",
              assignedUnit: currentUser.department || "Investigation",
              currentStatus: "in_investigation",
              currentPhase: "investigation",
              savedAt: now,
              savedById: currentUser.id,
              savedByName: currentUser.name,
            },
          },
        },
      }
    })
  }, [selectedCaseId, selectedCase, selectedCaseStatus, initialInvestigationLocked, currentUser])

  React.useEffect(() => {
    if (!selectedCase) return
    if (selectedCase.status === "pending_investigation" && hasInvestigationData(selectedCase)) {
      updateCase(selectedCase.caseId, { status: "in_investigation" })
    }
  }, [selectedCaseId, selectedCase, updateCase])

  React.useEffect(() => {
    const pendingWithData = all.filter(
      (c: AppCase) => c.status === "pending_investigation" && hasInvestigationData(c)
    )
    if (pendingWithData.length === 0) return
    pendingWithData.forEach((c) => updateCase(c.caseId, { status: "in_investigation" }))
  }, [all, updateCase])

  const withCasePatch = (caseId: string, transform: (c: AppCase) => Partial<AppCase>) => {
    const fresh = (getAllCases() as AppCase[]).find((c) => c.caseId === caseId)
    if (!fresh) return
    updateCase(caseId, transform(fresh))
  }

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`))
      reader.readAsDataURL(file)
    })

  const handleUploadSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    try {
      setUploadError(null)
      const uploadedFiles = await Promise.all(
        files.map(async (file) => ({
          id: makeId("upload"),
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          lastModified: file.lastModified,
          dataUrl: await readFileAsDataUrl(file),
        }))
      )

      setUploadForm((prev) => ({
        ...prev,
        fileName: prev.fileName || uploadedFiles[0]?.fileName || "",
        fileType: prev.fileType || uploadedFiles[0]?.fileType || "",
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
      }))
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to load selected files.")
    } finally {
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const removeUploadFile = (fileId: string) => {
    setUploadForm((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((file) => file.id !== fileId),
    }))
  }

  const saveInitialInvestigation = (panelAfterSave?: string) => {
    if (!selectedCase || !currentUser || initialInvestigationLocked) return

    if (selectedCase.status === "pending_investigation") {
      startInvestigation(selectedCase.caseId, currentUser)
    }

    const now = new Date().toISOString()
    const initialCapture = {
      ...sectionBForm,
      investigationStartDate: now,
      investigatingOfficerName: currentUser.name,
      investigatingOfficerNumber: currentUser.badge || currentUser.badgeNumber || "",
      policeStationDepartment: currentUser.station || currentUser.department || "",
      assignedUnit: currentUser.department || "Investigation",
      currentStatus: "in_investigation",
      currentPhase: "investigation",
      personsOfInterest: parseLines(personsOfInterestText),
      propertyExhibits: parseLines(propertyExhibitsText),
      savedAt: now,
      savedById: currentUser.id,
      savedByName: currentUser.name,
    }

    withCasePatch(selectedCase.caseId, (fresh) => {
      const currentSections = fresh.policeSections || {}
      const currentSectionB = currentSections.sectionB || {}

      return {
        status: "in_investigation",
        policeSections: {
          ...currentSections,
          sectionB: {
            ...currentSectionB,
            investigationStartedAt: currentSectionB.investigationStartedAt || now,
            investigatorId: currentUser.id,
            investigatorName: currentUser.name,
            investigatorNumber: currentUser.badge || currentUser.badgeNumber || "",
            initialCapture,
          },
        },
      }
    })

    appendCaseActivity({
      caseId: selectedCase.caseId,
      type: "investigation_started",
      actorName: currentUser.name,
      actorRole: "internal",
      message: "Initial investigation capture saved and locked (append-only).",
      metadata: {
        section: "B",
        personsOfInterestCount: parseLines(personsOfInterestText).length,
        propertyExhibitsCount: parseLines(propertyExhibitsText).length,
      },
    })

    setSaveMessage("Section B saved. Record is now view-only. Additions can be appended below.")
    router.push(`/investigation/cases?tab=active&caseId=${selectedCase.caseId}`)
    if (panelAfterSave) setQuickPanel(panelAfterSave)
  }

  const advanceSectionBStep = () => {
    if (initialInvestigationLocked) return
    const isLast = sectionBStep >= sectionBSteps.length - 1
    if (isLast) return

    if (!sectionBNextArmed) {
      setSectionBNextArmed(true)
      setSectionBStepMessage("Please confirm this step is complete, then click Next again to continue.")
      return
    }

    setSectionBLockedThrough((prev) => Math.max(prev, sectionBStep))
    setSectionBStep((prev) => Math.min(sectionBSteps.length - 1, prev + 1))
    setSectionBNextArmed(false)
    setSectionBStepMessage("Step locked. You cannot go back to previous steps.")
  }

  const sendDocketToCommissioner = (caseData: AppCase) => {
    if (!currentUser) return
    let latestCase =
      ((getAllCases() as AppCase[]).find((item) => item.caseId === caseData.caseId) as AppCase | undefined) ||
      caseData

    let readiness = getCommissionerReadiness(latestCase)
    if (!readiness.ready) {
      const canAutoSaveSectionC =
        !!selectedCase &&
        selectedCase.caseId === caseData.caseId &&
        (sectionCForm.processDocumentation.trim().length > 0 || sectionCForm.budgetUsed.trim().length > 0)

      if (canAutoSaveSectionC) {
        const entry: InvestigationEntry = {
          id: makeId("inv-doc"),
          type: "documentation_report",
          title: "Documentation & Budget Report",
          summary: sectionCForm.recommendation || "Investigation process report captured.",
          createdAt: new Date().toISOString(),
          createdById: currentUser.id,
          createdByName: currentUser.name,
          data: {
            ...sectionCForm,
          },
        }

        withCasePatch(caseData.caseId, (fresh) => {
          const sections = fresh.policeSections || {}
          const sC = sections.sectionC || {}
          const existing = (sC.documentationEntries || []) as InvestigationEntry[]
          return {
            policeSections: {
              ...sections,
              sectionC: {
                ...sC,
                documentationEntries: [entry, ...existing],
                lastDocumentationAt: entry.createdAt,
                lastDocumentationByName: currentUser.name,
              },
            },
          }
        })

        appendCaseActivity({
          caseId: caseData.caseId,
          type: "public_additional_info",
          actorName: currentUser.name,
          actorRole: "internal",
          message: "Section C documentation auto-saved during commissioner submission.",
          metadata: { appendType: "documentation_report", entryId: entry.id },
        })

        setSectionCForm({
          processDocumentation: "",
          budgetUsed: "",
          budgetBreakdown: "",
          reportRemarks: "",
          recommendation: "",
        })

        latestCase =
          ((getAllCases() as AppCase[]).find((item) => item.caseId === caseData.caseId) as AppCase | undefined) ||
          latestCase
        readiness = getCommissionerReadiness(latestCase)
      }
    }

    if (!readiness.ready) {
      const isReturnFlow =
        latestCase.status === "commissioner_clarification" ||
        String(latestCase.status || "").includes("rejected")
      setSaveMessage(
        isReturnFlow
          ? "Case is not ready for commissioner. Save clarification response (or Section C report) first."
          : "Case is not ready for commissioner. Save Section C documentation report first."
      )
      return
    }

    const docEntries = (latestCase?.policeSections?.sectionC?.documentationEntries || []) as InvestigationEntry[]
    const latestRecommendation = String(docEntries?.[0]?.data?.recommendation || "").trim()
    submitToCommissioner(
      latestCase.caseId,
      currentUser,
      latestRecommendation || "Investigation docket completed and submitted to commissioner."
    )
    setSaveMessage("Docket sent to Police Commissioner successfully.")
  }

  const appendToSectionB = (
    type: string,
    title: string,
    summary: string,
    data: Record<string, any>,
    clear: () => void
  ) => {
    if (!selectedCase || !currentUser || !initialInvestigationLocked) return

    const entry: InvestigationEntry = {
      id: makeId("inv"),
      type,
      title,
      summary,
      createdAt: new Date().toISOString(),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      data,
    }

    withCasePatch(selectedCase.caseId, (fresh) => {
      const sections = fresh.policeSections || {}
      const sB = sections.sectionB || {}
      const existing = (sB.appendEntries || []) as InvestigationEntry[]

      return {
        policeSections: {
          ...sections,
          sectionB: {
            ...sB,
            appendEntries: [entry, ...existing],
          },
        },
      }
    })

    appendCaseActivity({
      caseId: selectedCase.caseId,
      type: "public_additional_info",
      actorName: currentUser.name,
      actorRole: "internal",
      message: `${title} appended to investigation.`,
      metadata: { appendType: type, entryId: entry.id },
    })

    clear()
    setFocusSendCase(false)
    setSaveMessage(`${title} saved as new append-only entry.`)
  }

  const appendSectionCDocumentation = () => {
    if (!selectedCase || !currentUser || !initialInvestigationLocked) return
    if (!sectionCForm.processDocumentation.trim() && !sectionCForm.budgetUsed.trim()) return

    const entry: InvestigationEntry = {
      id: makeId("inv-doc"),
      type: "documentation_report",
      title: "Documentation & Budget Report",
      summary: sectionCForm.recommendation || "Investigation process report captured.",
      createdAt: new Date().toISOString(),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      data: {
        ...sectionCForm,
      },
    }

    withCasePatch(selectedCase.caseId, (fresh) => {
      const sections = fresh.policeSections || {}
      const sC = sections.sectionC || {}
      const existing = (sC.documentationEntries || []) as InvestigationEntry[]

      return {
        policeSections: {
          ...sections,
          sectionC: {
            ...sC,
            documentationEntries: [entry, ...existing],
            lastDocumentationAt: entry.createdAt,
            lastDocumentationByName: currentUser.name,
          },
        },
      }
    })

    appendCaseActivity({
      caseId: selectedCase.caseId,
      type: "public_additional_info",
      actorName: currentUser.name,
      actorRole: "internal",
      message: "Section C documentation and budget report appended.",
      metadata: { appendType: "documentation_report", entryId: entry.id },
    })

    setSectionCForm({
      processDocumentation: "",
      budgetUsed: "",
      budgetBreakdown: "",
      reportRemarks: "",
      recommendation: "",
    })
    setSaveMessage("Section C report saved as append-only entry.")
    setQuickPanel("send_case")
    setFocusSendCase(true)
  }

  const saveClarificationResponse = () => {
    if (!selectedCase || !currentUser || !initialInvestigationLocked || !latestClarification) return
    const responseText = clarificationReply.trim()
    if (!responseText) return

    const entry: InvestigationEntry = {
      id: makeId("inv-clar"),
      type: "clarification_response",
      title: "Clarification Response Added",
      summary: responseText,
      createdAt: new Date().toISOString(),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      data: {
        clarificationResponse: responseText,
        forClarificationId: latestClarification.id,
        requestedAt: latestClarification.requestedAt,
      },
    }

    withCasePatch(selectedCase.caseId, (fresh) => {
      const sections = fresh.policeSections || {}
      const sB = sections.sectionB || {}
      const sC = sections.sectionC || {}
      const existing = (sB.appendEntries || []) as InvestigationEntry[]
      return {
        policeSections: {
          ...sections,
          sectionB: {
            ...sB,
            appendEntries: [entry, ...existing],
          },
          sectionC: {
            ...sC,
            latestClarificationResponseAt: entry.createdAt,
            latestClarificationResponseById: currentUser.id,
            latestClarificationResponseByName: currentUser.name,
            latestClarificationResponseText: responseText,
          },
        },
      }
    })

    appendCaseActivity({
      caseId: selectedCase.caseId,
      type: "public_additional_info",
      actorName: currentUser.name,
      actorRole: "internal",
      message: "Clarification response saved and ready for re-submission to commissioner.",
      metadata: { appendType: "clarification_response", entryId: entry.id },
    })

    setClarificationReply("")
    setQuickPanel("send_case")
    setFocusSendCase(true)
    setSaveMessage("Clarification response saved. Next step: send the case to Police Commissioner.")
  }

  return (
    <InvestigationShell title="Investigation Queue" contentClassName="space-y-4">
      <div className="space-y-4">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.98),rgba(10,18,39,0.98))] shadow-[0_18px_40px_rgba(4,10,28,0.22)]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#54c7ec,#5b8cff)] shadow-[0_12px_28px_rgba(84,199,236,0.18)]">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/72">Search Queue</div>
                  <div className="mt-1 text-lg font-semibold text-white">Investigation Intake</div>
                  <div className="text-sm text-white/48">Locate dockets quickly before opening investigation steps.</div>
                </div>
              </div>
              <div className="w-full md:max-w-xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
                  <Input
                    className="h-12 rounded-[1rem] border-white/10 bg-[rgba(255,255,255,0.05)] pl-11 text-white placeholder:text-white/34"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by case number, crime no, complainant, suspect, location..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCase ? (
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(24,38,74,0.96),rgba(14,24,48,0.98))] shadow-[0_16px_34px_rgba(4,10,28,0.16)]">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">
                  Selected Case Only: {visibleCaseReference(selectedCase)}
                </div>
                <div className="text-sm text-white/60">
                  Other cases are hidden while you work on this investigation.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/investigation/cases?tab=${tab}`)}
              >
                Show All Cases
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3">
          {visibleCases.map((c: AppCase) => {
            const a = c.policeSections?.sectionA || {}
            const sectionCRow = c.policeSections?.sectionC || {}
            const cardStatus = c.status === "commissioner_clarification" ? "commissioner_clarification" : effectiveStatus(c)
            const routeMeta = getRouteMeta(cardStatus)
            const RouteIcon = routeMeta.icon
            return (
              <Card
                key={c.caseId}
                className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.98))] shadow-[0_18px_40px_rgba(4,10,28,0.22)] transition hover:-translate-y-0.5 hover:border-white/18"
              >
                <CardContent className="p-0">
                  <div className="grid gap-0 lg:grid-cols-[1.35fr_0.9fr]">
                    <div className="border-b border-white/8 p-4 lg:border-b-0 lg:border-r">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-white">
                            {visibleCaseReference(c)}
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/46">Investigation Docket</div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            cardStatus === "pending_investigation"
                              ? "border-cyan-300/20 bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)] text-white"
                              : cardStatus === "in_investigation"
                                ? "border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] text-white"
                                : "border-white/10 bg-[rgba(255,255,255,0.08)] text-white"
                          }
                        >
                          {statusLabel(cardStatus)}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-[0.95rem] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Crime No</div>
                          <div className="mt-1 text-sm font-medium text-white">{a.crimeNo || "Not saved"}</div>
                        </div>
                        <div className="rounded-[0.95rem] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Reported</div>
                          <div className="mt-1 text-sm font-medium text-white">
                            {a.dateReported || "-"} {a.timeReported || ""}
                          </div>
                        </div>
                        <div className="rounded-[0.95rem] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Alleged Crime</div>
                          <div className="mt-1 text-sm font-medium text-white">{a.allegedCrime || "Unknown"}</div>
                        </div>
                        <div className="rounded-[0.95rem] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Location</div>
                          <div className="mt-1 text-sm font-medium text-white">{a.whereCommitted || a.whereCommittedSpecify || "Unknown"}</div>
                        </div>
                      </div>

                      {sectionCRow?.latestClarificationResponseAt ? (
                        <div className="mt-3 text-xs text-white/50">
                          Clarification sent: {prettyDate(sectionCRow.latestClarificationResponseAt)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col justify-between gap-3 p-4">
                      <div className={`rounded-[1rem] border px-3 py-3 ${routeMeta.panelClass}`}>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Case Route</div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`grid h-8 w-8 place-items-center rounded-[0.8rem] ${routeMeta.badgeClass}`}>
                            <RouteIcon className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-white">{routeMeta.label}</div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Badge
                          variant="secondary"
                          className="w-fit border-white/10 bg-[rgba(255,255,255,0.08)] text-white"
                        >
                          {statusLabel(cardStatus)}
                        </Badge>

                        {cardStatus === "pending_investigation" ? (
                          <Button
                            size="sm"
                            className="w-full justify-between rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white shadow-[0_14px_30px_rgba(88,74,210,0.24)] hover:brightness-110 hover:!text-white"
                            onClick={() => {
                              if (currentUser) {
                                startInvestigation(c.caseId, currentUser)
                              }
                              router.push(`/investigation/cases?tab=active&caseId=${c.caseId}`)
                            }}
                          >
                            <span>Start Investigation</span>
                            <span>+</span>
                          </Button>
                        ) : (
                          <Button asChild size="sm" className="w-full justify-between rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white shadow-[0_14px_30px_rgba(88,74,210,0.24)] hover:brightness-110 hover:!text-white">
                            <Link
                              href={`/investigation/cases?tab=${
                                c.status === "commissioner_clarification"
                                  ? "clarifications"
                                  : String(c.status || "").includes("rejected")
                                    ? "rejected"
                                    : "active"
                              }&caseId=${c.caseId}&stage=4`}
                            >
                              <span>{cardStatus === "in_investigation" ? "Open Investigation Steps" : "Open Case"}</span>
                              <span>+</span>
                            </Link>
                          </Button>
                        )}

                        {(effectiveStatus(c) === "in_investigation" || String(c.status || "").includes("rejected")) && currentUser && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-between rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white shadow-[0_12px_26px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white"
                            onClick={() => sendDocketToCommissioner(c)}
                            title="Send docket to Police Commissioner"
                          >
                            <span>Send to Commissioner</span>
                            <span>+</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {visibleCases.length === 0 && (
            <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">No cases match your search.</div>
          )}
        </div>

        {selectedCase ? (
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_18px_40px_rgba(4,10,28,0.22)]">
            <CardHeader>
              <CardTitle className="text-white">Investigation Steps: {visibleCaseReference(selectedCase)}</CardTitle>
              <CardDescription className="text-white/58">
                Work on one case at a time. Saved records are locked, and all new details are added as append-only updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveMessage ? (
                <div className="rounded-[1rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(84,199,236,0.16),rgba(91,140,255,0.1))] p-3 text-sm text-white">
                  {saveMessage}
                </div>
              ) : null}

              <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(21,35,68,0.96),rgba(12,22,43,0.98))]">
                <CardHeader>
                  <CardTitle className="text-white">Next Step</CardTitle>
                  <CardDescription className="text-white/58">Follow this simple flow to move the case forward.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="rounded-[1rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,rgba(111,109,255,0.18),rgba(203,93,240,0.12))] p-3 font-medium text-white">
                    {nextStepLabel}
                  </div>
                  <div className="text-white/55">
                    Order: Section B initial record {"->"} append new information {"->"} Section C report {"->"} send to Police Commissioner.
                  </div>
                </CardContent>
              </Card>

              {!focusSendCase ? (
              <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(21,35,68,0.96),rgba(12,22,43,0.98))]">
                <CardHeader>
                  <CardTitle className="text-white">Case Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { label: "Case Reference", value: visibleCaseReference(selectedCase) },
                    { label: "Docket / Case No", value: selectedCase.caseNumber || "N/A" },
                    { label: "Crime Type", value: sectionA.allegedCrime || selectedCase.charge || "N/A" },
                    { label: "Status", value: statusLabel(selectedCaseStatus) },
                    { label: "Place", value: sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A" },
                    { label: "Date Opened", value: prettyDate(selectedCase.createdAt) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[0.95rem] border border-white/8 bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">{item.label}</div>
                      <div className="mt-1.5 text-sm font-medium text-white">{item.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              ) : null}

              {selectedCaseStatus === "in_investigation" && latestClarification ? (
                <Card className="border-warning/40">
                  <CardHeader>
                    <CardTitle>Commissioner Clarification Request (Internal)</CardTitle>
                    <CardDescription>
                      This statement is internal and attached to this case record for follow-up.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="rounded-md border border-warning/40 bg-warning/10 p-3 whitespace-pre-wrap">
                      {latestClarification.statement || "No clarification statement provided."}
                    </div>
                    <div className="text-muted-foreground">
                      Requested by {latestClarification.requestedByName || "Commissioner"} on{" "}
                      {prettyDate(latestClarification.requestedAt)}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {selectedCaseStatus === "in_investigation" && latestClarification ? (
                <Card className="border-warning/30">
                  <CardHeader>
                    <CardTitle>Add Clarification</CardTitle>
                    <CardDescription>
                      Respond to the commissioner clarification request. This will be saved as a new append-only entry.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Textarea
                      rows={4}
                      placeholder="Write clarification response and additional details..."
                      value={clarificationReply}
                      onChange={(e) => setClarificationReply(e.target.value)}
                    />
                    <Button
                      onClick={saveClarificationResponse}
                      disabled={!clarificationReply.trim()}
                    >
                      Save Clarification
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {String(selectedCase?.status || "").includes("rejected") ? (
                <Card className="border-destructive/40">
                  <CardHeader>
                    <CardTitle>Rejection Reason (Internal)</CardTitle>
                    <CardDescription>
                      This case was rejected. Review reason before adding follow-up information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 whitespace-pre-wrap">
                      {rejectionReason}
                    </div>
                    <div className="text-muted-foreground">
                      Rejected by {rejectionInfo?.rejectedByName || (selectedCase as any)?.commissionerDecision?.byName || "Commissioner"} on{" "}
                      {prettyDate(rejectionInfo?.rejectedAt || (selectedCase as any)?.commissionerDecision?.at)}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(21,35,68,0.96),rgba(12,22,43,0.98))]">
                <CardHeader>
                  <CardTitle className="text-white">Ready to Send to Police Commissioner</CardTitle>
                  <CardDescription className="text-white/58">
                    {canSendToCommissioner
                      ? hasUpdatesAfterCommissionerSubmission
                        ? "New append-only information exists after the last commissioner submission. Review and re-send the updated docket."
                        : "Complete the required items below. As soon as Section C is saved, the final send step opens immediately."
                      : "This case is no longer waiting at the final send step."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 lg:grid-cols-2">
                    {readiness?.checks.map((check) => (
                      <div
                        key={check.key}
                        className={[
                          "rounded-[0.95rem] border px-3 py-2.5",
                          check.ok
                            ? "border-emerald-300/18 bg-[linear-gradient(135deg,rgba(74,222,128,0.14),rgba(34,197,94,0.08))]"
                            : "border-amber-300/18 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(245,158,11,0.08))]",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm leading-5 text-white/88">{check.label}</span>
                          <span className={check.ok ? "shrink-0 rounded-full bg-emerald-400/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100" : "shrink-0 rounded-full bg-amber-400/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100"}>
                            {check.ok ? "Done" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {canSendToCommissioner ? (
                    <Button
                      className="w-full justify-between rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white shadow-[0_14px_30px_rgba(88,74,210,0.24)] hover:brightness-110 hover:!text-white"
                      onClick={() => sendDocketToCommissioner(selectedCase)}
                    >
                      <span>{hasUpdatesAfterCommissionerSubmission ? "Re-send Updated Docket" : "Send Case"}</span>
                      <span>+</span>
                    </Button>
                  ) : readiness?.ready ? (
                    <div className="rounded-[0.95rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.14),rgba(91,140,255,0.08))] px-3 py-3 text-sm text-white/82">
                      Final send action is already completed or this case is already in the next queue.
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {!focusSendCase && !initialInvestigationLocked ? (
              <Card>
                <CardHeader>
                  <CardTitle>Section B: Investigation Capture (Initial Record)</CardTitle>
                  <CardDescription>
                    Includes moved Police Registry items 5 and 6 (Persons of Interest and Property/Exhibits).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!initialInvestigationLocked ? (
                    <div className="space-y-2 rounded-md border border-dashed px-3 py-2 text-sm">
                      <div className="font-medium">
                        Step {sectionBStep + 1} of {sectionBSteps.length}: {sectionBSteps[sectionBStep]}
                      </div>
                      <div className="text-muted-foreground">
                        Completed steps are locked and cannot be edited or revisited.
                      </div>
                      {sectionBStepMessage ? (
                        <div className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs">
                          {sectionBStepMessage}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-3 md:grid-cols-2">
                    {(!initialInvestigationLocked && sectionBStep === 0) || initialInvestigationLocked ? (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Investigation ID</label>
                          <Input value={sectionB.investigationId || `INV-${selectedCase.caseId}`} readOnly />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Investigating Officer Name</label>
                          <Input value={currentUser?.name || ""} readOnly />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Officer Number</label>
                          <Input value={currentUser?.badge || currentUser?.badgeNumber || "N/A"} readOnly />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Station/Department</label>
                          <Input value={currentUser?.station || currentUser?.department || "N/A"} readOnly />
                        </div>
                      </>
                    ) : null}

                    {(!initialInvestigationLocked && sectionBStep === 1) || initialInvestigationLocked ? (
                      <>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Brief Case Summary</label>
                          <Textarea rows={2} value={initialInvestigationLocked ? sectionB.initialCapture?.incidentSummary || "" : sectionBForm.incidentSummary} onChange={(e) => setSectionBForm((p) => ({ ...p, incidentSummary: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Detailed Incident Description</label>
                          <Textarea rows={3} value={initialInvestigationLocked ? sectionB.initialCapture?.incidentDescription || "" : sectionBForm.incidentDescription} onChange={(e) => setSectionBForm((p) => ({ ...p, incidentDescription: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Date of Offence</label>
                          <Input type="date" value={initialInvestigationLocked ? sectionB.initialCapture?.dateOfOffence || "" : sectionBForm.dateOfOffence} onChange={(e) => setSectionBForm((p) => ({ ...p, dateOfOffence: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Time of Offence</label>
                          <Input type="time" value={initialInvestigationLocked ? sectionB.initialCapture?.timeOfOffence || "" : sectionBForm.timeOfOffence} onChange={(e) => setSectionBForm((p) => ({ ...p, timeOfOffence: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Place of Offence</label>
                          <Input value={initialInvestigationLocked ? sectionB.initialCapture?.placeOfOffence || "" : sectionBForm.placeOfOffence} onChange={(e) => setSectionBForm((p) => ({ ...p, placeOfOffence: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">District</label>
                          <Input value={initialInvestigationLocked ? sectionB.initialCapture?.district || "" : sectionBForm.district} onChange={(e) => setSectionBForm((p) => ({ ...p, district: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 1} />
                        </div>
                      </>
                    ) : null}

                    {(!initialInvestigationLocked && sectionBStep === 2) || initialInvestigationLocked ? (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Village / Area / Town</label>
                          <Input value={initialInvestigationLocked ? sectionB.initialCapture?.villageTownArea || "" : sectionBForm.villageTownArea} onChange={(e) => setSectionBForm((p) => ({ ...p, villageTownArea: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 2} />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Scene Visited</label>
                          <Input placeholder="yes/no" value={initialInvestigationLocked ? sectionB.initialCapture?.sceneVisited || "" : sectionBForm.sceneVisited} onChange={(e) => setSectionBForm((p) => ({ ...p, sceneVisited: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 2} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Exact Scene Description</label>
                          <Textarea rows={2} value={initialInvestigationLocked ? sectionB.initialCapture?.exactSceneDescription || "" : sectionBForm.exactSceneDescription} onChange={(e) => setSectionBForm((p) => ({ ...p, exactSceneDescription: e.target.value }))} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 2} />
                        </div>
                      </>
                    ) : null}

                    {(!initialInvestigationLocked && sectionBStep === 3) || initialInvestigationLocked ? (
                      <>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Persons of Interest / Additional Parties (one per line)</label>
                          <Textarea rows={3} value={initialInvestigationLocked ? (sectionB.initialCapture?.personsOfInterest || []).join("\n") : personsOfInterestText} onChange={(e) => setPersonsOfInterestText(e.target.value)} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 3} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted-foreground">Property / Exhibits / Related Items (one per line)</label>
                          <Textarea rows={3} value={initialInvestigationLocked ? (sectionB.initialCapture?.propertyExhibits || []).join("\n") : propertyExhibitsText} onChange={(e) => setPropertyExhibitsText(e.target.value)} readOnly={initialInvestigationLocked || sectionBLockedThrough >= 3} />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {!initialInvestigationLocked ? (
                    <div className="flex flex-wrap gap-2">
                      {sectionBStep < sectionBSteps.length - 1 ? (
                        <Button onClick={advanceSectionBStep}>Next Step</Button>
                      ) : (
                        <>
                          <Button onClick={() => saveInitialInvestigation()}>Save Section B</Button>
                          <Button variant="secondary" onClick={() => saveInitialInvestigation("witness")}>Save and Go to Witnesses</Button>
                          <Button variant="secondary" onClick={() => saveInitialInvestigation("upload")}>Save and Go to Uploads</Button>
                          <Button variant="secondary" onClick={() => saveInitialInvestigation("section_c")}>Save and Go to Section C</Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Initial investigation was saved on {prettyDate(sectionB.initialCapture?.savedAt)} and is now locked.</div>
                  )}
                </CardContent>
              </Card>
              ) : null}

              {!focusSendCase && initialInvestigationLocked ? (
                <>
                  <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(21,35,68,0.96),rgba(12,22,43,0.98))]">
                    <CardHeader>
                      <CardTitle className="text-white">{focusSendCase ? "Final Step" : "Add New Information"}</CardTitle>
                      <CardDescription className="text-white/58">
                        Old records stay unchanged. Additions are saved as new entries, and each step leads to the next one.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {focusSendCase ? (
                        <div className="space-y-3">
                          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
                            Section C was saved. Final step: send the case docket to Police Commissioner now.
                          </div>
                          <Button
                            onClick={() => sendDocketToCommissioner(selectedCase)}
                          >
                            Send to Police Commissioner
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button variant={quickPanel === "witness" ? "default" : "outline"} onClick={() => setQuickPanel("witness")}>1. Witness</Button>
                          <Button variant={quickPanel === "evidence" ? "default" : "outline"} onClick={() => setQuickPanel("evidence")}>2. Evidence</Button>
                          <Button variant={quickPanel === "upload" ? "default" : "outline"} onClick={() => setQuickPanel("upload")}>3. Upload</Button>
                          <Button variant={quickPanel === "note" ? "default" : "outline"} onClick={() => setQuickPanel("note")}>4. Note</Button>
                          <Button variant={quickPanel === "action" ? "default" : "outline"} onClick={() => setQuickPanel("action")}>5. Action</Button>
                          <Button variant={quickPanel === "suspect" ? "default" : "outline"} onClick={() => setQuickPanel("suspect")}>6. Suspect</Button>
                          <Button variant={quickPanel === "section_c" ? "default" : "outline"} onClick={() => setQuickPanel("section_c")}>7. Section C</Button>
                        </div>
                      )}

                      {!focusSendCase && quickPanel === "witness" ? (
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input placeholder="Witness Full Name" value={witnessForm.fullName} onChange={(e) => setWitnessForm((p) => ({ ...p, fullName: e.target.value }))} />
                          <Input placeholder="Contact Number" value={witnessForm.contactNumber} onChange={(e) => setWitnessForm((p) => ({ ...p, contactNumber: e.target.value }))} />
                          <Select value={witnessForm.relationshipToCase} onValueChange={(value) => setWitnessForm((p) => ({ ...p, relationshipToCase: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Relationship to case" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="colleague">Colleague</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="married_spouse">Married/Spouse</SelectItem>
                              <SelectItem value="neighbor">Neighbor</SelectItem>
                              <SelectItem value="employee_employer">Employee/Employer</SelectItem>
                              <SelectItem value="classmate">Classmate</SelectItem>
                              <SelectItem value="no_relationship">No relationship</SelectItem>
                              <SelectItem value="not_known">Not known</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input placeholder="Statement Summary" value={witnessForm.statementSummary} onChange={(e) => setWitnessForm((p) => ({ ...p, statementSummary: e.target.value }))} />
                          <div className="md:col-span-2">
                            <Button onClick={() => appendToSectionB("witness", "Witness Statement Added", witnessForm.statementSummary || "Witness details appended.", witnessForm, () => setWitnessForm({ fullName: "", contactNumber: "", relationshipToCase: "", statementSummary: "" }))}>Save Witness Entry</Button>
                          </div>
                        </div>
                      ) : null}

                      {!focusSendCase && quickPanel === "evidence" ? (<div className="grid gap-2 md:grid-cols-2"><Input placeholder="Evidence Item Number" value={evidenceForm.itemNumber} onChange={(e) => setEvidenceForm((p) => ({ ...p, itemNumber: e.target.value }))} /><Input placeholder="Evidence Type (photo, weapon, report...)" value={evidenceForm.evidenceType} onChange={(e) => setEvidenceForm((p) => ({ ...p, evidenceType: e.target.value }))} /><Input placeholder="Description" value={evidenceForm.description} onChange={(e) => setEvidenceForm((p) => ({ ...p, description: e.target.value }))} /><Input placeholder="Where Found" value={evidenceForm.whereFound} onChange={(e) => setEvidenceForm((p) => ({ ...p, whereFound: e.target.value }))} /><Input className="md:col-span-2" placeholder="Chain of Custody Reference" value={evidenceForm.chainRef} onChange={(e) => setEvidenceForm((p) => ({ ...p, chainRef: e.target.value }))} /><div className="md:col-span-2"><Button onClick={() => appendToSectionB("evidence", "Evidence Item Added", evidenceForm.description || "Evidence appended.", evidenceForm, () => setEvidenceForm({ itemNumber: "", evidenceType: "", description: "", whereFound: "", chainRef: "" }))}>Save Evidence Entry</Button></div></div>) : null}

                      {!focusSendCase && quickPanel === "upload" ? (
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="md:col-span-2 space-y-2">
                            <Input
                              ref={uploadInputRef}
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx,.txt"
                              onChange={handleUploadSelection}
                            />
                            <div className="text-xs text-muted-foreground">
                              Select images, reports, statements, or other evidence files to attach to this investigation entry.
                            </div>
                            {uploadError ? (
                              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                {uploadError}
                              </div>
                            ) : null}
                            {uploadForm.uploadedFiles.length > 0 ? (
                              <div className="space-y-2 rounded-md border p-3">
                                <div className="text-sm font-medium text-foreground">Selected Files</div>
                                {uploadForm.uploadedFiles.map((file) => (
                                  <div key={file.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                                    <div className="min-w-0">
                                      <div className="truncate font-medium">{file.fileName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {file.fileType} | {(file.fileSize / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                    <Button type="button" size="sm" variant="outline" onClick={() => removeUploadFile(file.id)}>
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <Input placeholder="File Name" value={uploadForm.fileName} onChange={(e) => setUploadForm((p) => ({ ...p, fileName: e.target.value }))} />
                          <Input placeholder="File Type" value={uploadForm.fileType} onChange={(e) => setUploadForm((p) => ({ ...p, fileType: e.target.value }))} />
                          <Input placeholder="Category (photo, report, statement...)" value={uploadForm.category} onChange={(e) => setUploadForm((p) => ({ ...p, category: e.target.value }))} />
                          <Input placeholder="Confidentiality Level" value={uploadForm.confidentiality} onChange={(e) => setUploadForm((p) => ({ ...p, confidentiality: e.target.value }))} />
                          <Input className="md:col-span-2" placeholder="Short Description" value={uploadForm.shortDescription} onChange={(e) => setUploadForm((p) => ({ ...p, shortDescription: e.target.value }))} />
                          <div className="md:col-span-2">
                            <Button
                              onClick={() => {
                                if (uploadForm.uploadedFiles.length === 0) {
                                  uploadInputRef.current?.click()
                                  return
                                }

                                appendToSectionB(
                                  "upload",
                                  "Evidence Files Uploaded",
                                  uploadForm.shortDescription || uploadForm.fileName || "Evidence files uploaded.",
                                  uploadForm,
                                  () => {
                                    setUploadForm({
                                      fileName: "",
                                      fileType: "",
                                      category: "",
                                      shortDescription: "",
                                      confidentiality: "public_safe",
                                      uploadedFiles: [],
                                    })
                                    setUploadError(null)
                                    if (uploadInputRef.current) {
                                      uploadInputRef.current.value = ""
                                    }
                                  }
                                )
                              }}
                            >
                              {uploadForm.uploadedFiles.length === 0 ? "Choose Evidence Files" : "Upload Evidence Files"}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {!focusSendCase && quickPanel === "note" ? (<div className="space-y-2"><Textarea rows={4} placeholder="Investigation note..." value={noteForm} onChange={(e) => setNoteForm(e.target.value)} /><Button onClick={() => appendToSectionB("note", "Investigation Note Added", noteForm, { note: noteForm }, () => setNoteForm(""))}>Save Note Entry</Button></div>) : null}

                      {!focusSendCase && quickPanel === "action" ? (<div className="grid gap-2 md:grid-cols-2"><Input placeholder="Action Taken" value={actionForm.actionTaken} onChange={(e) => setActionForm((p) => ({ ...p, actionTaken: e.target.value }))} /><Input placeholder="Result" value={actionForm.result} onChange={(e) => setActionForm((p) => ({ ...p, result: e.target.value }))} /><Input placeholder="Next Step" value={actionForm.nextStep} onChange={(e) => setActionForm((p) => ({ ...p, nextStep: e.target.value }))} /><Input placeholder="Remarks" value={actionForm.remarks} onChange={(e) => setActionForm((p) => ({ ...p, remarks: e.target.value }))} /><div className="md:col-span-2"><Button onClick={() => appendToSectionB("action", "Investigation Action Added", actionForm.actionTaken || "Action appended.", actionForm, () => setActionForm({ actionTaken: "", result: "", nextStep: "", remarks: "" }))}>Save Action Entry</Button></div></div>) : null}

                      {!focusSendCase && quickPanel === "suspect" ? (<div className="grid gap-2 md:grid-cols-2"><Input placeholder="Suspect Name" value={suspectUpdateForm.suspectName} onChange={(e) => setSuspectUpdateForm((p) => ({ ...p, suspectName: e.target.value }))} /><Input placeholder="Suspect Status (identified, traced, arrested...)" value={suspectUpdateForm.suspectStatus} onChange={(e) => setSuspectUpdateForm((p) => ({ ...p, suspectStatus: e.target.value }))} /><Textarea className="md:col-span-2" rows={3} placeholder="Suspect note" value={suspectUpdateForm.suspectNote} onChange={(e) => setSuspectUpdateForm((p) => ({ ...p, suspectNote: e.target.value }))} /><div className="md:col-span-2"><Button onClick={() => appendToSectionB("suspect_update", "Suspect Detail Added", suspectUpdateForm.suspectStatus || "Suspect update appended.", suspectUpdateForm, () => setSuspectUpdateForm({ suspectName: "", suspectStatus: "", suspectNote: "" }))}>Save Suspect Update</Button></div></div>) : null}

                      {!focusSendCase && quickPanel === "section_c" ? (<Card className="border-dashed"><CardHeader><CardTitle>Section C: Documentation Report and Budget</CardTitle><CardDescription>Report all process steps completed and budget/resources used during investigation.</CardDescription></CardHeader><CardContent className="grid gap-2"><Textarea rows={4} placeholder="Process documentation (what was done, interviews, scene follow-up, timeline)..." value={sectionCForm.processDocumentation} onChange={(e) => setSectionCForm((p) => ({ ...p, processDocumentation: e.target.value }))} /><Input placeholder="Budget used (e.g. M 2,350)" value={sectionCForm.budgetUsed} onChange={(e) => setSectionCForm((p) => ({ ...p, budgetUsed: e.target.value }))} /><Textarea rows={3} placeholder="Budget breakdown (transport, lab, document prep, etc.)" value={sectionCForm.budgetBreakdown} onChange={(e) => setSectionCForm((p) => ({ ...p, budgetBreakdown: e.target.value }))} /><Textarea rows={3} placeholder="Documentation remarks" value={sectionCForm.reportRemarks} onChange={(e) => setSectionCForm((p) => ({ ...p, reportRemarks: e.target.value }))} /><Textarea rows={2} placeholder="Recommendation (continue, submit to commissioner, request more evidence...)" value={sectionCForm.recommendation} onChange={(e) => setSectionCForm((p) => ({ ...p, recommendation: e.target.value }))} /><Button onClick={appendSectionCDocumentation}>Save Section C Report</Button></CardContent></Card>) : null}
                    </CardContent>
                  </Card>

                  {!focusSendCase ? (
                  <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))]">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-white">Section B Append-Only History</CardTitle>
                        {canSendToCommissioner ? (
                          <Button
                            size="sm"
                            className="justify-between rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white shadow-[0_14px_30px_rgba(88,74,210,0.24)] hover:brightness-110 hover:!text-white"
                            onClick={() => sendDocketToCommissioner(selectedCase)}
                          >
                            <span>{hasUpdatesAfterCommissionerSubmission ? "Re-send Updated Docket" : "Send Docket to Commissioner"}</span>
                            <span>+</span>
                          </Button>
                        ) : (
                          <div className="rounded-full border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.14),rgba(91,140,255,0.08))] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/74">
                            Already in commissioner queue
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {appendedEntries.length === 0 ? (
                        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">No appended entries yet.</div>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {appendedEntries.map((entry) => <HistoryEntryCard key={entry.id} entry={entry} />)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  ) : null}

                  {!focusSendCase ? (
                  <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))]">
                    <CardHeader>
                      <CardTitle className="text-white">Section C Report History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sectionCEntries.length === 0 ? (
                        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">No Section C reports appended yet.</div>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {sectionCEntries.map((entry) => <HistoryEntryCard key={entry.id} entry={entry} />)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </InvestigationShell>
  )
}


