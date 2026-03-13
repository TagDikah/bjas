"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function ProsecutorCasesPage() {
  const currentUser = useStore((s: any) => s.currentUser)
  const getAllCases = useStore((s: any) => s.getAllCases)

  // ✅ read these as any (they exist at runtime, TS just didn't know)
  const prosecutorFileToSmallCourt = useStore((s: any) => s.prosecutorFileToSmallCourt)
  const prosecutorReturnToPolice = useStore((s: any) => s.prosecutorReturnToPolice)

  const all = typeof getAllCases === "function" ? (getAllCases() ?? []) : []

  const myCases = all.filter(
    (c: any) =>
      String(c?.status ?? "").toLowerCase() === "assigned_to_prosecutor" &&
      c?.dppReview?.assignedProsecutorId === currentUser?.id
  )

  return (
    <DashboardLayout
      allowedRoles={["prosecutor","dpp"]}
      title="My Assigned Cases"
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Assigned to me</h2>

        {myCases.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myCases.map((c: any) => (
              <div key={c.caseId} className="space-y-2">
                <CaseCard caseData={c} showAssignment />

                <Link href={`/police/case/${c.caseId}`} className="block">
                  <Button variant="outline" className="w-full">
                    Open Police Docket (Section B)
                  </Button>
                </Link>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (!currentUser) return
                      if (typeof prosecutorFileToSmallCourt !== "function") {
                        alert("Action not available: prosecutorFileToSmallCourt is missing in store.")
                        return
                      }
                      prosecutorFileToSmallCourt(c.caseId, currentUser)
                    }}
                  >
                    File → Small Court
                  </Button>

                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      if (!currentUser) return
                      if (typeof prosecutorReturnToPolice !== "function") {
                        alert("Action not available: prosecutorReturnToPolice is missing in store.")
                        return
                      }
                      prosecutorReturnToPolice(
                        c.caseId,
                        currentUser,
                        "Insufficient evidence / further investigation"
                      )
                    }}
                  >
                    Return to Police
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

