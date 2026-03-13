"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function SmallCourtRegistryCases() {
  const { getAllCases } = useStore()
  const list = getAllCases().filter((c) => c.court?.courtType === "small")

  return (
    <DashboardLayout allowedRoles={["small_court_registry"]} title="Small Court Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Small Court cases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => (
            <CaseCard key={c.caseId} caseData={c} showAssignment />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
