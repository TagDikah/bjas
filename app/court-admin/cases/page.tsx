"use client"

import { useMemo, useState } from "react"
import { Search, Filter, FileText } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import type { CaseData } from "@/lib/blockchain"

export default function CourtAdminAllCasesPage() {
  const { getAllCases } = useStore()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const allCases = useMemo(() => getAllCases(), [getAllCases])

  const sortedCases = useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = allCases.filter((c: CaseData) => {
      const matchesSearch =
        (c.parties ?? "").toLowerCase().includes(q) ||
        (c.caseNumber ?? "").toLowerCase().includes(q) ||
        (c.charge ?? "").toLowerCase().includes(q) ||
        (c.district ?? "").toLowerCase().includes(q) ||
        (c.courtRegistry?.assignedJudgeName ?? "").toLowerCase().includes(q)

      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return [...filtered].sort(
      (a, b) => new Date(b.dateOpened).getTime() - new Date(a.dateOpened).getTime()
    )
  }, [allCases, search, statusFilter])

  return (
    <DashboardLayout allowedRoles={["court_admin"]} title="All Cases">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">All Cases</h2>
            <p className="text-sm text-muted-foreground">
              View and search every case in the system.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search parties, case number, district, judge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-64 bg-input border-border text-foreground">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground">
                All Statuses
              </SelectItem>
              <SelectItem value="pending_commissioner" className="text-foreground">
                Pending Commissioner
              </SelectItem>
              <SelectItem value="approved" className="text-foreground">
                Approved (Ready for Court)
              </SelectItem>
              <SelectItem value="assigned_to_judge" className="text-foreground">
                Assigned to Judge
              </SelectItem>
              <SelectItem value="in_progress" className="text-foreground">
                In Progress
              </SelectItem>
              <SelectItem value="completed" className="text-foreground">
                Completed
              </SelectItem>
              <SelectItem value="rejected" className="text-foreground">
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {sortedCases.length} of {allCases.length} cases
          </p>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Court Admin
          </Badge>
        </div>

        {/* List */}
        {sortedCases.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedCases.map((caseData: CaseData) => (
              <CaseCard key={caseData.caseId} caseData={caseData} showAssignment />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No cases found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
