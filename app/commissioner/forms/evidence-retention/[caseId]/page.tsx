"use client"

import React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function CommissionerDashboard() {
  const { getAllCases } = useStore()
  const cases = getAllCases()

  const inbox = cases.filter(c => c.status === "pending_commissioner")
  const clarifications = cases.filter(c => c.status === "commissioner_clarification")
  const approved = cases.filter(c => c.status === "approved")
  const rejected = cases.filter(c => c.status === "rejected")

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Police Commissioner Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{inbox.length}</div>
            <Button asChild className="w-full"><Link href="/commissioner/cases?tab=inbox">Review Now</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Clarifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{clarifications.length}</div>
            <Button asChild className="w-full" variant="secondary"><Link href="/commissioner/cases?tab=clarifications">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{approved.length}</div>
            <Button asChild className="w-full" variant="outline"><Link href="/commissioner/dashboardreports">Reports</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{rejected.length}</div>
            <Button asChild className="w-full" variant="outline"><Link href="/commissioner/dashboardreports">Reports</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="secondary"><Link href="/commissioner/dashboardapprovals">Approvals Queue</Link></Button>
            <Button asChild variant="secondary"><Link href="/commissioner/dashboardincidents">Incident Dashboard</Link></Button>
            <Button asChild variant="secondary"><Link href="/commissioner/dashboardaudit">Audit Trail</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cool Review Mode</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open a case packet to review registration + seizures + investigation side-by-side, verify hashes,
            redact attachments, and sign approval forms.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}