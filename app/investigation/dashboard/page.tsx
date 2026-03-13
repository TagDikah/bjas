"use client"

import React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function InvestigationDashboard() {
  const { getAllCases } = useStore()
  const cases = getAllCases()

  const pending = cases.filter(c => c.status === "pending_investigation")
  const inProgress = cases.filter(c => c.status === "in_investigation")
  const awaitingCommissioner = cases.filter(
    c => c.status === "pending_commissioner" || c.status === "submitted_to_commissioner"
  )

  return (
    <DashboardLayout allowedRoles={["police_investigator"]} title="Police Investigation Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pending Intake</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{pending.length}</div>
            <Button asChild className="w-full">
              <Link href="/investigation/cases?tab=pending">Open Queue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>In Investigation</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{inProgress.length}</div>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/investigation/cases?tab=active">View Active</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Awaiting Commissioner</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{awaitingCommissioner.length}</div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/investigation/cases?tab=sent">View Sent</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}