"use client"

import { useEffect, useMemo, useState } from "react"
import { FileCheck2, FileText, Scale, Users } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function text(value: unknown, fallback = "N/A") {
  const normalized = String(value || "").trim()
  return normalized || fallback
}

function formatStatus(status: unknown) {
  return text(String(status || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
}

export default function ProsecutorPreparationPage() {
  const store = useStore() as any
  const currentUser = store.currentUser
  const getAllCases = store.getAllCases ?? (() => [])
  const updateCase = store.updateCase ?? (() => {})
  const appendCaseActivity = store.appendCaseActivity ?? (() => {})

  const queue = useMemo(
    () =>
      (getAllCases() as any[]).filter((caseData) =>
        ["assigned_to_prosecutor", "delivered_to_dpp"].includes(String(caseData.status || "").toLowerCase())
      ),
    [getAllCases]
  )

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [form, setForm] = useState({
    chargeSheetNo: "",
    witnessList: "",
    exhibitsList: "",
    prosecutionNotes: "",
    filingRecommendation: "high_court",
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const selectedCase = useMemo(
    () => queue.find((item) => item.caseId === selectedCaseId) || null,
    [queue, selectedCaseId]
  )

  useEffect(() => {
    if (!selectedCaseId && queue[0]) {
      setSelectedCaseId(queue[0].caseId)
    }
  }, [queue, selectedCaseId])

  useEffect(() => {
    if (!selectedCase) return
    const latest = selectedCase?.prosecutionPreparation?.latestEntry || {}
    setForm({
      chargeSheetNo: String(latest.chargeSheetNo || ""),
      witnessList: String(latest.witnessList || selectedCase.parties || ""),
      exhibitsList: String(latest.exhibitsList || ""),
      prosecutionNotes: String(latest.prosecutionNotes || ""),
      filingRecommendation: String(latest.filingRecommendation || "high_court"),
    })
  }, [selectedCase])

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function submit() {
    setMessage("")
    setError("")

    if (!currentUser || !selectedCase) {
      setError("Select a prosecutor case before saving.")
      return
    }

    const latestEntry = {
      ...form,
      submittedAt: new Date().toISOString(),
      submittedById: currentUser.id,
      submittedByName: currentUser.name || currentUser.fullName || "Prosecutor",
    }

    updateCase(selectedCase.caseId, {
      status: "assigned_to_prosecutor",
      prosecutionPreparation: {
        entries: [latestEntry, ...(selectedCase.prosecutionPreparation?.entries || [])],
        latestEntry,
      },
    })

    appendCaseActivity({
      caseId: selectedCase.caseId,
      type: "prosecutor_assigned",
      actorName: currentUser.name || currentUser.fullName || "Prosecutor",
      actorRole: "internal",
      message: `Prosecutor preparation updated for ${selectedCase.caseNumber || selectedCase.caseId}.`,
      metadata: {
        module: "prosecutor_preparation",
        filingRecommendation: form.filingRecommendation,
      },
    })

    setMessage("Prosecutor preparation form saved.")
  }

  return (
    <DashboardLayout allowedRoles={["prosecutor", "dpp"]} title="Prosecutor Preparation">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Preparation Workspace</div>
                  <div className="mt-1 text-lg font-semibold text-white">Build the prosecution packet before court filing.</div>
                  <div className="text-sm text-white/52">Capture the working charge sheet, witness readiness, exhibit schedule, and prosecution notes.</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Assigned Cases</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{queue.length}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Witness Lines</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{selectedCase ? (form.witnessList.trim() ? form.witnessList.split("\n").filter(Boolean).length : 0) : 0}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Exhibits</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{selectedCase ? (form.exhibitsList.trim() ? form.exhibitsList.split("\n").filter(Boolean).length : 0) : 0}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
              <Label className="text-white/76">Select prosecutor case</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select prosecutor case" />
                </SelectTrigger>
                <SelectContent>
                  {queue.map((item) => (
                    <SelectItem key={item.caseId} value={item.caseId}>
                      {text(item.caseNumber)} | {text(item.charge)} | {formatStatus(item.status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Queue Status</div>
                  <div className="mt-1 text-sm font-semibold text-white">{selectedCase ? formatStatus(selectedCase.status) : "No case selected"}</div>
                </div>
                <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Filing Route</div>
                  <div className="mt-1 text-sm font-semibold text-white">{form.filingRecommendation.replace(/_/g, " ")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {message ? <div className="rounded-[0.95rem] border border-cyan-400/20 bg-cyan-400/10 px-3 py-2.5 text-sm text-cyan-50">{message}</div> : null}
        {error ? <div className="rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-100">{error}</div> : null}

        {selectedCase ? (
          <>
            <Card className={panelClass()}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Selected Prosecutor Packet</div>
                    <div className="mt-1 text-lg font-semibold text-white">{text(selectedCase.caseNumber || "Protected reference")}</div>
                    <div className="text-sm text-white/56">{text(selectedCase.charge || "Unknown charge")}</div>
                  </div>
                  <Badge className="w-fit border-0 bg-cyan-500/15 px-3 py-1 text-cyan-100">{formatStatus(selectedCase.status)}</Badge>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-4">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Case Number</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.caseNumber)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Charge</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.charge)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">District</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.district)}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Parties</div>
                    <div className="mt-1 text-sm font-medium text-white">{text(selectedCase.parties)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
              <Card className={panelClass()}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] bg-white/8">
                      <FileCheck2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">Preparation Form</div>
                      <div className="text-sm text-white/54">Record the prosecutor working packet details.</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white/76">Charge Sheet Number</Label>
                      <Input value={form.chargeSheetNo} onChange={(e) => setField("chargeSheetNo", e.target.value)} placeholder="Enter charge sheet reference" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/76">Filing Recommendation</Label>
                      <Select value={form.filingRecommendation} onValueChange={(value) => setField("filingRecommendation", value)}>
                        <SelectTrigger className="border-white/10 bg-white/5 text-white">
                          <SelectValue placeholder="Select filing recommendation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_court">High Court</SelectItem>
                          <SelectItem value="small_court">Small Court</SelectItem>
                          <SelectItem value="return_for_more_work">Return for More Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/76">Witness List</Label>
                      <Textarea rows={4} value={form.witnessList} onChange={(e) => setField("witnessList", e.target.value)} placeholder="List witnesses for the prosecution packet" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/76">Exhibits List</Label>
                      <Textarea rows={4} value={form.exhibitsList} onChange={(e) => setField("exhibitsList", e.target.value)} placeholder="List exhibits and evidence references" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/76">Prosecution Notes</Label>
                      <Textarea rows={6} value={form.prosecutionNotes} onChange={(e) => setField("prosecutionNotes", e.target.value)} placeholder="Capture preparation notes, witness readiness, and filing concerns" className="border-white/10 bg-white/5 text-white placeholder:text-white/32" />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95" onClick={submit}>
                      Save Preparation Form
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass()}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] bg-white/8">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">Preparation Snapshot</div>
                      <div className="text-sm text-white/54">Quick view of packet readiness before filing.</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Charge Sheet</div>
                      <div className="mt-1 text-sm font-semibold text-white">{text(form.chargeSheetNo, "Not recorded")}</div>
                    </div>
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Witness Readiness</div>
                      <div className="mt-1 text-sm font-semibold text-white">{form.witnessList.trim() ? "Witness list prepared" : "Pending witness list"}</div>
                    </div>
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Exhibit Schedule</div>
                      <div className="mt-1 text-sm font-semibold text-white">{form.exhibitsList.trim() ? "Exhibits recorded" : "Pending exhibit list"}</div>
                    </div>
                    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Recommended Route</div>
                      <div className="mt-1 text-sm font-semibold text-white">{form.filingRecommendation.replace(/_/g, " ")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className={panelClass()}>
            <CardContent className="p-8 text-center">
              <div className="text-lg font-semibold text-white">No prosecutor cases available</div>
              <div className="mt-2 text-sm text-white/56">
                No prosecutor cases are available for preparation right now.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
