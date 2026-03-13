"use client"

import React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

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

export default function PoliceCasesPage() {
  const { currentUser, getAllCases, submitToInvestigation } = useStore()
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")

  const all = getAllCases().filter(c => c.policeOfficerId === currentUser?.id)

  const filtered = all.filter(c => {
    if (status !== "all" && c.status !== status) return false
    const a = c.policeSections?.sectionA
    const hay = [
      c.caseNumber, c.caseId,
      a?.crimeNo, a?.reportingPersonFullName, a?.aggrievedFullName,
      a?.whereCommitted, a?.whereCommittedSpecify,
      a?.suspectDetails, a?.modusOperandi
    ].filter(Boolean).join(" ").toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <DashboardLayout allowedRoles={["police_officer"]} title="My Police Cases">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by crime no, complainant, suspect, location..." />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[260px]">
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
            <Button asChild className="shrink-0">
              <Link href="/police/dashboardnew-case">Open New Case</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {filtered.map(c => {
            const a = c.policeSections?.sectionA
            return (
              <Card key={c.caseId} className="hover:border-primary/60 transition">
                <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">{c.caseNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Crime No: {a?.crimeNo || "—"} • Reported: {a?.dateReported || "—"} {a?.timeReported || ""}
                    </div>
                    <div className="text-sm">
                      {a?.allegedCrime || "—"} • {a?.whereCommitted || a?.whereCommittedSpecify || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{labelStatus(c.status)}</Badge>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/police/case/${c.caseId}`}>Open</Link>
                    </Button>
                    {c.status === "draft_police" && currentUser && (
                      <Button size="sm" onClick={() => submitToInvestigation(c.caseId, currentUser)}>
                        Submit → Investigation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No cases found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}