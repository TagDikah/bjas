"use client"

import Link from "next/link"
import { Sparkles, ClipboardCheck, Calendar, FileText } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { useStore } from "@/lib/store"

export default function HighCourtRegistryAssistantDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const intake = all.filter((c) => c.status === "high_court_registry_intake")
  const assigned = all.filter((c) => c.status === "assigned_to_high_court_judge")
  const inProgress = all.filter((c) => c.status === "high_court_in_progress")
  const completed = all.filter((c) => c.status === "high_court_completed")
  const recentIntake = [...intake].sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())

  const recommendation =
    intake.length > assigned.length
      ? "Focus on registry interviews, prodeo screening, and AI-supported judge allocation so the intake queue does not grow."
      : inProgress.length > completed.length
        ? "More matters are active than completed. Prioritize PTPS scheduling, hearing dates, and clerk support for assigned judges."
        : "The court registry pipeline is stable. Continue monitoring completed matters and claim processing for prodeo counsel."

  return (
    <DashboardLayout
      allowedRoles={["high_court_registry_assistant", "high_court_registry", "court_registry"]}
      title="High Court Registry Assistance"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {currentUser?.name?.split(" ")[0]}
            </h2>
            <p className="text-muted-foreground">
              Support criminal case flow from registry intake, interviews, and PTPS up to judge and clerk assignment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/16 hover:!text-white [&_svg]:!text-white"
            >
              <Link href="/high-court-registry/assistant/assign">
                Open Assignment Queue
                <Sparkles className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/16 hover:!text-white [&_svg]:!text-white"
            >
              <Link href="/high-court-registry/cases">
                All High Court Cases
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Awaiting Assignment" value={intake.length} description="Registry intake complete" icon={ClipboardCheck} />
          <StatsCard title="Assigned" value={assigned.length} description="Allocated to judges" icon={Sparkles} />
          <StatsCard title="In Progress" value={inProgress.length} description="Active hearings" icon={Calendar} />
          <StatsCard title="Completed" value={completed.length} description="Concluded matters" icon={FileText} />
        </div>

        <WorkflowAnalytics
          title="Court Registry Workflow Analytics"
          subtitle="Compact view of the criminal trial management pipeline."
          compact
          items={[
            { label: "Registry intake complete", value: intake.length, tone: intake.length > assigned.length ? "warning" : "default" },
            { label: "Assigned to judges", value: assigned.length },
            { label: "High Court in progress", value: inProgress.length },
            { label: "High Court completed", value: completed.length, tone: "success" },
          ]}
          recommendation={recommendation}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Awaiting Assignment Cases</h3>
              <p className="text-sm text-muted-foreground">
                Cases already sent from registry intake and ready for judge and clerk allocation.
              </p>
            </div>
            {intake.length > 0 ? (
              <Link href="/high-court-registry/assistant/assign">
                <Button variant="outline">Go To Assignment</Button>
              </Link>
            ) : null}
          </div>

          {recentIntake.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentIntake.map((caseData) => (
                <Link key={caseData.caseId} href={`/high-court-registry/assistant/process-form?caseId=${encodeURIComponent(caseData.caseId)}`}>
                  <CaseCard caseData={caseData} showAssignment />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No sent High Court intake cases are waiting for assignment right now.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
