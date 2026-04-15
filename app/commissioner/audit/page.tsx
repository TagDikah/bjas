"use client"

import React from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileClock,
  Send,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  status: string
  updatedAt?: string
  policeSections?: {
    sectionA?: {
      openedAt?: string
      openedByName?: string
      submittedToInvestigationAt?: string
      submittedToInvestigationByName?: string
    }
    sectionB?: {
      investigationStartedAt?: string
      investigatorName?: string
    }
    sectionC?: {
      submittedToCommissionerAt?: string
      submittedToCommissionerByName?: string
      recommendedAction?: string
    }
  }
  commissionerDecision?: {
    decision?: string
    notes?: string
    byName?: string
    at?: string
  }
  dppReview?: {
    forwardedAt?: string
    forwardedByName?: string
  }
}

type AuditEvent = {
  caseId: string
  caseNumber: string
  label: string
  actor: string
  at: string
  detail?: string
}

function formatDate(value?: string) {
  if (!value) return "N/A"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleString()
}

function CompactMetric({
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
    <div className="rounded-[1.1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.96),rgba(11,20,40,0.98))] p-3.5 shadow-[0_16px_34px_rgba(3,8,20,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-[0.95rem] ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
      <div className="mt-3 border-t border-white/8 pt-2 text-[11px] leading-5 text-white/56">{hint}</div>
    </div>
  )
}

function AuditEventCard({ event }: { event: AuditEvent }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] p-3.5 shadow-[0_14px_28px_rgba(4,10,28,0.18)]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-mono text-[11px] text-cyan-200/82">{event.caseNumber}</div>
        <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/78">
          {event.label}
        </span>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Actor</div>
          <div className="mt-1 text-sm font-medium text-white">{event.actor}</div>
        </div>
        <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">When</div>
          <div className="mt-1 text-sm font-medium text-white">{formatDate(event.at)}</div>
        </div>
        <Button asChild className="h-10 rounded-[0.95rem] bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white hover:brightness-110 hover:!text-white">
          <Link href={`/commissioner/review/${event.caseId}`}>
            <span>Open Packet</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {event.detail ? (
        <div className="mt-3 rounded-[0.95rem] border border-cyan-300/12 bg-cyan-400/8 px-3 py-2.5 text-sm text-white/78">
          {event.detail}
        </div>
      ) : null}
    </div>
  )
}

function compactEvents(events: AuditEvent[]) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {events.map((event, index) => (
        <AuditEventCard key={`${event.caseId}-${event.label}-${event.at}-${index}`} event={event} />
      ))}
    </div>
  )
}

export default function CommissionerAuditPage() {
  const { getAllCases } = useStore()
  const cases = (getAllCases() ?? []) as AppCase[]

  const events = cases
    .flatMap((caseData) => {
      const caseNumber = caseData.caseNumber || caseData.caseId
      const sectionA = caseData.policeSections?.sectionA
      const sectionB = caseData.policeSections?.sectionB
      const sectionC = caseData.policeSections?.sectionC
      const decision = caseData.commissionerDecision
      const dppReview = caseData.dppReview

      const rows: AuditEvent[] = []

      if (sectionA?.openedAt) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: "Case opened",
          actor: sectionA.openedByName || "Unknown officer",
          at: sectionA.openedAt,
        })
      }

      if (sectionA?.submittedToInvestigationAt) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: "Submitted to investigation",
          actor: sectionA.submittedToInvestigationByName || "Unknown officer",
          at: sectionA.submittedToInvestigationAt,
        })
      }

      if (sectionB?.investigationStartedAt) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: "Investigation started",
          actor: sectionB.investigatorName || "Unknown investigator",
          at: sectionB.investigationStartedAt,
        })
      }

      if (sectionC?.submittedToCommissionerAt) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: "Submitted to commissioner",
          actor: sectionC.submittedToCommissionerByName || "Unknown investigator",
          at: sectionC.submittedToCommissionerAt,
          detail: sectionC.recommendedAction,
        })
      }

      if (decision?.at) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: `Commissioner ${decision.decision || "decision"}`,
          actor: decision.byName || "Commissioner",
          at: decision.at,
          detail: decision.notes,
        })
      }

      if (dppReview?.forwardedAt) {
        rows.push({
          caseId: caseData.caseId,
          caseNumber,
          label: "Forwarded to DPP",
          actor: dppReview.forwardedByName || "Commissioner",
          at: dppReview.forwardedAt,
        })
      }

      return rows
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const decisionCases = cases.filter((caseData) => !!caseData.commissionerDecision?.decision).length
  const forwardedCases = cases.filter((caseData) => !!caseData.dppReview?.forwardedAt).length

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Audit Trail">
      <div className="space-y-5">
        <section className="grid gap-3 md:grid-cols-3">
          <CompactMetric
            label="Audit Events"
            value={events.length}
            hint="Tracked workflow events"
            icon={Activity}
            accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]"
          />
          <CompactMetric
            label="Cases With Decisions"
            value={decisionCases}
            hint="Approved, rejected, or clarified"
            icon={CheckCircle2}
            accent="bg-[linear-gradient(135deg,#cb5df0,#7d6dff)]"
          />
          <CompactMetric
            label="Forwarded To DPP"
            value={forwardedCases}
            hint="Ready for prosecution intake"
            icon={Send}
            accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]"
          />
        </section>

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_18px_44px_rgba(4,10,28,0.22)]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">Latest Audit Events</div>
                <div className="text-sm text-white/55">Most recent commissioner workflow activity and case movement.</div>
              </div>
              <Button asChild variant="outline" className="h-10 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                <Link href="/commissioner/approvals">
                  <FileClock className="mr-2 h-4 w-4" />
                  Open Approvals Queue
                </Link>
              </Button>
            </div>

            <div className="mt-4">
              {events.length === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/55">
                  No audit activity is available yet.
                </div>
              ) : (
                compactEvents(events)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
