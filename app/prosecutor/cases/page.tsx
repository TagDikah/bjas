"use client"

import Link from "next/link"
import React from "react"
import { FileSearch, Scale, ShieldCheck } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function isMyProsecutorCase(caseData: any, currentUser: any) {
  const assignedId = String(caseData?.dppReview?.assignedProsecutorId || "").trim()
  const assignedName = String(caseData?.dppReview?.assignedProsecutorName || "").trim().toLowerCase()
  const currentId = String(currentUser?.id || "").trim()
  const currentName = String(currentUser?.name || currentUser?.fullName || "").trim().toLowerCase()
  const status = String(caseData?.status || "").toLowerCase()
  const wasSentByDppRegistry = Boolean(
    caseData?.prosecutionRegistry?.registeredAt ||
    caseData?.dppReview?.registeredAt ||
    caseData?.dppReview?.forwardedAt
  )
  const isInProsecutorStage = ["assigned_to_prosecutor", "prosecutor_review"].includes(status)

  return (
    wasSentByDppRegistry &&
    isInProsecutorStage &&
    (
      (assignedId && currentId && assignedId === currentId) ||
      (assignedName && currentName && assignedName === currentName) ||
      (!assignedId && (!assignedName || assignedName === "dpp prosecutor queue"))
    )
  )
}

export default function ProsecutorCasesPage() {
  const currentUser = useStore((s: any) => s.currentUser)
  const cases = useStore((s: any) => s.cases)
  const updateCase = useStore((s: any) => s.updateCase)
  const appendCaseActivity = useStore((s: any) => s.appendCaseActivity)
  const prosecutorFileToCourtRegistry = useStore((s: any) => s.prosecutorFileToCourtRegistry)
  const prosecutorReturnToPolice = useStore((s: any) => s.prosecutorReturnToPolice)

  const all = Array.isArray(cases) ? cases : []
  const myCases = all.filter((c: any) => isMyProsecutorCase(c, currentUser))

  const [confirmationNotes, setConfirmationNotes] = React.useState<Record<string, string>>({})

  const confirmCase = (caseData: any) => {
    if (!currentUser || typeof updateCase !== "function" || typeof appendCaseActivity !== "function") return

    const note = String(confirmationNotes[caseData.caseId] || "").trim()
    if (!note) {
      alert("Please write the prosecutor confirmation note first.")
      return
    }

    const now = new Date().toISOString()
    updateCase(caseData.caseId, {
      status: "prosecutor_review",
      dppReview: {
        ...(caseData.dppReview || {}),
        prosecutorConfirmedAt: now,
        prosecutorConfirmedById: currentUser.id,
        prosecutorConfirmedByName: currentUser.name || currentUser.fullName || "Prosecutor",
      },
      prosecutionAction: {
        ...(caseData.prosecutionAction || {}),
        confirmationRequired: true,
        confirmationStatus: "confirmed_by_prosecutor",
        confirmationNote: note,
        confirmedAt: now,
        confirmedById: currentUser.id,
        confirmedByName: currentUser.name || currentUser.fullName || "Prosecutor",
      },
    })

    appendCaseActivity({
      caseId: caseData.caseId,
      type: "public_additional_info",
      actorName: currentUser.name || currentUser.fullName || "Prosecutor",
      actorRole: "internal",
      message: "DPP prosecutor confirmed receipt and readiness of the case.",
      metadata: { confirmationNote: note },
    })

    setConfirmationNotes((prev) => ({ ...prev, [caseData.caseId]: "" }))
  }

  return (
    <DashboardLayout allowedRoles={["prosecutor", "dpp"]} title="My Assigned Cases">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Assigned Prosecutor Queue</div>
                  <div className="mt-1 text-lg font-semibold text-white">Cases currently assigned to you</div>
                  <div className="text-sm text-white/52">Confirm receipt, review the docket, then file to court or return to police.</div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Assigned</div>
                <div className="mt-1 text-xl font-semibold text-white">{myCases.length}</div>
              </div>
              <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Confirmed</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {myCases.filter((c: any) => Boolean(c?.prosecutionAction?.confirmedAt)).length}
                </div>
              </div>
              <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Waiting</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {myCases.filter((c: any) => !c?.prosecutionAction?.confirmedAt).length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {myCases.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {myCases.map((c: any) => {
              const confirmed = Boolean(c?.prosecutionAction?.confirmedAt)

              return (
                <div key={c.caseId} className="space-y-2">
                  <CaseCard caseData={c} showAssignment />

                  <Link href={`/police/case/${c.caseId}`} className="block">
                    <Button variant="outline" className="w-full">
                      Open Police Docket
                    </Button>
                  </Link>

                  <Card>
                    <CardHeader>
                      <CardTitle>Prosecutor Confirmation Form</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {confirmed ? (
                        <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                          Confirmed by {c?.prosecutionAction?.confirmedByName || "Prosecutor"} on {new Date(c.prosecutionAction.confirmedAt).toLocaleString()}.
                        </div>
                      ) : (
                        <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
                          This case must be confirmed by the assigned DPP prosecutor before it can be filed to court or returned to police.
                        </div>
                      )}

                      <Textarea
                        rows={4}
                        value={confirmationNotes[c.caseId] || c?.prosecutionAction?.confirmationNote || ""}
                        onChange={(e) => setConfirmationNotes((prev) => ({ ...prev, [c.caseId]: e.target.value }))}
                        placeholder="Write the prosecutor confirmation statement and readiness note..."
                        disabled={confirmed}
                      />

                      {!confirmed ? (
                        <Button className="w-full" onClick={() => confirmCase(c)}>
                          Confirm Case
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={!confirmed}
                      onClick={() => {
                        if (!currentUser) return
                        if (typeof prosecutorFileToCourtRegistry !== "function") {
                          alert("Action not available: prosecutorFileToCourtRegistry is missing in store.")
                          return
                        }
                        prosecutorFileToCourtRegistry(c.caseId, currentUser)
                      }}
                    >
                      File to Court Registry
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={!confirmed}
                      onClick={() => {
                        if (!currentUser) return
                        if (typeof prosecutorReturnToPolice !== "function") {
                          alert("Action not available: prosecutorReturnToPolice is missing in store.")
                          return
                        }
                        prosecutorReturnToPolice(
                          c.caseId,
                          currentUser,
                          "Insufficient evidence or further investigation required"
                        )
                      }}
                    >
                      Return to Police
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className={panelClass()}>
            <CardContent className="p-8">
              <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(90,140,255,0.2))] shadow-[0_14px_28px_rgba(6,12,28,0.22)]">
                  <FileSearch className="h-7 w-7 text-white" />
                </div>
                <div className="mt-4 text-xl font-semibold text-white">No assigned prosecutor cases right now</div>
                <div className="mt-2 text-sm leading-6 text-white/58">
                  New DPP assignments will appear here as soon as registry forwards them to your prosecutor queue.
                </div>

                <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
                  <Link
                    href="/prosecutor/dashboard"
                    className="rounded-[1rem] border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(84,199,236,0.24),rgba(91,140,255,0.2))] px-4 py-4 text-white shadow-[0_14px_28px_rgba(6,12,28,0.22)] transition hover:scale-[1.01] hover:border-cyan-100/46 hover:no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm font-semibold">Back to Dashboard</span>
                    </div>
                  </Link>

                  <Link
                    href="/prosecutor/preparation"
                    className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-4 text-white transition hover:border-white/20 hover:bg-white/8 hover:no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="h-4 w-4" />
                      <span className="text-sm font-semibold">Open Preparation</span>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
