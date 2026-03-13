"use client"

import Link from "next/link"
import { FileText, Clock, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function ProsecutorDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const myAssigned = all.filter(
    (c) => c.status === "assigned_to_prosecutor" && c.dppReview?.assignedProsecutorId === currentUser?.id
  )

  return (
    <DashboardLayout allowedRoles={["prosecutor"]} title="Prosecutor Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Review assigned cases and file to Small Court or return to Police.</p>
          </div>
          <Link href="/prosecutor/cases">
            <Button>
              Open My Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={myAssigned.length} description="Awaiting action" icon={Clock} />
          <StatsCard title="Total" value={all.length} description="All cases" icon={FileText} />
        </div>

        {myAssigned.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myAssigned.slice(0, 4).map((c) => (
              <CaseCard key={c.caseId} caseData={c} />
            ))}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}