"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerBriefingFormPage() {
  return (
    <CommissionerFormShell
      title="Commissioner Briefing Summary"
      description="Executive briefing generated from the police case opening data for quick command review."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Alleged crime:</span> {sectionA.allegedCrime || "N/A"}</div>
              <div><span className="text-muted-foreground">Attempt:</span> {sectionA.attempt ? "Yes" : "No"}</div>
              <div><span className="text-muted-foreground">Location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div><span className="text-muted-foreground">Time range:</span> {sectionA.whenFromDate || "N/A"} {sectionA.whenFromTime || ""} to {sectionA.whenToDate || "N/A"} {sectionA.whenToTime || ""}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Officers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Opening officer:</span> {sectionA.openedByName || "N/A"}</div>
              <div><span className="text-muted-foreground">Investigator:</span> {sectionA.investigatorOfficerNameNumber || "N/A"}</div>
              <div><span className="text-muted-foreground">Supervisor:</span> {sectionA.supervisor || "N/A"}</div>
              <div><span className="text-muted-foreground">Detected by:</span> {sectionA.detectedBy || "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Operational Narrative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Modus operandi:</span> {sectionA.modusOperandi || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Property or injury:</span> {sectionA.propertyOrInjury || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
