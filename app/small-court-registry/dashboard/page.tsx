"use client"

import Link from "next/link"
import { FileText, Clock, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function SmallCourtRegistryDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const intake = all.filter((c) => c.status === "filed_to_small_court")
  const assigned = all.filter((c) => c.status === "assigned_to_small_court_judge")

  return (
    <DashboardLayout allowedRoles={["small_court_registry"]} title="Small Court Registry Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Intake cases from prosecution and assign to Small Court judges.</p>
          </div>
          <Link href="/small-court-registry/dashboardintake">
            <Button>
              Open Intake
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Intake Queue" value={intake.length} description="Awaiting registration" icon={Clock} />
          <StatsCard title="Assigned" value={assigned.length} description="With judges" icon={FileText} />
        </div>

        {intake.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {intake.slice(0, 4).map((c) => (
              <CaseCard key={c.caseId} caseData={c} />
            ))}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}