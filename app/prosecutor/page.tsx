"use client"

import Link from "next/link"
import { useMemo } from "react"
import { FileText, Clock, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function isAssignedToCurrentProsecutor(caseData: any, currentUser: any) {
  const assignedId = String(caseData?.dppReview?.assignedProsecutorId || "").trim()
  const assignedName = String(caseData?.dppReview?.assignedProsecutorName || "").trim().toLowerCase()
  const currentId = String(currentUser?.id || "").trim()
  const currentName = String(currentUser?.name || currentUser?.fullName || "").trim().toLowerCase()
  const status = String(caseData?.status || "").toLowerCase()
  const wasSentByDppRegistry = Boolean(
    caseData?.prosecutionRegistry?.registeredAt ||
    caseData?.dppReview?.registeredAt ||
    caseData?.dppReview?.forwardedAt
  )
  const isInProsecutorStage = ["assigned_to_prosecutor", "prosecutor_review"].includes(status)

  return Boolean(
    wasSentByDppRegistry &&
    isInProsecutorStage &&
    (
      (assignedId && currentId && assignedId === currentId) ||
      (assignedName && currentName && assignedName === currentName) ||
      (!assignedId && (!assignedName || assignedName === "dpp prosecutor queue"))
    )
  )
}

export default function ProsecutorDashboard() {
  const currentUser = useStore((s: any) => s.currentUser)
  const cases = useStore((s: any) => s.cases)

  const role = useMemo(
    () => String(currentUser?.role ?? "").trim().toUpperCase(),
    [currentUser]
  )

  const all = useMemo(() => {
    try {
      return Array.isArray(cases) ? cases : []
    } catch {
      return []
    }
  }, [cases])

  // ✅ accept both DB-style roles and simple roles
  const allowedRoles = useMemo(
    () => ["PROSECUTOR", "DPP_PROSECUTOR", "DPP-PROSECUTOR", "prosecutor"],
    []
  )

  const myAssigned = useMemo(() => {
    return all.filter((c: any) => isAssignedToCurrentProsecutor(c, currentUser))
  }, [all, currentUser?.id])
  const awaitingConfirmation = useMemo(
    () => myAssigned.filter((c: any) => !c?.prosecutionAction?.confirmedAt),
    [myAssigned]
  )
  const confirmedReady = useMemo(
    () => myAssigned.filter((c: any) => Boolean(c?.prosecutionAction?.confirmedAt)),
    [myAssigned]
  )
  const sentBack = useMemo(
    () =>
      all.filter(
        (c: any) =>
          String(c?.status || "").toLowerCase() === "returned_to_police" &&
          isAssignedToCurrentProsecutor(c, currentUser)
      ),
    [all, currentUser]
  )

  const recommendation =
    awaitingConfirmation.length > confirmedReady.length
      ? "Most assigned files are still waiting for prosecutor confirmation. Confirm receipt first so strong cases can move to court quickly."
      : confirmedReady.length > 0
        ? "Confirmed files are ready for your next action. Prioritize court-ready packets and return weak files to police early."
        : "Your prosecutor queue is light right now. Monitor new assignments from DPP registration and confirm them as they arrive."

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
            <Button className="!text-white hover:!text-white [&_svg]:text-white">
              Open My Cases
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={myAssigned.length} description="Awaiting action" icon={Clock} />
          <StatsCard title="Need Confirmation" value={awaitingConfirmation.length} description="Pending prosecutor form" icon={Clock} />
          <StatsCard title="Confirmed Ready" value={confirmedReady.length} description="Ready for filing or return" icon={FileText} />
          <StatsCard title="Total" value={all.length} description="All cases" icon={FileText} />
        </div>

        <WorkflowAnalytics
          title="Prosecutor Workload Analytics"
          subtitle="Live view of assigned files, confirmation pressure, and next-action readiness."
          items={[
            { label: "Assigned to you", value: myAssigned.length },
            { label: "Waiting confirmation", value: awaitingConfirmation.length, tone: awaitingConfirmation.length > confirmedReady.length ? "warning" : "default" },
            { label: "Confirmed and ready", value: confirmedReady.length, tone: "success" },
            { label: "Returned to police", value: sentBack.length, tone: sentBack.length > 0 ? "warning" : "default" },
          ]}
          recommendation={recommendation}
        />

        {myAssigned.length ? (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Top Priority Cases</h3>
            <div className="grid gap-4 md:grid-cols-2">
            {[...awaitingConfirmation, ...confirmedReady].slice(0, 4).map((c: any) => (
              <CaseCard key={c.caseId} caseData={c} />
            ))}
            </div>
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
