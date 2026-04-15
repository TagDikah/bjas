"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerResourceAllocationFormPage() {
  return (
    <CommissionerFormShell
      title="Resource Allocation and Budget"
      description="Command resource review based on units, severity, seizure activity, and investigation scope."
    >
      {({ caseData, sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Operational Resourcing</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Investigator:</span> {sectionA.investigatorOfficerNameNumber || "N/A"}</div>
              <div><span className="text-muted-foreground">Unit:</span> {sectionA.investigatorUnit || "N/A"}</div>
              <div><span className="text-muted-foreground">Supervisor:</span> {sectionA.supervisor || "N/A"}</div>
              <div><span className="text-muted-foreground">Recorded seizures:</span> {Array.isArray(caseData.policeSeizures) ? caseData.policeSeizures.length : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Budget Pressure Signals</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Charge:</span> {sectionA.allegedCrime || "N/A"}</div>
              <div><span className="text-muted-foreground">Property or injury:</span> {sectionA.propertyOrInjury || "N/A"}</div>
              <div><span className="text-muted-foreground">Location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Summary:</span> {sectionA.modusOperandi || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
