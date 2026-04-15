"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Gauge,
  Layers3,
  ShieldAlert,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { PoliceOfficerShell } from "@/components/police-officer-shell"
import { useStore } from "@/lib/store"

function isIncompletePoliceCase(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const hasCheckpoint =
    Number(sectionA?.lastCheckpointStepIndex ?? -1) >= 0 ||
    Number(sectionA?.checkpointLockedThrough ?? -1) >= 0
  const submittedToInvestigation = Boolean(sectionA?.submittedToInvestigationAt)
  return caseData?.status === "draft_police" || (hasCheckpoint && !submittedToInvestigation)
}

function getCaseSortTime(caseData: any) {
  const timestamp =
    caseData?.updatedAt ||
    caseData?.dateOpened ||
    caseData?.createdAt ||
    caseData?.policeSections?.sectionA?.openedAt ||
    ""

  const parsed = new Date(timestamp).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function getCaseTimelineDate(caseData: any) {
  const timestamp =
    caseData?.dateOpened ||
    caseData?.createdAt ||
    caseData?.updatedAt ||
    caseData?.policeSections?.sectionA?.openedAt ||
    ""

  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getFlowBucket(status: string | undefined): "opened" | "review" | "resolved" {
  if (!status) return "opened"
  if (["approved", "assigned_to_court", "assigned_to_judge", "in_progress", "completed"].includes(status)) {
    return "resolved"
  }
  if (["pending_investigation", "in_investigation", "pending_commissioner", "commissioner_clarification"].includes(status)) {
    return "review"
  }
  return "opened"
}

type FlowChartBucket = {
  key: string
  month: string
  opened: number
  review: number
  resolved: number
}

function getResumeStep(caseData: any) {
  const explicitCurrentStep = Number(caseData?.policeSections?.sectionA?.currentEditingStepIndex ?? -1)
  if (explicitCurrentStep >= 0) {
    return Math.min(4, Math.max(1, explicitCurrentStep + 1))
  }
  const lockedThrough = Number(caseData?.policeSections?.sectionA?.checkpointLockedThrough ?? -1)
  const lastCheckpoint = Number(caseData?.policeSections?.sectionA?.lastCheckpointStepIndex ?? -1)
  const nextStep = lockedThrough >= 0 ? lockedThrough + 1 : lastCheckpoint >= 0 ? lastCheckpoint + 1 : 0
  return Math.min(4, Math.max(1, nextStep + 1))
}

function mergeCaseRecords(serverCase: any, localCase: any) {
  if (!serverCase) return localCase
  if (!localCase) return serverCase

  const serverSectionA = serverCase?.policeSections?.sectionA ?? {}
  const localSectionA = localCase?.policeSections?.sectionA ?? {}

  return {
    ...serverCase,
    ...localCase,
    status: localCase?.status || serverCase?.status,
    updatedAt: localCase?.updatedAt || serverCase?.updatedAt,
    policeSections: {
      ...(serverCase?.policeSections ?? {}),
      ...(localCase?.policeSections ?? {}),
      sectionA: {
        ...serverSectionA,
        ...localSectionA,
      },
    },
    chainAnchor: serverCase?.chainAnchor || localCase?.chainAnchor,
  }
}

function panelClass(extra = "") {
  return `rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)] ${extra}`.trim()
}

function miniPalette(index: number) {
  const colors = ["#54c7ec", "#5a8cff", "#ffcb45", "#ff8b5b", "#4ade80"]
  return colors[index % colors.length]
}

function PoliceInsightsPageContent() {
  const searchParams = useSearchParams()
  const { currentUser, setCases, getAllCases } = useStore()
  const view = String(searchParams.get("view") || "draft").trim()
  const selectedView = view === "flow" || view === "pipeline" || view === "risk" ? view : "draft"

  React.useEffect(() => {
    if (!currentUser) return

    let cancelled = false

    const syncCases = async () => {
      try {
        const response = await fetch("/api/cases", { credentials: "include" })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.ok || !Array.isArray(data?.cases) || cancelled) {
          return
        }

        const localCases = useStore.getState().cases
        const mergedById = new Map<string, any>()

        for (const serverItem of data.cases) {
          mergedById.set(serverItem.caseId, serverItem)
        }

        for (const localItem of localCases) {
          const existing = mergedById.get(localItem.caseId)
          if (existing) {
            mergedById.set(localItem.caseId, mergeCaseRecords(existing, localItem))
            continue
          }

          if (isIncompletePoliceCase(localItem)) {
            mergedById.set(localItem.caseId, localItem)
          }
        }

        setCases(Array.from(mergedById.values()))
      } catch {
        // Keep current local state if sync fails.
      }
    }

    syncCases()

    return () => {
      cancelled = true
    }
  }, [currentUser, setCases])

  const allCases = getAllCases()
  const myCases = allCases.filter((c) => c.policeOfficerId === currentUser?.id)
  const draftCases = myCases.filter(isIncompletePoliceCase)
  const pendingCases = myCases.filter((c) => c.status === "pending_commissioner")
  const approvedCases = myCases.filter(
    (c) => c.status === "approved" || c.status === "assigned_to_court" || c.status === "assigned_to_judge" || c.status === "in_progress"
  )
  const rejectedCases = myCases.filter((c) => c.status === "rejected")
  const completedCases = myCases.filter((c) => c.status === "completed")
  const activeFlowCases = myCases.filter((c) => ["pending_investigation", "in_investigation", "pending_commissioner"].includes(c.status))
  const urgentCases = myCases.filter((c) => c.status === "rejected" || c.status === "commissioner_clarification")
  const progressHealth = myCases.length === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((approvedCases.length + completedCases.length) / myCases.length) * 100)))
  const draftRatio = myCases.length === 0 ? 0 : Math.round((draftCases.length / myCases.length) * 100)
  const latestDraft = [...draftCases].sort((a, b) => getCaseSortTime(b) - getCaseSortTime(a))[0]

  const insightViews = {
    draft: {
      title: "Draft Pressure",
      description: "How much of your workload is still unfinished and waiting for completion before handoff.",
      value: `${draftRatio}%`,
      footer: `${draftCases.length} unfinished files`,
      icon: Layers3,
      highlights: [
        { label: "Open Drafts", value: draftCases.length },
        { label: "Draft Ratio", value: draftRatio },
        { label: "Latest Resume", value: latestDraft ? getResumeStep(latestDraft) : 0 },
        { label: "Approved", value: approvedCases.length },
      ],
    },
    flow: {
      title: "Flow Health",
      description: "Share of your caseload that has already moved past intake into approval or completion.",
      value: `${progressHealth}%`,
      footer: `${approvedCases.length + completedCases.length} progressed files`,
      icon: Gauge,
      highlights: [
        { label: "Flow Health", value: progressHealth },
        { label: "Approved", value: approvedCases.length },
        { label: "Completed", value: completedCases.length },
        { label: "Review", value: pendingCases.length },
      ],
    },
    pipeline: {
      title: "Active Pipeline",
      description: "Cases currently moving through investigation and commissioner handling right now.",
      value: String(activeFlowCases.length),
      footer: "live operational queue",
      icon: CheckCircle2,
      highlights: [
        { label: "Pipeline", value: activeFlowCases.length },
        { label: "Investigation", value: myCases.filter((c) => c.status === "in_investigation").length },
        { label: "Pending", value: myCases.filter((c) => c.status === "pending_investigation").length },
        { label: "Review", value: pendingCases.length },
      ],
    },
    risk: {
      title: "Risk Watch",
      description: "Files needing fast attention because they were returned, rejected, or sent back for clarification.",
      value: String(urgentCases.length),
      footer: "priority review items",
      icon: ShieldAlert,
      highlights: [
        { label: "Risk", value: urgentCases.length },
        { label: "Rejected", value: rejectedCases.length },
        { label: "Clarify", value: myCases.filter((c) => c.status === "commissioner_clarification").length },
        { label: "Complete", value: completedCases.length },
      ],
    },
  } as const

  const activeInsight = insightViews[selectedView]
  const ActiveIcon = activeInsight.icon

  const stackedData = React.useMemo(() => {
    const now = new Date()
    const monthKeys: FlowChartBucket[] = Array.from({ length: 4 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      return {
        key,
        month: date.toLocaleString("en-US", { month: "short" }),
        opened: 0,
        review: 0,
        resolved: 0,
      }
    })

    const monthMap = new Map(monthKeys.map((item) => [item.key, item]))

    for (const caseItem of myCases) {
      const timelineDate = getCaseTimelineDate(caseItem)
      if (!timelineDate) continue

      const key = `${timelineDate.getFullYear()}-${timelineDate.getMonth()}`
      const bucket = monthMap.get(key)
      if (!bucket) continue

      const flowBucket: keyof Pick<FlowChartBucket, "opened" | "review" | "resolved"> = getFlowBucket(caseItem.status)
      bucket[flowBucket] += 1
    }

    return monthKeys
  }, [myCases])

  const radarData = activeInsight.highlights.map((item) => ({
    subject: item.label,
    value: Number(item.value) || 0,
  }))

  const statusPieData = [
    { name: "Draft", value: draftCases.length, fill: "#5a8cff" },
    { name: "Review", value: pendingCases.length, fill: "#54c7ec" },
    { name: "Approved", value: approvedCases.length, fill: "#ffcb45" },
    { name: "Risk", value: urgentCases.length, fill: "#ff8b5b" },
  ]

  return (
    <PoliceOfficerShell title="Police Insights">
      <div className="space-y-5">
        <section className="grid gap-3">
          <div className="grid gap-3 xl:grid-cols-[180px_1fr]">
            <div className={panelClass("p-3")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">Live View</div>
                  <div className="mt-1 text-sm font-semibold text-white">{activeInsight.title}</div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-[0.85rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.22)]">
                  <ActiveIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-3 text-xs leading-5 text-white/62">
                {selectedView === "draft" && "Keep interrupted registrations moving back to completion."}
                {selectedView === "flow" && "Check whether files are progressing beyond intake."}
                {selectedView === "pipeline" && "Monitor live queue pressure in active handling."}
                {selectedView === "risk" && "Surface returns and clarifications needing follow-up."}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <div className={panelClass("p-3")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">Primary Signal</div>
                  <div className="mt-1 text-base font-semibold text-white">{activeInsight.title}</div>
                </div>
                <div className="text-xs text-cyan-200/75">Live</div>
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">{activeInsight.value}</div>
              <div className="mt-1 text-xs text-cyan-200/78">{activeInsight.footer}</div>
            </div>

            <div className={panelClass("p-3 md:col-span-1 2xl:col-span-2")}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Police Flow Mix</div>
                <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/68">Live</div>
              </div>
              <div className="mt-2 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(16, 27, 52, 0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="opened" stackId="a" fill="#54c7ec" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="review" stackId="a" fill="#ffcb45" />
                    <Bar dataKey="resolved" stackId="a" fill="#5a8cff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={panelClass("p-3")}>
              <div className="text-sm font-semibold text-white">Control Signal</div>
              <div className="mt-2 grid gap-1.5">
                {activeInsight.highlights.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/6 px-2.5 py-2">
                    <div className="text-[11px] text-white/58">{item.label}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: miniPalette(index) }} />
                      <div className="text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={panelClass("p-3")}>
              <div className="text-sm font-semibold text-white">Distribution Radar</div>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.14)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.62)", fontSize: 9 }} />
                    <Radar dataKey="value" stroke="#5a8cff" fill="#54c7ec" fillOpacity={0.35} strokeWidth={2.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={panelClass("p-3")}>
              <div className="text-sm font-semibold text-white">Status Mix</div>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" innerRadius={28} outerRadius={48} paddingAngle={4}>
                      {statusPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(16, 27, 52, 0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid gap-1">
                {statusPieData.map((item) => (
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

            <div className={panelClass("p-3")}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Signal Dials</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Live</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {activeInsight.highlights.slice(0, 3).map((item, index) => {
                  const value = Math.max(0, Math.min(100, Number(item.value) || 0))
                  return (
                    <div key={item.label} className="flex flex-col items-center rounded-[0.8rem] border border-white/8 bg-white/5 px-2 py-3">
                      <div
                        className="grid h-14 w-14 place-items-center rounded-full border border-white/10 text-sm font-semibold text-white"
                        style={{ background: `conic-gradient(${miniPalette(index)} ${value}%, rgba(255,255,255,0.08) ${value}% 100%)` }}
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(10,18,39,0.95)]">{value}</div>
                      </div>
                      <div className="mt-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/50">{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={panelClass("p-3 md:col-span-2 2xl:col-span-2")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Quick Snapshot</div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/68">Snapshot</div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {[
                  { label: "Draft", value: draftRatio },
                  { label: "Flow", value: progressHealth },
                  { label: "Review", value: myCases.length === 0 ? 0 : Math.round((pendingCases.length / myCases.length) * 100) },
                  { label: "Risk", value: myCases.length === 0 ? 0 : Math.round((urgentCases.length / myCases.length) * 100) },
                  { label: "Closed", value: myCases.length === 0 ? 0 : Math.round((completedCases.length / myCases.length) * 100) },
                  { label: "Resume", value: latestDraft ? getResumeStep(latestDraft) * 20 : 0 },
                ].map((item, index) => (
                  <div key={item.label} className="rounded-[0.8rem] border border-white/8 bg-white/5 p-2">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">{item.label}</div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="text-base font-semibold text-white">{item.value}%</div>
                      <div className="h-7 w-7 rounded-full border border-white/10" style={{ background: `conic-gradient(${miniPalette(index)} ${item.value}%, rgba(255,255,255,0.08) ${item.value}% 100%)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      </div>
    </PoliceOfficerShell>
  )
}

export default function PoliceInsightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PoliceInsightsPageContent />
    </Suspense>
  )
}
