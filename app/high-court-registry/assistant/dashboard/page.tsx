"use client"

import Link from "next/link"
import { Sparkles, ClipboardCheck, Calendar, FileText, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function HighCourtRegistryAssistantDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const intake = all.filter((c) => c.status === "high_court_registry_intake")
  const assigned = all.filter((c) => c.status === "assigned_to_high_court_judge")
  const inProgress = all.filter((c) => c.status === "high_court_in_progress")

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
              Support High Court criminal case flow: register filings, schedule registry steps, and use AI to assign judges.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/high-court-registry/dashboardintake">
              <Button variant="outline">
                Intake Queue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/high-court-registry/dashboardassistant/assign">
              <Button>
                AI Assignment
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Awaiting Assignment" value={intake.length} description="High Court intake cases" icon={ClipboardCheck} />
          <StatsCard title="Assigned" value={assigned.length} description="Allocated to judges" icon={Sparkles} />
          <StatsCard title="In Progress" value={inProgress.length} description="Active hearings" icon={Calendar} />
          <StatsCard title="All High Court" value={all.filter((c) => (c.court?.courtType ?? "").toLowerCase() === "high").length} description="Total high court cases" icon={FileText} />
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Registry Assistance Checklist (High Court Criminal)</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Receive filing package from DPP (indictment, notice of trial, list of witnesses) and record it in the registry book.</li>
              <li>Open the file and assign the citation (e.g., CRI/T/0001/26) and prepare multiple copies of the notice of trial.</li>
              <li>Schedule interview before the Assistant Registrar after return of service is filed.</li>
              <li>If needed, assist with appointment of prodeo counsel, then prepare PTPS roll and schedule PTPS dates with judge availability.</li>
              <li>Maintain the criminal roll, support subpoena issuance, and record outcomes (guilt/acquittal) after completion.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}