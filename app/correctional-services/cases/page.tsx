"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function CorrectionalServicesCasesPage() {
  const { getAllCases } = useStore()
  const cases = getAllCases().filter((c) =>
    [
      "transferred_to_correctional_services",
      "serving_sentence",
      "parole_review",
      "released",
    ].includes(String(c.status || "").toLowerCase())
  )

  return (
    <DashboardLayout allowedRoles={["correctional_services", "correctional_admin"]} title="Correctional Services Cases">
      <div className="space-y-4">
        <p className="text-muted-foreground">These are the cases currently in correctional intake, sentence execution, parole, or release stages.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((caseData) => (
            <CaseCard key={caseData.caseId} caseData={caseData} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
