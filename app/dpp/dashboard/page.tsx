"use client"

import Link from "next/link"
import { FileText, Clock, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function DppDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const pending = all.filter((c) => c.status === "submitted_to_dpp")
  const assigned = all.filter((c) => c.status === "assigned_to_prosecutor")
  const escalations = all.filter((c) => c.status === "small_court_requests_high_court")

  return (
    <DashboardLayout allowedRoles={["dpp"]} title="DPP Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Review registered cases, assign prosecutors, and approve escalations.</p>
          </div>
          <Link href="/dpp/dashboardreview">
            <Button>
              Open Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Pending Review" value={pending.length} description="Awaiting DPP" icon={Clock} />
          <StatsCard title="Assigned" value={assigned.length} description="With prosecutors" icon={CheckCircle} />
          <StatsCard title="Escalations" value={escalations.length} description="Small â†’ High Court" icon={AlertTriangle} />
          <StatsCard title="Total" value={all.length} description="All cases" icon={FileText} />
        </div>

        {pending.length ? (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Next to review</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {pending.slice(0, 4).map((c) => (
                <CaseCard key={c.caseId} caseData={c} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}