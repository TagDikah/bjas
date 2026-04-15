"use client"

import Link from "next/link"
import { FileText, Clock, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function DppDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const pending = all.filter((c) => c.status === "submitted_to_dpp")
  const registered = all.filter((c) => c.status === "dpp_registry_intake")
  const assigned = all.filter((c) => c.status === "assigned_to_prosecutor")
  const escalations = all.filter((c) => c.status === "small_court_requests_high_court")

  const recommendation =
    pending.length > registered.length
      ? "Register commissioner-approved files in the DPP office first so prosecutors receive complete trial packets."
      : assigned.length < registered.length
        ? "More registered files are waiting than assigned. Allocate prosecutors next to keep the prosecution line moving."
        : "The DPP workflow is balanced. Focus on returns to police and escalations that may delay trial readiness."

  return (
    <DashboardLayout allowedRoles={["dpp"]} title="DPP Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">
              Register cases from the police commissioner, assign prosecutors, and control prosecution flow.
            </p>
          </div>
          <Link href="/dpp/review">
            <Button>
              Open Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Awaiting DPP" value={pending.length} description="From commissioner" icon={Clock} />
          <StatsCard title="DPP Registered" value={registered.length} description="Filed in DPP office" icon={CheckCircle} />
          <StatsCard title="Assigned" value={assigned.length} description="With prosecutors" icon={FileText} />
          <StatsCard title="Escalations" value={escalations.length} description="Awaiting direction" icon={AlertTriangle} />
        </div>

        <WorkflowAnalytics
          title="DPP Pipeline Analytics"
          subtitle="Bar-chart style view of prosecution workload."
          items={[
            { label: "Awaiting DPP registration", value: pending.length, tone: pending.length > registered.length ? "warning" : "default" },
            { label: "Registered in DPP office", value: registered.length },
            { label: "Assigned to prosecutors", value: assigned.length, tone: "success" },
            { label: "Escalations to review", value: escalations.length, tone: "warning" },
          ]}
          recommendation={recommendation}
        />

        {[...pending, ...registered].length ? (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Next to review</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[...pending, ...registered].slice(0, 4).map((c) => (
                <CaseCard key={c.caseId} caseData={c} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
