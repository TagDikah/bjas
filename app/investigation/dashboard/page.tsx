"use client"

import React from "react"
import Link from "next/link"
import {
  BellRing,
  Clock3,
  MessageSquareWarning,
  SearchCheck,
  Shield,
  XCircle,
} from "lucide-react"

import { InvestigationShell } from "@/components/investigation-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

function QueueMetric({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  hint: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.5),rgba(11,20,40,0.5))] p-2.5 shadow-[0_16px_34px_rgba(3,8,20,0.22)] backdrop-blur-[3px]">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-8 w-8 place-items-center rounded-[0.8rem] ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">{label}</div>
          <div className="mt-1 text-xl font-semibold text-white">{value}</div>
        </div>
      </div>
      <div className="mt-2 border-t border-white/8 pt-2 text-[10px] leading-4 text-white/56">{hint}</div>
    </div>
  )
}

function QueueActionCard({
  title,
  value,
  actionLabel,
  href,
  icon: Icon,
  accent,
}: {
  title: string
  value: number
  actionLabel: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.5),rgba(10,18,39,0.5))] shadow-[0_16px_44px_rgba(4,10,28,0.26)] backdrop-blur-[4px]">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.16em] text-cyan-200/68">Investigation Queue</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">{title}</div>
          </div>
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-[0.85rem] ${accent}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold leading-none text-white">{value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">Live</div>
          </div>
          <div className="text-right text-[10px] uppercase tracking-[0.16em] text-white/42">
            {value === 1 ? "1 case" : `${value} cases`}
          </div>
        </div>

        <div className="mt-3 border-t border-white/8 pt-3">
          <Button
            asChild
            size="sm"
            className="w-full justify-between rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.35),rgba(91,140,255,0.32))] !text-white shadow-[0_12px_26px_rgba(84,199,236,0.14)] hover:brightness-110 hover:!text-white"
          >
            <Link href={href}>
              <span>{actionLabel}</span>
              <span aria-hidden="true">+</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function InvestigationDashboard() {
  const { getAllCases, currentUser } = useStore()
  const cases = getAllCases()

  const initials = String(currentUser?.name || "PI")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const firstName = currentUser?.name?.split(" ")[0] || "Investigator"

  const hasInvestigationData = (caseData: any) => Boolean(caseData?.policeSections?.sectionB?.initialCapture)
  const isCaseOwnedByCurrentInvestigator = (caseData: any) => {
    if (!currentUser?.id) return false
    const sectionB = caseData?.policeSections?.sectionB || {}
    const sectionC = caseData?.policeSections?.sectionC || {}
    const latestClar = Array.isArray(sectionC?.clarificationRequests) ? sectionC.clarificationRequests[0] : null
    const ownerId = String(
      sectionC?.submittedToCommissionerById ||
        sectionB?.investigatorId ||
        sectionB?.initialCapture?.savedById ||
        ""
    ).trim()
    const targetClarificationId = String(
      sectionC?.latestClarificationTargetInvestigatorId ||
        latestClar?.targetInvestigatorId ||
        ""
    ).trim()
    return ownerId === currentUser.id || targetClarificationId === currentUser.id
  }

  const pending = cases.filter(
    (c) => c.status === "pending_investigation" && !hasInvestigationData(c)
  )
  const inProgress = cases.filter(
    (c) =>
      (
        c.status === "in_investigation" ||
        (c.status === "pending_investigation" && hasInvestigationData(c)) ||
        c.status === "commissioner_clarification"
      ) &&
      isCaseOwnedByCurrentInvestigator(c)
  )
  const awaitingCommissioner = cases.filter(
    (c) =>
      (c.status === "pending_commissioner" || c.status === "submitted_to_commissioner") &&
      isCaseOwnedByCurrentInvestigator(c)
  )
  const clarificationRequests = cases.filter(
    (c) => c.status === "commissioner_clarification" && isCaseOwnedByCurrentInvestigator(c)
  )
  const rejected = cases.filter(
    (c) => String(c.status || "").includes("rejected") && isCaseOwnedByCurrentInvestigator(c)
  )

  return (
    <InvestigationShell title="Police Investigation Dashboard">
      <div className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.5),rgba(14,22,43,0.5))] shadow-[0_18px_50px_rgba(6,12,28,0.28)] backdrop-blur-[4px]">
              <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.14]">
                <Shield className="h-64 w-64 text-cyan-100" strokeWidth={1.15} />
              </div>
              <div className="pointer-events-none absolute -left-8 bottom-0 opacity-[0.05]">
                <Shield className="h-36 w-36 text-white" strokeWidth={1} />
              </div>
              <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] text-xs font-semibold text-white shadow-[0_10px_24px_rgba(84,199,236,0.22)]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Police Command Deck</div>
                      <div className="mt-0.5 text-base font-semibold text-white">Police Investigation Dashboard</div>
                      <div className="mt-0.5 text-xs text-cyan-100/60">Welcome back, {firstName}.</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <QueueMetric label="Pending Intake" value={pending.length} hint="Fresh police files awaiting first investigator action." icon={BellRing} accent="bg-[linear-gradient(135deg,#54c7ec,#5b8cff)]" />
                <QueueMetric label="In Investigation" value={inProgress.length} hint="Active files already opened and under review." icon={SearchCheck} accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]" />
                <QueueMetric label="Awaiting Review" value={awaitingCommissioner.length} hint="Submitted onward and waiting for commissioner handling." icon={Clock3} accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]" />
                <QueueMetric label="Clarifications" value={clarificationRequests.length + rejected.length} hint="Returns and rework items needing follow-up." icon={MessageSquareWarning} accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]" />
              </div>

              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">
                <QueueActionCard
                  title="Pending Intake"
                  value={pending.length}
                  actionLabel="View Pending Cases"
                  href="/investigation/cases?tab=pending"
                  icon={BellRing}
                  accent="bg-[linear-gradient(135deg,#54c7ec,#5b8cff)]"
                />
                <QueueActionCard
                  title="In Investigation"
                  value={inProgress.length}
                  actionLabel="Under Investigation"
                  href="/investigation/cases?tab=active"
                  icon={SearchCheck}
                  accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]"
                />
                <QueueActionCard
                  title="Awaiting Commissioner"
                  value={awaitingCommissioner.length}
                  actionLabel="View Sent"
                  href="/investigation/cases?tab=sent"
                  icon={Clock3}
                  accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]"
                />
                <QueueActionCard
                  title="Clarification Requests"
                  value={clarificationRequests.length}
                  actionLabel="View Requests"
                  href="/investigation/cases?tab=clarifications"
                  icon={MessageSquareWarning}
                  accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]"
                />
                <QueueActionCard
                  title="Rejected Cases"
                  value={rejected.length}
                  actionLabel="View Rejected"
                  href="/investigation/cases?tab=rejected"
                  icon={XCircle}
                  accent="bg-[linear-gradient(135deg,#ff7a59,#d94d57)]"
                />
              </div>
            </section>
      </div>
    </InvestigationShell>
  )
}
