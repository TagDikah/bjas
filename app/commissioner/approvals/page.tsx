"use client"

import Link from "next/link"
import { CheckCircle2, Clock3, FileCheck2, ShieldAlert } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  parties?: string
  charge?: string
  district?: string
  status: string
  updatedAt?: string
  policeSections?: {
    sectionA?: {
      crimeNo?: string
      aggrievedFullName?: string
      reportingPersonFullName?: string
      allegedCrime?: string
      whereCommitted?: string
      whereCommittedSpecify?: string
    }
    sectionC?: {
      submittedToCommissionerAt?: string
      submittedToCommissionerByName?: string
      recommendedAction?: string
    }
  }
}

function prettyDate(value?: string) {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString()
}

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
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Commissioner queue</div>
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

export default function CommissionerApprovalsPage() {
  const { getAllCases } = useStore()
  const cases = (getAllCases() ?? []) as AppCase[]

  const inbox = cases.filter((c) => c.status === "pending_commissioner")
  const clarifications = cases.filter((c) => c.status === "commissioner_clarification")
  const approved = cases.filter((c) => c.status === "submitted_to_dpp")
  const rejected = cases.filter((c) => c.status === "rejected")

  const sortedInbox = [...inbox].sort((a, b) => {
    const aTime = new Date(a.policeSections?.sectionC?.submittedToCommissionerAt || a.updatedAt || 0).getTime()
    const bTime = new Date(b.policeSections?.sectionC?.submittedToCommissionerAt || b.updatedAt || 0).getTime()
    return bTime - aTime
  })

  const recommendation =
    inbox.length === 0
      ? "The commissioner queue is clear. Review clarifications and monitor DPP handoff quality."
      : clarifications.length > 0
        ? "Handle clarification-heavy files first so missing investigation details do not block the full queue."
        : "Focus on the oldest complete case packets first, then forward approved files to the DPP office without delay."

  const leadPacket = sortedInbox[0]

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Approvals Queue">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <FileCheck2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Commissioner Approval Deck</div>
                  <div className="mt-1 text-lg font-semibold text-white">Review pressure and decision readiness in one place.</div>
                  <div className="text-sm text-white/52">Use this queue to approve, clarify, reject, and track DPP handoff quality.</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricPanel title="Pending Approval" value={inbox.length} note="Ready for commissioner decision" icon={Clock3} accent="#5a8cff" />
                <MetricPanel title="Clarifications" value={clarifications.length} note="Returned for more detail" icon={ShieldAlert} accent="#ff7a9f" />
                <MetricPanel title="Approved" value={approved.length} note="Forwarded to DPP" icon={CheckCircle2} accent="#2fd4ff" />
                <MetricPanel title="Rejected" value={rejected.length} note="Closed at commissioner stage" icon={ShieldAlert} accent="#f7c948" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Queue signal</div>
                    <div className="mt-1 text-base font-semibold text-white">
                      {inbox.length} {inbox.length === 1 ? "packet" : "packets"} waiting for review
                    </div>
                  </div>
                  <Badge className="border-0 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">
                    Live
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Inbox</div>
                    <div className="mt-1 text-xl font-semibold text-white">{inbox.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Clarify</div>
                    <div className="mt-1 text-xl font-semibold text-white">{clarifications.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Rejected</div>
                    <div className="mt-1 text-xl font-semibold text-white">{rejected.length}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-[0.9rem] border border-cyan-400/18 bg-cyan-400/8 px-3 py-2.5 text-sm text-cyan-50/92">
                  {recommendation}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                  <Link href="/commissioner/cases?tab=inbox">Open Full Inbox</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                  <Link href="/commissioner/dashboard">Back To Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Card className={panelClass()}>
          <CardContent className="p-4 lg:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Pending Case Packets</div>
                <div className="mt-1 text-lg font-semibold text-white">Commissioner review inbox</div>
                <div className="text-sm text-white/52">Open the latest investigation packets that are still waiting for commissioner action.</div>
              </div>
              {leadPacket ? (
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Oldest active packet</div>
                  <div className="mt-1 text-sm font-semibold text-white">{leadPacket.caseNumber || "Protected reference"}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
            {sortedInbox.length === 0 ? (
              <div className="rounded-[1rem] border border-dashed border-white/12 bg-white/5 p-5 text-sm text-white/55">
                No pending approvals right now. New investigation files will appear here when they are submitted to the commissioner.
              </div>
            ) : (
              sortedInbox.map((caseData) => {
                const sectionA = caseData.policeSections?.sectionA
                const sectionC = caseData.policeSections?.sectionC
                return (
                  <div key={caseData.caseId} className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold text-white">
                            {caseData.caseNumber || "Protected reference"}
                          </div>
                          <Badge className="border-0 bg-amber-400/15 text-amber-100">Pending commissioner</Badge>
                        </div>

                        <div className="mt-1 text-sm text-white/58">
                          {caseData.parties || sectionA?.aggrievedFullName || sectionA?.reportingPersonFullName || "Unknown complainant"}
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Charge</div>
                            <div className="mt-1 text-sm font-medium text-white">{caseData.charge || sectionA?.allegedCrime || "N/A"}</div>
                          </div>
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Location</div>
                            <div className="mt-1 text-sm font-medium text-white">{sectionA?.whereCommittedSpecify || sectionA?.whereCommitted || caseData.district || "N/A"}</div>
                          </div>
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Crime No</div>
                            <div className="mt-1 text-sm font-medium text-white">{sectionA?.crimeNo || "N/A"}</div>
                          </div>
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Submitted</div>
                            <div className="mt-1 text-sm font-medium text-white">{prettyDate(sectionC?.submittedToCommissionerAt)}</div>
                          </div>
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Submitted By</div>
                            <div className="mt-1 text-sm font-medium text-white">{sectionC?.submittedToCommissionerByName || "N/A"}</div>
                          </div>
                          <div className="rounded-[0.9rem] border border-white/8 bg-white/5 px-3 py-2.5">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Recommendation</div>
                            <div className="mt-1 line-clamp-2 text-sm font-medium text-white">{sectionC?.recommendedAction || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 xl:w-auto">
                        <Button asChild className="h-11 min-w-[170px] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                          <Link href={`/commissioner/review/${caseData.caseId}`}>Open Packet</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-11 min-w-[170px] border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                          <Link href={`/commissioner/forms/case-review/${caseData.caseId}`}>Review Form</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
