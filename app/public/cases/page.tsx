"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileSearch,
  Filter,
  FolderKanban,
  Search,
  ShieldCheck,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import {
  PUBLIC_STATUS_CONFIG,
  filterPublicCases,
  mergePublicCases,
  toPublicCases,
  type PublicCaseView,
} from "@/lib/public-case-tracking"

const PHASE_OPTIONS = [
  { value: "all", label: "All Phases" },
  { value: "case_opening", label: "Case Opening" },
  { value: "investigation", label: "Investigation" },
  { value: "review_approval", label: "Review / Commissioner / Approval" },
  { value: "prosecution_routing", label: "Prosecution / Court Routing" },
  { value: "complete_docket", label: "Complete Docket" },
]

const GROUP_LABELS: Record<string, string> = {
  opened: "Opened Cases",
  pending: "Pending Cases",
  under_investigation: "Under Investigation",
  pending_commissioner: "Pending Commissioner",
  approved: "Approved",
  rejected: "Rejected",
  delivered: "Delivered",
  docket_complete: "Completed Dockets",
  closed: "Closed Cases",
}

function statusBadgeClass(status: string) {
  const lower = String(status || "").toLowerCase()
  if (lower.includes("reject")) return "border-rose-300/20 bg-rose-400/10 text-rose-100"
  if (lower.includes("approved") || lower.includes("complete") || lower.includes("closed")) {
    return "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
  }
  if (lower.includes("pending")) return "border-amber-300/20 bg-amber-400/10 text-amber-100"
  if (lower.includes("investigation")) return "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
  return "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
}

function safeSummary(value?: string) {
  const summary = String(value || "").trim()
  if (!summary || summary === "N/A") return "No public summary available for this case yet."
  return summary
}

function PublicCaseListPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeCases = useStore((s: any) => (Array.isArray(s.cases) ? s.cases : []))
  const [publicCases, setPublicCases] = useState<PublicCaseView[]>([])

  const qParam = searchParams.get("q") || ""
  const statusParam = searchParams.get("status") || "all"
  const groupParam = searchParams.get("group") || "all"
  const phaseParam = searchParams.get("phase") || "all"

  const [query, setQuery] = useState(qParam)
  const [status, setStatus] = useState(statusParam)
  const [phase, setPhase] = useState(phaseParam)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    fetch("/api/public/cases")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.publicCases)) {
          setPublicCases(data.publicCases)
        }
      })
      .catch(() => {})
  }, [])

  const mergedPublicCases = useMemo(
    () => mergePublicCases(publicCases, toPublicCases(storeCases)),
    [publicCases, storeCases]
  )

  const filtered = useMemo(() => {
    const normalized = filterPublicCases(mergedPublicCases, {
      query,
      status: status === "all" ? "" : status,
      phase: phase === "all" ? "" : phase,
      fromDate: fromDate || "",
      toDate: toDate || "",
    })

    if (groupParam === "all") return normalized

    return normalized.filter((item) => {
      const statusConfig = PUBLIC_STATUS_CONFIG[String(item.status || "").toLowerCase()]
      return statusConfig?.dashboardGroup === groupParam
    })
  }, [mergedPublicCases, query, status, phase, fromDate, toDate, groupParam])

  const panelClass =
    "overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_20px_60px_rgba(4,10,28,0.32)] text-white"
  const softPanelClass =
    "rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] shadow-[0_16px_34px_rgba(3,8,20,0.18)]"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="h-11 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white"
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
        </div>

        <Card className={panelClass}>
          <CardHeader className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-8 -top-8 opacity-[0.12]">
              <FileSearch className="h-40 w-40 text-cyan-100" strokeWidth={1.1} />
            </div>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              Public Case List{groupParam !== "all" ? ` - ${GROUP_LABELS[groupParam] || "Filtered"}` : ""}
            </CardTitle>
            <CardDescription className="text-white/62">
              Search and filter public-safe case records by status, phase, and date.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className={softPanelClass}>
                <div className="border-b border-white/8 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    <Search className="h-4 w-4" />
                    Search and Filters
                  </div>
                </div>

                <div className="grid gap-3 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Case number or title..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-12 rounded-[0.95rem] border-white/10 bg-white/6 text-white placeholder:text-white/38"
                    />
                  </div>

                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-12 rounded-[0.95rem] border-white/10 bg-white/6 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.keys(PUBLIC_STATUS_CONFIG).map((key) => (
                        <SelectItem key={key} value={key}>
                          {PUBLIC_STATUS_CONFIG[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger className="h-12 rounded-[0.95rem] border-white/10 bg-white/6 text-white">
                      <SelectValue placeholder="Filter by phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-12 rounded-[0.95rem] border-white/10 bg-white/6 text-white"
                  />
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-12 rounded-[0.95rem] border-white/10 bg-white/6 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Button asChild className="h-11 rounded-[0.95rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white shadow-[0_16px_34px_rgba(88,74,210,0.32)] hover:brightness-110 hover:!text-white">
                  <Link href={`/public/cases${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}>
                    <Search className="mr-2 h-4 w-4" />
                    Search Cases
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-11 rounded-[0.95rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Link href="/public">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            <div className={`${softPanelClass} p-4`}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <Filter className="h-4 w-4" />
                Reading
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/48">Cases</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{filtered.length}</div>
                  <div className="mt-1 text-sm text-white/62">public cases found.</div>
                </div>

                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                    <FolderKanban className="h-4 w-4" />
                    Active Filters
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/68">
                    <div>Status: {status === "all" ? "All Statuses" : PUBLIC_STATUS_CONFIG[status]?.label || status}</div>
                    <div>Phase: {PHASE_OPTIONS.find((item) => item.value === phase)?.label || "All Phases"}</div>
                    <div>Date range: {fromDate || toDate ? `${fromDate || "Start"} to ${toDate || "End"}` : "Any date"}</div>
                  </div>
                </div>

                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                    <CalendarDays className="h-4 w-4" />
                    Public Safe View
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/68">
                    This list shows only public-safe case records, current location, phase, and recent movement summaries.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={panelClass}>
          <CardHeader>
            <CardTitle className="text-white">Cases</CardTitle>
            <CardDescription className="text-white/62">{filtered.length} public cases found.</CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/55">
                No cases match the selected filters.
              </div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((item) => (
                  <Link
                    key={`${item.caseId}-${item.updatedAt}`}
                    href={`/public/cases/${item.caseId}`}
                    className="group rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] p-4 transition hover:-translate-y-0.5 hover:border-cyan-200/34 hover:no-underline"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-base font-semibold text-white">
                          {item.title && item.title !== "UNKNOWN" ? item.title : "Case record"}
                        </div>
                        <div className="mt-1 font-mono text-xs text-cyan-200/78">{item.caseNumber}</div>
                      </div>
                      <Badge variant="outline" className={statusBadgeClass(item.status)}>
                        {item.statusLabel}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-white/62 md:grid-cols-3">
                      <div>
                        <span className="font-medium text-white">Department:</span> {item.department}
                      </div>
                      <div>
                        <span className="font-medium text-white">Phase:</span> {item.phaseLabel}
                      </div>
                      <div>
                        <span className="font-medium text-white">Last update:</span>{" "}
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/68">
                      {safeSummary(item.progressSummary)}
                    </div>

                    <div className="mt-4 inline-flex items-center text-sm font-medium text-cyan-200 transition group-hover:text-white">
                      Open Case
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PublicCaseListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <PublicCaseListPageContent />
    </Suspense>
  )
}
