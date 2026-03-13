"use client"

import Link from "next/link"
import { FileText, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function ProsecutionRegistryDashboard() {
  const { currentUser, getAllCases } = useStore()
  const allCases = getAllCases()

  const inbound = allCases.filter((c) => c.status === "submitted_to_prosecution_registry")
  const registered = allCases.filter((c) => c.status === "registered_by_prosecution_registry" || c.status === "submitted_to_dpp")

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Prosecution Registry Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser?.name?.split(" ")[0]}</h2>
            <p className="text-muted-foreground">Register police cases (metadata only) and forward to the DPP.</p>
          </div>
          <Link href="/prosecution-registry/dashboardregister">
            <Button>
              Register Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Inbound" value={inbound.length} description="Awaiting registration" icon={Clock} />
          <StatsCard title="Registered" value={registered.length} description="Forwarded / ready for DPP" icon={CheckCircle} />
          <StatsCard title="Total Cases" value={allCases.length} description="In the system" icon={FileText} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Inbound from Police</h3>
              <p className="text-sm text-muted-foreground">You can only register and forward (no docket access).</p>
            </div>
            <Link href="/prosecution-registry/dashboardregister">
              <Button variant="ghost">Open Intake</Button>
            </Link>
          </div>

          {inbound.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inbound.slice(0, 4).map((caseData) => (
                <CaseCard key={caseData.caseId} caseData={caseData} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h4 className="mt-4 text-lg font-medium text-foreground">No inbound cases</h4>
              <p className="mt-2 text-sm text-muted-foreground">When police submit cases, they will appear here for registration.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}