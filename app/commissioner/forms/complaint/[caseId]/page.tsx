"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerComplaintFormPage() {
  return (
    <CommissionerFormShell
      title="Complaint and Discipline Referral Form"
      description="Complaint-focused summary pulled from the police case opening form for commissioner review."
    >
      {({ sectionA }) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Complainant:</span> {sectionA.aggrievedFullName || sectionA.reportingPersonFullName || "N/A"}</div>
              <div><span className="text-muted-foreground">Address:</span> {sectionA.aggrievedAddress || sectionA.reportingAddress || "N/A"}</div>
              <div><span className="text-muted-foreground">Method received:</span> {sectionA.methodOfComplaint || "N/A"}</div>
              <div><span className="text-muted-foreground">Reported by officer:</span> {sectionA.recComplainantOfficer || "N/A"}</div>
              <div><span className="text-muted-foreground">Date received:</span> {sectionA.dateReported || "N/A"} {sectionA.timeReported || ""}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk and Harm Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Extent of injury:</span> {sectionA.extentOfInjury || "N/A"}</div>
              <div><span className="text-muted-foreground">Firearm used:</span> {sectionA.firearmSpecify || sectionA.firearmUsed || "N/A"}</div>
              <div><span className="text-muted-foreground">Weapon used:</span> {sectionA.weaponSpecify || sectionA.weaponUsed || "N/A"}</div>
              <div><span className="text-muted-foreground">Drink related:</span> {sectionA.drinkRelated || "N/A"}</div>
              <div><span className="text-muted-foreground">Drug related:</span> {sectionA.drugRelated || "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Narrative Basis for Referral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Offence details:</span> {sectionA.modusOperandi || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Property or injury sustained:</span> {sectionA.propertyOrInjury || "N/A"}</div>
              <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </CommissionerFormShell>
  )
}
