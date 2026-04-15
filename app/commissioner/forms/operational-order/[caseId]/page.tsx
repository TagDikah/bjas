"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerOperationalOrderFormPage() {
  return (
    <CommissionerFormShell
      title="Operational Order"
      description="Operational direction sheet using case location, unit, supervisor, and suspect intelligence."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Command Inputs</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Investigator:</span> {sectionA.investigatorOfficerNameNumber || "N/A"}</div>
              <div><span className="text-muted-foreground">Unit:</span> {sectionA.investigatorUnit || "N/A"}</div>
              <div><span className="text-muted-foreground">Supervisor:</span> {sectionA.supervisor || "N/A"}</div>
              <div><span className="text-muted-foreground">Detected by:</span> {sectionA.detectedBy || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Field Focus</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div><span className="text-muted-foreground">Time window:</span> {sectionA.whenFromDate || "N/A"} {sectionA.whenFromTime || ""} to {sectionA.whenToDate || "N/A"} {sectionA.whenToTime || ""}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Operational narrative:</span> {sectionA.modusOperandi || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
