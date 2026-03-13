"use client"

export const dynamic = "force-dynamic"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"

export default function HighCourtIntakePage() {
  const {
    currentUser,
    getAllCases,
    getUsersByRole,
    highCourtRegistryIntake,
    highCourtAssignJudge,
  } = useStore()

  const queue = useMemo(() => {
    if (typeof getAllCases !== "function") return []
    return getAllCases().filter((c: any) => c.status === "filed_to_high_court")
  }, [getAllCases])

  const judges =
    typeof getUsersByRole === "function" ? getUsersByRole("high_court_judge") : []

  const [caseNo, setCaseNo] = useState<Record<string, string>>({})
  const [judgeSel, setJudgeSel] = useState<Record<string, string>>({})

  return (
    <DashboardLayout
      allowedRoles={[
        "high_court_registry",
        "high_court_registry_assistant",
        "court_registry",
      ]}
      title="High Court Intake"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Intake Queue</h2>
          <p className="text-muted-foreground">
            Create a High Court case number and assign a judge.
          </p>
        </div>

        {queue.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {queue.map((c: any) => (
              <div key={c.caseId} className="space-y-2">
                <CaseCard caseData={c} />

                <Input
                  placeholder="High Court case number (e.g. HC/0523/2024)"
                  value={caseNo[c.caseId] || ""}
                  onChange={(e) =>
                    setCaseNo((s) => ({ ...s, [c.caseId]: e.target.value }))
                  }
                />

                <Select
                  value={judgeSel[c.caseId] || ""}
                  onValueChange={(v) =>
                    setJudgeSel((s) => ({ ...s, [c.caseId]: v }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select judge" />
                  </SelectTrigger>

                  <SelectContent className="bg-popover border-border">
                    {judges.map((j: any) => (
                      <SelectItem
                        key={j.id}
                        value={j.id}
                        className="text-foreground"
                      >
                        {j.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (!currentUser) return

                    const cn = (caseNo[c.caseId] || "").trim()
                    const jid = judgeSel[c.caseId]
                    const j = judges.find((x: any) => x.id === jid)

                    if (!cn || !j) return
                    if (typeof highCourtRegistryIntake !== "function") return
                    if (typeof highCourtAssignJudge !== "function") return

                    highCourtRegistryIntake(c.caseId, currentUser, cn)
                    highCourtAssignJudge(c.caseId, j)
                  }}
                >
                  Intake & Assign
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No cases waiting for High Court intake.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
