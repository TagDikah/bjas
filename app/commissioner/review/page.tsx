"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { Suspense } from "react"
import Loading from "./loading"

export default function CommissionerReviewPage() {
  const { getAllCases } = useStore()
  const [search, setSearch] = useState("")

  const pendingCases = getAllCases().filter(c => c.status === "pending_commissioner")

  const filteredCases = pendingCases.filter(c => {
    return (
      (c.parties || "").toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.charge || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.district || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.policeOfficerName || "").toLowerCase().includes(search.toLowerCase())
    )
  })

  const sortedCases = [...filteredCases].sort((a, b) => 
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  )

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Review Cases">
      <div className="space-y-6">
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
          {sortedCases.length} case{sortedCases.length !== 1 ? "s" : ""} pending review
        </p>

        {/* Cases Grid */}
        <Suspense fallback={<Loading />}>
          {sortedCases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedCases.map(caseData => (
                <Link key={caseData.caseId} href={`/commissioner/review/${caseData.caseId}`}>
                  <CaseCard caseData={caseData} onClick={() => {}} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                {search ? "No cases found matching your search." : "No cases pending review."}
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
