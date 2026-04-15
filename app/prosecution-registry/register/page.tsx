"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, FileCheck2, FolderOpen } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function makeProsecutionRef(caseId: string) {
  const year = new Date().getFullYear()
  const short = String(caseId || "").replace(/[^A-Z0-9]/gi, "").slice(-6).toUpperCase()
  return `DPP/${year}/${short}`
}

function text(v: unknown) {
  const t = String(v || "").trim()
  return t || "N/A"
}

function dateText(v: unknown) {
  const raw = String(v || "").trim()
  if (!raw) return "N/A"
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString()
}

function formatFieldLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function friendlyStatus(value: unknown) {
  return String(value || "")
    .replace(/_/g, " ")
    .trim() || "Unknown"
}

function renderObjectFields(data: Record<string, any> | null | undefined) {
  const obj = data && typeof data === "object" ? data : {}
  const entries = Object.entries(obj)
  if (!entries.length) {
    return <div className="text-muted-foreground">No data captured.</div>
  }

  return (
    <div className="grid gap-2 md:grid-cols-2 text-sm">
      {entries.map(([key, value]) => {
        const label = formatFieldLabel(key)
        if (Array.isArray(value)) {
          if (!value.length) {
            return (
              <div key={key}>
                <span className="text-muted-foreground">{label}:</span> N/A
              </div>
            )
          }
          return (
            <div key={key} className="md:col-span-2 rounded-md border border-border p-2">
              <div className="font-medium">{label}</div>
              <div className="mt-1 space-y-1">
                {value.map((item, index) => (
                  <div key={`${key}-${index}`} className="rounded-md border border-border/70 p-2">
                    <div className="mb-1 text-xs text-muted-foreground">Item {index + 1}</div>
                    {item && typeof item === "object" ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(item as Record<string, any>).map(([childKey, childValue]) => (
                          <div key={`${key}-${index}-${childKey}`}>
                            <span className="text-muted-foreground">{formatFieldLabel(childKey)}:</span>{" "}
                            {text(childValue)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">{text(item)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        if (value && typeof value === "object") {
          return (
            <div key={key} className="md:col-span-2 rounded-md border border-border p-2">
              <div className="font-medium">{label}</div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {Object.entries(value as Record<string, any>).map(([childKey, childValue]) => (
                  <div key={`${key}-${childKey}`}>
                    <span className="text-muted-foreground">{formatFieldLabel(childKey)}:</span>{" "}
                    {text(childValue)}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return (
          <div key={key}>
            <span className="text-muted-foreground">{label}:</span> {text(value)}
          </div>
        )
      })}
    </div>
  )
}

export default function ProsecutionRegistryRegister() {
  const store = useStore() as any
  const currentUser = store.currentUser
  const getAllCases = store.getAllCases ?? (() => [])
  const updateCase = store.updateCase ?? (() => {})
  const appendCaseActivity = store.appendCaseActivity ?? (() => {})
  const addCase = store.addCase ?? (() => {})

  const inbound = useMemo(
    () =>
      (getAllCases() || []).filter((c: any) =>
        ["submitted_to_prosecution_registry", "submitted_to_dpp"].includes(String(c.status || ""))
      ),
    [getAllCases]
  )

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedCase = inbound.find((c: any) => c.caseId === selectedCaseId) || null
  const sectionA = selectedCase?.policeSections?.sectionA || {}
  const sectionB = selectedCase?.policeSections?.sectionB || {}
  const sectionC = selectedCase?.policeSections?.sectionC || {}
  const sectionBEntries = Array.isArray(sectionB?.appendEntries) ? sectionB.appendEntries : []
  const sectionCEntries = Array.isArray(sectionC?.documentationEntries) ? sectionC.documentationEntries : []

  const registerSelectedCase = async () => {
    if (!selectedCase || !currentUser) return
    setError("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/cases/register-to-prosecutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.caseId,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok || !data?.case?.caseId) {
        throw new Error(data?.error || "Failed to send case to prosecutor.")
      }

      const existsLocally = (getAllCases() || []).some((item: any) => item?.caseId === data.case.caseId)
      if (existsLocally) {
        updateCase(data.case.caseId, data.case)
      } else {
        addCase(data.case)
      }

      appendCaseActivity({
        caseId: data.case.caseId,
        type: "public_additional_info",
        actorName: currentUser.name || currentUser.fullName || "Registry Officer",
        actorRole: "internal",
        message: `Case registered and sent to the DPP prosecutor queue for confirmation (${makeProsecutionRef(data.case.caseId)}).`,
        metadata: {
          assignedProsecutorName: "DPP Prosecutor Queue",
        },
      })

      setMessage(`Case ${data.case.caseNumber || data.case.caseId} registered and sent to the DPP prosecutor queue for confirmation.`)
    } catch (err: any) {
      setError(err?.message || "Failed to send case to prosecutor.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Register Cases">
      <div className="space-y-5">
        <Card className={panelClass()}>
          <CardContent className="p-4 lg:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-[0.95rem] border border-white/10 bg-[linear-gradient(135deg,#5a8cff,rgba(84,199,236,0.35))]">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Registry Workspace</div>
                    <div className="mt-1 text-lg font-semibold text-white">Case Registration Box</div>
                    <div className="text-sm text-white/55">
                      Select an inbound case, then register and send it directly to the DPP prosecutor queue for confirmation.
                    </div>
                  </div>
                </div>

                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger className="h-12 border-white/12 bg-white/5 text-white">
                    <SelectValue placeholder="Choose case to register" />
                  </SelectTrigger>
                  <SelectContent>
                    {inbound.map((c: any) => (
                      <SelectItem key={c.caseId} value={c.caseId}>
                        {text(c.caseNumber)} | {text(c.charge)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {error ? (
                  <div className="rounded-[0.9rem] border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}
                {message ? (
                  <div className="rounded-[0.9rem] border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-50">
                    {message}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Inbound Signal</div>
                      <div className="mt-1 text-base font-semibold text-white">{inbound.length} packets waiting for registry</div>
                    </div>
                    <Badge className="border-0 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">Live</Badge>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Available</div>
                      <div className="mt-1 text-xl font-semibold text-white">{inbound.length}</div>
                    </div>
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Selected</div>
                      <div className="mt-1 text-sm font-semibold text-white">{selectedCase ? text(selectedCase.caseNumber) : "None"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button asChild className="h-11 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                    <Link href="/prosecution-registry/cases">
                      View Cases
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="flex h-11 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/5 px-3 text-xs text-white/58">
                    Registration and forwarding workspace
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCase ? (
          <>
            <Card className={panelClass()}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Selected Case Packet</span>
                  <Badge className="border-0 bg-cyan-400/15 text-cyan-100">{friendlyStatus(selectedCase.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Case Reference</div>
                    <div className="mt-1 text-sm font-semibold text-white">{text(selectedCase.caseNumber, "Protected reference")}</div>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Route</div>
                    <div className="mt-1 text-sm font-semibold text-white">{friendlyStatus(selectedCase.status)}</div>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">District</div>
                    <div className="mt-1 text-sm font-semibold text-white">{text(selectedCase.district)}</div>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Queue</div>
                    <div className="mt-1 text-sm font-semibold text-white">DPP Prosecutor</div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Packet Summary</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm">
                      <div><span className="text-white/48">Charge:</span> <span className="text-white">{text(selectedCase.charge)}</span></div>
                      <div><span className="text-white/48">Parties:</span> <span className="text-white">{text(selectedCase.parties)}</span></div>
                      <div><span className="text-white/48">Created:</span> <span className="text-white">{dateText(selectedCase.createdAt)}</span></div>
                      <div><span className="text-white/48">Updated:</span> <span className="text-white">{dateText(selectedCase.updatedAt)}</span></div>
                      <div className="md:col-span-2"><span className="text-white/48">Description:</span> <span className="text-white">{text(selectedCase.description)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-[0.95rem] border border-cyan-400/18 bg-cyan-400/8 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/72">Forwarding Readiness</div>
                    <div className="mt-2 text-sm text-cyan-50/92">This packet is routed to the DPP prosecutor queue for confirmation before the next prosecution step.</div>
                    <div className="mt-3">
                      <Button className="bg-[#cf5d47] !text-white border border-[#8a3a2b] hover:bg-[#b94f3b]" onClick={registerSelectedCase} disabled={submitting}>
                    {submitting ? "Sending..." : "Register & Send to DPP Prosecutor"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className={panelClass()}>
                <CardHeader><CardTitle>Police Registration (Section A)</CardTitle></CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                  <div><span className="text-white/48">Crime No:</span> <span className="text-white">{text(sectionA.crimeNo)}</span></div>
                  <div><span className="text-white/48">Alleged Crime:</span> <span className="text-white">{text(sectionA.allegedCrime || selectedCase.charge)}</span></div>
                  <div><span className="text-white/48">Complainant:</span> <span className="text-white">{text(sectionA.aggrievedFullName)}</span></div>
                  <div><span className="text-white/48">Reported By:</span> <span className="text-white">{text(sectionA.reportingPersonFullName)}</span></div>
                  <div><span className="text-white/48">Method:</span> <span className="text-white">{text(sectionA.methodOfComplaint)}</span></div>
                  <div><span className="text-white/48">Place:</span> <span className="text-white">{text(sectionA.whereCommittedSpecify || sectionA.whereCommitted || selectedCase.district)}</span></div>
                  <div><span className="text-white/48">Date Reported:</span> <span className="text-white">{text(sectionA.dateReported)}</span></div>
                  <div><span className="text-white/48">Time Reported:</span> <span className="text-white">{text(sectionA.timeReported)}</span></div>
                  <div><span className="text-white/48">Date of Birth:</span> <span className="text-white">{text(sectionA.dateOfBirth)}</span></div>
                  <div><span className="text-white/48">Sex / Age:</span> <span className="text-white">{text(sectionA.sex)} / {text(sectionA.age)}</span></div>
                  <div><span className="text-white/48">Victim Relationship:</span> <span className="text-white">{text(sectionA.offenderVictimRelationship)}</span></div>
                  <div className="md:col-span-2 rounded-[0.9rem] border border-white/8 bg-white/5 p-3"><span className="text-white/48">Modus Operandi:</span> <div className="mt-1 text-white">{text(sectionA.modusOperandi)}</div></div>
                  <div className="md:col-span-2 rounded-[0.9rem] border border-white/8 bg-white/5 p-3"><span className="text-white/48">Suspect Details:</span> <div className="mt-1 text-white">{text(sectionA.suspectDetails)}</div></div>
                  <div className="md:col-span-2 rounded-[0.9rem] border border-white/8 bg-white/5 p-3"><span className="text-white/48">Witness List:</span> <div className="mt-1 text-white">{text(sectionA.witnessList)}</div></div>
                </CardContent>
              </Card>

              <Card className={panelClass()}>
                <CardHeader><CardTitle>Investigation (Section B)</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div><span className="text-white/48">Investigation Started:</span> <span className="text-white">{dateText(sectionB?.investigationStartedAt)}</span></div>
                    <div><span className="text-white/48">Investigator:</span> <span className="text-white">{text(sectionB?.investigatorName)}</span></div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="font-medium text-white">Initial Capture</div>
                    <div className="mt-1 text-white/68">
                      {text(sectionB?.initialCapture?.incidentSummary || sectionB?.initialCapture?.incidentDescription)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 font-medium text-white">Section B Entries ({sectionBEntries.length})</div>
                    {sectionBEntries.length === 0 ? (
                      <div className="text-white/55">No Section B entries yet.</div>
                    ) : (
                      <div className="grid gap-2 xl:grid-cols-2">
                        {sectionBEntries.map((entry: any) => (
                          <div key={entry.id} className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium text-white">{text(entry.title)}</div>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/60">
                                {text(entry.type)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-white/45">{dateText(entry.createdAt)} | {text(entry.createdByName)}</div>
                            <div className="mt-2 text-white/68">{text(entry.summary)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass()}>
                <CardHeader><CardTitle>Documentation Report (Section C)</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="font-medium text-white">Latest Clarification Request</div>
                    <div className="mt-1 text-white/68">{text(sectionC?.latestClarificationStatement)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="font-medium text-white">Latest Clarification Response</div>
                    <div className="mt-1 text-white/68">{text(sectionC?.latestClarificationResponseText)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="font-medium text-white">Latest Recommendation</div>
                    <div className="mt-1 text-white/68">{text(sectionC?.recommendedAction)}</div>
                  </div>
                  <div>
                    <div className="mb-2 font-medium text-white">Section C Reports ({sectionCEntries.length})</div>
                    {sectionCEntries.length === 0 ? (
                      <div className="text-white/55">No Section C reports yet.</div>
                    ) : (
                      <div className="grid gap-2">
                        {sectionCEntries.map((entry: any) => (
                          <div key={entry.id} className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                            <div className="font-medium text-white">{text(entry.title)}</div>
                            <div className="mt-1 text-xs text-white/45">{dateText(entry.createdAt)} | {text(entry.createdByName)}</div>
                            <div className="mt-2 text-white/68">{text(entry.summary)}</div>
                            <div className="mt-2 grid gap-2 md:grid-cols-2 text-sm">
                              <div><span className="text-white/45">Process:</span> <span className="text-white">{text(entry?.data?.processDocumentation)}</span></div>
                              <div><span className="text-white/45">Budget:</span> <span className="text-white">{text(entry?.data?.budgetUsed)}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass()}>
                <CardHeader><CardTitle>Rejection and Resubmission</CardTitle></CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                  <div><span className="text-white/48">Rejected At:</span> <span className="text-white">{dateText(selectedCase?.rejectionInfo?.rejectedAt)}</span></div>
                  <div><span className="text-white/48">Rejected By:</span> <span className="text-white">{text(selectedCase?.rejectionInfo?.rejectedByName)}</span></div>
                  <div><span className="text-white/48">Rejected Role:</span> <span className="text-white">{text(selectedCase?.rejectionInfo?.rejectedByRole)}</span></div>
                  <div><span className="text-white/48">Rejection Stage:</span> <span className="text-white">{text(selectedCase?.rejectionInfo?.rejectionStage)}</span></div>
                  <div className="md:col-span-2 rounded-[0.9rem] border border-white/8 bg-white/5 p-3"><span className="text-white/48">Rejection Reason:</span> <div className="mt-1 text-white">{text(selectedCase?.rejectionInfo?.rejectionReasonPublic)}</div></div>
                  <div><span className="text-white/48">Resubmitted At:</span> <span className="text-white">{dateText(selectedCase?.rejectionInfo?.resubmittedAt)}</span></div>
                  <div><span className="text-white/48">Resubmitted By:</span> <span className="text-white">{text(selectedCase?.rejectionInfo?.resubmittedBy)}</span></div>
                </CardContent>
              </Card>

              <Card className={`${panelClass()} lg:col-span-2`}>
                <CardContent className="p-0">
                  <details className="group">
                    <summary className="cursor-pointer list-none px-6 py-4 text-base font-semibold text-white marker:hidden">
                      View Full Section A Fields
                    </summary>
                    <div className="border-t border-white/10 px-6 pb-6 text-white/78">{renderObjectFields(sectionA)}</div>
                  </details>
                </CardContent>
              </Card>

              <Card className={`${panelClass()} lg:col-span-2`}>
                <CardContent className="p-0">
                  <details className="group">
                    <summary className="cursor-pointer list-none px-6 py-4 text-base font-semibold text-white marker:hidden">
                      View Full Section B Fields
                    </summary>
                    <div className="border-t border-white/10 px-6 pb-6 text-white/78">{renderObjectFields(sectionB)}</div>
                  </details>
                </CardContent>
              </Card>

              <Card className={`${panelClass()} lg:col-span-2`}>
                <CardContent className="p-0">
                  <details className="group">
                    <summary className="cursor-pointer list-none px-6 py-4 text-base font-semibold text-white marker:hidden">
                      View Full Section C Fields
                    </summary>
                    <div className="border-t border-white/10 px-6 pb-6 text-white/78">{renderObjectFields(sectionC)}</div>
                  </details>
                </CardContent>
              </Card>

              <Card className={`${panelClass()} lg:col-span-2`}>
                <CardContent className="p-0">
                  <details className="group">
                    <summary className="cursor-pointer list-none px-6 py-4 text-base font-semibold text-white marker:hidden">
                      View Full Rejection Fields
                    </summary>
                    <div className="border-t border-white/10 px-6 pb-6 text-white/78">{renderObjectFields(selectedCase?.rejectionInfo)}</div>
                  </details>
                </CardContent>
              </Card>

            </div>
          </>
        ) : (
          <Card className={panelClass()}>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-[1rem] border border-white/10 bg-white/5">
                <FileCheck2 className="h-6 w-6 text-cyan-200" />
              </div>
              <div>
                <div className="text-base font-semibold text-white">No case selected yet</div>
                <div className="mt-1 text-sm text-white/55">
                  Choose an inbound case from the registration workspace above to load the full packet and continue.
                </div>
              </div>
              <Button asChild variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                <Link href="/prosecution-registry/cases">View Registry Cases</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!inbound.length ? (
          <Card className={panelClass()}>
            <CardContent className="p-8 text-center text-sm text-white/58">
              No inbound cases. When police submit cases, they will appear in the registration box.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
