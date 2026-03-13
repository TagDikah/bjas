"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function ProsecutionRegistryCases() {
  const { getAllCases } = useStore()
  const list = getAllCases().filter((c) =>
    [
      "submitted_to_prosecution_registry",
      "registered_by_prosecution_registry",
      "submitted_to_dpp",
    ].includes(c.status)
  )

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Prosecution Registry Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Cases</h2>
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((c) => (
              <CaseCard key={c.caseId} caseData={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No cases to show.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
