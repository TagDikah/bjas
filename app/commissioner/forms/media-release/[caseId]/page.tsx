"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerMediaReleaseFormPage() {
  return (
    <CommissionerFormShell
      title="Media Release Approval"
      description="Public communication review based on case sensitivity, injury level, and investigative posture."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Public Release Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Alleged crime:</span> {sectionA.allegedCrime || "N/A"}</div>
              <div><span className="text-muted-foreground">Location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div><span className="text-muted-foreground">Extent of injury:</span> {sectionA.extentOfInjury || "N/A"}</div>
              <div><span className="text-muted-foreground">Weapon indicator:</span> {sectionA.weaponSpecify || sectionA.weaponUsed || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Disclosure Checks</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>Victim identified: {sectionA.aggrievedFullName ? "Yes" : "No"}</div>
              <div>Suspect description recorded: {sectionA.suspectDetails ? "Yes" : "No"}</div>
              <div>Investigator assigned: {sectionA.investigatorOfficerNameNumber ? "Yes" : "No"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Narrative basis:</span> {sectionA.modusOperandi || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
