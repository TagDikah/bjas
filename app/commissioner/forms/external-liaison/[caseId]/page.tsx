"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerExternalLiaisonFormPage() {
  return (
    <CommissionerFormShell
      title="External Agency Liaison"
      description="External liaison summary for inter-agency coordination, referrals, and command communication."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Referral Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Complainant:</span> {sectionA.aggrievedFullName || sectionA.reportingPersonFullName || "N/A"}</div>
              <div><span className="text-muted-foreground">Alleged crime:</span> {sectionA.allegedCrime || "N/A"}</div>
              <div><span className="text-muted-foreground">Location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div><span className="text-muted-foreground">Investigating unit:</span> {sectionA.investigatorUnit || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Coordination Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Supervisor:</span> {sectionA.supervisor || "N/A"}</div>
              <div><span className="text-muted-foreground">Receiving officer:</span> {sectionA.recComplainantOfficer || "N/A"}</div>
              <div><span className="text-muted-foreground">Victim statement taken:</span> {sectionA.victimStatementTaken ? "Yes" : "No"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
