"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function AppealRegistryCasesPage() {
  const { getAllCases } = useStore()
  const cases = getAllCases().filter((c) =>
    ["appealed", "appeal_in_progress", "appeal_decided"].includes(String(c.status || "").toLowerCase())
  )

  return (
    <DashboardLayout allowedRoles={["appeal_registry", "appeal_judge"]} title="Appeal Cases">
      <div className="space-y-4">
        <p className="text-muted-foreground">These are the cases that have moved into appeal registration, appeal hearing, or appeal decision stages.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((caseData) => (
            <CaseCard key={caseData.caseId} caseData={caseData} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
