"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerEvidenceRetentionFormPage() {
  return (
    <CommissionerFormShell
      title="Evidence Retention and Disposal"
      description="Evidence summary for retention, chain awareness, and disposal decision support."
    >
      {({ caseData, sectionA }) => {
        const seizures = (caseData.policeSeizures ?? []) as any[]

        return (
          <div className="grid gap-4">
            <Card>
              <CardHeader><CardTitle>Evidence Summary</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Property or injury record:</span> {sectionA.propertyOrInjury || "N/A"}</div>
                <div><span className="text-muted-foreground">Recorded seizures:</span> {seizures.length}</div>
                <div><span className="text-muted-foreground">Case charge:</span> {sectionA.allegedCrime || "N/A"}</div>
                <div><span className="text-muted-foreground">Station arrest number:</span> {sectionA.stationArrestNumber || "N/A"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Seized Items</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {seizures.length === 0 ? (
                  <div className="text-muted-foreground">No seizure items recorded yet.</div>
                ) : (
                  seizures.map((seizure) => (
                    <div key={seizure.seizureId} className="rounded-lg border border-border p-3">
                      <div><span className="text-muted-foreground">Seized at:</span> {seizure.seizedAt || "N/A"}</div>
                      <div><span className="text-muted-foreground">Location:</span> {seizure.seizureLocation || "N/A"}</div>
                      <div><span className="text-muted-foreground">Items:</span> {Array.isArray(seizure.items) ? seizure.items.length : 0}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )
      }}
    </CommissionerFormShell>
  )
}
