"use client"

import React from "react"
import Link from "next/link"
import {
  ArrowRight,
  FileSearch,
  MessageSquareWarning,
  Send,
  Shield,
  ShieldAlert,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

function QueueActionCard({
  label,
  title,
  value,
  href,
  icon: Icon,
  accent,
}: {
  label: string
  title: string
  value: number
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1rem] border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(84,199,236,0.26),rgba(111,109,255,0.2))] px-3 py-3 transition shadow-[0_16px_32px_rgba(6,12,28,0.24)] hover:scale-[1.01] hover:border-cyan-100/48 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.36),rgba(111,109,255,0.28))] hover:no-underline"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/78">{label}</div>
          <div className="mt-1 text-sm font-semibold text-white">{title}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-[0.95rem] ${accent} shadow-[0_12px_28px_rgba(6,12,28,0.24)]`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
        <div className="text-lg font-semibold text-white">{value}</div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/12 px-3 py-1.5 text-xs font-semibold text-white">
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  )
}

export default function CommissionerDashboard() {
  const { currentUser, getAllCases } = useStore()
  const cases = getAllCases()

  const hasClarificationThread = (c: any) =>
    c.status === "commissioner_clarification" ||
    Boolean(c?.policeSections?.sectionC?.latestClarificationResponseAt)
  const hasNewClarificationReply = (c: any) => {
    const sC = c?.policeSections?.sectionC || {}
    if (!sC.latestClarificationResponseAt) return false
    if (!sC.latestClarificationAt) return true
    return new Date(sC.latestClarificationResponseAt).getTime() >= new Date(sC.latestClarificationAt).getTime()
  }

  const inbox = cases.filter((c) => c.status === "pending_commissioner")
  const clarifications = cases.filter((c: any) => hasClarificationThread(c))
  const clarificationReplies = clarifications.filter((c: any) => hasNewClarificationReply(c))
  const forwardedToDpp = cases.filter((c) => c.status === "submitted_to_dpp")
  const rejected = cases.filter((c) => c.status === "rejected")

  const currentUserFirstName = currentUser?.name?.split(" ")[0] || "Commissioner"

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Police Commissioner Dashboard">
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.98),rgba(14,22,43,0.98))] shadow-[0_18px_50px_rgba(6,12,28,0.28)]">
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.14]">
            <Shield className="h-64 w-64 text-cyan-100" strokeWidth={1.15} />
          </div>
          <div className="pointer-events-none absolute -left-8 bottom-0 opacity-[0.05]">
            <Shield className="h-36 w-36 text-white" strokeWidth={1} />
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Commissioner Command Deck</div>
                  <div className="mt-1 text-lg font-semibold text-white">{currentUserFirstName}, keep review moving.</div>
                  <div className="text-sm text-white/52">Inbox pressure, police clarifications, and DPP-ready files in one place.</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <div className="rounded-full border border-white/10 bg-white/6 px-3.5 py-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/42">Role</span>
                  <span className="ml-2 text-sm font-medium text-white">Police Commissioner</span>
                </div>
                <div className="rounded-full border border-cyan-300/12 bg-cyan-400/10 px-3.5 py-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/52">Inbox</span>
                  <span className="ml-2 text-sm font-medium text-white">{inbox.length}</span>
                </div>
                <div className="rounded-full border border-amber-300/12 bg-amber-400/10 px-3.5 py-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-amber-100/52">Clarifications</span>
                  <span className="ml-2 text-sm font-medium text-white">{clarificationReplies.length}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:justify-self-end">
              <Button asChild className="h-11 rounded-[1rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white shadow-[0_16px_34px_rgba(88,74,210,0.32)] hover:scale-[1.01] hover:brightness-110 hover:!text-white">
                <Link href="/commissioner/cases?tab=inbox">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Review Now
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-[1rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:scale-[1.01] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Link href="/commissioner/cases">View All Cases</Link>
                </Button>
            </div>
          </div>
        </section>

        <section>
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="text-lg font-semibold text-white">Commissioner Review Queue</div>
                <div className="text-sm text-white/55">Open the live case-review queues used to process commissioner decisions.</div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <QueueActionCard label="Queue" title="Inbox" value={inbox.length} href="/commissioner/cases?tab=inbox" icon={FileSearch} accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]" />
                <QueueActionCard label="Queue" title="Clarifications" value={clarificationReplies.length} href="/commissioner/cases?tab=clarifications" icon={MessageSquareWarning} accent="bg-[linear-gradient(135deg,#cb5df0,#7d6dff)]" />
                <QueueActionCard label="Queue" title="Forwarded to DPP" value={forwardedToDpp.length} href="/dpp/review" icon={Send} accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]" />
                <QueueActionCard label="Queue" title="Rejected" value={rejected.length} href="/commissioner/cases?tab=rejected" icon={ShieldAlert} accent="bg-[linear-gradient(135deg,#ff7a59,#d94d57)]" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_18px_44px_rgba(4,10,28,0.22)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">Commissioner Insights</div>
                <div className="text-sm text-white/55">Open a focused analytics page when you need it.</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <QueueActionCard label="Insight" title="Overview" value={inbox.length + clarifications.length + forwardedToDpp.length + rejected.length} href="/commissioner/insights?view=overview" icon={Shield} accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]" />
              <QueueActionCard label="Insight" title="Inbox Load" value={inbox.length} href="/commissioner/insights?view=inbox" icon={FileSearch} accent="bg-[linear-gradient(135deg,#cb5df0,#7d6dff)]" />
              <QueueActionCard label="Insight" title="Clarifications" value={clarificationReplies.length} href="/commissioner/insights?view=clarifications" icon={MessageSquareWarning} accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]" />
              <QueueActionCard label="Insight" title="Decision Flow" value={forwardedToDpp.length + rejected.length} href="/commissioner/insights?view=decisions" icon={ShieldAlert} accent="bg-[linear-gradient(135deg,#ff7a59,#d94d57)]" />
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_18px_44px_rgba(4,10,28,0.22)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Quick Links</div>
                  <div className="text-sm text-white/55">Open the commissioner tools you need most.</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/commissioner/approvals"
                  className="rounded-[1rem] border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(84,199,236,0.26),rgba(91,140,255,0.2))] px-4 py-4 text-sm font-semibold text-white transition shadow-[0_14px_28px_rgba(6,12,28,0.22)] hover:scale-[1.01] hover:border-cyan-100/46 hover:no-underline"
                >
                  <span className="inline-flex w-full items-center justify-between gap-3">
                    <span>Approvals Queue</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  href="/commissioner/incidents"
                  className="rounded-[1rem] border border-fuchsia-200/30 bg-[linear-gradient(135deg,rgba(111,109,255,0.24),rgba(203,93,240,0.2))] px-4 py-4 text-sm font-semibold text-white transition shadow-[0_14px_28px_rgba(6,12,28,0.22)] hover:scale-[1.01] hover:border-fuchsia-100/44 hover:no-underline"
                >
                  <span className="inline-flex w-full items-center justify-between gap-3">
                    <span>Incident Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  href="/commissioner/audit"
                  className="rounded-[1rem] border border-amber-200/30 bg-[linear-gradient(135deg,rgba(251,191,36,0.22),rgba(245,158,11,0.18))] px-4 py-4 text-sm font-semibold text-white transition shadow-[0_14px_28px_rgba(6,12,28,0.22)] hover:scale-[1.01] hover:border-amber-100/44 hover:no-underline"
                >
                  <span className="inline-flex w-full items-center justify-between gap-3">
                    <span>Audit Trail</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>

        </section>
      </div>
    </DashboardLayout>
  )
}
