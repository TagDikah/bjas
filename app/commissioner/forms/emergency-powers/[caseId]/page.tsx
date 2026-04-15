"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerEmergencyPowersFormPage() {
  return (
    <CommissionerFormShell
      title="Emergency Powers and Curfew"
      description="Emergency escalation review for high-risk incidents requiring fast commissioner intervention."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Emergency Triggers</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Alleged crime:</span> {sectionA.allegedCrime || "N/A"}</div>
              <div><span className="text-muted-foreground">Extent of injury:</span> {sectionA.extentOfInjury || "N/A"}</div>
              <div><span className="text-muted-foreground">Firearm used:</span> {sectionA.firearmSpecify || sectionA.firearmUsed || "N/A"}</div>
              <div><span className="text-muted-foreground">Weapon used:</span> {sectionA.weaponSpecify || sectionA.weaponUsed || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Situation Awareness</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">District / location:</span> {sectionA.whereCommittedSpecify || sectionA.whereCommitted || "N/A"}</div>
              <div><span className="text-muted-foreground">Drink factor:</span> {sectionA.drinkRelated || "N/A"}</div>
              <div><span className="text-muted-foreground">Drug factor:</span> {sectionA.drugRelated || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Incident narrative:</span> {sectionA.modusOperandi || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
