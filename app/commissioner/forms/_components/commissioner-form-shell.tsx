"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

type Props = {
  title: string
  description: string
  children: (context: {
    caseData: any
    sectionA: Record<string, any>
  }) => React.ReactNode
}

export function CommissionerFormShell({ title, description, children }: Props) {
  const params = useParams<{ caseId: string }>()
  const { getCaseById } = useStore()
  const caseData = getCaseById(params.caseId)

  if (!caseData) {
    return (
      <DashboardLayout allowedRoles={["police_commissioner"]} title={title}>
        <div className="text-sm text-muted-foreground">Case not found.</div>
      </DashboardLayout>
    )
  }

  const sectionA = (caseData.policeSections?.sectionA ?? {}) as Record<string, any>
  const commissionerDecision = (caseData.commissionerDecision ?? {}) as Record<string, any>

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title={title}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="secondary">
            <Link href={`/commissioner/review/${caseData.caseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Packet
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            {caseData.caseNumber} - {caseData.status}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Crime No</div>
              <div>{sectionA.crimeNo || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Reported</div>
              <div>{sectionA.dateReported || "N/A"} {sectionA.timeReported || ""}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Complainant</div>
              <div>{sectionA.aggrievedFullName || sectionA.reportingPersonFullName || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Alleged Crime</div>
              <div>{sectionA.allegedCrime || "N/A"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Location</div>
              <div>{sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        {children({ caseData, sectionA })}

        <Card>
          <CardHeader>
            <CardTitle>Commissioner Notes</CardTitle>
            <CardDescription>Current decision notes captured for this case.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={commissionerDecision.notes || ""}
              readOnly
              rows={4}
              placeholder="No decision notes recorded yet."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
