"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerUseOfForceFormPage() {
  return (
    <CommissionerFormShell
      title="Use-of-Force Review"
      description="Commissioner review of force indicators, weapons, injuries, and escalation risk."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Force Indicators</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Firearm used:</span> {sectionA.firearmSpecify || sectionA.firearmUsed || "N/A"}</div>
              <div><span className="text-muted-foreground">Weapon used:</span> {sectionA.weaponSpecify || sectionA.weaponUsed || "N/A"}</div>
              <div><span className="text-muted-foreground">Extent of injury:</span> {sectionA.extentOfInjury || "N/A"}</div>
              <div><span className="text-muted-foreground">Victim statement taken:</span> {sectionA.victimStatementTaken ? "Yes" : "No"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Risk Factors</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Drink related:</span> {sectionA.drinkRelated || "N/A"}</div>
              <div><span className="text-muted-foreground">Drug related:</span> {sectionA.drugRelated || "N/A"}</div>
              <div><span className="text-muted-foreground">Relationship:</span> {sectionA.offenderVictimRelationship || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
