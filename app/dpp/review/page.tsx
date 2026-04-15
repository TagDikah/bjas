"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

type AppUser = {
  id: string
  name?: string
  fullname?: string
  role?: string
}

type AppCase = {
  caseId: string
  status: string
}

export default function DppReviewPage() {
  const store = useStore() as any

  const currentUser = store.currentUser
  const getAllCases = store.getAllCases ?? (() => [])
  const users = (store.users ?? store.getUsers?.() ?? []) as AppUser[]

  const dppRegisterCase = store.dppRegisterCase
  const dppAssignToProsecutor = store.dppAssignToProsecutor
  const dppReturnToPolice = store.dppReturnToPolice
  const dppEscalateToHighCourt =
    store.dppEscalateToHighCourt ??
    store.escalateToHighCourt ??
    store.approveEscalationToHighCourt

  const prosecutors = useMemo(
    () => users.filter((u: AppUser) => String(u.role || "").toLowerCase() === "prosecutor"),
    [users]
  )

  const queue = useMemo(
    () =>
      (getAllCases() as AppCase[]).filter((c: AppCase) =>
        ["submitted_to_dpp", "dpp_registry_intake", "small_court_requests_high_court"].includes(c.status)
      ),
    [getAllCases]
  )

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  return (
    <DashboardLayout allowedRoles={["dpp"]} title="DPP Review and Assignment">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Review queue</h2>
          <p className="text-muted-foreground">
            Register files in the DPP office, assign prosecutors, return matters to police, or approve escalation.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {queue.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {queue.map((c: AppCase) => (
              <div key={c.caseId} className="space-y-2">
                <CaseCard caseData={c as any} />

                {c.status === "small_court_requests_high_court" ? (
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" variant="outline">
                      <Link href={`/dpp/review/${c.caseId}`}>Open Docket</Link>
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setError("")
                        if (!currentUser || typeof dppEscalateToHighCourt !== "function") {
                          setError("High Court escalation action is not available.")
                          return
                        }
                        dppEscalateToHighCourt(c.caseId, currentUser)
                      }}
                    >
                      Approve Escalation
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dpp/review/${c.caseId}`}>Open Docket</Link>
                    </Button>
                    {c.status === "submitted_to_dpp" && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setError("")
                          if (!currentUser || typeof dppRegisterCase !== "function") {
                            setError("DPP register action is not available.")
                            return
                          }
                          dppRegisterCase(c.caseId, currentUser, "Registered in DPP office")
                        }}
                      >
                        Enter DPP
                      </Button>
                    )}

                    <Select
                      value={selected[c.caseId] || ""}
                      onValueChange={(v) => setSelected((s) => ({ ...s, [c.caseId]: v }))}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select prosecutor" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {prosecutors.map((p: AppUser) => (
                          <SelectItem key={p.id} value={p.id} className="text-foreground">
                            {p.name || p.fullname || p.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setError("")
                          if (!currentUser || typeof dppAssignToProsecutor !== "function") {
                            setError("DPP assign action is not available.")
                            return
                          }

                          const pid = selected[c.caseId]
                          const prosecutor = prosecutors.find((x: AppUser) => x.id === pid)

                          if (!prosecutor) {
                            setError("Please select a prosecutor first.")
                            return
                          }

                          dppAssignToProsecutor(c.caseId, currentUser, prosecutor)
                        }}
                      >
                        Assign Prosecutor
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => {
                          setError("")
                          if (!currentUser || typeof dppReturnToPolice !== "function") {
                            setError("DPP return action is not available.")
                            return
                          }
                          dppReturnToPolice(c.caseId, currentUser, "More investigation or documents required")
                        }}
                      >
                        Return to Police
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No items in the DPP queue.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
