"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function HighCourtRegistryCases() {
  const { getAllCases } = useStore()
  const list = getAllCases().filter((c) => c.court?.courtType === "high")

  return (
    <DashboardLayout allowedRoles={["high_court_registry", "high_court_registry_assistant", "court_registry"]} title="High Court Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">High Court cases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => (
            <CaseCard key={c.caseId} caseData={c} showAssignment />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
