"use client"

import Link from "next/link"
import { Gavel, Clock, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function HighCourtJudgeDashboard() {
  const { currentUser, getAllCases } = useStore()
  const mine = getAllCases().filter(
    (c) => c.status === "assigned_to_high_court_judge" && c.court?.assignedJudgeId === currentUser?.id
  )

  return (
    <DashboardLayout allowedRoles={["high_court_judge", "judge"]} title="High Court Judge Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Work your assigned High Court cases.</p>
          </div>
          <Link href="/high-court-judge/cases">
            <Button>
              Open My Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={mine.length} description="Awaiting action" icon={Clock} />
          <StatsCard title="Role" value={"High Court"} description={"Judge"} icon={Gavel} />
        </div>

        {mine.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.slice(0, 4).map((c) => (
              <CaseCard key={c.caseId} caseData={c} showAssignment />
            ))}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}