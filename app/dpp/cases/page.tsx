"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DppCasesPage() {
  const { getAllCases } = useStore()
  const list = getAllCases().filter((c) =>
    [
      "submitted_to_dpp",
      "assigned_to_prosecutor",
      "returned_to_police",
      "filed_to_small_court",
      "small_court_requests_high_court",
      "filed_to_high_court",
    ].includes(c.status)
  )

  return (
    <DashboardLayout allowedRoles={["dpp"]} title="DPP Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">All prosecution cases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => (
            <div key={c.caseId} className="space-y-2">
              <CaseCard caseData={c} />
              <Link href={`/police/case/${c.caseId}`} className="block">
                <Button variant="outline" className="w-full">Open Police Docket (Section B)</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}