"use client"

import { useState } from "react"
import { Search, Clock } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useSearchParams, Suspense } from "next/navigation"
import Loading from "./loading"

export default function RegistryPendingPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const { getAllCases } = useStore()
  const [search, setSearch] = useState(searchQuery)

  const pendingCases = getAllCases().filter(c => c.status === "approved")

  const filteredCases = pendingCases.filter(c => {
    return (
      c.parties.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.charge.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
    )
  })

  const sortedCases = [...filteredCases].sort((a, b) => 
    new Date(a.dateOpened).getTime() - new Date(b.dateOpened).getTime()
  )

  return (
    <DashboardLayout allowedRoles={["court_registry"]} title="Pending Assignment">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Clock className="h-5 w-5 text-warning-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Cases Pending Assignment</h2>
            <p className="text-sm text-muted-foreground">
              These cases have been approved and are waiting for judge assignment
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pending cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          {sortedCases.length} case{sortedCases.length !== 1 ? "s" : ""} pending assignment
        </p>

        {/* Cases Grid */}
        <Suspense fallback={<Loading />}>
          {sortedCases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedCases.map(caseData => (
                <Link key={caseData.caseId} href={`/registry/dashboardassign/${caseData.caseId}`}>
                  <CaseCard caseData={caseData} onClick={() => {}} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                {search ? "No cases found matching your search." : "No cases pending assignment."}
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </DashboardLayout>
  )
}