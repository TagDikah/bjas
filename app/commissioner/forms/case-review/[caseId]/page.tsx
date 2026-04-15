"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommissionerFormShell } from "../../_components/commissioner-form-shell"

export default function CommissionerCaseReviewFormPage() {
  return (
    <CommissionerFormShell
      title="Case Review and Approval Form"
      description="Police commissioner review form generated from the case opening details and investigation handoff."
    >
      {({ caseData, sectionA }) => {
        const sectionB = (caseData.policeSections?.sectionB ?? {}) as Record<string, any>
        const sectionC = (caseData.policeSections?.sectionC ?? {}) as Record<string, any>

        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Opening Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Method of complaint:</span> {sectionA.methodOfComplaint || "N/A"}</div>
                <div><span className="text-muted-foreground">Reporting person:</span> {sectionA.reportingPersonFullName || "N/A"}</div>
                <div><span className="text-muted-foreground">Victim statement taken:</span> {sectionA.victimStatementTaken ? "Yes" : "No"}</div>
                <div><span className="text-muted-foreground">Relationship:</span> {sectionA.offenderVictimRelationship || "N/A"}</div>
                <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Modus operandi:</span> {sectionA.modusOperandi || "N/A"}</div>
                <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Suspect details:</span> {sectionA.suspectDetails || "N/A"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investigation Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Investigator:</span> {sectionA.investigatorOfficerNameNumber || sectionB.investigatorName || "N/A"}</div>
                <div><span className="text-muted-foreground">Unit:</span> {sectionA.investigatorUnit || "N/A"}</div>
                <div><span className="text-muted-foreground">Started:</span> {sectionB.investigationStartedAt || "N/A"}</div>
                <div><span className="text-muted-foreground">Submitted to commissioner:</span> {sectionC.submittedToCommissionerAt || "N/A"}</div>
                <div><span className="text-muted-foreground">Submitted by:</span> {sectionC.submittedToCommissionerByName || "N/A"}</div>
                <div className="whitespace-pre-wrap"><span className="text-muted-foreground">Recommended action:</span> {sectionC.recommendedAction || "N/A"}</div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Decision Checklist</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
                <div>Charge clearly recorded: {sectionA.allegedCrime ? "Yes" : "No"}</div>
                <div>Complainant identified: {sectionA.aggrievedFullName || sectionA.reportingPersonFullName ? "Yes" : "No"}</div>
                <div>Time window captured: {sectionA.whenFromDate || sectionA.whenToDate ? "Yes" : "No"}</div>
                <div>Location captured: {sectionA.whereCommitted || sectionA.whereCommittedSpecify ? "Yes" : "No"}</div>
                <div>Officer assignment present: {sectionA.investigatorOfficerNameNumber ? "Yes" : "No"}</div>
                <div>Property or injury details present: {sectionA.propertyOrInjury ? "Yes" : "No"}</div>
              </CardContent>
            </Card>
          </div>
        )
      }}
    </CommissionerFormShell>
  )
}
