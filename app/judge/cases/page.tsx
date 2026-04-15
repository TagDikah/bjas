"use client"

import Link from "next/link"
import { useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Filter } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import type { CaseData } from "@/lib/blockchain"

type JudgeCasesView = "pending" | "hearing" | "closed" | "all"

function getStatusGroup(status: string) {
  const normalized = String(status || "").toLowerCase()
  if (["sent_to_judge", "assigned_to_judge", "assigned_to_high_court_judge", "assigned_to_small_court_judge"].includes(normalized)) {
    return "pending"
  }
  if (["in_hearing", "in_progress", "high_court_in_progress", "small_court_in_progress", "trial_in_progress"].includes(normalized)) {
    return "hearing"
  }
  if (["closed", "case_closed", "completed", "high_court_completed", "small_court_completed"].includes(normalized)) {
    return "closed"
  }
  return "all"
}

const viewContent: Record<JudgeCasesView, { title: string; description: string }> = {
  pending: {
    title: "Pending Hearings",
    description: "Cases assigned to you and ready to begin hearing.",
  },
  hearing: {
    title: "In Hearing",
    description: "Cases already in active hearing or trial progress.",
  },
  closed: {
    title: "Closed Cases",
    description: "Finalized matters kept for record and review.",
  },
  all: {
    title: "All Assigned Cases",
    description: "Full workload across all judge-assigned statuses.",
  },
}

function PageLoading() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-3">
        <div className="h-5 w-56 rounded bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded bg-muted animate-pulse" />
        <div className="h-24 w-full rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function JudgeCasesContent() {
  const { currentUser, getAllCases } = useStore()
  const searchParams = useSearchParams()

  const initialSearch = searchParams.get("search") ?? ""
  const initialStatus = searchParams.get("status") ?? "all"
  const initialView = (searchParams.get("view") ?? "all") as JudgeCasesView

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [viewFilter, setViewFilter] = useState<JudgeCasesView>(initialView in viewContent ? initialView : "all")

  const myCases = useMemo(() => {
    const allCases = getAllCases()
    return allCases.filter(
      (c: CaseData) => c.courtRegistry?.assignedJudgeId === currentUser?.id
    )
  }, [getAllCases, currentUser?.id])

  const sortedCases = useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = myCases.filter((c: CaseData) => {
      const matchesSearch =
        (c.parties ?? "").toLowerCase().includes(q) ||
        (c.caseNumber ?? "").toLowerCase().includes(q) ||
        (c.charge ?? "").toLowerCase().includes(q) ||
        (c.district ?? "").toLowerCase().includes(q)

      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      const matchesView = viewFilter === "all" || getStatusGroup(String(c.status || "")) === viewFilter
      return matchesSearch && matchesStatus && matchesView
    })

    return [...filtered].sort(
      (a, b) => new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
    )
  }, [myCases, search, statusFilter, viewFilter])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(20,34,63,0.92),rgba(12,23,45,0.96))] p-5 text-white">
        <div className="text-2xl font-semibold">{viewContent[viewFilter].title}</div>
        <div className="mt-1 text-sm text-slate-200">{viewContent[viewFilter].description}</div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>

          <SelectContent className="bg-popover border-border">
            <SelectItem value="all" className="text-foreground">
              All Statuses
            </SelectItem>
            <SelectItem value="assigned_to_judge" className="text-foreground">
              Assigned
            </SelectItem>
            <SelectItem value="in_progress" className="text-foreground">
              In Progress
            </SelectItem>
            <SelectItem value="completed" className="text-foreground">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={viewFilter} onValueChange={(value) => setViewFilter(value as JudgeCasesView)}>
          <SelectTrigger className="w-full sm:w-52 bg-input border-border text-foreground">
            <SelectValue placeholder="Open a view" />
          </SelectTrigger>

          <SelectContent className="bg-popover border-border">
            <SelectItem value="pending" className="text-foreground">
              Pending Hearings
            </SelectItem>
            <SelectItem value="hearing" className="text-foreground">
              In Hearing
            </SelectItem>
            <SelectItem value="closed" className="text-foreground">
              Closed Cases
            </SelectItem>
            <SelectItem value="all" className="text-foreground">
              All Assigned
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {sortedCases.length} of {myCases.length} cases
      </p>

      {/* Cases Grid */}
      {sortedCases.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedCases.map((caseData: CaseData) => (
            <Link key={caseData.caseId} href={`/judge/cases/${caseData.caseId}`}>
              <CaseCard caseData={caseData} onClick={() => {}} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No cases found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

function JudgeCasesPageContent() {
  return (
    <DashboardLayout allowedRoles={["judge"]} title="My Cases">
      <Suspense fallback={<PageLoading />}>
        <JudgeCasesContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default function JudgeCasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <JudgeCasesPageContent />
    </Suspense>
  )
}
