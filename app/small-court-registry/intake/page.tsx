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

export default function SmallCourtIntakePage() {
  const store = useStore() as any

  const currentUser = store.currentUser

  const cases = useMemo(() => {
    if (typeof store.getAllCases === "function") {
      const result = store.getAllCases()
      return Array.isArray(result) ? result : []
    }
    if (Array.isArray(store.cases)) return store.cases
    return []
  }, [store])

  const magistrates = useMemo(() => {
    if (typeof store.getUsersByRole === "function") {
      const result =
        store.getUsersByRole("small_court_magistrate") ??
        store.getUsersByRole("magistrate") ??
        []
      return Array.isArray(result) ? result : []
    }

    if (Array.isArray(store.users)) {
      return store.users.filter((u: any) =>
        ["small_court_magistrate", "magistrate"].includes(u?.role)
      )
    }

    return []
  }, [store])

  const queue = useMemo(() => {
    return cases.filter((c: any) =>
      ["filed_to_small_court", "pending_small_court_intake"].includes(c?.status)
    )
  }, [cases])

  const [caseNo, setCaseNo] = useState<Record<string, string>>({})
  const [magSel, setMagSel] = useState<Record<string, string>>({})

  const intakeAction =
    store.smallCourtRegistryIntake ??
    store.smallCourtIntake ??
    store.registryIntakeSmallCourt

  const assignAction =
    store.smallCourtAssignMagistrate ??
    store.smallCourtAssignJudge ??
    store.smallCourtAssign

  return (
    <DashboardLayout
      allowedRoles={[
        "small_court_registry",
        "small_court_registry_assistant",
        "court_registry",
      ]}
      title="Small Court Intake"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Intake Queue</h2>
          <p className="text-muted-foreground">
            Create a Small Court case number and assign a magistrate.
          </p>
        </div>

        {queue.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {queue.map((c: any) => (
              <div key={c.caseId} className="space-y-2">
                <CaseCard caseData={c} />

                <Input
                  placeholder="Small Court case number"
                  value={caseNo[c.caseId] || ""}
                  onChange={(e) =>
                    setCaseNo((s) => ({ ...s, [c.caseId]: e.target.value }))
                  }
                />

                <Select
                  value={magSel[c.caseId] || ""}
                  onValueChange={(v) =>
                    setMagSel((s) => ({ ...s, [c.caseId]: v }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select magistrate" />
                  </SelectTrigger>

                  <SelectContent className="bg-popover border-border">
                    {magistrates.map((m: any) => (
                      <SelectItem
                        key={m.id}
                        value={m.id}
                        className="text-foreground"
                      >
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (!currentUser) return

                    const cn = (caseNo[c.caseId] || "").trim()
                    const mid = magSel[c.caseId]
                    const magistrate = magistrates.find((x: any) => x.id === mid)

                    if (!cn || !magistrate) return
                    if (typeof intakeAction !== "function") return
                    if (typeof assignAction !== "function") return

                    intakeAction(c.caseId, currentUser, cn)
                    assignAction(c.caseId, magistrate)
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
              No cases waiting for Small Court intake.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
