"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Row = {
  caseId: string
  caseNumber: string
  title: string
  rejectedBy: string
  rejectedByRole: string
  rejectionReason: string
  rejectedAt: string
}

export default function ReviewerTracePage() {
  const [rows, setRows] = useState<Row[]>([])
  const [reviewer, setReviewer] = useState("")
  const [role, setRole] = useState("")
  const [reason, setReason] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  useEffect(() => {
    const qs = new URLSearchParams()
    if (reviewer.trim()) qs.set("rejectedBy", reviewer.trim())
    if (role.trim()) qs.set("rejectedByRole", role.trim())
    if (reason.trim()) qs.set("reason", reason.trim())
    if (from) qs.set("from", from)
    if (to) qs.set("to", to)

    fetch(`/api/admin/rejections?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.rows)) {
          setRows(data.rows)
        }
      })
      .catch(() => {})
  }, [reviewer, role, reason, from, to])

  const grouped = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of rows) {
      const key = `${r.rejectedBy || "Unknown"} (${r.rejectedByRole || "Unknown"})`
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [rows])

  return (
    <DashboardLayout allowedRoles={["admin", "police_admin", "court_admin", "dpp_admin"]} title="Reviewer Trace">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Trace Filters</CardTitle>
            <CardDescription>Search all cases rejected by officer, role, date range, or reason.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <Input placeholder="Rejected by name" value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
            <Input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline"><Link href="/admin/rejections">Rejected Cases</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/rejections/analytics">Analytics</Link></Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rejections by Reviewer</CardTitle>
              <CardDescription>Who rejected what and how often.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {grouped.map((g) => (
                <div key={g.name} className="flex justify-between rounded border p-2 text-sm">
                  <span>{g.name}</span>
                  <span className="font-semibold">{g.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matched Cases</CardTitle>
              <CardDescription>{rows.length} cases matched.</CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No matches found.</div>
              ) : (
                <div className="space-y-2">
                  {rows.map((r) => (
                    <div key={r.caseId} className="rounded border p-2 text-sm">
                      <div className="font-semibold">{r.caseNumber}</div>
                      <div>{r.title}</div>
                      <div className="text-muted-foreground">
                        {r.rejectedBy || "Unknown"} ({r.rejectedByRole || "Unknown"}) - {r.rejectedAt ? new Date(r.rejectedAt).toLocaleString() : "N/A"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{r.rejectionReason || "No reason captured."}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

