"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Analytics = {
  totalRejected: number
  resumed: number
  pendingCorrection: number
  rejectionRateResumed: number
  byReviewer: Array<{ name: string; count: number }>
  byRole: Array<{ role: string; count: number }>
  byReason: Array<{ reason: string; count: number }>
  byCrimeType: Array<{ crimeType: string; count: number }>
  byDistrict: Array<{ district: string; count: number }>
}

export default function RejectionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRejected: 0,
    resumed: 0,
    pendingCorrection: 0,
    rejectionRateResumed: 0,
    byReviewer: [],
    byRole: [],
    byReason: [],
    byCrimeType: [],
    byDistrict: [],
  })

  useEffect(() => {
    fetch("/api/admin/rejections/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setAnalytics({
            totalRejected: data.totalRejected ?? 0,
            resumed: data.resumed ?? 0,
            pendingCorrection: data.pendingCorrection ?? 0,
            rejectionRateResumed: data.rejectionRateResumed ?? 0,
            byReviewer: Array.isArray(data.byReviewer) ? data.byReviewer : [],
            byRole: Array.isArray(data.byRole) ? data.byRole : [],
            byReason: Array.isArray(data.byReason) ? data.byReason : [],
            byCrimeType: Array.isArray(data.byCrimeType) ? data.byCrimeType : [],
            byDistrict: Array.isArray(data.byDistrict) ? data.byDistrict : [],
          })
        }
      })
      .catch(() => {})
  }, [])

  const top = <T extends { count: number }>(arr: T[]) => [...arr].sort((a, b) => b.count - a.count).slice(0, 8)

  return (
    <DashboardLayout allowedRoles={["admin", "police_admin", "court_admin", "dpp_admin"]} title="Rejection Analytics">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Rejected Cases</div><div className="mt-1 text-2xl font-semibold">{analytics.totalRejected}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Resumed</div><div className="mt-1 text-2xl font-semibold">{analytics.resumed}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Pending Correction</div><div className="mt-1 text-2xl font-semibold">{analytics.pendingCorrection}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Resumed Rate</div><div className="mt-1 text-2xl font-semibold">{analytics.rejectionRateResumed}%</div></CardContent></Card>
        </div>

        <div className="flex justify-end">
          <Button asChild variant="outline"><Link href="/admin/rejections">Back to Rejected Cases</Link></Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>By Reviewer</CardTitle><CardDescription>Who rejected cases most.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {top(analytics.byReviewer).map((r) => <div key={r.name} className="flex justify-between rounded border p-2 text-sm"><span>{r.name}</span><span className="font-semibold">{r.count}</span></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>By Role</CardTitle><CardDescription>Rejection totals by reviewer role.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {top(analytics.byRole).map((r) => <div key={r.role} className="flex justify-between rounded border p-2 text-sm"><span>{r.role}</span><span className="font-semibold">{r.count}</span></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Common Rejection Reasons</CardTitle><CardDescription>Most frequent causes of rejection.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {top(analytics.byReason).map((r) => <div key={r.reason} className="flex justify-between rounded border p-2 text-sm"><span>{r.reason}</span><span className="font-semibold">{r.count}</span></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>By Crime / District</CardTitle><CardDescription>Pattern insights for geography and crime type.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-2 text-sm font-medium">Crime Types</div>
                {top(analytics.byCrimeType).map((r) => <div key={r.crimeType} className="flex justify-between rounded border p-2 text-sm"><span>{r.crimeType}</span><span className="font-semibold">{r.count}</span></div>)}
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Districts</div>
                {top(analytics.byDistrict).map((r) => <div key={r.district} className="flex justify-between rounded border p-2 text-sm"><span>{r.district}</span><span className="font-semibold">{r.count}</span></div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

