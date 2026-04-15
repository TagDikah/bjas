"use client"

import Link from "next/link"
import { ArrowRight, Scale } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function AppealRegistryDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const filed = all.filter((c) => c.status === "appealed")
  const active = all.filter((c) => c.status === "appeal_in_progress")
  const decided = all.filter((c) => c.status === "appeal_decided")

  return (
    <DashboardLayout allowedRoles={["appeal_registry", "appeal_judge"]} title="Appeal Registry Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Track appeal filing, registry intake, hearing progress, and final appeal outcomes.</p>
          </div>
          <Link href="/appeal-registry/cases">
            <Button className="!text-white hover:!text-white [&_svg]:text-white">
              Open Appeal Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Appeals Filed" value={filed.length} description="Awaiting registry processing" icon={Scale} />
          <StatsCard title="In Progress" value={active.length} description="Hearing and review stage" icon={Scale} />
          <StatsCard title="Decided" value={decided.length} description="Appeal outcome recorded" icon={Scale} />
        </div>

        <WorkflowAnalytics
          title="Appeal Analytics"
          subtitle="Appeal-stage visibility after judgment and sentence."
          items={[
            { label: "Appeals filed", value: filed.length, tone: filed.length > active.length ? "warning" : "default" },
            { label: "Appeals in progress", value: active.length },
            { label: "Appeals decided", value: decided.length, tone: "success" },
          ]}
          recommendation="Every appeal filing, hearing, and final outcome should remain append-only so appellate history stays visible even after the main case is closed."
        />
      </div>
    </DashboardLayout>
  )
}
