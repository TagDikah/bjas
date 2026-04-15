"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "N/A"
  const text = String(value).trim()
  return text.length > 0 ? text : "N/A"
}

function safeTime(value: unknown) {
  const raw = String(value || "").trim()
  if (!raw) return null
  const time = new Date(raw).getTime()
  if (Number.isNaN(time)) return null
  return { raw, time }
}

export default function DppReviewPacketPage() {
  const params = useParams<{ caseId: string }>()
  const router = useRouter()
  const caseId = params.caseId
  const store = useStore() as any
  const { currentUser, getCaseById } = store

  const dppRegisterCase = store.dppRegisterCase ?? (() => {})
  const dppAssignToProsecutor = store.dppAssignToProsecutor ?? (() => {})
  const dppReturnToPolice = store.dppReturnToPolice ?? (() => {})

  const c = getCaseById(caseId)
  const [returnNote, setReturnNote] = React.useState("More investigation or documents required")
  const [error, setError] = React.useState("")

  if (!c) {
    return (
      <DashboardLayout allowedRoles={["dpp"]} title="DPP Docket">
        <div className="text-muted-foreground">Case not found.</div>
      </DashboardLayout>
    )
  }

  const a = c.policeSections?.sectionA || {}
  const b = (c.policeSections?.sectionB ?? {}) as Record<string, any>
  const secC = (c.policeSections?.sectionC ?? {}) as Record<string, any>
  const initialCapture = (b.initialCapture ?? {}) as Record<string, any>
  const appendEntries = Array.isArray(b.appendEntries) ? b.appendEntries : []
  const documentationEntries = Array.isArray(secC.documentationEntries) ? secC.documentationEntries : []
  const latestClarification = Array.isArray(secC.clarificationRequests) ? secC.clarificationRequests[0] : null
  const rejectionInfo = (c.rejectionInfo ?? {}) as Record<string, any>
  const commissionerDecision = (c.commissionerDecision ?? {}) as Record<string, any>
  const dppReview = (c.dppReview ?? {}) as Record<string, any>
  const timeline = React.useMemo(() => {
    const items: Array<{ at: string; type: string; actor: string; details: string }> = []
    const add = (at: unknown, type: string, actor: unknown, details: unknown) => {
      const parsed = safeTime(at)
      if (!parsed) return
      items.push({
        at: parsed.raw,
        type,
        actor: displayValue(actor),
        details: displayValue(details),
      })
    }

    add(c.createdAt, "Case Opened", a?.openedByName || c.policeOfficerName, a?.summary || c.description)
    add(a?.submittedToInvestigationAt, "Submitted to Investigation", a?.submittedToInvestigationByName, "Case forwarded from police registry.")
    add(b?.investigationStartedAt, "Investigation Started", b?.investigatorName, initialCapture?.incidentSummary)
    add(initialCapture?.savedAt, "Initial Investigation Saved", initialCapture?.savedByName, initialCapture?.incidentDescription)

    appendEntries.forEach((entry: any) => {
      add(entry?.createdAt, `Append Entry: ${displayValue(entry?.type)}`, entry?.createdByName, entry?.summary)
    })

    documentationEntries.forEach((entry: any) => {
      add(entry?.createdAt, "Section C Documentation Added", entry?.createdByName, entry?.data?.recommendation || entry?.summary)
    })

    const clarifications = Array.isArray(secC?.clarificationRequests) ? secC.clarificationRequests : []
    clarifications.forEach((req: any) => {
      add(req?.requestedAt, "Clarification Requested", req?.requestedByName, req?.statement)
    })
    add(secC?.latestClarificationResponseAt, "Clarification Response Submitted", secC?.latestClarificationResponseByName, secC?.latestClarificationResponseText)

    add(secC?.submittedToCommissionerAt, "Submitted to Commissioner", secC?.submittedToCommissionerByName, secC?.recommendedAction)
    add(commissionerDecision?.at, `Commissioner Decision: ${displayValue(commissionerDecision?.decision)}`, commissionerDecision?.byName, commissionerDecision?.notes)
    add(rejectionInfo?.rejectedAt, "Case Rejected", rejectionInfo?.rejectedByName, rejectionInfo?.rejectionReasonPublic || rejectionInfo?.rejectionReason)

    add(dppReview?.forwardedAt, "Forwarded to DPP", dppReview?.forwardedByName, "Case sent to DPP office.")
    add(dppReview?.registeredAt, "Entered DPP", dppReview?.registeredByName, dppReview?.registryNotes)
    add(dppReview?.assignedAt, "Assigned Prosecutor", dppReview?.assignedByName, dppReview?.prosecutorName)
    add(dppReview?.returnedAt, "Returned to Police", dppReview?.returnedByName, dppReview?.returnReason)

    return items.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
  }, [
    a?.openedByName,
    a?.submittedToInvestigationAt,
    a?.submittedToInvestigationByName,
    a?.summary,
    appendEntries,
    b?.investigationStartedAt,
    b?.investigatorName,
    c.createdAt,
    c.description,
    c.policeOfficerName,
    commissionerDecision?.at,
    commissionerDecision?.byName,
    commissionerDecision?.decision,
    commissionerDecision?.notes,
    documentationEntries,
    dppReview?.assignedAt,
    dppReview?.assignedByName,
    dppReview?.forwardedAt,
    dppReview?.forwardedByName,
    dppReview?.prosecutorName,
    dppReview?.registeredAt,
    dppReview?.registeredByName,
    dppReview?.registryNotes,
    dppReview?.returnReason,
    dppReview?.returnedAt,
    dppReview?.returnedByName,
    initialCapture?.incidentDescription,
    initialCapture?.incidentSummary,
    initialCapture?.savedAt,
    initialCapture?.savedByName,
    rejectionInfo?.rejectedAt,
    rejectionInfo?.rejectedByName,
    rejectionInfo?.rejectionReason,
    rejectionInfo?.rejectionReasonPublic,
    secC?.clarificationRequests,
    secC?.latestClarificationResponseAt,
    secC?.latestClarificationResponseByName,
    secC?.latestClarificationResponseText,
    secC?.recommendedAction,
    secC?.submittedToCommissionerAt,
    secC?.submittedToCommissionerByName,
  ])

  return (
    <DashboardLayout allowedRoles={["dpp"]} title={`DPP Docket: ${c.caseNumber || c.caseId}`}>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{c.caseNumber || c.caseId}</div>
              <div className="text-sm text-muted-foreground">Case ID: {c.caseId}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{c.status}</Badge>
              <Button asChild variant="outline">
                <Link href="/dpp/review">Back to DPP Queue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>DPP Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 md:grid-cols-3">
              <Button
                onClick={() => {
                  setError("")
                  if (!currentUser) return
                  dppRegisterCase(c.caseId, currentUser, "Registered in DPP office")
                }}
              >
                Enter DPP
              </Button>

              <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  This action sends the case straight to the DPP prosecutor queue for confirmation.
                </div>
                <Button
                  onClick={() => {
                    setError("")
                    if (!currentUser) return
                    dppAssignToProsecutor(c.caseId, currentUser)
                    router.push("/dpp/review")
                  }}
                >
                  Send to DPP Prosecutor
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea value={returnNote} onChange={(e) => setReturnNote(e.target.value)} rows={3} />
              <Button
                variant="destructive"
                onClick={() => {
                  setError("")
                  if (!currentUser) return
                  dppReturnToPolice(c.caseId, currentUser, returnNote || "More investigation or documents required")
                  router.push("/dpp/review")
                }}
              >
                Return to Police
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Registration (Section A)</CardTitle></CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Crime No:</span> {displayValue(a?.crimeNo)}</div>
              <div><span className="text-muted-foreground">Case Number:</span> {displayValue(c?.caseNumber)}</div>
              <div><span className="text-muted-foreground">Reported:</span> {displayValue(a?.dateReported)} {displayValue(a?.timeReported)}</div>
              <div><span className="text-muted-foreground">Alleged Crime:</span> {displayValue(a?.allegedCrime)}</div>
              <div><span className="text-muted-foreground">Place:</span> {displayValue(a?.whereCommittedSpecify || a?.whereCommitted)}</div>
              <div><span className="text-muted-foreground">Victim Relationship:</span> {displayValue(a?.offenderVictimRelationship)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap"><span className="text-muted-foreground">Modus Operandi:</span> {displayValue(a?.modusOperandi)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap"><span className="text-muted-foreground">Suspect Details:</span> {displayValue(a?.suspectDetails)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Investigation Core (Section B)</CardTitle></CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Investigation Started:</span> {displayValue(b?.investigationStartedAt)}</div>
              <div><span className="text-muted-foreground">Investigator:</span> {displayValue(b?.investigatorName)}</div>
              <div><span className="text-muted-foreground">District:</span> {displayValue(initialCapture?.district)}</div>
              <div><span className="text-muted-foreground">Place of Offence:</span> {displayValue(initialCapture?.placeOfOffence)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap"><span className="text-muted-foreground">Incident Summary:</span> {displayValue(initialCapture?.incidentSummary)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap"><span className="text-muted-foreground">Incident Description:</span> {displayValue(initialCapture?.incidentDescription)}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Clarification Thread</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="rounded-md border border-warning/40 bg-warning/10 p-2">
                <span className="font-medium">Request:</span> {displayValue(latestClarification?.statement || secC?.latestClarificationStatement)}
              </div>
              <div className="rounded-md border border-border bg-card p-2">
                <span className="font-medium">Response:</span> {displayValue(secC?.latestClarificationResponseText)}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Rejection and Review Trace</CardTitle></CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Rejected:</span> {rejectionInfo?.rejectedAt ? "Yes" : "No"}</div>
              <div><span className="text-muted-foreground">Rejected At:</span> {displayValue(rejectionInfo?.rejectedAt)}</div>
              <div><span className="text-muted-foreground">Rejected By:</span> {displayValue(rejectionInfo?.rejectedByName)}</div>
              <div><span className="text-muted-foreground">Rejected Role:</span> {displayValue(rejectionInfo?.rejectedByRole)}</div>
              <div><span className="text-muted-foreground">Rejection Stage:</span> {displayValue(rejectionInfo?.rejectionStage)}</div>
              <div><span className="text-muted-foreground">Follow Up Required:</span> {displayValue(rejectionInfo?.followUpRequired)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap">
                <span className="text-muted-foreground">Rejection Reason:</span>{" "}
                {displayValue(rejectionInfo?.rejectionReasonPublic || rejectionInfo?.rejectionReason)}
              </div>
              <div><span className="text-muted-foreground">Commissioner Decision:</span> {displayValue(commissionerDecision?.decision)}</div>
              <div><span className="text-muted-foreground">Commissioner At:</span> {displayValue(commissionerDecision?.at)}</div>
              <div className="md:col-span-2 whitespace-pre-wrap">
                <span className="text-muted-foreground">Commissioner Notes:</span> {displayValue(commissionerDecision?.notes)}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Full Activity Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {timeline.length === 0 ? (
                <div className="text-sm text-muted-foreground">No activity events available.</div>
              ) : (
                timeline.map((event, idx) => (
                  <div key={`${event.type}-${event.at}-${idx}`} className="rounded-md border p-3 text-sm space-y-1">
                    <div className="font-medium">{event.type}</div>
                    <div className="text-muted-foreground">{displayValue(event.at)} | {displayValue(event.actor)}</div>
                    <div className="whitespace-pre-wrap">{displayValue(event.details)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Blockchain Anchor</CardTitle></CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-4 text-sm">
              <div className="break-all"><span className="text-muted-foreground">Transaction ID:</span> {displayValue(c?.chainAnchor?.transactionId || c?.chainAnchor?.txHash)}</div>
              <div><span className="text-muted-foreground">Channel:</span> {displayValue(c?.chainAnchor?.channelName)}</div>
              <div><span className="text-muted-foreground">Chaincode:</span> {displayValue(c?.chainAnchor?.chaincodeName)}</div>
              <div className="break-all"><span className="text-muted-foreground">Content Hash:</span> {displayValue(c?.chainAnchor?.contentHash)}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Section B Append Entries</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {appendEntries.length === 0 ? (
                <div className="text-sm text-muted-foreground">No appended investigation entries.</div>
              ) : (
                appendEntries.map((entry: any) => (
                  <div key={entry.id} className="rounded-md border p-3 text-sm space-y-1">
                    <div className="font-medium">{displayValue(entry.title)}</div>
                    <div className="text-muted-foreground">Type: {displayValue(entry.type)}</div>
                    <div className="text-muted-foreground">{displayValue(entry.createdAt)} | {displayValue(entry.createdByName)}</div>
                    <div className="whitespace-pre-wrap">{displayValue(entry.summary)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Section C Documentation Entries</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {documentationEntries.length === 0 ? (
                <div className="text-sm text-muted-foreground">No Section C documentation entries.</div>
              ) : (
                documentationEntries.map((entry: any) => (
                  <div key={entry.id} className="rounded-md border p-3 text-sm space-y-1">
                    <div className="font-medium">{displayValue(entry.title)}</div>
                    <div className="text-muted-foreground">{displayValue(entry.createdAt)} | {displayValue(entry.createdByName)}</div>
                    <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Process:</span> {displayValue(entry?.data?.processDocumentation)}</div>
                    <div><span className="text-muted-foreground">Budget:</span> {displayValue(entry?.data?.budgetUsed)}</div>
                    <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Remarks:</span> {displayValue(entry?.data?.reportRemarks)}</div>
                    <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Recommendation:</span> {displayValue(entry?.data?.recommendation)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

