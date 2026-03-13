"use client"

import { FileText, Clock, Gavel, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function RegistryDashboard() {
  const { currentUser, getAllCases } = useStore()
  
  const allCases = getAllCases()
  
  const approvedCases = allCases.filter(c => c.status === "approved")
  const assignedCases = allCases.filter(c => c.status === "assigned_to_judge" || c.status === "in_progress")
  const completedCases = allCases.filter(c => c.status === "completed")

  const pendingAssignment = [...approvedCases].slice(0, 4)

  return (
    <DashboardLayout allowedRoles={["court_registry"]} title="Court Registry Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[1]}</h2>
            <p className="text-muted-foreground">Manage case assignments and track judicial proceedings.</p>
          </div>
          {approvedCases.length > 0 && (
            <Link href="/registry/dashboardassign">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                AI Assignment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cases"
            value={allCases.length}
            description="In the system"
            icon={FileText}
          />
          <StatsCard
            title="Pending Assignment"
            value={approvedCases.length}
            description="Awaiting judge"
            icon={Clock}
            className={approvedCases.length > 0 ? "border-warning/50" : ""}
          />
          <StatsCard
            title="Assigned to Judges"
            value={assignedCases.length}
            description="Active cases"
            icon={Gavel}
          />
          <StatsCard
            title="Completed"
            value={completedCases.length}
            description="Cases resolved"
            icon={CheckCircle}
          />
        </div>

        {/* Pending Assignment */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Pending Judge Assignment</h3>
              <p className="text-sm text-muted-foreground">Cases approved by Commissioner awaiting judge assignment</p>
            </div>
            {approvedCases.length > 4 && (
              <Link href="/registry/dashboardpending">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  View All ({approvedCases.length})
                </Button>
              </Link>
            )}
          </div>
          
          {pendingAssignment.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingAssignment.map(caseData => (
                <Link key={caseData.caseId} href={`/registry/dashboardassign/${caseData.caseId}`}>
                  <CaseCard caseData={caseData} onClick={() => {}} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h4 className="mt-4 text-lg font-medium text-foreground">All cases assigned!</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no cases pending judge assignment at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}