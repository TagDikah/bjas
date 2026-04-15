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

function AIAssignmentContent() {
  const searchParams = useSearchParams()
  const { getAllCases } = useStore()

  const initialQuery = searchParams.get("query") ?? ""
  const [search, setSearch] = useState(initialQuery)

  const sortedCases = useMemo(() => {
    const all = getAllCases()

    const approvedCases = all.filter((c: CaseData) => c.status === "approved")

    const q = search.trim().toLowerCase()
    const filtered = q
      ? approvedCases.filter((c: CaseData) => {
          return (
            (c.parties ?? "").toLowerCase().includes(q) ||
            (c.caseNumber ?? "").toLowerCase().includes(q) ||
            (c.charge ?? "").toLowerCase().includes(q) ||
            (c.district ?? "").toLowerCase().includes(q)
          )
        })
      : approvedCases

    // newest first is usually better for work queues
    return [...filtered].sort(
      (a, b) => new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
    )
  }, [getAllCases, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI-Powered Judge Assignment</h2>
          <p className="text-sm text-muted-foreground">
            Select a case to view AI recommendations based on judge workload analysis
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search approved cases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border text-foreground"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {sortedCases.length} case{sortedCases.length !== 1 ? "s" : ""} ready for assignment
        </p>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          AI Ready
        </Badge>
      </div>

      {/* Cases Grid */}
      {sortedCases.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedCases.map((caseData: CaseData) => (
            <Link key={caseData.caseId} href={`/registry/dashboardassign/${caseData.caseId}`}>
              <CaseCard caseData={caseData} showAssignment onClick={() => {}} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {search.trim() ? "No cases found matching your search." : "No approved cases available."}
          </p>
        </div>
      )}
    </div>
  )
}

function AIAssignmentPageContent() {
  return (
    <DashboardLayout allowedRoles={["court_registry"]} title="AI Judge Assignment">
      <Suspense fallback={<PageLoading />}>
        <AIAssignmentContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default function AIAssignmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <AIAssignmentPageContent />
    </Suspense>
  )
}
