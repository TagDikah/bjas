"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

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

  const commissionerRequestClarification =
    store.commissionerRequestClarification ??
    ((id: string, user: any, notes: string) => updateCase?.(id, { status: "commissioner_clarification" }));

  const c = getCaseById(caseId)

  const [notes, setNotes] = React.useState("")

  if (!c) {
    return (
      <DashboardLayout allowedRoles={["police_commissioner"]} title="Case Not Found">
        <div className="text-muted-foreground">Case not found.</div>
      </DashboardLayout>
    )
  }

  const a = c.policeSections?.sectionA

  const approve = () => {
    if (!currentUser) return
    commissionerApproveCase(caseId, currentUser, notes)
    router.push("/commissioner/cases?tab=approved")
  }

  const reject = () => {
    if (!currentUser) return
    commissionerRejectCase(caseId, currentUser, notes || "Rejected by Commissioner")
    router.push("/commissioner/cases?tab=rejected")
  }

  const clarify = () => {
    if (!currentUser) return
    commissionerRequestClarification(caseId, currentUser, notes || "Clarification requested")
    router.push("/commissioner/cases?tab=clarifications")
  }

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title={`Review Packet: ${c.caseNumber}`}>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{c.caseNumber}</div>
              <div className="text-sm text-muted-foreground">Case ID: {c.caseId}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{c.status}</Badge>
              <Button variant="secondary" onClick={clarify}>Request Clarification</Button>
              <Button variant="destructive" onClick={reject}>Reject</Button>
              <Button onClick={approve}>Approve</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="packet">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packet">Packet</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="notes">Decision Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="packet" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Registration (C1/C2)</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Crime No:</span> {a?.crimeNo || "—"}</div>
                  <div><span className="text-muted-foreground">Reported:</span> {a?.dateReported || "—"} {a?.timeReported || ""}</div>
                  <div><span className="text-muted-foreground">Alleged Crime:</span> {a?.allegedCrime || "—"}</div>
                  <div><span className="text-muted-foreground">Where:</span> {a?.whereCommittedSpecify || a?.whereCommitted || "—"}</div>
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Modus:</span> {a?.modusOperandi || "—"}</div>
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect:</span> {a?.suspectDetails || "—"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Investigation (Section B/C)</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Docket Notes:</span> {(c.policeSections as any)?.sectionB?.docketNotes || "—"}</div>
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Evidence Notes:</span> {(c.policeSections as any)?.sectionB?.evidenceNotes || "—"}</div>
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Findings:</span> {(c.policeSections as any)?.sectionC?.investigationFindings || "—"}</div>
                  <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Recommended:</span> {(c.policeSections as any)?.sectionC?.recommendedAction || "—"}</div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Property Seizure</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {(c.policeSeizures ?? []).map((sz: any) => (
                    <Card key={sz.seizureId}>
                      <CardContent className="p-3 text-sm">
                        <div className="font-medium">{new Date(sz.seizedAt).toLocaleString()}</div>
                        <div className="text-muted-foreground">Location: {sz.seizureLocation}</div>
                        <div>Items: {sz.items.length}</div>
                      </CardContent>
                    </Card>
                  ))}
                  {(c.policeSeizures ?? []).length === 0 && <div className="text-sm text-muted-foreground">No seizures recorded.</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-3">
            <Card>
              <CardHeader><CardTitle>Commissioner Standard Forms</CardTitle></CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                (Scaffold) This will display immutable audit events: open/view/download, hash verification, redaction,
                approvals, and workflow transitions.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-3">
            <Card>
              <CardHeader><CardTitle>Decision Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={5} placeholder="Reason, conditions, or clarification questions..." />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
