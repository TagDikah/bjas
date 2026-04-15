"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkflowAnalytics } from "@/components/workflow-analytics"
import { useStore } from "@/lib/store"

type AvailableUser = {
  id: string
  name: string
  fullname?: string
  email?: string
  role: string
  station?: string | null
  department?: string | null
  badge?: string | null
}

type RankedUserRow = {
  user: AvailableUser
  score: number
  load: number
  regionScore: number
  hearingDatesCount: number
  nextHearingDate: string
  schedulePenalty: number
}

type AssignmentDecisionSummary = {
  judgeName: string
  clerkName: string
  judgeReason: string
  clerkReason: string
  judgeLoad: number
  clerkLoad: number
  judgeUpcomingDates: number
  clerkUpcomingDates: number
  judgeRegionScore: number
  clerkRegionScore: number
}

const steps = [
  "Snapshot",
  "Court Process",
  "Interviews",
  "Prodeo Counsel",
  "PTPS Scheduling",
  "Hearing Dates",
  "Claims",
  "AI Assignment",
]

function short(value?: string, max = 18) {
  const text = String(value || "")
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}...`
}

function isoDate(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

function maskInternalCaseKey(value?: string) {
  const raw = String(value || "").trim()
  if (!raw) return ""
  const compact = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  const tail = compact.slice(-8) || "HIDDEN"
  return `ENC-${tail}`
}

function collectUpcomingDates(caseData: any) {
  const values = new Set<string>()
  const pushDate = (value?: string) => {
    const normalized = isoDate(value)
    if (normalized) values.add(normalized)
  }

  const hearingDates = Array.isArray(caseData?.hearingDates) ? caseData.hearingDates : []
  for (const date of hearingDates) pushDate(String(date || ""))

  pushDate(caseData?.hearingRecord?.latestEntry?.appearanceDate)
  pushDate(caseData?.courtProcess?.firstAppearanceAt)
  pushDate(caseData?.courtProcess?.trialStartedAt)
  pushDate(caseData?.courtProcess?.judgmentAt)
  pushDate(caseData?.courtProcess?.sentenceAt)

  return Array.from(values).sort()
}

function buildSelectionReason(row: RankedUserRow | undefined, roleLabel: string) {
  if (!row) return `No ${roleLabel.toLowerCase()} was selected.`

  const parts = [
    `${row.user.name} was chosen as ${roleLabel.toLowerCase()} because the current workload is ${row.load}.`,
  ]

  if (row.regionScore > 0) {
    parts.push(`Their station matches the case district, which improves proximity for scheduling.`)
  } else {
    parts.push(`No direct station match was found, so workload and hearing calendar carried more weight.`)
  }

  if (row.hearingDatesCount > 0) {
    parts.push(
      `They already have ${row.hearingDatesCount} upcoming case date${row.hearingDatesCount === 1 ? "" : "s"}, with the next one on ${row.nextHearingDate || "an upcoming date"}.`
    )
  } else {
    parts.push(`They currently have no upcoming recorded hearing dates on assigned active matters.`)
  }

  if (row.schedulePenalty > 0) {
    parts.push(`That hearing calendar reduced the score slightly compared with less-booked staff.`)
  } else {
    parts.push(`Their open calendar helped them rank above the alternatives.`)
  }

  return parts.join(" ")
}

function HighCourtRegistryProcessFormPageContent() {
  const router = useRouter()
  const search = useSearchParams()
  const caseIdFromQuery = String(search.get("caseId") || "").trim()

  const { getAllCases, getUsers, highCourtAssignJudge } = useStore()
  const [step, setStep] = React.useState(0)
  const [formSaved, setFormSaved] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null)

  const intakeCases = React.useMemo(
    () =>
      getAllCases().filter((c) =>
        ["filed_to_high_court", "high_court_registry_intake"].includes(String(c.status || ""))
      ),
    [getAllCases]
  )

  const allCases = React.useMemo(() => getAllCases(), [getAllCases])

  const [selectedCaseId, setSelectedCaseId] = React.useState(caseIdFromQuery)
  React.useEffect(() => {
    if (selectedCaseId) return
    if (caseIdFromQuery) {
      setSelectedCaseId(caseIdFromQuery)
      return
    }
    if (intakeCases.length > 0) setSelectedCaseId(intakeCases[0].caseId)
  }, [selectedCaseId, caseIdFromQuery, intakeCases])

  const selectedCase = allCases.find((c) => c.caseId === selectedCaseId) || null
  const dateRegistered = isoDate(selectedCase?.courtRegistry?.intakeAt) || new Date().toISOString().slice(0, 10)

  const [judges, setJudges] = React.useState<AvailableUser[]>([])
  const [clerks, setClerks] = React.useState<AvailableUser[]>([])
  const [availabilityError, setAvailabilityError] = React.useState<string | null>(null)
  const [selectedJudgeId, setSelectedJudgeId] = React.useState("")
  const [selectedClerkId, setSelectedClerkId] = React.useState("")
  const [assignmentMessage, setAssignmentMessage] = React.useState<string | null>(null)
  const [assignmentSummary, setAssignmentSummary] = React.useState<AssignmentDecisionSummary | null>(null)
  const [assigning, setAssigning] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/users/availability?roles=high_court_judge,judge,clerk,judge_clerk")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok || !Array.isArray(data?.users)) {
          const localUsers = typeof getUsers === "function" ? (getUsers() as AvailableUser[]) : []
          setJudges(localUsers.filter((u) => ["high_court_judge", "judge"].includes(String(u.role || "").toLowerCase())))
          setClerks(localUsers.filter((u) => String(u.role || "").toLowerCase() === "clerk"))
          setAvailabilityError("Using local user list because TiDB availability lookup was unavailable.")
          return
        }
        const all = data.users as AvailableUser[]
        setJudges(all.filter((u) => ["high_court_judge", "judge"].includes(String(u.role || "").toLowerCase())))
        setClerks(all.filter((u) => String(u.role || "").toLowerCase() === "clerk"))
      })
      .catch(() => {
        const localUsers = typeof getUsers === "function" ? (getUsers() as AvailableUser[]) : []
        setJudges(localUsers.filter((u) => ["high_court_judge", "judge"].includes(String(u.role || "").toLowerCase())))
        setClerks(localUsers.filter((u) => String(u.role || "").toLowerCase() === "clerk"))
        setAvailabilityError("Using local user list because TiDB availability lookup was unavailable.")
      })
  }, [getUsers])

  React.useEffect(() => {
    if (!selectedCaseId && intakeCases.length > 0) {
      setSelectedCaseId(intakeCases[0].caseId)
    }
  }, [selectedCaseId, intakeCases])

  const workloads = React.useMemo(() => {
    const all = getAllCases()
    const judgeCount: Record<string, number> = {}
    const clerkCount: Record<string, number> = {}
    const judgeSchedule: Record<string, string[]> = {}
    const clerkSchedule: Record<string, string[]> = {}
    for (const c of all) {
      const active = ["assigned_to_high_court_judge", "high_court_in_progress"].includes(String(c.status || "").toLowerCase())
      if (!active) continue
      const jid = String(c.courtRegistry?.assignedJudgeId || c.court?.assignedJudgeId || "")
      const cid = String(c.courtRegistry?.assignedClerkId || "")
      const upcomingDates = collectUpcomingDates(c)
      if (jid) judgeCount[jid] = (judgeCount[jid] || 0) + 1
      if (cid) clerkCount[cid] = (clerkCount[cid] || 0) + 1
      if (jid) judgeSchedule[jid] = Array.from(new Set([...(judgeSchedule[jid] || []), ...upcomingDates])).sort()
      if (cid) clerkSchedule[cid] = Array.from(new Set([...(clerkSchedule[cid] || []), ...upcomingDates])).sort()
    }
    return { judgeCount, clerkCount, judgeSchedule, clerkSchedule }
  }, [getAllCases])

  const aiSuggestion = React.useMemo(() => {
    if (!selectedCase) return null
    const district = String(selectedCase.district || "").toLowerCase()
    const buildRows = (users: AvailableUser[], loadMap: Record<string, number>, scheduleMap: Record<string, string[]>) =>
      users
        .map((user) => {
          const regionScore = district && String(user.station || "").toLowerCase().includes(district) ? 3 : 0
          const load = loadMap[user.id] || 0
          const schedule = scheduleMap[user.id] || []
          const hearingDatesCount = schedule.length
          const nextHearingDate = schedule[0] || ""
          const schedulePenalty = Math.min(3, hearingDatesCount)
          return {
            user,
            score: regionScore - load - schedulePenalty,
            load,
            regionScore,
            hearingDatesCount,
            nextHearingDate,
            schedulePenalty,
          } satisfies RankedUserRow
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          if (a.load !== b.load) return a.load - b.load
          if (a.hearingDatesCount !== b.hearingDatesCount) return a.hearingDatesCount - b.hearingDatesCount
          return a.user.name.localeCompare(b.user.name)
        })

    const judgeRows = buildRows(judges, workloads.judgeCount, workloads.judgeSchedule)
    const clerkRows = buildRows(clerks, workloads.clerkCount, workloads.clerkSchedule)
    return {
      judge: judgeRows[0]?.user || null,
      clerk: clerkRows[0]?.user || null,
      judgeRows,
      clerkRows,
    }
  }, [selectedCase, judges, clerks, workloads])

  React.useEffect(() => {
    if (!aiSuggestion) return
    if (!selectedJudgeId && aiSuggestion.judge) setSelectedJudgeId(aiSuggestion.judge.id)
    if (!selectedClerkId && aiSuggestion.clerk) setSelectedClerkId(aiSuggestion.clerk.id)
  }, [aiSuggestion, selectedJudgeId, selectedClerkId])

  const isLast = step === steps.length - 1

  return (
    <DashboardLayout
      allowedRoles={["high_court_registry_assistant", "high_court_registry", "court_registry"]}
      title="Court Assistant Register"
    >
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Case Flow Management in Criminal Trials</CardTitle>
            <CardDescription>
              Structured flow from court process issuance to claims, with AI assignment as final step.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {steps.map((label, idx) => (
              <Badge key={label} variant={idx === step ? "default" : "outline"} className="text-xs">
                {idx + 1}. {label}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>White Paper Trial Snapshot</CardTitle>
              <CardDescription>Auto-filled from database and blockchain anchored case data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <Label>Select Registered Case</Label>
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger><SelectValue placeholder="Choose case" /></SelectTrigger>
                  <SelectContent>
                    {intakeCases.map((c) => (
                      <SelectItem key={c.caseId} value={c.caseId}>
                        {short(c.caseNumber)} - {short(c.district, 10)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Date Registered</Label><Input value={dateRegistered} readOnly /></div>
              <div className="space-y-1"><Label>Date of Occurrence</Label><Input value={isoDate(selectedCase?.createdAt)} readOnly /></div>
              <div className="space-y-1"><Label>Court File No.</Label><Input value={String(selectedCase?.court?.courtCaseNumber || "")} readOnly /></div>
              <div className="space-y-1"><Label>District</Label><Input value={String(selectedCase?.district || "")} readOnly /></div>
              <div className="space-y-1"><Label>L/DPP Ref</Label><Input value={String(selectedCase?.caseNumber || "")} readOnly /></div>
              <div className="space-y-1"><Label>Citation</Label><Input value={String(selectedCase?.citation || "")} readOnly /></div>
              <div className="space-y-1"><Label>Parties</Label><Input value={String(selectedCase?.parties || "")} readOnly /></div>
              <div className="space-y-1"><Label>Charge</Label><Input value={String(selectedCase?.charge || "")} readOnly /></div>
              <div className="space-y-1"><Label>Judge</Label><Input placeholder="Assigned at final AI step" readOnly /></div>
              <div className="space-y-1 md:col-span-2"><Label>Counsels</Label><Textarea rows={2} placeholder="CROWN ADV / DEFENCE ADV (PRODEO)" /></div>
              <div className="space-y-1"><Label>Interview Dates</Label><Textarea rows={2} placeholder="Interviewed / PTPS" /></div>
              <div className="space-y-1 md:col-span-2"><Label>Date of Hearing</Label><Input placeholder="Court hearing dates" /></div>
              <div className="space-y-1 md:col-span-2"><Label>Fabric Transaction ID</Label><Input value={String(selectedCase?.chainAnchor?.transactionId || selectedCase?.chainAnchor?.txHash || "")} readOnly /></div>
              <div className="space-y-1 md:col-span-2"><Label>Case Primary Key</Label><Input value={maskInternalCaseKey(String(selectedCase?.caseId || ""))} readOnly /></div>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? <Card><CardHeader><CardTitle>1. Issuing of Court Process</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>Registry Book Entry Number</Label><Input /></div><div className="space-y-1"><Label>Notice of Trial Date</Label><Input type="date" /></div><div className="space-y-1 md:col-span-2"><Label>Process Notes</Label><Textarea rows={4} /></div></CardContent></Card> : null}
        {step === 2 ? <Card><CardHeader><CardTitle>2. Conducting the Interviews</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>Accused Full Name</Label><Input /></div><div className="space-y-1"><Label>Legal Representation</Label><Input /></div><div className="space-y-1"><Label>Next of Kin</Label><Input /></div><div className="space-y-1"><Label>Actual Residence</Label><Input /></div><div className="space-y-1 md:col-span-2"><Label>Interview Summary</Label><Textarea rows={4} /></div></CardContent></Card> : null}
        {step === 3 ? <Card><CardHeader><CardTitle>3. Appointment of Prodeo Counsel</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>Eligibility Result</Label><Input /></div><div className="space-y-1"><Label>Appointed Counsel</Label><Input /></div><div className="space-y-1"><Label>Acceptance Date</Label><Input type="date" /></div><div className="space-y-1"><Label>Filed Form Reference</Label><Input /></div></CardContent></Card> : null}
        {step === 4 ? <Card><CardHeader><CardTitle>4. PTPS Scheduling</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>PTPS Date</Label><Input type="date" /></div><div className="space-y-1"><Label>Judge Session</Label><Input /></div><div className="space-y-1"><Label>Witness Exchange Deadline</Label><Input type="date" /></div><div className="space-y-1"><Label>PTPS Minutes Filed</Label><Input /></div></CardContent></Card> : null}
        {step === 5 ? <Card><CardHeader><CardTitle>5. Hearing Dates</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>Hearing Start Date</Label><Input type="date" /></div><div className="space-y-1"><Label>Hearing End Date</Label><Input type="date" /></div><div className="space-y-1"><Label>Subpoena Issued</Label><Input /></div><div className="space-y-1"><Label>Warrant of Apprehension</Label><Input /></div><div className="space-y-1 md:col-span-2"><Label>Result Notes</Label><Textarea rows={3} /></div></CardContent></Card> : null}
        {step === 6 ? <Card><CardHeader><CardTitle>6. Claims (Prodeo Rules 2011)</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>Preparation Fee</Label><Input /></div><div className="space-y-1"><Label>1st Day Fee</Label><Input /></div><div className="space-y-1"><Label>Subsequent Day Fee</Label><Input /></div><div className="space-y-1"><Label>Postponement Fee</Label><Input /></div><div className="space-y-1 md:col-span-2"><Label>Supporting Documents</Label><Textarea rows={4} /></div></CardContent></Card> : null}

        {step === 7 ? (
          <Card>
            <CardHeader>
              <CardTitle>Final Step: AI Assignment (Judge + Clerk)</CardTitle>
              <CardDescription>
                This is the only non-admin workflow interface for assigning judges and clerks from system availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availabilityError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{availabilityError}</div> : null}
              {!formSaved ? <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-foreground">Save form first to unlock assignment.</div> : null}
              {formSaved && judges.length === 0 ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  No judge account is available for assignment. Register a court user with role <span className="font-semibold">Judge</span> or <span className="font-semibold">High Court Judge</span> first.
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1"><Label>Case</Label><Input value={selectedCase ? `${selectedCase.caseNumber} - ${selectedCase.district}` : "No case"} readOnly /></div>
                <div className="space-y-1"><Label>AI Judge</Label><Input value={aiSuggestion?.judge?.name || "No suggestion"} readOnly /></div>
                <div className="space-y-1"><Label>AI Clerk</Label><Input value={aiSuggestion?.clerk?.name || "No suggestion"} readOnly /></div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium">Judge Selection Reason</div>
                  <p className="mt-1 text-muted-foreground">{buildSelectionReason(aiSuggestion?.judgeRows?.find((row) => row.user.id === selectedJudgeId), "Judge")}</p>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium">Clerk Selection Reason</div>
                  <p className="mt-1 text-muted-foreground">{buildSelectionReason(aiSuggestion?.clerkRows?.find((row) => row.user.id === selectedClerkId), "Clerk")}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Manual Judge Override</Label>
                  <Select value={selectedJudgeId} onValueChange={setSelectedJudgeId} disabled={!formSaved}>
                    <SelectTrigger><SelectValue placeholder="Select judge" /></SelectTrigger>
                    <SelectContent>
                      {judges.map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.name} - {j.station || "No station"} - load {workloads.judgeCount[j.id] || 0} - dates {(workloads.judgeSchedule[j.id] || []).length}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Manual Clerk Override</Label>
                  <Select value={selectedClerkId} onValueChange={setSelectedClerkId} disabled={!formSaved}>
                    <SelectTrigger><SelectValue placeholder="Select clerk" /></SelectTrigger>
                    <SelectContent>
                      {clerks.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.station || "No station"} - load {workloads.clerkCount[c.id] || 0} - dates {(workloads.clerkSchedule[c.id] || []).length}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">All Available Judges</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-xs">
                    {aiSuggestion?.judgeRows?.map((row) => (
                      <div key={row.user.id} className="rounded border p-2">
                        <div className="flex items-center justify-between gap-3">
                          <span>{row.user.name} ({row.user.station || "No station"})</span>
                          <span>Score {row.score}</span>
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          Load {row.load} | Upcoming dates {row.hearingDatesCount} | Next {row.nextHearingDate || "None"}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">All Available Clerks</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-xs">
                    {aiSuggestion?.clerkRows?.map((row) => (
                      <div key={row.user.id} className="rounded border p-2">
                        <div className="flex items-center justify-between gap-3">
                          <span>{row.user.name} ({row.user.station || "No station"})</span>
                          <span>Score {row.score}</span>
                        </div>
                        <div className="mt-1 text-muted-foreground">
                          Load {row.load} | Upcoming dates {row.hearingDatesCount} | Next {row.nextHearingDate || "None"}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Button
                disabled={!formSaved || !selectedCaseId || !selectedJudgeId || judges.length === 0 || assigning}
                onClick={async () => {
                  const judge = judges.find((j) => j.id === selectedJudgeId)
                  const clerk = clerks.find((c) => c.id === selectedClerkId)
                  if (!selectedCaseId || !judge || !highCourtAssignJudge) {
                    setAssignmentMessage("Assignment failed. No valid judge is selected.")
                    return
                  }
                  setAssignmentMessage(null)
                  setAssignmentSummary(null)
                  setAssigning(true)

                  try {
                    const response = await fetch("/api/cases/high-court-assign", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        caseId: selectedCaseId,
                        judgeId: judge.id,
                        judgeName: judge.name,
                        clerkId: clerk?.id || "",
                        clerkName: clerk?.name || "",
                      }),
                    })

                    const data = await response.json().catch(() => null)
                    if (!response.ok || !data?.ok) {
                      setAssignmentMessage(data?.error || "Assignment failed.")
                      return
                    }

                    highCourtAssignJudge(
                      selectedCaseId,
                      {
                        id: judge.id,
                        name: judge.name,
                        fullName: judge.fullname || judge.name,
                        email: judge.email || `${judge.id}@local`,
                        role: "high_court_judge",
                        station: judge.station || undefined,
                        department: judge.department || undefined,
                        badge: judge.badge || undefined,
                      } as any,
                      clerk
                        ? ({
                            id: clerk.id,
                            name: clerk.name,
                            fullName: clerk.fullname || clerk.name,
                            email: clerk.email || `${clerk.id}@local`,
                            role: "clerk",
                            station: clerk.station || undefined,
                            department: clerk.department || undefined,
                            badge: clerk.badge || undefined,
                          } as any)
                        : undefined
                    )

                    setAssignmentMessage("Assignment applied successfully.")
                    setAssignmentSummary({
                      judgeName: judge.name,
                      clerkName: clerk?.name || "No clerk selected",
                      judgeReason: buildSelectionReason(aiSuggestion?.judgeRows?.find((row) => row.user.id === judge.id), "Judge"),
                      clerkReason: buildSelectionReason(aiSuggestion?.clerkRows?.find((row) => row.user.id === (clerk?.id || "")), "Clerk"),
                      judgeLoad: aiSuggestion?.judgeRows?.find((row) => row.user.id === judge.id)?.load || 0,
                      clerkLoad: aiSuggestion?.clerkRows?.find((row) => row.user.id === (clerk?.id || ""))?.load || 0,
                      judgeUpcomingDates: aiSuggestion?.judgeRows?.find((row) => row.user.id === judge.id)?.hearingDatesCount || 0,
                      clerkUpcomingDates: aiSuggestion?.clerkRows?.find((row) => row.user.id === (clerk?.id || ""))?.hearingDatesCount || 0,
                      judgeRegionScore: aiSuggestion?.judgeRows?.find((row) => row.user.id === judge.id)?.regionScore || 0,
                      clerkRegionScore: aiSuggestion?.clerkRows?.find((row) => row.user.id === (clerk?.id || ""))?.regionScore || 0,
                    })
                  } catch (error: any) {
                    setAssignmentMessage(error?.message || "Assignment failed.")
                  } finally {
                    setAssigning(false)
                  }
                }}
              >
                {assigning ? "Applying..." : "Apply Assignment"}
              </Button>
              {assignmentMessage ? <div className={`text-sm ${assignmentMessage.toLowerCase().includes("failed") ? "text-destructive" : "text-emerald-700"}`}>{assignmentMessage}</div> : null}
              {assignmentSummary ? (
                <div className="space-y-3">
                  <WorkflowAnalytics
                    title="Assignment Decision Analytics"
                    subtitle={`Judge: ${assignmentSummary.judgeName} | Clerk: ${assignmentSummary.clerkName}`}
                    compact
                    items={[
                      { label: "Judge Load", value: assignmentSummary.judgeLoad, tone: assignmentSummary.judgeLoad > 2 ? "warning" : "success" },
                      { label: "Judge Dates", value: assignmentSummary.judgeUpcomingDates, tone: assignmentSummary.judgeUpcomingDates > 2 ? "warning" : "default" },
                      { label: "Clerk Load", value: assignmentSummary.clerkLoad, tone: assignmentSummary.clerkLoad > 2 ? "warning" : "success" },
                      { label: "Clerk Dates", value: assignmentSummary.clerkUpcomingDates, tone: assignmentSummary.clerkUpcomingDates > 2 ? "warning" : "default" },
                    ]}
                    recommendationTitle="Selection Logic"
                    recommendation={`Judge station score ${assignmentSummary.judgeRegionScore}. Clerk station score ${assignmentSummary.clerkRegionScore}. The model prioritized the lowest workable load and the lightest hearing calendar before completing assignment.`}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Judge Analytics Note</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {assignmentSummary.judgeReason}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Clerk Analytics Note</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {assignmentSummary.clerkReason}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {isLast ? (
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                setSaveMessage(selectedCase ? `Workflow completed for ${selectedCase.caseNumber}.` : "Workflow completed.")
                router.push("/high-court-registry/cases")
              }}
            >
              Finish
            </Button>
          ) : step === steps.length - 2 ? (
            <Button
              onClick={() => {
                setFormSaved(true)
                setSaveMessage("Form saved. AI Assignment unlocked.")
                setStep((s) => Math.min(steps.length - 1, s + 1))
              }}
            >
              Save Form & Open AI Assignment
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Next</Button>
          )}
        </div>
        {saveMessage ? <div className="text-sm text-emerald-700">{saveMessage}</div> : null}
      </div>
    </DashboardLayout>
  )
}

export default function HighCourtRegistryProcessFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071426]" />}>
      <HighCourtRegistryProcessFormPageContent />
    </Suspense>
  )
}
