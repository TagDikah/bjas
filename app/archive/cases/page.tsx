"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

export default function ArchiveCasesPage() {
  const { getAllCases } = useStore()
  const cases = getAllCases().filter((c) =>
    ["closed", "case_closed", "case_archived"].includes(String(c.status || "").toLowerCase())
  )

  return (
    <DashboardLayout allowedRoles={["archive_officer", "admin"]} title="Archived and Closed Cases">
      <div className="space-y-4">
        <p className="text-muted-foreground">These cases have reached final closure or archive state and should remain read-only except for appended audit updates.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((caseData) => (
            <CaseCard key={caseData.caseId} caseData={caseData} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
