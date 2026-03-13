"use client"

import { useMemo, useState, Suspense } from "react"
import { Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import type { CaseData } from "@/lib/blockchain"

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

function Content() {
  const searchParams = useSearchParams()
  const { getAllCases } = useStore()

  const initialQuery = searchParams.get("query") ?? ""
  const [search, setSearch] = useState(initialQuery)

  const sortedCases = useMemo(() => {
    const all = getAllCases()

    // âœ… High Court judge assignment happens after High Court registry intake
    const ready = all.filter((c: CaseData) => c.status === "high_court_registry_intake")

    const q = search.trim().toLowerCase()
    const filtered = q
      ? ready.filter((c: CaseData) => {
          return (
            (c.parties ?? "").toLowerCase().includes(q) ||
            (c.caseNumber ?? "").toLowerCase().includes(q) ||
            (c.charge ?? "").toLowerCase().includes(q) ||
            (c.district ?? "").toLowerCase().includes(q) ||
            (c.court?.courtCaseNumber ?? "").toLowerCase().includes(q)
          )
        })
      : ready

    return [...filtered].sort(
      (a, b) => new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
    )
  }, [getAllCases, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Judge Assignment (High Court)</h2>
          <p className="text-sm text-muted-foreground">
            Select an intake case to get AI workload recommendations and assign a High Court judge.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search High Court intake cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border text-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {sortedCases.length} case{sortedCases.length !== 1 ? "s" : ""} awaiting assignment
        </p>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          AI Ready
        </Badge>
      </div>

      {sortedCases.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedCases.map((caseData: CaseData) => (
            <Link key={caseData.caseId} href={`/high-court-registry/dashboardassistant/assign/${caseData.caseId}`}>
              <CaseCard caseData={caseData} showAssignment onClick={() => {}} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {search.trim() ? "No cases found matching your search." : "No High Court intake cases available."}
          </p>
        </div>
      )}
    </div>
  )
}

export default function HighCourtAIAssignmentPage() {
  return (
    <DashboardLayout
      allowedRoles={["high_court_registry_assistant", "high_court_registry", "court_registry"]}
      title="High Court AI Assignment"
    >
      <Suspense fallback={<PageLoading />}>
        <Content />
      </Suspense>
    </DashboardLayout>
  )
}