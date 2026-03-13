"use client"

import { FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function PoliceDashboard() {
  const { currentUser, getAllCases } = useStore()
  
  const allCases = getAllCases()
  const myCases = allCases.filter(c => c.policeOfficerId === currentUser?.id)
  
  const pendingCases = myCases.filter(c => c.status === "pending_commissioner")
  const approvedCases = myCases.filter(c => c.status === "approved" || c.status === "assigned_to_court" || c.status === "assigned_to_judge" || c.status === "in_progress")
  const rejectedCases = myCases.filter(c => c.status === "rejected")
  const completedCases = myCases.filter(c => c.status === "completed")

  const recentCases = [...myCases].sort((a, b) => 
    new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
  ).slice(0, 5)

  return (
    <DashboardLayout allowedRoles={["police_officer"]} title="Police Officer Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {currentUser?.name?.split(" ")[1]}</h2>
            <p className="text-muted-foreground">Manage your cases and track their progress through the judicial system.</p>
          </div>
          <Link href="/police/dashboardnew-case">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Open New Case
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Cases"
            value={myCases.length}
            description="All cases filed"
            icon={FileText}
          />
          <StatsCard
            title="Pending Review"
            value={pendingCases.length}
            description="Awaiting commissioner"
            icon={Clock}
          />
          <StatsCard
            title="Approved"
            value={approvedCases.length}
            description="Progressing through court"
            icon={CheckCircle}
          />
          <StatsCard
            title="Rejected"
            value={rejectedCases.length}
            description="Cases not accepted"
            icon={XCircle}
          />
        </div>

        {/* Recent Cases */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Cases</h3>
            <Link href="/police/cases">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </Link>
          </div>
          
          {recentCases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentCases.map(caseData => (
                <CaseCard key={caseData.caseId} caseData={caseData} showAssignment />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h4 className="mt-4 text-lg font-medium text-foreground">No cases yet</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t filed any cases. Click the button above to open your first case.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}