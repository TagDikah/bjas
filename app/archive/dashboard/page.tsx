"use client"

import Link from "next/link"
import { Archive, ArrowRight, Lock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function ArchiveDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const closed = all.filter((c) => ["closed", "case_closed"].includes(String(c.status || "").toLowerCase()))
  const archived = all.filter((c) => String(c.status || "").toLowerCase() === "case_archived")

  return (
    <DashboardLayout allowedRoles={["archive_officer", "admin"]} title="Archive Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Review case closure, archive transitions, and read-only records for final retention.</p>
          </div>
          <Link href="/archive/cases">
            <Button className="!text-white hover:!text-white [&_svg]:text-white">
              Open Archived Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatsCard title="Closed" value={closed.length} description="Ready for archival review" icon={Lock} />
          <StatsCard title="Archived" value={archived.length} description="Read-only retained cases" icon={Archive} />
        </div>

        <WorkflowAnalytics
          title="Archive Analytics"
          subtitle="Final workflow visibility after all operational stages are complete."
          items={[
            { label: "Closed cases", value: closed.length },
            { label: "Archived cases", value: archived.length, tone: "success" },
          ]}
          recommendation="Keep archived cases read-only while still allowing appended audit notes, so the final blockchain-linked timeline remains intact."
        />
      </div>
    </DashboardLayout>
  )
}
