"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  status: string
  policeSections?: {
    sectionA?: {
      crimeNo?: string
      aggrievedFullName?: string
      reportingPersonFullName?: string
      suspectDetails?: string
      whereCommitted?: string
      whereCommittedSpecify?: string
      modusOperandi?: string
      allegedCrime?: string
      dateReported?: string
      timeReported?: string
    }
  }
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
    default:
      return s
  }
}

export default function InvestigationCasesClient() {
  const sp = useSearchParams()
  const tab = sp.get("tab") || "pending"
  const [q, setQ] = React.useState("")

  const store = useStore() as any
  const getAllCases = store.getAllCases ?? (() => [])
  const all = (getAllCases() ?? []) as AppCase[]

  const filteredByTab = all.filter((c: AppCase) => {
    if (tab === "pending") return c.status === "pending_investigation"
    if (tab === "active") return c.status === "in_investigation"
    if (tab === "sent") {
      return (
        c.status === "pending_commissioner" ||
        c.status === "submitted_to_commissioner" ||
        c.status === "commissioner_clarification"
      )
    }
    return true
  })

  const filtered = filteredByTab.filter((c: AppCase) => {
    const a = c.policeSections?.sectionA
    const hay = [
      c.caseNumber,
      c.caseId,
      a?.crimeNo,
      a?.aggrievedFullName,
      a?.reportingPersonFullName,
      a?.suspectDetails,
      a?.whereCommitted,
      a?.whereCommittedSpecify,
      a?.modusOperandi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(q.toLowerCase())
  })

  return (
    <DashboardLayout allowedRoles={["police_investigator"]} title="Investigation Queue">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by case number, crime no, complainant, suspect, location..."
            />
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {filtered.map((c: AppCase) => {
            const a = c.policeSections?.sectionA
            return (
              <Card key={c.caseId} className="hover:border-primary/60 transition">
                <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {c.caseNumber || c.caseId}{" "}
                      <span className="text-muted-foreground text-sm">({c.caseId})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Crime No: {a?.crimeNo || "—"} • Reported: {a?.dateReported || "—"}{" "}
                      {a?.timeReported || ""}
                    </div>
                    <div className="text-sm">
                      {a?.allegedCrime || "—"} • {a?.whereCommitted || a?.whereCommittedSpecify || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{statusLabel(c.status)}</Badge>
                    <Button asChild size="sm">
                      <Link href={`/investigation/dashboardcase/${c.caseId}`}>Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-muted-foreground text-sm">No cases match your search.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}