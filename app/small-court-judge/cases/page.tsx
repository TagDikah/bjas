"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function SmallCourtJudgeCasesPage() {
  const { currentUser, getAllCases, updateCase, smallCourtRequestHighCourt } = useStore()

  const mine = getAllCases().filter((c) => c.court?.courtType === "small" && c.court?.assignedJudgeId === currentUser?.id)

  return (
    <DashboardLayout allowedRoles={["small_court_judge"]} title="My Small Court Cases">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My cases</h2>

        {mine.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.map((c) => (
              <div key={c.caseId} className="space-y-2">
                <Link href={`/small-court-judge/cases/${c.caseId}`}>
                  <CaseCard caseData={c} showAssignment />
                </Link>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => updateCase(c.caseId, { status: "small_court_in_progress" })}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    onClick={() => updateCase(c.caseId, { status: "small_court_completed" })}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!currentUser) return
                      smallCourtRequestHighCourt(c.caseId, currentUser, "Threshold reached / serious offence")
                    }}
                  >
                    Request High Court
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No cases assigned to you.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
