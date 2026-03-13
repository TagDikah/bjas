"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Incident Dashboard">
      <Card>
        <CardHeader><CardTitle>Incident Dashboard</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          (Scaffold) This screen is ready for the next step:
          approvals list, incident analytics, audit exports, and retention reports — all in GitHub-dark style.
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
