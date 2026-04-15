"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileSearch,
  MessageSquareWarning,
  Scale,
  ShieldAlert,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_16px_34px_rgba(4,10,28,0.22)] ${extra}`.trim()
}

function getSignalMeta(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes("inbox")) {
    return {
      fill: "#2fd4ff",
      chip: "border-cyan-200/24 bg-cyan-400/12 text-cyan-100",
    }
  }
  if (normalized.includes("clarif") || normalized.includes("repl") || normalized.includes("thread")) {
    return {
      fill: "#ff7a9f",
      chip: "border-pink-200/24 bg-pink-400/12 text-pink-100",
    }
  }
  if (normalized.includes("forward")) {
    return {
      fill: "#f7c948",
      chip: "border-amber-200/24 bg-amber-400/12 text-amber-100",
    }
  }
  if (normalized.includes("reject")) {
    return {
      fill: "#9b7bff",
      chip: "border-violet-200/24 bg-violet-400/12 text-violet-100",
    }
  }

  return {
    fill: "#5a8cff",
    chip: "border-blue-200/24 bg-blue-400/12 text-blue-100",
  }
}

function SelectorTile({ title, active, href }: { title: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-[0.8rem] border px-3 py-2.5 text-left transition hover:no-underline",
        active
          ? "border-cyan-200/34 bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(111,109,255,0.22))]"
          : "border-white/10 bg-white/6 hover:border-white/18 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/56">View</div>
      <div className="mt-1 text-sm font-semibold text-white">{title}</div>
    </Link>
  )
}

function CommissionerInsightsPageContent() {
  const searchParams = useSearchParams()
  const { getAllCases } = useStore()
  const cases = getAllCases()
  const view = String(searchParams.get("view") || "overview").trim()
  const selectedView =
    view === "inbox" || view === "clarifications" || view === "decisions" ? view : "overview"

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
  const totalVisible = inbox.length + clarificationReplies.length + forwardedToDpp.length + rejected.length

  const insightViews = {
    overview: {
      title: "Overview",
      description: "A quick snapshot of the commissioner queue and the current decision workload.",
      value: String(totalVisible),
      footer: "visible commissioner-side matters",
      icon: Scale,
      highlights: [
        { label: "Inbox", value: inbox.length },
        { label: "Clarifications", value: clarificationReplies.length },
        { label: "Forwarded", value: forwardedToDpp.length },
        { label: "Rejected", value: rejected.length },
      ],
    },
    inbox: {
      title: "Inbox Load",
      description: "Cases waiting for commissioner review before they can move forward.",
      value: String(inbox.length),
      footer: "pending commissioner decisions",
      icon: FileSearch,
      highlights: [
        { label: "Inbox", value: inbox.length },
        { label: "Visible Queue", value: totalVisible },
        { label: "Forwarded", value: forwardedToDpp.length },
        { label: "Rejected", value: rejected.length },
      ],
    },
    clarifications: {
      title: "Clarifications",
      description: "Replies that came back and need commissioner attention before a final decision.",
      value: String(clarificationReplies.length),
      footer: "clarification replies ready",
      icon: MessageSquareWarning,
      highlights: [
        { label: "Replies", value: clarificationReplies.length },
        { label: "Threads", value: clarifications.length },
        { label: "Inbox", value: inbox.length },
        { label: "Rejected", value: rejected.length },
      ],
    },
    decisions: {
      title: "Decision Flow",
      description: "How many matters have already moved into approved handoff or rejection outcomes.",
      value: String(forwardedToDpp.length + rejected.length),
      footer: "decision outcomes recorded",
      icon: ShieldAlert,
      highlights: [
        { label: "Forwarded", value: forwardedToDpp.length },
        { label: "Rejected", value: rejected.length },
        { label: "Inbox", value: inbox.length },
        { label: "Replies", value: clarificationReplies.length },
      ],
    },
  } as const

  const activeInsight = insightViews[selectedView]
  const ActiveIcon = activeInsight.icon

  const flowData = [
    { name: "Inbox", value: inbox.length, fill: "#2fd4ff" },
    { name: "Clarify", value: clarificationReplies.length, fill: "#ff7a9f" },
    { name: "Forwarded", value: forwardedToDpp.length, fill: "#f7c948" },
    { name: "Rejected", value: rejected.length, fill: "#9b7bff" },
  ]

  const barData = activeInsight.highlights.map((item) => ({
    name: item.label,
    value: item.value,
    fill: getSignalMeta(item.label).fill,
  }))

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Commissioner Insights">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="outline" className="border-white/14 bg-white/6 !text-white hover:bg-white/10 hover:!text-white">
            <Link href="/commissioner/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-sm text-white/55">Commissioner analytics board</div>
        </div>

        <section className="grid gap-3 xl:grid-cols-[180px_1fr]">
          <div className={panelClass("p-3 border-cyan-300/16 bg-[linear-gradient(180deg,rgba(24,38,74,0.98),rgba(12,20,42,0.98))]")}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">Live View</div>
                <div className="mt-1 text-sm font-semibold text-white">{activeInsight.title}</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-[0.85rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]">
                <ActiveIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs leading-5 text-white/62">{activeInsight.description}</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <div className={panelClass("p-3 border-cyan-300/16 bg-[linear-gradient(180deg,rgba(22,36,70,0.98),rgba(10,18,39,0.98))]")}>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">Primary Signal</div>
              <div className="mt-2 text-3xl font-semibold text-white">{activeInsight.value}</div>
              <div className="mt-1 text-xs text-cyan-200/78">{activeInsight.footer}</div>
            </div>

            <div className={panelClass("p-3 md:col-span-1 2xl:col-span-2 border-cyan-300/12 bg-[linear-gradient(180deg,rgba(18,30,61,0.98),rgba(10,18,39,0.98))]")}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Commissioner Flow Mix</div>
                <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/68">Live</div>
              </div>
              <div className="mt-2 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(16,27,52,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={panelClass("p-3 border-white/12 bg-[linear-gradient(180deg,rgba(18,28,55,0.98),rgba(10,18,39,0.98))]")}>
              <div className="text-sm font-semibold text-white">Control Signal</div>
              <div className="mt-2 grid gap-1.5">
                {activeInsight.highlights.map((item) => {
                  const meta = getSignalMeta(item.label)
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/6 px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: meta.fill }} />
                        <div className="text-[11px] text-white/66">{item.label}</div>
                      </div>
                      <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>{item.value}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={panelClass("p-3 border-white/12 bg-[linear-gradient(180deg,rgba(18,28,55,0.98),rgba(10,18,39,0.98))]")}>
              <div className="text-sm font-semibold text-white">Status Mix</div>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={flowData} dataKey="value" innerRadius={28} outerRadius={48} paddingAngle={4}>
                      {flowData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(16,27,52,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid gap-1">
                {flowData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] text-white/62">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className={panelClass("p-3 border-white/12 bg-[linear-gradient(180deg,rgba(18,28,55,0.98),rgba(10,18,39,0.98))]")}>
          <div className="mb-3 px-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/56">Views</div>
            <div className="mt-1 text-sm text-white/62">Open a focused commissioner insight mode.</div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 xl:items-start">
            <SelectorTile title="Overview" active={selectedView === "overview"} href="/commissioner/insights?view=overview" />
            <SelectorTile title="Inbox Load" active={selectedView === "inbox"} href="/commissioner/insights?view=inbox" />
            <SelectorTile title="Clarifications" active={selectedView === "clarifications"} href="/commissioner/insights?view=clarifications" />
            <SelectorTile title="Decision Flow" active={selectedView === "decisions"} href="/commissioner/insights?view=decisions" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function CommissionerInsightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <CommissionerInsightsPageContent />
    </Suspense>
  )
}
