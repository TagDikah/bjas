"use client"

import Link from "next/link"
import React from "react"
import { ArrowRight, CheckCircle2, Clock3, FileText, Gavel, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

type JudgeUser = {
  id: string
  name: string
  fullName?: string
  role?: string
}

type JudgeTabKey = "pending" | "hearing" | "closed" | "all"

function safeText(value: unknown) {
  return String(value || "").trim()
}

function formatDateTime(value: unknown) {
  const parsed = new Date(value as any)
  if (Number.isNaN(parsed.getTime())) return "Not recorded"
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getAssignedJudgeId(caseData: any) {
  return String(caseData?.court?.assignedJudgeId || caseData?.courtRegistry?.assignedJudgeId || "")
}

function getAssignedJudgeName(caseData: any) {
  return safeText(caseData?.court?.assignedJudgeName || caseData?.courtRegistry?.assignedJudgeName)
}

function getPriority(caseData: any) {
  return safeText(
    caseData?.priority ||
      caseData?.policeSections?.sectionA?.priority ||
      caseData?.courtRegistry?.priority ||
      "medium"
  ).toLowerCase()
}

function getProsecutorName(caseData: any) {
  return safeText(
    caseData?.dpp?.assignedProsecutorName ||
      caseData?.prosecution?.assignedProsecutorName ||
      caseData?.assignedProsecutorName
  ) || "Not assigned"
}

function getCaseStatement(caseData: any) {
  return (
    safeText(caseData?.description) ||
    safeText(caseData?.policeSections?.sectionA?.summary) ||
    safeText(caseData?.policeSections?.sectionA?.complainantStatement) ||
    "No case statement recorded."
  )
}

function getStatusGroup(status: string) {
  const normalized = String(status || "").toLowerCase()
  if (["sent_to_judge", "assigned_to_judge", "assigned_to_high_court_judge", "assigned_to_small_court_judge"].includes(normalized)) {
    return "pending"
  }
  if (["in_hearing", "in_progress", "high_court_in_progress", "small_court_in_progress", "trial_in_progress"].includes(normalized)) {
    return "hearing"
  }
  if (["closed", "case_closed", "completed", "high_court_completed", "small_court_completed"].includes(normalized)) {
    return "closed"
  }
  return "all"
}

function statusBadge(status: string) {
  const group = getStatusGroup(status)
  if (group === "pending") return { label: "Sent To Judge", className: "border-blue-300/30 bg-blue-400/15 text-blue-100" }
  if (group === "hearing") return { label: "In Hearing", className: "border-yellow-300/30 bg-yellow-400/15 text-yellow-100" }
  if (group === "closed") return { label: "Closed", className: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100" }
  return { label: safeText(status).replace(/_/g, " ") || "Unknown", className: "border-slate-300/20 bg-slate-400/10 text-slate-100" }
}

function priorityBadge(priority: string) {
  if (priority === "urgent") return { label: "URGENT", className: "border-red-300/30 bg-red-400/20 text-red-100" }
  if (priority === "high") return { label: "HIGH", className: "border-orange-300/30 bg-orange-400/20 text-orange-100" }
  if (priority === "low") return { label: "LOW", className: "border-emerald-300/30 bg-emerald-400/20 text-emerald-100" }
  return { label: "MEDIUM", className: "border-yellow-300/30 bg-yellow-400/20 text-yellow-100" }
}

function appendJudgeNote(existing: string, message: string) {
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const nextEntry = `[${timestamp}] ${message.trim()}`
  return existing.trim() ? `${existing.trim()}\n${nextEntry}` : nextEntry
}

function topCardClass() {
  return "rounded-[1.1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.96),rgba(11,20,40,0.98))] text-white shadow-[0_16px_34px_rgba(3,8,20,0.22)]"
}

function tabClass(active: boolean) {
  return active
    ? "border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)]"
    : "border border-white/8 bg-white/6 text-white/80 hover:bg-white/10"
}

function CompactMetric({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  valueClassName = "text-white",
}: {
  label: string
  value: number
  hint: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  valueClassName?: string
}) {
  return (
    <div className={topCardClass()}>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-[0.9rem] ${accent}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${valueClassName}`}>{value}</div>
          </div>
        </div>
        <div className="mt-2.5 border-t border-white/8 pt-2 text-[10px] leading-5 text-white/56">{hint}</div>
      </div>
    </div>
  )
}

export default function JudgeDashboard() {
  return <JudgeDashboardScreen allowedRoles={["judge"]} title="Judge Dashboard" scope="all" />
}

type JudgeDashboardScreenProps = {
  allowedRoles: string[]
  title: string
  scope: "all" | "high"
}

export function JudgeDashboardScreen({ allowedRoles, title, scope }: JudgeDashboardScreenProps) {
  const { currentUser, getAllCases, getUsers, updateCase } = useStore() as any
  const allCases = getAllCases().filter((caseData: any) => {
    if (scope !== "high") return true
    return String(caseData?.court?.courtType || "").toLowerCase() === "high"
  })
  const allJudges = (typeof getUsers === "function" ? getUsers() : []) as JudgeUser[]

  const myCases = React.useMemo(
    () =>
      allCases.filter((caseData: any) => {
        const assignedJudgeId = getAssignedJudgeId(caseData)
        return assignedJudgeId === currentUser?.id
      }),
    [allCases, currentUser?.id]
  )

  const pendingCases = myCases.filter((caseData: any) => getStatusGroup(caseData.status) === "pending")
  const hearingCases = myCases.filter((caseData: any) => getStatusGroup(caseData.status) === "hearing")
  const closedCases = myCases.filter((caseData: any) => getStatusGroup(caseData.status) === "closed")
  const totalSessions = myCases.reduce((count: number, caseData: any) => count + (Array.isArray(caseData?.hearingDates) ? caseData.hearingDates.length : 0), 0)

  const [selectedCaseId, setSelectedCaseId] = React.useState("")
  const [minutesDraft, setMinutesDraft] = React.useState("")
  const [transferJudgeId, setTransferJudgeId] = React.useState("")
  const [busyAction, setBusyAction] = React.useState<"" | "start" | "save" | "transfer" | "close">("")
  const [feedback, setFeedback] = React.useState("")

  const selectedCase = myCases.find((caseData: any) => caseData.caseId === selectedCaseId) || null
  const availableJudges = allJudges.filter((judge) => {
    const role = safeText(judge.role).toLowerCase()
    return judge.id !== currentUser?.id && ["judge", "high_court_judge", "small_court_judge"].includes(role)
  })

  React.useEffect(() => {
    if (!selectedCase) {
      setMinutesDraft("")
      setTransferJudgeId("")
      return
    }
    setMinutesDraft("")
    setTransferJudgeId("")
  }, [selectedCaseId, selectedCase])

  const tabs = [
    { key: "pending" as JudgeTabKey, label: "Pending Hearings", description: "Ready to start", items: pendingCases },
    { key: "hearing" as JudgeTabKey, label: "In Hearing", description: "Active sessions", items: hearingCases },
    { key: "closed" as JudgeTabKey, label: "Closed", description: "Finalized matters", items: closedCases },
    { key: "all" as JudgeTabKey, label: "All Assigned", description: "Full workload", items: myCases },
  ]
  const currentUserFirstName = currentUser?.name?.split(" ")[0] || "Judge"

  async function runSimulatedAction(action: "" | "start" | "save" | "transfer" | "close", callback: () => void, doneMessage: string) {
    setBusyAction(action)
    setFeedback("")
    await new Promise((resolve) => setTimeout(resolve, action === "save" ? 1000 : 1500))
    callback()
    setBusyAction("")
    setFeedback(doneMessage)
  }

  function openCase(caseId: string) {
    setSelectedCaseId(caseId)
    setFeedback("")
  }

  function startHearing(caseData: any) {
    const currentNotes = safeText(caseData?.judgeNotes)
    runSimulatedAction(
      "start",
      () => {
        const nextStatus = String(caseData?.court?.courtType || "").toLowerCase() === "high" ? "high_court_in_progress" : "in_progress"
        updateCase(caseData.caseId, {
          status: nextStatus,
          judgeNotes: appendJudgeNote(currentNotes, `Hearing started by ${currentUser?.name || "Judge"}.`),
        })
        setSelectedCaseId(caseData.caseId)
      },
      "Hearing started."
    )
  }

  function saveMinutes() {
    if (!selectedCase) return
    if (!minutesDraft.trim()) {
      setFeedback("Minutes cannot be empty.")
      return
    }

    runSimulatedAction(
      "save",
      () => {
        updateCase(selectedCase.caseId, {
          judgeNotes: appendJudgeNote(safeText(selectedCase?.judgeNotes), minutesDraft),
        })
        setMinutesDraft("")
      },
      "Minutes saved successfully."
    )
  }

  function transferCase() {
    if (!selectedCase) return
    if (!transferJudgeId) {
      setFeedback("Select a judge before transferring.")
      return
    }
    if (transferJudgeId === currentUser?.id) {
      setFeedback("You cannot transfer a case to yourself.")
      return
    }

    const targetJudge = availableJudges.find((judge) => judge.id === transferJudgeId)
    if (!targetJudge) {
      setFeedback("Selected judge could not be found.")
      return
    }

    runSimulatedAction(
      "transfer",
      () => {
        const nextNotes = appendJudgeNote(
          safeText(selectedCase?.judgeNotes),
          `Case transferred from ${currentUser?.name || "Current Judge"} to ${targetJudge.name || targetJudge.fullName || "Judge"}.`
        )
        updateCase(selectedCase.caseId, {
          judgeNotes: nextNotes,
          court: {
            ...(selectedCase?.court || {}),
            assignedJudgeId: targetJudge.id,
            assignedJudgeName: targetJudge.name || targetJudge.fullName || "Judge",
          },
          courtRegistry: {
            ...(selectedCase?.courtRegistry || {}),
            assignedJudgeId: targetJudge.id,
            assignedJudgeName: targetJudge.name || targetJudge.fullName || "Judge",
          },
        })
        setSelectedCaseId("")
      },
      `Case transferred to ${targetJudge.name || targetJudge.fullName || "Judge"}.`
    )
  }

  function closeCase() {
    if (!selectedCase) return
    if (getStatusGroup(selectedCase.status) !== "hearing") {
      setFeedback("Only cases in hearing can be closed.")
      return
    }

    const nextStatus =
      String(selectedCase?.court?.courtType || "").toLowerCase() === "high"
        ? "high_court_completed"
        : String(selectedCase?.court?.courtType || "").toLowerCase() === "small"
          ? "small_court_completed"
          : "closed"

    runSimulatedAction(
      "close",
      () => {
        updateCase(selectedCase.caseId, {
          status: nextStatus,
          judgeNotes: appendJudgeNote(safeText(selectedCase?.judgeNotes), `Case closed by ${currentUser?.name || "Judge"}.`),
        })
      },
      "Case closed successfully."
    )
  }

  return (
    <DashboardLayout allowedRoles={allowedRoles} title={title}>
      <div className="space-y-4">
        <section className="relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.98),rgba(14,22,43,0.98))] shadow-[0_18px_50px_rgba(6,12,28,0.28)]">
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.14]">
            <Gavel className="h-64 w-64 text-cyan-100" strokeWidth={1.15} />
          </div>
          <div className="grid gap-3 p-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <Gavel className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Judge Command Deck</div>
                  <div className="mt-1 text-base font-semibold text-white">{currentUserFirstName}, manage your hearings.</div>
                  <div className="text-xs text-white/52">Assigned matters, live hearing control, and transfer actions in one place.</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/42">Assigned</span>
                  <span className="ml-2 text-sm font-medium text-white">{myCases.length}</span>
                </div>
                <div className="rounded-full border border-amber-300/12 bg-amber-400/10 px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-amber-100/52">Pending</span>
                  <span className="ml-2 text-sm font-medium text-white">{pendingCases.length}</span>
                </div>
                <div className="rounded-full border border-emerald-300/12 bg-emerald-400/10 px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/52">Closed</span>
                  <span className="ml-2 text-sm font-medium text-white">{closedCases.length}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:justify-self-end">
              <Button asChild className="h-10 rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white shadow-[0_16px_34px_rgba(88,74,210,0.32)] hover:scale-[1.01] hover:brightness-110 hover:!text-white">
                <Link href="/judge/cases">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Assigned Cases
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-[0.9rem] border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:scale-[1.01] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                <Link href="/judge/dashboardsessions">Manage Hearings</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-[1.65fr_0.75fr]">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CompactMetric label="Assigned Cases" value={myCases.length} hint="All cases currently assigned to you." icon={Gavel} accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]" />
              <CompactMetric label="Pending Hearings" value={pendingCases.length} hint="Cases ready to start." icon={Clock3} accent="bg-[linear-gradient(135deg,#ffb347,#ffcc33)]" valueClassName="text-[#f1b900]" />
              <CompactMetric label="In Hearing" value={hearingCases.length} hint="Matters currently in session." icon={Users} accent="bg-[linear-gradient(135deg,#f4c542,#e3a008)]" valueClassName="text-[#ffd228]" />
              <CompactMetric label="Closed Cases" value={closedCases.length} hint="Finalized and read-only." icon={CheckCircle2} accent="bg-[linear-gradient(135deg,#32d583,#12b76a)]" valueClassName="text-[#4ee37c]" />
            </div>

            <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
              <CardContent className="grid gap-3 p-3 md:grid-cols-4">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/judge/cases?view=${encodeURIComponent(tab.key)}`}
                className={`rounded-[0.95rem] px-5 py-4 text-left text-base font-semibold transition ${tabClass(false)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
                    {tab.items.length}
                  </span>
                </div>
                <div className="mt-1 text-xs font-normal text-white/55">
                  {tab.description}
                </div>
              </Link>
            ))}
              </CardContent>
            </Card>

          </div>

          <div />
        </section>

        <Dialog open={!!selectedCase} onOpenChange={(open) => (!open ? setSelectedCaseId("") : null)}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-white/10 bg-[#213d59] text-white">
            {selectedCase ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">{safeText(selectedCase.caseNumber) || "Case Details"}</DialogTitle>
                  <DialogDescription className="text-slate-200">
                    Full case information, live minutes, transfer controls, and decision actions.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-white/10 bg-[#2d4a68] text-white">
                    <CardHeader><CardTitle className="text-lg">Case Information</CardTitle></CardHeader>
                    <CardContent className="grid gap-3 text-sm text-slate-200">
                      <div>Docket: {safeText(selectedCase.caseNumber) || "Not recorded"}</div>
                      <div>Officer: {safeText(selectedCase.policeOfficerName) || "Not recorded"}</div>
                      <div>Prosecutor: {getProsecutorName(selectedCase)}</div>
                      <div>District: {safeText(selectedCase.district) || "Not recorded"}</div>
                      <div>Priority: {priorityBadge(getPriority(selectedCase)).label}</div>
                      <div>Assigned: {formatDateTime(selectedCase?.courtRegistry?.assignedAt || selectedCase?.updatedAt || selectedCase?.createdAt)}</div>
                      <div>Assigned by: {safeText(selectedCase?.courtRegistry?.assignedByName || selectedCase?.court?.assignedByName || "System Admin")}</div>
                      <div>Status: {statusBadge(selectedCase.status).label}</div>
                      <div>Judge: {getAssignedJudgeName(selectedCase) || safeText(currentUser?.name) || "Not recorded"}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-[#2d4a68] text-white">
                    <CardHeader><CardTitle className="text-lg">Case Statement</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea value={getCaseStatement(selectedCase)} readOnly rows={12} className="border-white/10 bg-[#1e3550] text-white" />
                    </CardContent>
                  </Card>
                </div>

                {getStatusGroup(selectedCase.status) === "hearing" ? (
                  <Card className="border-white/10 bg-[#2d4a68] text-white">
                    <CardHeader><CardTitle className="text-lg">Live Minutes Entry</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={minutesDraft}
                        onChange={(event) => setMinutesDraft(event.target.value)}
                        rows={6}
                        placeholder="Type hearing minutes in real time..."
                        className="border-white/10 bg-[#1e3550] text-white placeholder:text-slate-400"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          className="bg-[#efb307] text-[#0f243b] hover:bg-[#f5c028]"
                          disabled={busyAction === "save"}
                          onClick={saveMinutes}
                        >
                          {busyAction === "save" ? "Saving..." : "Save Minutes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="border-white/10 bg-[#2d4a68] text-white">
                  <CardHeader><CardTitle className="text-lg">Judge Notes & Minutes History</CardTitle></CardHeader>
                  <CardContent>
                    <Textarea
                      value={safeText(selectedCase?.judgeNotes) || "No judge notes or hearing minutes have been recorded yet."}
                      readOnly
                      rows={8}
                      className="border-white/10 bg-[#1e3550] text-white"
                    />
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-[#2d4a68] text-white">
                  <CardHeader><CardTitle className="text-lg">Case Transfer</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Label>Select judge to transfer to</Label>
                    <Select value={transferJudgeId} onValueChange={setTransferJudgeId}>
                      <SelectTrigger className="border-white/10 bg-[#1e3550] text-white">
                        <SelectValue placeholder="Choose another judge" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableJudges.map((judge) => {
                          const judgeLoad = allCases.filter((caseData: any) => getAssignedJudgeId(caseData) === judge.id).length
                          return (
                            <SelectItem key={judge.id} value={judge.id}>
                              {(judge.name || judge.fullName || "Judge")} ({judgeLoad} cases)
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 bg-transparent !text-white hover:bg-white/10"
                        disabled={busyAction === "transfer"}
                        onClick={transferCase}
                      >
                        {busyAction === "transfer" ? "Transferring..." : "Transfer"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-wrap justify-end gap-2">
                  {getStatusGroup(selectedCase.status) === "pending" ? (
                    <Button
                      type="button"
                      className="bg-[#efb307] text-[#0f243b] hover:bg-[#f5c028]"
                      disabled={busyAction === "start"}
                      onClick={() => startHearing(selectedCase)}
                    >
                      {busyAction === "start" ? "Starting..." : "Start Hearing"}
                    </Button>
                  ) : null}
                  {getStatusGroup(selectedCase.status) === "hearing" ? (
                    <Button
                      type="button"
                      className="bg-[#4ee37c] text-[#103127] hover:bg-[#64eb8d]"
                      disabled={busyAction === "close"}
                      onClick={closeCase}
                    >
                      {busyAction === "close" ? "Closing..." : "Close Case"}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {feedback ? (
          <div className="rounded-xl border border-white/10 bg-[#2d4a68] px-4 py-3 text-sm text-white">
            {feedback}
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
