"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

export default function HighCourtRegistryCases() {
  const { getAllCases } = useStore()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return getAllCases()
      .filter((c) => c.court?.courtType === "high")
      .filter((c) => {
        const matchesStatus = status === "all" || c.status === status
        const haystack = [c.caseNumber, c.parties, c.charge, c.district, c.court?.courtCaseNumber]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        const matchesSearch = !q || haystack.includes(q)
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())
  }, [getAllCases, search, status])

  return (
    <DashboardLayout allowedRoles={["high_court_registry", "high_court_registry_assistant", "court_registry"]} title="High Court Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">High Court cases</h2>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            placeholder="Search by case number, parties, charge, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="filed_to_high_court">Filed to High Court</SelectItem>
              <SelectItem value="high_court_registry_intake">Awaiting Assignment</SelectItem>
              <SelectItem value="assigned_to_high_court_judge">Assigned to Judge</SelectItem>
              <SelectItem value="high_court_in_progress">In Progress</SelectItem>
              <SelectItem value="high_court_completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((c) => (
              <Link
                key={c.caseId}
                href={
                  c.status === "filed_to_high_court" || c.status === "high_court_registry_intake"
                    ? `/high-court-registry/assistant/process-form?caseId=${encodeURIComponent(c.caseId)}`
                    : c.status === "assigned_to_high_court_judge" || c.status === "high_court_in_progress"
                      ? `/high-court-judge/cases/${c.caseId}`
                      : "#"
                }
              >
                <CaseCard caseData={c} showAssignment />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No High Court cases match the current filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
