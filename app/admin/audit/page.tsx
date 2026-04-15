"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { getPublicTimeline } from "@/lib/public-case-tracking"

type AuditEntry = {
  id: string
  caseId: string
  caseNumber: string
  action: string
  actorName: string
  actorRole: string
  createdAt: string
  reason?: string
  previousStage?: string
}

function actionBadge(action: string) {
  const normalized = String(action).toLowerCase()
  if (normalized.includes("rejected")) return "bg-red-100 text-red-700 border-red-200"
  if (normalized.includes("approved")) return "bg-green-100 text-green-700 border-green-200"
  if (normalized.includes("public")) return "bg-blue-100 text-blue-700 border-blue-200"
  return "bg-slate-100 text-slate-700 border-slate-200"
}

export default function AdminAuditPage() {
  const cases = useStore((s) => s.cases)
  const caseActivities = useStore((s) => s.caseActivities)
  const [search, setSearch] = useState("")

  const auditEntries = useMemo(() => {
    const entries: AuditEntry[] = []

    for (const caseData of cases || []) {
      const timeline = getPublicTimeline(caseData, caseActivities)
      const caseNumber = caseData.caseNumber || caseData.caseId

      for (const event of timeline) {
        entries.push({
          id: `${caseData.caseId}-${event.id}`,
          caseId: caseData.caseId,
          caseNumber,
          action: event.type,
          actorName: event.actorName,
          actorRole: event.actorRole,
          createdAt: event.createdAt,
          reason: String(event.metadata?.reason || ""),
          previousStage:
            event.type === "commissioner_rejected"
              ? String(caseData?.policeSections?.sectionC?.submittedToCommissionerAt ? "pending_commissioner" : "review")
              : "",
        })
      }
    }

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [cases, caseActivities])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return auditEntries
    return auditEntries.filter((item) => {
      return (
        item.caseNumber.toLowerCase().includes(q) ||
        item.caseId.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.actorName.toLowerCase().includes(q) ||
        item.actorRole.toLowerCase().includes(q) ||
        String(item.reason || "").toLowerCase().includes(q)
      )
    })
  }, [auditEntries, search])

  const rejectionEntries = filtered.filter((item) => item.action === "commissioner_rejected")

  return (
    <DashboardLayout allowedRoles={["admin", "police_admin", "court_admin", "dpp_admin"]} title="Admin Audit Trail">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Trace Entries</div>
              <div className="mt-1 text-2xl font-semibold">{auditEntries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Commissioner Rejections</div>
              <div className="mt-1 text-2xl font-semibold">{rejectionEntries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Public Submissions</div>
              <div className="mt-1 text-2xl font-semibold">
                {auditEntries.filter((entry) => entry.action.startsWith("public_")).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Cases Tracked</div>
              <div className="mt-1 text-2xl font-semibold">{(cases || []).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trace Search</CardTitle>
            <CardDescription>Search by case number, actor, action, or reason.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trace logs..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action History</CardTitle>
            <CardDescription>Immutable activity log for case progress and public interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No audit entries found.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((entry) => (
                  <div key={entry.id} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{entry.caseNumber}</div>
                        <div className="font-mono text-xs text-muted-foreground">{entry.caseId}</div>
                      </div>
                      <Badge variant="outline" className={actionBadge(entry.action)}>
                        {entry.action.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                      <div>
                        <span className="font-medium">Actor:</span> {entry.actorName}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span> {entry.actorRole}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {new Date(entry.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {entry.reason ? (
                      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                        <span className="font-medium">Reason:</span> {entry.reason}
                      </div>
                    ) : null}

                    {entry.previousStage ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Previous Stage: {entry.previousStage}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

