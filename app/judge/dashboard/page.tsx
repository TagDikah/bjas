"use client"

import { FileText, Clock, CheckCircle, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function JudgeDashboard() {
  const { currentUser, getAllCases } = useStore()
  
  const allCases = getAllCases()
  const myCases = allCases.filter(c => c.courtRegistry?.assignedJudgeId === currentUser?.id)
  
  const activeCases = myCases.filter(c => c.status === "assigned_to_judge" || c.status === "in_progress")
  const completedCases = myCases.filter(c => c.status === "completed")
  
  // Cases with upcoming hearings
  const upcomingHearings = myCases.filter(c => 
    c.hearingDates && c.hearingDates.length > 0 && c.status !== "completed"
  )

  const recentCases = [...activeCases].slice(0, 4)

  return (
    <DashboardLayout allowedRoles={["judge"]} title="Judge Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name}</h2>
            <p className="text-muted-foreground">Manage your assigned cases and court sessions.</p>
          </div>
          <Link href="/judge/dashboardsessions">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              View Session List
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Assigned"
            value={myCases.length}
            description="Cases assigned to you"
            icon={FileText}
          />
          <StatsCard
            title="Active Cases"
            value={activeCases.length}
            description="Currently in progress"
            icon={Clock}
          />
          <StatsCard
            title="Upcoming Hearings"
            value={upcomingHearings.length}
            description="Scheduled sessions"
            icon={Calendar}
          />
          <StatsCard
            title="Completed"
            value={completedCases.length}
            description="Cases resolved"
            icon={CheckCircle}
          />
        </div>

        {/* Active Cases */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Active Cases</h3>
              <p className="text-sm text-muted-foreground">Cases currently assigned to you</p>
            </div>
            {activeCases.length > 4 && (
              <Link href="/judge/cases">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  View All ({activeCases.length})
                </Button>
              </Link>
            )}
          </div>
          
          {recentCases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentCases.map(caseData => (
                <Link key={caseData.caseId} href={`/judge/cases/${caseData.caseId}`}>
                  <CaseCard caseData={caseData} onClick={() => {}} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h4 className="mt-4 text-lg font-medium text-foreground">No active cases</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                You don&apos;t have any cases assigned to you at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}