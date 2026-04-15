"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  MessageSquareWarning,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "N/A"
  const text = String(value).trim()
  return text.length > 0 ? text : "N/A"
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ")
}

function statusClass(status: string) {
  if (status === "pending_commissioner") return "border-cyan-200/24 bg-cyan-400/12 text-cyan-100"
  if (status === "commissioner_clarification") return "border-pink-200/24 bg-pink-400/12 text-pink-100"
  if (status === "rejected") return "border-rose-200/24 bg-rose-400/12 text-rose-100"
  if (status === "approved" || status === "submitted_to_dpp") return "border-amber-200/24 bg-amber-400/12 text-amber-100"
  return "border-white/12 bg-white/8 text-white"
}

function SurfaceCard({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] ${className}`.trim()}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function SummaryTile({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{displayValue(value)}</div>
    </div>
  )
}

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: unknown; wide?: boolean }>
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2 text-sm">
      {items.map((item) => (
        <div
          key={`${item.label}-${String(item.value)}`}
          className={`rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5 ${item.wide ? "md:col-span-2" : ""}`}
        >
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">{item.label}</div>
          <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-white">{displayValue(item.value)}</div>
        </div>
      ))}
    </div>
  )
}

export default function CommissionerReview() {
  const params = useParams<{ caseId: string }>()
  const router = useRouter()
  const caseId = params.caseId
  const store = useStore() as any
  const { currentUser, getCaseById, updateCase } = store

  const commissionerApproveCase =
    store.commissionerApproveCase ??
    ((id: string, user: any, notes: string) => updateCase?.(id, { status: "approved" }))

  const commissionerRejectCase =
    store.commissionerRejectCase ??
    ((id: string, user: any, notes: string) => updateCase?.(id, { status: "rejected" }))

  const c = getCaseById(caseId)

  const [notes, setNotes] = React.useState("")
  const [showRejectForm, setShowRejectForm] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [rejectionConfidential, setRejectionConfidential] = React.useState(false)
  const [rejectionError, setRejectionError] = React.useState<string | null>(null)
  const [clarificationError, setClarificationError] = React.useState<string | null>(null)
  const [isRequestingClarification, setIsRequestingClarification] = React.useState(false)

  if (!c) {
    return (
      <DashboardLayout allowedRoles={["police_commissioner"]} title="Case Not Found">
        <div className="text-muted-foreground">Case not found.</div>
      </DashboardLayout>
    )
  }

  const a = c.policeSections?.sectionA ?? {}
  const b = (c.policeSections?.sectionB ?? {}) as Record<string, any>
  const secC = (c.policeSections?.sectionC ?? {}) as Record<string, any>
  const initialCapture = (b.initialCapture ?? {}) as Record<string, any>
  const appendEntries = Array.isArray(b.appendEntries) ? b.appendEntries : []
  const documentationEntries = Array.isArray(secC.documentationEntries) ? secC.documentationEntries : []
  const latestClarificationRequest = Array.isArray(secC?.clarificationRequests) ? secC.clarificationRequests[0] : null
  const latestClarificationResponseText = String(secC?.latestClarificationResponseText || "").trim()
  const hasNewClarificationMessage = Boolean(secC?.latestClarificationResponseAt)
  const decision = (c.commissionerDecision ?? {}) as Record<string, any>
  const dppReview = (c.dppReview ?? {}) as Record<string, any>

  const auditEvents = [
    a?.openedAt
      ? { label: "Case opened", by: a.openedByName || "Unknown officer", at: a.openedAt, detail: a.allegedCrime || "" }
      : null,
    a?.submittedToInvestigationAt
      ? { label: "Submitted to investigation", by: a.submittedToInvestigationByName || "Unknown officer", at: a.submittedToInvestigationAt, detail: "" }
      : null,
    b?.investigationStartedAt
      ? { label: "Investigation started", by: b.investigatorName || a?.investigatorOfficerNameNumber || "Unknown investigator", at: b.investigationStartedAt, detail: b.docketNotes || "" }
      : null,
    secC?.submittedToCommissionerAt
      ? { label: "Submitted to commissioner", by: secC.submittedToCommissionerByName || "Unknown investigator", at: secC.submittedToCommissionerAt, detail: secC.recommendedAction || "" }
      : null,
    decision?.at
      ? { label: `Commissioner ${decision.decision || "decision"}`, by: decision.byName || "Commissioner", at: decision.at, detail: decision.notes || "" }
      : null,
    dppReview?.forwardedAt
      ? { label: "Forwarded to DPP", by: dppReview.forwardedByName || "Commissioner", at: dppReview.forwardedAt, detail: "" }
      : null,
  ].filter(Boolean) as Array<{ label: string; by: string; at: string; detail: string }>

  const approve = () => {
    if (!currentUser) return
    commissionerApproveCase(caseId, currentUser, notes)
    router.push("/dpp/review")
  }

  const reject = () => {
    if (!currentUser) return
    const internalReason = rejectionReason.trim()
    if (!internalReason) {
      setRejectionError("Please write the rejection statement before submitting.")
      return
    }

    commissionerRejectCase(caseId, currentUser, internalReason)
    updateCase?.(caseId, {
      rejectionInfo: {
        ...(c?.rejectionInfo ?? {}),
        rejectedAt: new Date().toISOString(),
        rejectedByUserId: currentUser.id,
        rejectedByName: currentUser.name || currentUser.fullName || "Commissioner",
        rejectedByRole: currentUser.role || "police_commissioner",
        rejectionReason: internalReason,
        rejectionReasonPublic: internalReason,
        rejectionIsConfidential: rejectionConfidential,
        rejectionStage: "commissioner_review",
      },
    })
    router.push("/commissioner/cases?tab=rejected")
  }

  const clarify = async () => {
    if (!currentUser) return
    const statement = notes.trim()
    if (!statement) {
      setClarificationError("Please write the clarification statement in Decision Notes before sending.")
      return
    }
    setClarificationError(null)
    setIsRequestingClarification(true)
    try {
      const response = await fetch("/api/cases/commissioner-clarification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, statement }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to request clarification.")
      }

      if (data?.case) {
        updateCase?.(caseId, data.case)
      } else {
        updateCase?.(caseId, { status: "commissioner_clarification" })
      }

      router.push("/commissioner/cases?tab=clarifications")
    } catch (error: any) {
      setClarificationError(error?.message || "Failed to request clarification.")
    } finally {
      setIsRequestingClarification(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title={`Review Packet: ${displayValue(c.caseNumber)}`}>
      <div className="space-y-4">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.98),rgba(14,22,43,0.98))] shadow-[0_18px_50px_rgba(6,12,28,0.28)]">
          <CardContent className="p-4 lg:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                    <FileSearch className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Commissioner Review Packet</div>
                    <div className="mt-1 text-lg font-semibold text-white">{displayValue(c.caseNumber)}</div>
                    <div className="text-sm text-white/52">Public case reference only. Internal encrypted IDs are not shown on this page.</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusClass(c.status)}`}>
                    {statusLabel(c.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <SummaryTile label="Crime No" value={a?.crimeNo || "Not saved"} />
                  <SummaryTile label="Alleged Crime" value={a?.allegedCrime || "Unknown"} />
                  <SummaryTile label="Where" value={a?.whereCommittedSpecify || a?.whereCommitted || "Unknown"} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={clarify}
                  disabled={isRequestingClarification}
                  className="h-11 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white"
                >
                  <MessageSquareWarning className="mr-2 h-4 w-4" />
                  {isRequestingClarification ? "Sending..." : "Request Clarification"}
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectForm(true)} className="h-11 rounded-[0.95rem]">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={approve} className="h-11 rounded-[0.95rem] bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white sm:col-span-2">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {clarificationError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/12 px-3 py-2 text-sm font-semibold text-destructive shadow-sm">
            {clarificationError}
          </div>
        ) : null}

        {(latestClarificationRequest || latestClarificationResponseText) ? (
          <SurfaceCard title="Clarification Box">
            <div className="space-y-2 text-sm">
              {hasNewClarificationMessage ? (
                <div className="inline-flex rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">New Message</div>
              ) : null}
              <div className="rounded-md border border-pink-200/18 bg-pink-400/10 p-3 text-white/80">
                <span className="font-medium text-white">Request:</span>{" "}
                {String(latestClarificationRequest?.statement || secC?.latestClarificationStatement || "N/A")}
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3 text-white/80">
                <span className="font-medium text-white">Response:</span>{" "}
                {latestClarificationResponseText || "Awaiting investigator response."}
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        {showRejectForm ? (
          <SurfaceCard title="Commissioner Rejection Statement Form">
            <div className="space-y-3">
              {rejectionError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {rejectionError}
                </div>
              ) : null}
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                placeholder="Write full commissioner rejection statement and findings..."
                className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
              />
              <label className="flex items-center gap-2 text-sm text-white/72">
                <input
                  type="checkbox"
                  checked={rejectionConfidential}
                  onChange={(e) => setRejectionConfidential(e.target.checked)}
                />
                Mark internal reason as confidential
              </label>
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={reject}>Confirm Rejection</Button>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        <Tabs defaultValue="packet">
          <TabsList className="grid w-full grid-cols-4 border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] p-1">
            <TabsTrigger value="packet">Packet</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="notes">Decision Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="packet" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <SurfaceCard title="Registration (C1/C2)">
                <DetailGrid
                  items={[
                    { label: "Crime No", value: a?.crimeNo || "-" },
                    { label: "Reported", value: `${a?.dateReported || "-"} ${a?.timeReported || ""}`.trim() },
                    { label: "Alleged Crime", value: a?.allegedCrime || "-" },
                    { label: "Where", value: a?.whereCommittedSpecify || a?.whereCommitted || "-" },
                    { label: "Modus", value: a?.modusOperandi || "-", wide: true },
                    { label: "Suspect", value: a?.suspectDetails || "-", wide: true },
                  ]}
                />
              </SurfaceCard>

              <SurfaceCard title="Investigation (Section B/C)">
                <DetailGrid
                  items={[
                    { label: "Docket Notes", value: b?.docketNotes || "-", wide: true },
                    { label: "Evidence Notes", value: b?.evidenceNotes || "-", wide: true },
                    { label: "Findings", value: secC?.investigationFindings || "-", wide: true },
                    { label: "Recommended", value: secC?.recommendedAction || "-", wide: true },
                  ]}
                />
              </SurfaceCard>

              <SurfaceCard title="Property Seizure" className="lg:col-span-2">
                <div className="space-y-2">
                  {(c.policeSeizures ?? []).length === 0 ? (
                    <div className="text-sm text-white/55">No seizures recorded.</div>
                  ) : (
                    (c.policeSeizures ?? []).map((sz: any) => (
                      <div key={sz.seizureId} className="rounded-[1rem] border border-white/8 bg-white/5 p-3 text-sm text-white/78">
                        <div className="font-medium text-white">{new Date(sz.seizedAt).toLocaleString()}</div>
                        <div className="mt-1">Location: {sz.seizureLocation}</div>
                        <div>Items: {sz.items.length}</div>
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>

              <SurfaceCard title="Full Registration Data (Section A)" className="lg:col-span-2">
                <DetailGrid
                  items={[
                    { label: "Station Code", value: a?.stnCode },
                    { label: "Crime No", value: a?.crimeNo },
                    { label: "Crime Year", value: a?.crimeYear },
                    { label: "Crime Region", value: a?.crimeRegion },
                    { label: "Date Reported", value: a?.dateReported },
                    { label: "Time Reported", value: a?.timeReported },
                    { label: "Method of Complaint", value: a?.methodOfComplaint },
                    { label: "Reporting Person", value: a?.reportingPersonFullName },
                    { label: "Complainant / Victim", value: a?.aggrievedFullName },
                    { label: "Sex / Age", value: `${displayValue(a?.sex)} / ${displayValue(a?.age)}` },
                    { label: "Date of Birth", value: a?.dateOfBirth },
                    { label: "Alleged Crime", value: a?.allegedCrime },
                    { label: "Attempt", value: a?.attempt ? "Yes" : "No" },
                    { label: "Where Committed", value: a?.whereCommittedSpecify || a?.whereCommitted },
                    { label: "From Date/Time", value: `${displayValue(a?.whenFromDate)} ${displayValue(a?.whenFromTime)}` },
                    { label: "To Date/Time", value: `${displayValue(a?.whenToDate)} ${displayValue(a?.whenToTime)}` },
                    { label: "Modus Operandi", value: a?.modusOperandi, wide: true },
                    { label: "Property/Injury", value: a?.propertyOrInjury, wide: true },
                    { label: "Drink Related", value: a?.drinkRelated },
                    { label: "Drug Related", value: a?.drugRelated },
                    { label: "Firearm Used", value: `${displayValue(a?.firearmUsed)}${a?.firearmSpecify ? ` (${a.firearmSpecify})` : ""}` },
                    { label: "Weapon Used", value: `${displayValue(a?.weaponUsed)}${a?.weaponSpecify ? ` (${a.weaponSpecify})` : ""}` },
                    { label: "Extent of Injury", value: a?.extentOfInjury },
                    { label: "Victim Relationship", value: a?.offenderVictimRelationship },
                    { label: "Victim Statement Taken", value: a?.victimStatementTaken ? "Yes" : "No" },
                    { label: "Investigator (From Police Form)", value: a?.investigatorOfficerNameNumber },
                    { label: "Suspect Details", value: a?.suspectDetails, wide: true },
                    { label: "Witness List", value: a?.witnessList, wide: true },
                  ]}
                />
              </SurfaceCard>

              <SurfaceCard title="Full Investigation Data (Section B)" className="lg:col-span-2">
                <DetailGrid
                  items={[
                    { label: "Investigation Started At", value: b?.investigationStartedAt },
                    { label: "Investigator Name", value: b?.investigatorName },
                    { label: "Investigator Number", value: b?.investigatorNumber },
                    { label: "Assigned Unit", value: initialCapture?.assignedUnit },
                    { label: "Investigation Start Date", value: initialCapture?.investigationStartDate },
                    { label: "District", value: initialCapture?.district },
                    { label: "Incident Summary", value: initialCapture?.incidentSummary, wide: true },
                    { label: "Incident Description", value: initialCapture?.incidentDescription, wide: true },
                    { label: "Date/Time of Offence", value: `${displayValue(initialCapture?.dateOfOffence)} ${displayValue(initialCapture?.timeOfOffence)}` },
                    { label: "Place", value: initialCapture?.placeOfOffence },
                    { label: "Village/Town", value: initialCapture?.villageTownArea },
                    { label: "Scene Visited", value: initialCapture?.sceneVisited },
                    { label: "Scene Visit Date/Time", value: `${displayValue(initialCapture?.sceneVisitDate)} ${displayValue(initialCapture?.sceneVisitTime)}` },
                    { label: "Exact Scene Description", value: initialCapture?.exactSceneDescription, wide: true },
                  ]}
                />
              </SurfaceCard>

              <SurfaceCard title="Investigation Append Entries" className="lg:col-span-2">
                <div className="grid gap-3 xl:grid-cols-2">
                  {appendEntries.length === 0 ? (
                    <div className="text-sm text-white/55">No additional investigation entries recorded.</div>
                  ) : (
                    appendEntries.map((entry: any) => (
                      <div key={entry.id} className="rounded-[1rem] border border-white/8 bg-white/5 p-3 text-sm">
                        <div className="font-medium text-white">{displayValue(entry.title)}</div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          <SummaryTile label="Type" value={entry.type} />
                          <SummaryTile label="By" value={entry.createdByName} />
                          <SummaryTile label="At" value={entry.createdAt} />
                        </div>
                        <div className="mt-3 whitespace-pre-wrap text-white/76">{displayValue(entry.summary)}</div>
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>

              <SurfaceCard title="Full Documentation Data (Section C)" className="lg:col-span-2">
                <div className="space-y-3">
                  <DetailGrid
                    items={[
                      { label: "Last Documentation At", value: secC?.lastDocumentationAt },
                      { label: "Last Documentation By", value: secC?.lastDocumentationByName },
                      { label: "Submitted To Commissioner At", value: secC?.submittedToCommissionerAt },
                      { label: "Submitted By", value: secC?.submittedToCommissionerByName },
                      { label: "Recommended Action", value: secC?.recommendedAction, wide: true },
                    ]}
                  />

                  <div className="grid gap-3 xl:grid-cols-2">
                    {documentationEntries.length === 0 ? (
                      <div className="text-sm text-white/55">No Section C entries recorded yet.</div>
                    ) : (
                      documentationEntries.map((entry: any) => (
                        <div key={entry.id} className="rounded-[1rem] border border-white/8 bg-white/5 p-3 text-sm">
                          <div className="font-medium text-white">{displayValue(entry.title)}</div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <SummaryTile label="By" value={entry.createdByName} />
                            <SummaryTile label="At" value={entry.createdAt} />
                          </div>
                          <div className="mt-3">
                            <DetailGrid
                              items={[
                                { label: "Process Documentation", value: entry?.data?.processDocumentation, wide: true },
                                { label: "Budget Used", value: entry?.data?.budgetUsed },
                                { label: "Budget Breakdown", value: entry?.data?.budgetBreakdown, wide: true },
                                { label: "Remarks", value: entry?.data?.reportRemarks, wide: true },
                                { label: "Recommendation", value: entry?.data?.recommendation, wide: true },
                              ]}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </SurfaceCard>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-3">
            <SurfaceCard title="Commissioner Standard Forms">
              <div className="grid gap-2 md:grid-cols-2">
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/case-review/${c.caseId}`}>Case Review & Approval</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/briefing/${c.caseId}`}>Briefing / Incident Summary</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/use-of-force/${c.caseId}`}>Use-of-Force Review</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/evidence-retention/${c.caseId}`}>Evidence Retention / Disposal</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/complaint/${c.caseId}`}>Complaint / Discipline Referral</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/media-release/${c.caseId}`}>Media Release Approval</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/operational-order/${c.caseId}`}>Operational Order</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/emergency-powers/${c.caseId}`}>Emergency Powers / Curfew</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/resource-allocation/${c.caseId}`}>Resource Allocation / Budget</Link></Button>
                <Button asChild variant="secondary"><Link href={`/commissioner/forms/external-liaison/${c.caseId}`}>External Agency Liaison</Link></Button>
              </div>
            </SurfaceCard>
          </TabsContent>

          <TabsContent value="audit">
            <SurfaceCard title="Audit Trail">
              <div className="grid gap-3 xl:grid-cols-2">
                {auditEvents.length === 0 ? (
                  <div className="text-sm text-white/55">No workflow events recorded yet for this case.</div>
                ) : (
                  auditEvents.map((event, index) => (
                    <div key={`${event.label}-${event.at}-${index}`} className="rounded-[1rem] border border-white/8 bg-white/5 p-3 text-sm">
                      <div className="font-medium text-white">{event.label}</div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <SummaryTile label="By" value={event.by} />
                        <SummaryTile label="At" value={event.at} />
                      </div>
                      {event.detail ? <div className="mt-3 whitespace-pre-wrap text-white/76">{event.detail}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </SurfaceCard>
          </TabsContent>

          <TabsContent value="notes" className="space-y-3">
            <SurfaceCard title="Decision Notes">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Reason, conditions, or clarification questions..."
                className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
              />
            </SurfaceCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
