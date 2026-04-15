"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, Clock3, FileCheck2, FileText } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function MetricPanel({
  title,
  value,
  note,
  icon: Icon,
  accent,
}: {
  title: string
  value: number
  note: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Prosecutor queue</div>
          <div className="mt-1 text-sm font-medium text-white">{title}</div>
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.08))` }}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/62">
          Live
        </div>
      </div>
      <div className="mt-2 text-xs text-white/55">{note}</div>
    </div>
  )
}

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
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const myAssigned = all.filter((c) => isAssignedToCurrentProsecutor(c, currentUser))
  const awaitingConfirmation = myAssigned.filter((c: any) => !c?.prosecutionAction?.confirmedAt)
  const confirmedReady = myAssigned.filter((c: any) => Boolean(c?.prosecutionAction?.confirmedAt))
  const sentBack = all.filter(
    (c: any) =>
      String(c?.status || "").toLowerCase() === "returned_to_police" &&
      isAssignedToCurrentProsecutor(c, currentUser)
  )

  const recommendation =
    awaitingConfirmation.length > confirmedReady.length
      ? "Most assigned files are still waiting for prosecutor confirmation. Confirm them first so court-ready packets move quickly."
      : confirmedReady.length > 0
        ? "Confirmed files are ready for your next action. Prioritize filing strong matters and returning weak packets early."
        : "Your prosecutor queue is light right now. Monitor new assignments from DPP registration and confirm them as they arrive."

  const topCases = [...awaitingConfirmation, ...confirmedReady].slice(0, 4)

  return (
    <DashboardLayout allowedRoles={["prosecutor"]} title="Prosecutor Dashboard">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricPanel title="Assigned" value={myAssigned.length} note="Awaiting action" icon={Clock3} accent="#5a8cff" />
                <MetricPanel title="Need Confirmation" value={awaitingConfirmation.length} note="Pending prosecutor form" icon={AlertTriangle} accent="#ff7a9f" />
                <MetricPanel title="Confirmed Ready" value={confirmedReady.length} note="Ready for filing or return" icon={FileCheck2} accent="#2fd4ff" />
                <MetricPanel title="Total" value={all.length} note="All cases" icon={FileText} accent="#f7c948" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Queue signal</div>
                    <div className="mt-1 text-base font-semibold text-white">{myAssigned.length} files assigned to you</div>
                  </div>
                  <Badge className="border-0 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">Live</Badge>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Assigned</div>
                    <div className="mt-1 text-xl font-semibold text-white">{myAssigned.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Confirm</div>
                    <div className="mt-1 text-xl font-semibold text-white">{awaitingConfirmation.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Returned</div>
                    <div className="mt-1 text-xl font-semibold text-white">{sentBack.length}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-[0.9rem] border border-cyan-400/18 bg-cyan-400/8 px-3 py-2.5 text-sm text-cyan-50/92">
                  {recommendation}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                  <Link href="/prosecutor/cases">
                    Open My Cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                  <Link href="/prosecutor/preparation">Open Preparation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {topCases.length ? (
          <Card className={panelClass()}>
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Top Priority Cases</div>
                  <div className="mt-1 text-lg font-semibold text-white">Assigned prosecutor packets</div>
                  <div className="text-sm text-white/52">Focus on these files first for confirmation, filing, or return.</div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {topCases.map((c) => (
                  <CaseCard key={c.caseId} caseData={c} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
