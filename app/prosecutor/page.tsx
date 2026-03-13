"use client"

import Link from "next/link"
import { useMemo } from "react"
import { FileText, Clock, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function ProsecutorDashboard() {
  const currentUser = useStore((s: any) => s.currentUser)
  const getAllCases = useStore((s: any) => s.getAllCases)

  const role = useMemo(
    () => String(currentUser?.role ?? "").trim().toUpperCase(),
    [currentUser]
  )

  const all = useMemo(() => {
    try {
      return typeof getAllCases === "function" ? (getAllCases() ?? []) : []
    } catch {
      return []
    }
  }, [getAllCases])

  // ✅ accept both DB-style roles and simple roles
  const allowedRoles = useMemo(
    () => ["PROSECUTOR", "DPP_PROSECUTOR", "DPP-PROSECUTOR", "prosecutor"],
    []
  )

  const myAssigned = useMemo(() => {
    return all.filter(
      (c: any) =>
        String(c?.status ?? "").toLowerCase() === "assigned_to_prosecutor" &&
        c?.dppReview?.assignedProsecutorId === currentUser?.id
    )
  }, [all, currentUser?.id])

  return (
    <DashboardLayout allowedRoles={allowedRoles} title="Prosecutor Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {currentUser?.name?.split(" ")?.[0] ?? "Prosecutor"}
            </h2>
            <p className="text-muted-foreground">
              Review assigned cases and file to Small Court or return to Police.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Role: <span className="text-foreground font-medium">{role || "UNKNOWN"}</span>
            </p>
          </div>

          <Link href="/prosecutor/cases">
            <Button>
              Open My Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={myAssigned.length} description="Awaiting action" icon={Clock} />
          <StatsCard title="Total" value={all.length} description="All cases" icon={FileText} />
        </div>

        {myAssigned.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myAssigned.slice(0, 4).map((c: any) => (
              <CaseCard key={c.caseId} caseData={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            No cases are currently assigned to you.
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}