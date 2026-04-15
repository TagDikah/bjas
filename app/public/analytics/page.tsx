"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Globe2,
  ShieldCheck,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { PUBLIC_STATUS_CONFIG, mergePublicCases, toPublicCases, type PublicCaseView } from "@/lib/public-case-tracking"

const PIE_COLORS = ["#93C5FD", "#60A5FA", "#3B82F6", "#1D4ED8", "#A5B4FC", "#64748B"]
const GRID_STROKE = "rgba(148, 163, 184, 0.18)"
const AXIS_STROKE = "#94A3B8"
const PANEL_CLASS =
  "bejas-brand-panel text-white shadow-[0_28px_80px_rgba(2,6,23,0.42)]"

function shortLabel(value: string, max = 12) {
  const text = String(value || "")
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}...`
}

function daysFromPeriod(period: string) {
  if (period === "all") return null
  if (period === "today") return 1
  if (period === "7d") return 7
  if (period === "14d") return 14
  if (period === "30d") return 30
  if (period === "90d") return 90
  return null
}

function isPendingReview(statusRaw: string) {
  const key = String(statusRaw || "").toLowerCase()
  return (
    key === "pending_review" ||
    key === "pending_commissioner" ||
    key === "submitted_to_commissioner" ||
    key === "commissioner_clarification"
  )
}

function isActiveStatus(statusRaw: string) {
  const key = String(statusRaw || "").toLowerCase()
  return !["closed", "docket_complete", "completed"].includes(key)
}

function bucketByMonth(cases: PublicCaseView[]) {
  const map: Record<string, number> = {}
  for (const item of cases) {
    const d = new Date(item.updatedAt)
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    map[label] = (map[label] || 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, count]) => ({ period, count }))
}

function isUsefulSummary(value?: string) {
  const summary = String(value || "").trim()
  if (!summary || summary === "N/A") return false
  return summary !== "Progress is being updated by the responsible department."
}

function normalizeText(value: string) {
  return String(value || "").trim().toLowerCase()
}

function resolveDepartmentFilter(departmentKey: string, options: string[]) {
  const raw = normalizeText(departmentKey)
  if (!raw || raw === "all_departments") return "all_departments"

  const exact = options.find((option) => normalizeText(option) === raw)
  if (exact) return exact

  const aliasGroups: Record<string, string[]> = {
    police: ["police", "hq intake", "hq", "maseru central police station"],
    investigation: ["investigation department", "investigation queue", "investigation"],
    registry: ["court registry", "registry assistant", "registry"],
    prosecution: ["prosecution", "prosecutor", "dpp"],
    court: ["court registry", "court"],
    records: ["records", "archive", "registry"],
  }

  const candidates = aliasGroups[raw] || [raw]
  for (const candidate of candidates) {
    const partial = options.find((option) => normalizeText(option).includes(candidate))
    if (partial) return partial
  }

  return "all_departments"
}

function MetricCard({
  title,
  value,
  detail,
  Icon,
  accentClass,
}: {
  title: string
  value: string | number
  detail: string
  Icon: typeof Activity
  accentClass: string
}) {
  return (
    <Card className={`${PANEL_CLASS} overflow-hidden rounded-[1.4rem]`}>
      <CardContent className="relative p-5">
        <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100/70">{title}</div>
            <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
            <div className="text-sm text-blue-50/68">{detail}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Icon className="h-5 w-5 text-blue-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PublicAnalyticsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeCases = useStore((s: any) => (Array.isArray(s.cases) ? s.cases : []))
  const [publicCases, setPublicCases] = useState<PublicCaseView[]>([])
  const [phaseFilter, setPhaseFilter] = useState("all_phases")
  const [statusFilter, setStatusFilter] = useState("all_statuses")
  const [deptFilter, setDeptFilter] = useState("all_departments")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [serviceOnline, setServiceOnline] = useState(true)
  const selectedPanel = searchParams.get("panel") || "reading"
  const departmentParam = searchParams.get("departmentKey") || searchParams.get("department") || "all_departments"

  useEffect(() => {
    fetch("/api/public/cases")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.publicCases)) {
          setPublicCases(data.publicCases)
          setServiceOnline(true)
        } else {
          setServiceOnline(false)
        }
      })
      .catch(() => setServiceOnline(false))
  }, [])

  const mergedPublicCases = useMemo(
    () => mergePublicCases(publicCases, toPublicCases(storeCases)),
    [publicCases, storeCases]
  )

  const departmentOptions = useMemo(() => {
    return Array.from(new Set(mergedPublicCases.map((c) => c.department).filter(Boolean))).sort()
  }, [mergedPublicCases])

  useEffect(() => {
    setDeptFilter(resolveDepartmentFilter(departmentParam, departmentOptions))
  }, [departmentParam, departmentOptions])

  const phaseOptions = useMemo(() => {
    return Array.from(new Set(mergedPublicCases.map((c) => c.phaseLabel).filter(Boolean))).sort()
  }, [mergedPublicCases])

  const statusOptions = useMemo(() => {
    return Array.from(new Set(mergedPublicCases.map((c) => c.statusLabel).filter(Boolean))).sort()
  }, [mergedPublicCases])

  const filtered = useMemo(() => {
    const now = Date.now()
    const days = daysFromPeriod(periodFilter)
    const from = days == null ? Number.NEGATIVE_INFINITY : now - days * 24 * 60 * 60 * 1000

    return mergedPublicCases.filter((item) => {
      const passPhase = phaseFilter === "all_phases" || item.phaseLabel === phaseFilter
      const passStatus = statusFilter === "all_statuses" || item.statusLabel === statusFilter
      const passDept = deptFilter === "all_departments" || item.department === deptFilter
      const passPeriod = new Date(item.updatedAt).getTime() >= from
      return passPhase && passStatus && passDept && passPeriod
    })
  }, [mergedPublicCases, phaseFilter, statusFilter, deptFilter, periodFilter])

  const activeCases = useMemo(() => filtered.filter((c) => isActiveStatus(c.status)).length, [filtered])
  const newThisWeek = useMemo(() => {
    const from = Date.now() - 7 * 24 * 60 * 60 * 1000
    return filtered.filter((c) => new Date(c.createdAt).getTime() >= from).length
  }, [filtered])
  const pendingReviews = useMemo(() => filtered.filter((c) => isPendingReview(c.status)).length, [filtered])

  const statusData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of filtered) {
      const label = PUBLIC_STATUS_CONFIG[String(item.status || "").toLowerCase()]?.label || item.statusLabel
      map[label] = (map[label] || 0) + 1
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  const departmentData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of filtered) {
      map[item.department] = (map[item.department] || 0) + 1
    }
    return Object.entries(map)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filtered])

  const trendData = useMemo(() => bucketByMonth(filtered), [filtered])

  const rejectionData = useMemo(() => {
    const rejected = filtered.filter((c) => String(c.status || "").toLowerCase().includes("reject")).length
    const backInProcess = filtered.filter((c) => String(c.status || "").toLowerCase() === "back_in_process").length
    const reSubmitted = filtered.filter((c) => String(c.status || "").toLowerCase() === "re_submitted").length
    const approvedAfterCorrection = filtered.filter(
      (c) => String(c.status || "").toLowerCase() === "approved_after_correction"
    ).length
    return [
      { name: "Rejected", count: rejected },
      { name: "Back In Process", count: backInProcess },
      { name: "Re-Submitted", count: reSubmitted },
      { name: "Approved After Correction", count: approvedAfterCorrection },
    ]
  }, [filtered])

  const topDepartments = useMemo(() => departmentData.slice(0, 3), [departmentData])
  const topStatus = statusData[0]
  const recentCases = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8),
    [filtered]
  )
  const focusCards = [
    {
      key: "reading",
      title: "Dashboard Reading",
      description: "Open a cleaner summary of the current workload without the full dashboard distribution.",
      detail: `${filtered.length} visible cases, ${activeCases} active, ${pendingReviews} pending review.`,
    },
    {
      key: "workflow",
      title: "Workflow Snapshot",
      description: "Use the charts below to understand how cases are spread across stages.",
      detail: `${statusData.length} visible status groups and ${trendData.length} trend periods are available.`,
    },
    {
      key: "location",
      title: "Case Locations",
      description: "Focus on departments and operational placement of visible public cases.",
      detail: `${departmentData.length} departments are currently represented in this view.`,
    },
    {
      key: "workload",
      title: "Office Workload",
      description: "Review office pressure and routing concentration from the public-safe data.",
      detail: `${topDepartments[0]?.department || "No department"} currently has the strongest visible workload.`,
    },
    {
      key: "status",
      title: "Status Breakdown",
      description: "Read the full status composition and compare which visible states dominate.",
      detail: `${topStatus?.name || "No status"} is currently the strongest visible status.`,
    },
    {
      key: "recent",
      title: "Recent Movements",
      description: "Jump from analytics into the public case list to inspect recent case movement updates.",
      detail: "Use the public case list for record-level movement tracking.",
    },
  ] as const
  const activeFocus = focusCards.find((item) => item.key === selectedPanel) || focusCards[0]
  const isReadingPanel = activeFocus.key === "reading"
  const isWorkflowPanel = activeFocus.key === "workflow"
  const isLocationPanel = activeFocus.key === "location"
  const isWorkloadPanel = activeFocus.key === "workload"
  const isStatusPanel = activeFocus.key === "status"
  const isRecentPanel = activeFocus.key === "recent"
  const isDepartmentFocused = deptFilter !== "all_departments"
  const pageEyebrow = isDepartmentFocused ? "Department Public Analytics" : "Public Analytics Page"
  const pageTitle = isDepartmentFocused
    ? `${deptFilter} ${activeFocus.title}`
    : activeFocus.title
  const pageDescription = isDepartmentFocused
    ? `This page shows only the public analytics view for ${deptFilter}, including workload, status movement, and visible case activity in this department.`
    : `This page shows the ${activeFocus.title.toLowerCase()} for visible public cases across the justice workflow.`

  const downloadSummary = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      filters: {
        phase: phaseFilter,
        status: statusFilter,
        department: deptFilter,
        period: periodFilter,
      },
      totals: {
        activeCases,
        newThisWeek,
        pendingReviews,
        visibleCases: filtered.length,
        serviceOnline,
      },
      trendData,
      statusData,
      departmentData,
      rejectionData,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `public-analytics-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),linear-gradient(180deg,#06111f_0%,#09172c_46%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
                return
              }
              router.push("/public")
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge
            variant="outline"
            className={`rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.24em] ${
              serviceOnline
                ? "border-blue-300/30 bg-blue-300/10 text-blue-100"
                : "border-amber-400/30 bg-amber-400/10 text-amber-200"
            }`}
          >
            {serviceOnline ? "Operational" : "Degraded"}
          </Badge>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className={`${PANEL_CLASS} overflow-hidden rounded-[1.8rem]`}>
            <CardContent className="relative p-6 md:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-300/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative max-w-3xl space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-blue-100 hover:bg-blue-300/10">
                    {pageEyebrow}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-blue-50/70"
                  >
                    BEJAS Public Portal
                  </Badge>
                  {deptFilter !== "all_departments" ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100"
                    >
                      Department Focus: {deptFilter}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                    {pageTitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-blue-50/70 md:text-base">
                    {pageDescription}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.35rem] border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(96,165,250,0.12),rgba(15,23,42,0.12))] px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/70">Current Page</div>
                    <div className="mt-2 text-xl font-semibold text-white">{activeFocus.title}</div>
                    <div className="mt-1 text-sm text-blue-50/72">
                      {isDepartmentFocused ? `Focused on ${deptFilter}` : "All visible public departments"}
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-blue-100/70">View Meaning</div>
                    <div className="mt-2 text-sm leading-6 text-blue-50/76">{activeFocus.description}</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">Visible Cases</div>
                    <div className="mt-2 text-2xl font-semibold">{filtered.length}</div>
                    <div className="mt-1 text-sm text-blue-50/68">Public-safe records in the current scope.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">Dominant Status</div>
                    <div className="mt-2 text-xl font-semibold">{topStatus?.name || "No data"}</div>
                    <div className="mt-1 text-sm text-blue-50/68">
                      {topStatus ? `${topStatus.count} cases currently grouped here.` : "Waiting for records."}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">Lead Department</div>
                    <div className="mt-2 text-xl font-semibold">{topDepartments[0]?.department || "No data"}</div>
                    <div className="mt-1 text-sm text-blue-50/68">
                      {topDepartments[0] ? `${topDepartments[0].count} cases in selected period.` : "No department breakdown yet."}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${PANEL_CLASS} rounded-[1.8rem]`}>
            <CardHeader className="space-y-3 pb-3">
              <CardTitle className="text-lg font-semibold tracking-[-0.02em] text-white">
                Filter Analytics
              </CardTitle>
              <CardDescription className="text-blue-50/68">
                Choose the type of cases you want to see. These filters only change the view, not the records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">Case Stage</div>
                  <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_phases">All Case Stages</SelectItem>
                      {phaseOptions.map((phase) => (
                        <SelectItem key={phase} value={phase}>
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">Case Status</div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_statuses">All Case Statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">Office or Department</div>
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_departments">All Departments</SelectItem>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">Updated Within</div>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="14d">Last 14 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/70">Current Filters</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-50/80">
                    Stage: {phaseFilter === "all_phases" ? "All" : shortLabel(phaseFilter, 20)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-50/80">
                    Status: {statusFilter === "all_statuses" ? "All" : shortLabel(statusFilter, 20)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-50/80">
                    Office: {deptFilter === "all_departments" ? "All" : shortLabel(deptFilter, 18)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-50/80">
                    Time: {periodFilter === "all" ? "All Time" : periodFilter === "today" ? "Today" : periodFilter === "7d" ? "Last 7 Days" : periodFilter === "14d" ? "Last 14 Days" : periodFilter === "30d" ? "Last 30 Days" : "Last 90 Days"}
                  </Badge>
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                className="w-full border-white/10 bg-blue-300 text-[#06111f] hover:bg-blue-200"
                onClick={downloadSummary}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Summary
              </Button>
            </CardContent>
          </Card>
        </section>

        <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">
              {isDepartmentFocused ? `${deptFilter} Page Summary` : `${activeFocus.title} Summary`}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isDepartmentFocused
                ? `A quick summary of what this ${deptFilter} page is showing right now.`
                : activeFocus.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-50/80">
              {activeFocus.detail}
            </div>
            {selectedPanel === "recent" ? (
              <Button asChild className="border-none bg-blue-300 text-[#06111f] hover:bg-blue-200">
                <Link href="/public/cases">Open Recent Case List</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/public">Back to Public Dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {(isReadingPanel || isWorkloadPanel) ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Active Caseload"
            value={activeCases}
            detail="Records still moving through the justice workflow."
            Icon={Activity}
            accentClass="bg-blue-300"
          />
          <MetricCard
            title="New This Week"
            value={newThisWeek}
            detail="Fresh public-safe records opened in the last 7 days."
            Icon={CalendarDays}
            accentClass="bg-blue-500"
          />
          <MetricCard
            title="Pending Review"
            value={pendingReviews}
            detail="Cases queued for commissioner or review actions."
            Icon={Clock3}
            accentClass="bg-indigo-300"
          />
          <MetricCard
            title="Service Health"
            value={serviceOnline ? "99.9%" : "Alert"}
            detail={serviceOnline ? "Public-facing analytics responding normally." : "Backend response needs attention."}
            Icon={ShieldCheck}
            accentClass="bg-blue-500"
          />
        </section>
        ) : null}

        {(isWorkflowPanel || isStatusPanel) ? (
        <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <BarChart3 className="h-4 w-4 text-blue-200" />
                Network Activity Trend
              </CardTitle>
              <CardDescription className="text-slate-400">
                Case movement volume by month across the selected public scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: AXIS_STROKE, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: AXIS_STROKE, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(5, 10, 24, 0.96)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "18px",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#60A5FA" strokeWidth={3} dot={{ r: 3, fill: "#60A5FA" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Globe2 className="h-4 w-4 text-blue-200" />
                Status Composition
              </CardTitle>
              <CardDescription className="text-slate-400">
                Current public-safe distribution across visible case states.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="name" outerRadius={100} innerRadius={48} paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(5, 10, 24, 0.96)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "18px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
        ) : null}

        {(isLocationPanel || isWorkloadPanel || isStatusPanel) ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Filter className="h-4 w-4 text-blue-200" />
                Department Throughput
              </CardTitle>
              <CardDescription className="text-slate-400">
                Highest-volume departments in the chosen public reporting window.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_STROKE, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={110}
                    tick={{ fill: AXIS_STROKE, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => shortLabel(String(value), 14)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(5, 10, 24, 0.96)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "18px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#60A5FA" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <CheckCircle2 className="h-4 w-4 text-blue-200" />
                Correction Lifecycle
              </CardTitle>
              <CardDescription className="text-slate-400">
                Rejection-related follow-up visibility across resumed and corrected cases.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rejectionData}>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: AXIS_STROKE, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(value) => shortLabel(String(value), 14)}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: AXIS_STROKE, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(5, 10, 24, 0.96)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "18px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {rejectionData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
        ) : null}

        {(isReadingPanel || isLocationPanel || isWorkloadPanel || isStatusPanel) ? (
        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Snapshot Summary</CardTitle>
              <CardDescription className="text-slate-400">
                A compact operational reading for the currently selected public view.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">Observed Priority</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {pendingReviews > newThisWeek ? "Review bottleneck watch" : "Normal public intake pace"}
                </div>
                <div className="mt-1 text-sm text-blue-50/68">
                  Pending review volume is {pendingReviews} while new weekly intake is {newThisWeek}.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">Top Departments</div>
                <div className="mt-3 space-y-2">
                  {topDepartments.length === 0 ? (
                    <div className="text-sm text-blue-50/68">No department data available.</div>
                  ) : (
                    topDepartments.map((item, index) => (
                      <div key={item.department} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-300/10 text-xs font-semibold text-blue-100">
                            {index + 1}
                          </div>
                          <div className="text-sm text-white">{item.department}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-100">{item.count}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Status Register</CardTitle>
              <CardDescription className="text-slate-400">
                Ranked count of public-safe statuses in the active filter scope.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {statusData.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-blue-50/68">
                    No status records match the current filters.
                  </div>
                ) : (
                  statusData.map((item, index) => (
                    <div key={item.name} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-sm font-semibold text-blue-100/60">{String(index + 1).padStart(2, "0")}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-blue-300"
                            style={{
                              width: `${Math.max(8, (item.count / Math.max(statusData[0]?.count || 1, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-100">{item.count}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        ) : null}

        {isRecentPanel ? (
        <Card className={`${PANEL_CLASS} rounded-[1.6rem]`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Recent Movements</CardTitle>
            <CardDescription className="text-slate-400">
              Latest visible case updates and the department currently holding each record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-blue-50/68">
                No recent public-safe movement is available for the current filters.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {recentCases.map((item) => (
                  <Link
                    key={`${item.caseId}-${item.updatedAt}`}
                    href={`/public/cases/${item.caseId}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-blue-300/30 hover:bg-white/8 hover:no-underline"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{item.caseNumber}</div>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-50/80">
                        {item.phaseLabel}
                      </Badge>
                    </div>
                    <div className="mt-2 text-base font-medium text-white">
                      {item.title && item.title !== "UNKNOWN" ? item.title : "Case record"}
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-blue-50/72">
                      <div>Current status: {item.statusLabel}</div>
                      <div>Current location: {item.department}</div>
                      <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
                      {isUsefulSummary(item.progressSummary) ? <div>Summary: {item.progressSummary}</div> : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        ) : null}

        <div className="flex justify-end">
          <Button asChild className="border-none bg-blue-300 text-[#06111f] hover:bg-blue-200">
            <Link href="/public/cases">Open Public Case List</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PublicAnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicAnalyticsPageContent />
    </Suspense>
  )
}
