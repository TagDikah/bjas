"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function displayText(value: unknown, fallback = "N/A") {
  const text = String(value || "").trim()
  return text || fallback
}

function friendlyStatus(value: unknown) {
  return String(value || "").replace(/_/g, " ").trim() || "Unknown"
}

function formatDate(value: unknown, fallback = "N/A") {
  const raw = String(value || "").trim()
  if (!raw) return fallback
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString()
}

function shortenHash(value: string) {
  if (!value) return "Not available"
  if (value.length <= 28) return value
  return `${value.slice(0, 16)}...${value.slice(-8)}`
}

function getDraftSnapshotKey(userId?: string | null, caseId?: string | null, caseNumber?: string | null) {
  const stableId = String(caseId || caseNumber || "new").trim() || "new"
  const actor = String(userId || "anonymous").trim() || "anonymous"
  return `bejas:police-draft:${actor}:${stableId}`
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
    return Math.min(3, Math.max(0, explicitCurrentStep))
  }

  const checkpointIndex = Number(sectionA?.lastCheckpointStepIndex ?? -1)
  const lockedThrough = Number(sectionA?.checkpointLockedThrough ?? -1)
  return Math.min(
    3,
    Math.max(0, lockedThrough >= 0 ? lockedThrough + 1 : checkpointIndex >= 0 ? checkpointIndex + 1 : 0)
  )
}

export default function PoliceCaseDetailPage() {
  const router = useRouter()
  const params = useParams<{ caseId: string }>()
  const { currentUser, setCases, getAllCases } = useStore()

  const caseId = params?.caseId
  const [draftSnapshotSectionA, setDraftSnapshotSectionA] = React.useState<Record<string, any>>({})

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
        // Keep the current local view if sync fails.
      }
    }

    syncCases()

    return () => {
      cancelled = true
    }
  }, [currentUser, setCases])

  const caseData = getAllCases().find((c) => c.caseId === caseId)

  React.useEffect(() => {
    if (!currentUser || !caseData) return

    try {
      const snapshotKey = getDraftSnapshotKey(currentUser.id, caseData.caseId, caseData.caseNumber)
      const snapshot = JSON.parse(localStorage.getItem(snapshotKey) || "{}")
      setDraftSnapshotSectionA(snapshot?.policeSections?.sectionA ?? {})
    } catch {
      setDraftSnapshotSectionA({})
    }
  }, [currentUser, caseData?.caseId, caseData?.caseNumber])

  if (!caseData) {
    return (
      <DashboardLayout allowedRoles={["police_officer", "police_commissioner"]} title="Case not found">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="font-medium text-foreground">Case not found.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The caseId in the URL does not match any case in the current store.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
            <Link href="/police/cases">
              <Button>Open My Cases</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isOwner = caseData.policeOfficerId ? caseData.policeOfficerId === currentUser?.id : true
  const existingAnchor = caseData?.chainAnchor
  const mergedCaseData = {
    ...caseData,
    policeSections: {
      ...caseData.policeSections,
      sectionA: {
        ...(caseData.policeSections?.sectionA ?? {}),
        ...draftSnapshotSectionA,
      },
    },
  }
  const sectionA = mergedCaseData.policeSections?.sectionA ?? {}
  const resumeStep = getResumeStep(mergedCaseData)

  return (
    <DashboardLayout allowedRoles={["police_officer", "police_commissioner"]} title="Police Docket">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Link href="/police/cases">
            <Button variant="secondary">My Cases</Button>
          </Link>
        </div>

        {!isOwner ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-medium text-foreground">Access restricted</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This case is not assigned to your user in the current store.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className={panelClass()}>
              <CardContent className="p-4 lg:p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">{displayText(caseData.caseNumber, "Protected case")}</div>
                        <div className="mt-1 text-sm text-white/62">{displayText(sectionA?.aggrievedFullName || sectionA?.reportingPersonFullName || caseData.parties, "Unknown complainant")}</div>
                      </div>
                      <div className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-cyan-100">
                        {friendlyStatus(caseData.status)}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Crime</div>
                        <div className="mt-1 text-sm text-white">{displayText(sectionA?.allegedCrime || caseData.charge, "Unknown")}</div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Station</div>
                        <div className="mt-1 text-sm text-white">{displayText(caseData.district || sectionA?.station, "Unknown")}</div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Date</div>
                        <div className="mt-1 text-sm text-white">{formatDate(caseData.dateOpened || caseData.createdAt)}</div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Filed By</div>
                        <div className="mt-1 text-sm text-white">{displayText(caseData.policeOfficerName, "N/A")}</div>
                      </div>
                    </div>

                    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3 text-sm text-white/70">
                      {displayText(caseData.description, "No case summary captured yet.")}
                    </div>
                  </div>

                  <div className="grid gap-2 lg:w-[200px]">
                    <Button asChild className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white hover:opacity-95">
                      <Link href="/police/cases">View All Cases</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isIncompletePoliceCase(caseData) ? (
              <Card className={panelClass()}>
                <CardHeader>
                  <CardTitle className="text-white">Continue Draft</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-[0.95rem] border border-cyan-400/18 bg-cyan-400/10 p-3 text-cyan-50/92">
                    Resume from step {resumeStep + 1}. The form reloads saved details and opens the next incomplete stage.
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Crime No</div>
                      <div className="mt-1 text-sm text-white">{displayText(sectionA?.crimeNo, "Not saved yet")}</div>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Complainant</div>
                      <div className="mt-1 text-sm text-white">{displayText(sectionA?.aggrievedFullName || sectionA?.reportingPersonFullName, "Not saved yet")}</div>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Alleged Crime</div>
                      <div className="mt-1 text-sm text-white">{displayText(sectionA?.allegedCrime, "Not saved yet")}</div>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Latest Saved</div>
                      <div className="mt-1 text-sm text-white">{formatDate(sectionA?.draftLastSavedAt || mergedCaseData?.updatedAt, "Not available")}</div>
                    </div>
                  </div>
                  <Link href={`/police/new-case?caseId=${encodeURIComponent(caseData.caseId)}`}>
                    <Button className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white hover:opacity-95">Continue Case Entry</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            <Card className={panelClass()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-cyan-200" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {existingAnchor?.transactionId || existingAnchor?.txHash ? (
                  <div className="space-y-3">
                    <div className="rounded-[0.95rem] border border-cyan-400/18 bg-cyan-400/10 px-3 py-2.5 text-cyan-50/92">
                      Anchor record available for this police docket.
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Transaction ID</div>
                        <div className="mt-1 break-all text-sm text-white" title={existingAnchor.transactionId || existingAnchor.txHash}>
                          {shortenHash(existingAnchor.transactionId || existingAnchor.txHash)}
                        </div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Channel</div>
                        <div className="mt-1 text-sm text-white">{displayText(existingAnchor.channelName)}</div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Chaincode</div>
                        <div className="mt-1 text-sm text-white">{displayText(existingAnchor.chaincodeName)}</div>
                      </div>
                      <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Content Hash</div>
                        <div className="mt-1 break-all text-sm text-white" title={existingAnchor.contentHash}>{shortenHash(existingAnchor.contentHash)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[0.95rem] border border-amber-400/20 bg-amber-400/10 p-3 text-amber-100">
                    No blockchain anchor found on this case yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
