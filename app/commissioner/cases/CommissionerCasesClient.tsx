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
      allegedCrime?: string
      whereCommitted?: string
      whereCommittedSpecify?: string
      suspectDetails?: string
    }
  }
}

export default function CommissionerCasesClient() {
  const sp = useSearchParams()
  const tab = sp.get("tab") || "inbox"
  const [q, setQ] = React.useState("")
  const store = useStore() as any
  const getAllCases = store.getAllCases ?? (() => [])
  const all = (getAllCases() ?? []) as AppCase[]

  const byTab = all.filter((c: AppCase) => {
    if (tab === "inbox") return c.status === "pending_commissioner"
    if (tab === "clarifications") return c.status === "commissioner_clarification"
    if (tab === "approved") return c.status === "approved"
    if (tab === "rejected") return c.status === "rejected"
    return true
  })

  const filtered = byTab.filter((c: AppCase) => {
    const a = c.policeSections?.sectionA
    const hay = [
      c.caseNumber,
      c.caseId,
      a?.crimeNo,
      a?.aggrievedFullName,
      a?.reportingPersonFullName,
      a?.allegedCrime,
      a?.whereCommitted,
      a?.whereCommittedSpecify,
      a?.suspectDetails,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(q.toLowerCase())
  })

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Case Reviews">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by case, crime no, complainant, suspect..."
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
                    <div className="font-semibold">{c.caseNumber || c.caseId}</div>
                    <div className="text-sm text-muted-foreground">
                      Crime No: {a?.crimeNo || "—"} • {a?.allegedCrime || "—"}
                    </div>
                    <div className="text-sm">
                      {a?.whereCommittedSpecify || a?.whereCommitted || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{c.status}</Badge>
                    <Button asChild size="sm">
                      <Link href={`/commissioner/dashboardreview/${c.caseId}`}>Open Packet</Link>
                    </Button>
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