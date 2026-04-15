"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"
import { PoliceOfficerShell } from "@/components/police-officer-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function labelStatus(s: string) {
  switch (s) {
    case "draft_police": return "Draft"
    case "pending_investigation": return "Pending Investigation"
    case "in_investigation": return "In Investigation"
    case "pending_commissioner": return "Pending Commissioner"
    case "commissioner_clarification": return "Clarification"
    case "approved": return "Approved"
    case "rejected": return "Rejected"
    default: return s
  }
}

function statusTone(status: string) {
  switch (status) {
    case "draft_police":
      return "bg-white/10 text-white/80"
    case "pending_investigation":
      return "bg-[#5a8cff]/15 text-[#bfd4ff]"
    case "in_investigation":
      return "bg-cyan-400/15 text-cyan-100"
    case "pending_commissioner":
      return "bg-[#ff7a9f]/15 text-[#ffd2df]"
    case "commissioner_clarification":
      return "bg-[#ffb86b]/15 text-[#ffe0bf]"
    case "approved":
      return "bg-emerald-400/15 text-emerald-100"
    case "rejected":
      return "bg-red-500/15 text-red-100"
    default:
      return "bg-white/10 text-white/80"
  }
}

function getCaseSortTime(caseData: any) {
  const timestamp =
    caseData?.updatedAt ||
    caseData?.dateOpened ||
    caseData?.createdAt ||
    caseData?.policeSections?.sectionA?.openedAt ||
    ""

  const parsed = new Date(timestamp).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function isIncompletePoliceCase(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const hasCheckpoint =
    Number(sectionA?.lastCheckpointStepIndex ?? -1) >= 0 ||
    Number(sectionA?.checkpointLockedThrough ?? -1) >= 0
  const submittedToInvestigation = Boolean(sectionA?.submittedToInvestigationAt)
  return caseData?.status === "draft_police" || (hasCheckpoint && !submittedToInvestigation)
}

function mergeCaseRecords(serverCase: any, localCase: any) {
  if (!serverCase) return localCase
  if (!localCase) return serverCase

  const serverSectionA = serverCase?.policeSections?.sectionA ?? {}
  const localSectionA = localCase?.policeSections?.sectionA ?? {}

  return {
    ...serverCase,
    ...localCase,
    status: localCase?.status || serverCase?.status,
    updatedAt: localCase?.updatedAt || serverCase?.updatedAt,
    policeSections: {
      ...(serverCase?.policeSections ?? {}),
      ...(localCase?.policeSections ?? {}),
      sectionA: {
        ...serverSectionA,
        ...localSectionA,
      },
    },
    chainAnchor: serverCase?.chainAnchor || localCase?.chainAnchor,
  }
}

function getResumeStep(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const explicitCurrentStep = Number(sectionA?.currentEditingStepIndex ?? -1)
  if (explicitCurrentStep >= 0) {
    return Math.min(4, Math.max(1, explicitCurrentStep + 1))
  }
  const lockedThrough = Number(sectionA?.checkpointLockedThrough ?? -1)
  const lastCheckpoint = Number(sectionA?.lastCheckpointStepIndex ?? -1)
  const nextStep = lockedThrough >= 0 ? lockedThrough + 1 : lastCheckpoint >= 0 ? lastCheckpoint + 1 : 0
  return Math.min(4, Math.max(1, nextStep + 1))
}

function getPoliceProgressStep(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const explicitCurrentStep = Number(sectionA?.currentEditingStepIndex ?? -1)
  const lockedThrough = Number(sectionA?.checkpointLockedThrough ?? -1)
  const lastCheckpoint = Number(sectionA?.lastCheckpointStepIndex ?? -1)
  return Math.max(explicitCurrentStep, lockedThrough, lastCheckpoint) + 1
}

function getCaseClassification(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const allegedCrime = String(sectionA?.allegedCrime || caseData?.charge || "").trim()
  if (!allegedCrime || allegedCrime.toUpperCase() === "UNKNOWN") {
    return "unclassified"
  }
  return "crime"
}

function canSubmitToInvestigation(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  return !sectionA?.submittedToInvestigationAt && getPoliceProgressStep(caseData) >= 6
}

function PoliceCasesPageContent() {
  const { currentUser, setCases, getAllCases, submitToInvestigation } = useStore()
  const searchParams = useSearchParams()
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")
  const [classification, setClassification] = React.useState<string>("all")
  const showIncompleteOnly = searchParams.get("resume") === "incomplete"
  const caseView = searchParams.get("view") === "recent" ? "recent" : "all"

  React.useEffect(() => {
    if (!currentUser) return

    let cancelled = false

    const syncCases = async () => {
      try {
        const response = await fetch("/api/cases", { credentials: "include" })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.ok || !Array.isArray(data?.cases) || cancelled) {
          return
        }

        const localCases = useStore.getState().cases
        const mergedById = new Map<string, any>()

        for (const serverItem of data.cases) {
          mergedById.set(serverItem.caseId, serverItem)
        }

        for (const localItem of localCases) {
          const existing = mergedById.get(localItem.caseId)
          if (existing) {
            mergedById.set(localItem.caseId, mergeCaseRecords(existing, localItem))
            continue
          }

          if (isIncompletePoliceCase(localItem)) {
            mergedById.set(localItem.caseId, localItem)
          }
        }

        setCases(Array.from(mergedById.values()))
      } catch {
        // Keep the current local view if server sync fails.
      }
    }

    syncCases()

    return () => {
      cancelled = true
    }
  }, [currentUser, setCases])

  const all = getAllCases().filter(c => c.policeOfficerId === currentUser?.id)

  const filtered = all
    .filter(c => {
      if (showIncompleteOnly && !isIncompletePoliceCase(c)) return false
      if (status !== "all" && c.status !== status) return false
      if (classification !== "all" && getCaseClassification(c) !== classification) return false
      const a = c.policeSections?.sectionA
      const hay = [
        c.caseNumber, c.caseId,
        a?.crimeNo, a?.reportingPersonFullName, a?.aggrievedFullName,
        a?.whereCommitted, a?.whereCommittedSpecify,
        a?.suspectDetails, a?.modusOperandi
      ].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(q.toLowerCase())
    })
    .sort((a, b) => getCaseSortTime(b) - getCaseSortTime(a))

  const visibleCases = caseView === "recent" ? filtered.slice(0, 5) : filtered

  return (
    <PoliceOfficerShell title="My Police Cases" contentClassName="space-y-4">
      <div className="space-y-4">
        {showIncompleteOnly ? (
          <Card className={panelClass("border-cyan-400/18 bg-cyan-400/8")}>
            <CardContent className="flex flex-col gap-1 p-2.5">
              <div className="text-sm font-semibold text-white">Incomplete Police Cases</div>
            </CardContent>
          </Card>
        ) : null}

        <Card className={panelClass()}>
          <CardContent className="p-3 lg:p-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-[0.9rem] border border-white/10 bg-[linear-gradient(135deg,#5a8cff,rgba(84,199,236,0.35))]">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Search Workspace</div>
                    <div className="mt-1 text-base font-semibold text-white">Search & Filters</div>
                    <div className="text-xs text-white/55">Search by crime no, complainant, suspect, or location.</div>
                  </div>
                </div>
                <Input
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  placeholder="Search by crime no, complainant, suspect, location..."
                  className="h-10 border-white/12 bg-white/5 text-white placeholder:text-white/35"
                />
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select value={classification} onValueChange={setClassification}>
                    <SelectTrigger className="h-10 w-full border-white/12 bg-white/5 text-white">
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classifications</SelectItem>
                      <SelectItem value="crime">Crime</SelectItem>
                      <SelectItem value="unclassified">Unclassified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-10 w-full border-white/12 bg-white/5 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="draft_police">Draft</SelectItem>
                      <SelectItem value="pending_investigation">Pending Investigation</SelectItem>
                      <SelectItem value="in_investigation">In Investigation</SelectItem>
                      <SelectItem value="pending_commissioner">Pending Commissioner</SelectItem>
                      <SelectItem value="commissioner_clarification">Clarification</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2 text-xs text-white/60">
                  {visibleCases.length} visible police case{visibleCases.length === 1 ? "" : "s"} in this view.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {visibleCases.map(c => {
            const a = c.policeSections?.sectionA
            return (
              <Card key={c.caseId} className={panelClass("transition hover:border-cyan-300/35")}>
                <CardContent className="p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-white">{c.caseNumber}</div>
                          <div className="mt-1 text-sm text-white/62">
                            Crime No: {a?.crimeNo || "-"} | Reported: {a?.dateReported || "-"} {a?.timeReported || ""}
                          </div>
                        </div>
                        <Badge className={`border-0 ${statusTone(String(c.status || ""))}`}>
                          {labelStatus(c.status)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Crime</div>
                          <div className="mt-1 text-sm text-white">{a?.allegedCrime || "-"}</div>
                        </div>
                        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Location</div>
                          <div className="mt-1 text-sm text-white">{a?.whereCommitted || a?.whereCommittedSpecify || "-"}</div>
                        </div>
                        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Complainant</div>
                          <div className="mt-1 text-sm text-white">{a?.aggrievedFullName || "-"}</div>
                        </div>
                        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Progress</div>
                          <div className="mt-1 text-sm text-white">
                            {isIncompletePoliceCase(c) ? `Saved at step ${getResumeStep(c)}` : labelStatus(c.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 self-end lg:w-[270px] lg:flex-col lg:items-stretch lg:justify-end">
                      <Button asChild size="sm" className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white hover:opacity-95">
                        <Link href={`/police/case/${c.caseId}`}>
                          Open
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      {isIncompletePoliceCase(c) && currentUser && (
                        <>
                          <Button asChild size="sm" variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                            <Link href={`/police/new-case?caseId=${encodeURIComponent(c.caseId)}`}>Continue</Link>
                          </Button>
                        </>
                      )}
                      {canSubmitToInvestigation(c) && currentUser && (
                        <Button size="sm" className="bg-[#ff7a9f] text-white hover:bg-[#ff6a92]" onClick={() => submitToInvestigation(c.caseId, currentUser)}>
                          Submit to Investigation
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {visibleCases.length === 0 && (
            <Card className={panelClass()}>
              <CardContent className="p-8 text-center text-sm text-white/58">No cases found.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </PoliceOfficerShell>
  )
}

export default function PoliceCasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PoliceCasesPageContent />
    </Suspense>
  )
}
