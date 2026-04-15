"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Row = {
  caseId: string
  caseNumber: string
  docketNumber: string
  title: string
  crimeType: string
  location: string
  currentPhase: string
  currentStatus: string
  rejectionStatus: string
  rejectionReason: string
  rejectionReasonPublic: string
  rejectedBy: string
  rejectedByRole: string
  rejectedAt: string
  resumed: boolean
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s.includes("rejected")) return "bg-destructive/15 text-destructive border-destructive/30"
  if (s.includes("back in process") || s.includes("approved")) return "bg-success/15 text-foreground border-success/30"
  return "bg-warning/15 text-foreground border-warning/30"
}

export default function AdminRejectedCasesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/rejections?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.rows)) {
          setRows(data.rows)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  const resumed = useMemo(() => rows.filter((r) => r.resumed).length, [rows])

  return (
    <DashboardLayout allowedRoles={["admin", "police_admin", "court_admin", "dpp_admin"]} title="Rejected Cases">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Rejected Cases</div><div className="mt-1 text-2xl font-semibold">{rows.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Resumed Cases</div><div className="mt-1 text-2xl font-semibold">{resumed}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Pending Correction</div><div className="mt-1 text-2xl font-semibold">{rows.length - resumed}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Rejections</CardTitle>
            <CardDescription>Search by case, reviewer, role, reason, crime type, or location.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rejected cases..." />
            <Button asChild variant="outline"><Link href="/admin/rejections/analytics">Analytics</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/rejections/reviewer-trace">Reviewer Trace</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejected Case Register</CardTitle>
            <CardDescription>Append-only rejection and resubmission truth view for admin.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No rejected cases found.</div>
            ) : (
              <div className="space-y-3">
                {rows.map((row) => (
                  <div key={row.caseId} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{row.caseNumber}</div>
                        <div className="text-xs text-muted-foreground">{row.caseId}</div>
                      </div>
                      <Badge variant="outline" className={statusBadge(row.rejectionStatus)}>{row.rejectionStatus}</Badge>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                      <div><span className="font-medium">Title:</span> {row.title}</div>
                      <div><span className="font-medium">Crime:</span> {row.crimeType}</div>
                      <div><span className="font-medium">Location:</span> {row.location || "N/A"}</div>
                      <div><span className="font-medium">Phase:</span> {row.currentPhase}</div>
                      <div><span className="font-medium">Status:</span> {row.currentStatus}</div>
                      <div><span className="font-medium">Rejected At:</span> {row.rejectedAt ? new Date(row.rejectedAt).toLocaleString() : "N/A"}</div>
                      <div><span className="font-medium">Rejected By:</span> {row.rejectedBy || "N/A"}</div>
                      <div><span className="font-medium">Role:</span> {row.rejectedByRole || "N/A"}</div>
                    </div>

                    <div className="mt-3 rounded-md border border-border bg-background p-2 text-sm">
                      <span className="font-medium">Internal Reason:</span> {row.rejectionReason || "No reason captured."}
                    </div>
                    <div className="mt-2 rounded-md border border-border bg-background p-2 text-sm">
                      <span className="font-medium">Public-Safe Reason:</span> {row.rejectionReasonPublic || "No public reason available."}
                    </div>
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

