"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AlertTriangle, Bell, Bot, Calendar, FileText, Gavel, Scale, ShieldCheck, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CaseData } from "@/lib/blockchain"
import type { JudicialDecisionSupport } from "@/lib/legal/judicial-decision-support"
import { useStore } from "@/lib/store"

type JudgeCaseWorkbenchProps = {
  caseId: string
  allowedRoles: string[]
  title: string
}

function text(value: unknown) {
  return String(value || "").trim()
}

function statusTone(status: JudicialDecisionSupport["fairnessChecks"][number]["status"]) {
  if (status === "pass") return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
  if (status === "caution") return "bg-amber-500/15 text-amber-100 border-amber-400/30"
  return "bg-rose-500/15 text-rose-100 border-rose-400/30"
}

function safeDate(value: unknown) {
  const parsed = new Date(value as any)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDateInput(value: unknown) {
  const parsed = safeDate(value)
  return parsed ? parsed.toISOString().slice(0, 10) : ""
}

function prettyDate(value: unknown) {
  const parsed = safeDate(value)
  if (!parsed) return "Not recorded"
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function JudgeCaseWorkbench({ caseId, allowedRoles, title }: JudgeCaseWorkbenchProps) {
  const store = useStore() as any
  const currentUser = store.currentUser
  const getAllCases = store.getAllCases ?? (() => [])
  const updateCase = store.updateCase ?? (() => {})

  const caseData = useMemo(() => {
    return (getAllCases() as CaseData[]).find((item) => item.caseId === caseId) || null
  }, [caseId, getAllCases])

  const [defenseSummary, setDefenseSummary] = useState("")
  const [prosecutionSummary, setProsecutionSummary] = useState("")
  const [requestedRelief, setRequestedRelief] = useState("")
  const [judgeQuestion, setJudgeQuestion] = useState("")
  const [support, setSupport] = useState<JudicialDecisionSupport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [workspaceMessage, setWorkspaceMessage] = useState("")
  const storedWorkspace = caseData?.judgeWorkspace || {}
  const [nextHearingDate, setNextHearingDate] = useState("")
  const [judgeNotes, setJudgeNotes] = useState(text(storedWorkspace.privateNotes))
  const [judgmentDraft, setJudgmentDraft] = useState(text(storedWorkspace.judgmentDraft))
  const [finalOrder, setFinalOrder] = useState(text(storedWorkspace.finalOrder))
  const [decision, setDecision] = useState(text(storedWorkspace.decision))

  async function generateSupport() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/judge/decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          defenseSummary,
          prosecutionSummary,
          requestedRelief,
          judgeQuestion,
        }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to generate support.")
      }

      setSupport(json.support as JudicialDecisionSupport)
    } catch (supportError: any) {
      setError(supportError?.message || "Failed to generate support.")
    } finally {
      setLoading(false)
    }
  }

  if (!caseData) {
    return (
      <DashboardLayout allowedRoles={allowedRoles} title={title}>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            The selected case could not be found in the current workspace.
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const assignedJudgeName = text(caseData?.court?.assignedJudgeName || caseData?.courtRegistry?.assignedJudgeName || currentUser?.name)
  const isSmallCourt = String(caseData?.court?.courtType || "").toLowerCase() === "small"
  const canMarkInProgress = ["assigned_to_high_court_judge", "assigned_to_small_court_judge", "assigned_to_judge"].includes(
    String(caseData.status || "")
  )

  const hearingDates = useMemo(() => {
    const baseDates = Array.isArray(caseData?.hearingDates) ? caseData.hearingDates : []
    const latestAppearance = caseData?.hearingRecord?.latestEntry?.appearanceDate
    const unique = new Set<string>()
    for (const value of baseDates) {
      const normalized = toDateInput(value)
      if (normalized) unique.add(normalized)
    }
    if (latestAppearance) {
      const normalized = toDateInput(latestAppearance)
      if (normalized) unique.add(normalized)
    }
    return Array.from(unique).sort()
  }, [caseData])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingHearings = hearingDates.filter((value) => {
    const parsed = safeDate(value)
    return parsed ? parsed.getTime() >= today.getTime() : false
  })
  const pastHearings = hearingDates.filter((value) => {
    const parsed = safeDate(value)
    return parsed ? parsed.getTime() < today.getTime() : false
  })

  const evidenceItems = Array.isArray(caseData?.evidence) ? caseData.evidence : []
  const witnesses = Array.isArray(caseData?.policeSections?.sectionA?.witnessList)
    ? caseData.policeSections.sectionA.witnessList
    : []

  const actorCards = [
    { label: "Prosecutor", value: text(caseData?.dpp?.assignedProsecutorName || caseData?.prosecution?.assignedProsecutorName || caseData?.assignedProsecutorName) || "Not yet linked" },
    { label: "Defence Counsel", value: text(caseData?.courtRegistry?.intakeFormData?.appointedCounsel || caseData?.defenseCounsel || caseData?.defenceCounsel) || "Not yet recorded" },
    { label: "Accused", value: text(caseData?.policeSections?.sectionA?.accusedName || caseData?.accusedName) || "Not recorded" },
    { label: "Witnesses", value: witnesses.length ? witnesses.join(", ") : "No witness list recorded" },
  ]

  const notifications = [
    assignedJudgeName ? `Case assigned to ${assignedJudgeName}.` : "",
    upcomingHearings[0] ? `Upcoming hearing on ${prettyDate(upcomingHearings[0])}.` : "No future hearing is scheduled yet.",
    evidenceItems.length ? `${evidenceItems.length} evidence item${evidenceItems.length === 1 ? "" : "s"} available for review.` : "No uploaded evidence is attached yet.",
    String(caseData.status || "").includes("in_progress") ? "Case is currently marked in progress." : "Case has not yet been moved into active proceedings.",
  ].filter(Boolean)

  const historyItems = [
    { label: "Case opened", value: caseData?.createdAt },
    { label: "Registry intake completed", value: caseData?.courtRegistry?.intakeAt },
    { label: "Judge assigned", value: caseData?.courtRegistry?.assignedAt },
    { label: "Latest appearance", value: caseData?.hearingRecord?.latestEntry?.appearanceDate },
    { label: "Judgment recorded", value: caseData?.courtProcess?.judgmentAt },
    { label: "Sentence recorded", value: caseData?.courtProcess?.sentenceAt },
  ].filter((item) => item.value)

  function persistJudgeWorkspace(overrides: Record<string, any>, successMessage: string) {
    updateCase(caseData.caseId, {
      hearingDates: overrides.hearingDates ?? caseData.hearingDates,
      judgeWorkspace: {
        ...(caseData?.judgeWorkspace || {}),
        privateNotes: overrides.privateNotes ?? judgeNotes,
        judgmentDraft: overrides.judgmentDraft ?? judgmentDraft,
        finalOrder: overrides.finalOrder ?? finalOrder,
        decision: overrides.decision ?? decision,
        updatedAt: new Date().toISOString(),
      },
      status: overrides.status ?? caseData.status,
      courtProcess: {
        ...(caseData?.courtProcess || {}),
        judgmentAt: overrides.judgmentAt ?? caseData?.courtProcess?.judgmentAt,
      },
    })
    setWorkspaceMessage(successMessage)
  }

  return (
    <DashboardLayout allowedRoles={allowedRoles} title={title}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start justify-between gap-3">
              <div>
                <div>{text(caseData.parties) || "Judicial File"}</div>
                <CardDescription className="mt-2">
                  {text(caseData.caseNumber)} | {text(caseData.charge) || "Charge not recorded"} | {text(caseData.district) || "District not recorded"}
                </CardDescription>
              </div>
              <Badge variant="outline">{String(caseData.status || "").replace(/_/g, " ")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div><span className="text-muted-foreground">Assigned judge:</span> {assignedJudgeName || "Not recorded"}</div>
            <div><span className="text-muted-foreground">Filed by:</span> {text(caseData.policeOfficerName) || "Not recorded"}</div>
            <div><span className="text-muted-foreground">Case type:</span> {isSmallCourt ? "Criminal - Small Court" : "Criminal - High Court"}</div>
            <div><span className="text-muted-foreground">Court file:</span> {text(caseData?.court?.courtCaseNumber) || "Not recorded"}</div>
            <div className="md:col-span-2"><span className="text-muted-foreground">Case summary:</span> {text(caseData.description || caseData?.policeSections?.sectionA?.summary) || "No summary recorded."}</div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              {canMarkInProgress ? (
                <Button
                  variant="secondary"
                  className="!text-white [&_svg]:!text-white"
                  onClick={() =>
                    updateCase(caseData.caseId, {
                      status: isSmallCourt ? "small_court_in_progress" : "high_court_in_progress",
                    })
                  }
                >
                  Mark In Progress
                </Button>
              ) : null}
              <Link href={isSmallCourt ? "/small-court-judge/cases" : "/high-court-judge/hearing"}>
                <Button variant="outline" className="!text-white [&_svg]:!text-white">Open Hearing Module</Button>
              </Link>
              <Link href={isSmallCourt ? "/small-court-judge/cases" : "/high-court-judge/sentencing"}>
                <Button variant="outline" className="!text-white [&_svg]:!text-white">Open Sentencing Module</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session And Hearing Management
              </CardTitle>
              <CardDescription>Schedule, review, and reschedule hearings linked to this case.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  type="date"
                  value={nextHearingDate}
                  onChange={(e) => setNextHearingDate(e.target.value)}
                  className="w-full text-sm md:max-w-[170px]"
                />
                <Button
                  onClick={() => {
                    if (!nextHearingDate) {
                      setWorkspaceMessage("Choose a hearing date first.")
                      return
                    }
                    const normalizedDate = nextHearingDate.trim()
                    if (!normalizedDate) {
                      setWorkspaceMessage("Choose a valid date first.")
                      return
                    }
                    const mergedDates = Array.from(new Set([...hearingDates, normalizedDate])).sort()
                    persistJudgeWorkspace({ hearingDates: mergedDates }, `Hearing date ${prettyDate(normalizedDate)} saved.`)
                    setNextHearingDate("")
                  }}
                >
                  Schedule Session
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="font-medium">Upcoming Hearings</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {upcomingHearings.length ? upcomingHearings.map((date) => (
                      <div key={date} className="flex items-center justify-between rounded-lg border p-2">
                        <span>{prettyDate(date)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNextHearingDate(date)}
                        >
                          Reschedule
                        </Button>
                      </div>
                    )) : <div className="text-muted-foreground">No future hearing is linked yet.</div>}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-medium">Past Hearings</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {pastHearings.length ? pastHearings.slice(-6).reverse().map((date) => (
                      <div key={date} className="rounded-lg border p-2">{prettyDate(date)}</div>
                    )) : <div className="text-muted-foreground">No past sessions are recorded yet.</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications And Alerts
              </CardTitle>
              <CardDescription>Important updates connected to assignment, hearings, and case readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((item, index) => (
                <div key={`${index}-${item}`} className="rounded-xl border p-3 text-sm">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents And Evidence Review
              </CardTitle>
              <CardDescription>Review uploaded evidence, affidavits, and legal material attached to this matter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidenceItems.length ? evidenceItems.map((item: any, index: number) => (
                <div key={`${index}-${text(item?.id || item?.name || index)}`} className="rounded-xl border p-4">
                  <div className="font-medium">{text(item?.title || item?.name || `Evidence ${index + 1}`)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{text(item?.type || item?.category || "Evidence item")}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{text(item?.description || item?.summary || "No description recorded.")}</div>
                </div>
              )) : (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  No uploaded documents or evidence are attached to this case yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Parties And Legal Actors
              </CardTitle>
              <CardDescription>Parties, prosecutors, defence lawyers, accused persons, and witnesses linked to the case.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {actorCards.map((item) => (
                <div key={item.label} className="rounded-xl border p-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Judgment And Orders</CardTitle>
              <CardDescription>Prepare draft reasoning, save your decision, and issue the final order for the matter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Decision</Label>
                <Input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Example: guilty, not guilty, approved, rejected, adjourned" />
              </div>
              <div className="space-y-2">
                <Label>Draft Judgment</Label>
                <Textarea rows={6} value={judgmentDraft} onChange={(e) => setJudgmentDraft(e.target.value)} placeholder="Write the ruling analysis or save an in-progress judgment draft." />
              </div>
              <div className="space-y-2">
                <Label>Final Order</Label>
                <Textarea rows={4} value={finalOrder} onChange={(e) => setFinalOrder(e.target.value)} placeholder="Record the final order or signed directions for the case." />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => persistJudgeWorkspace({}, "Judgment draft saved.")}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() =>
                    persistJudgeWorkspace(
                      {
                        judgmentAt: new Date().toISOString(),
                        status: isSmallCourt ? "small_court_completed" : "high_court_completed",
                      },
                      "Final ruling recorded for this case."
                    )
                  }
                >
                  Issue Final Ruling
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Private Notes And Annotations</CardTitle>
              <CardDescription>Keep working notes, observations, and hearing remarks for your own judicial workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea rows={10} value={judgeNotes} onChange={(e) => setJudgeNotes(e.target.value)} placeholder="Private observations, courtroom notes, or personal reminders." />
              <Button variant="outline" onClick={() => persistJudgeWorkspace({ privateNotes: judgeNotes }, "Private judge notes saved.")}>
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Case History And Audit Trail</CardTitle>
            <CardDescription>Timeline of major case milestones, previous hearings, and recorded court events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {historyItems.length ? historyItems.map((item) => (
              <div key={`${item.label}-${item.value}`} className="flex items-center justify-between rounded-xl border p-4">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{prettyDate(item.value)}</div>
              </div>
            )) : (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                No history entries have been recorded for this case yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security And Access</CardTitle>
            <CardDescription>Role-based controls and recorded access points for this judge workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="font-medium">Logged-in role</div>
              <div className="mt-1 text-sm text-muted-foreground">{text(currentUser?.role).replace(/_/g, " ") || "Unknown"}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="font-medium">Assigned case access</div>
              <div className="mt-1 text-sm text-muted-foreground">{assignedJudgeName ? "Granted to assigned judge workflow" : "Awaiting assignment confirmation"}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="font-medium">Latest audit marker</div>
              <div className="mt-1 text-sm text-muted-foreground">{prettyDate(caseData?.updatedAt || caseData?.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        {workspaceMessage ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {workspaceMessage}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Constitutional Decision Support
            </CardTitle>
            <CardDescription>
              Enter the defence and prosecution positions to generate a non-binding Lesotho Constitution review for this case.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Defence Summary</Label>
              <Textarea rows={4} value={defenseSummary} onChange={(e) => setDefenseSummary(e.target.value)} placeholder="Summarize the defence case, objections, constitutional concerns, or mitigation." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Prosecution Summary</Label>
              <Textarea rows={4} value={prosecutionSummary} onChange={(e) => setProsecutionSummary(e.target.value)} placeholder="Summarize the prosecution evidence, requested orders, and response to the defence." />
            </div>
            <div className="space-y-2">
              <Label>Requested Relief</Label>
              <Input value={requestedRelief} onChange={(e) => setRequestedRelief(e.target.value)} placeholder="Example: bail denied, discharge, adjournment, conviction, sentence" />
            </div>
            <div className="space-y-2">
              <Label>Judge Question</Label>
              <Input value={judgeQuestion} onChange={(e) => setJudgeQuestion(e.target.value)} placeholder="Example: Is the matter ready for ruling?" />
            </div>
            {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{error}</div> : null}
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={generateSupport} disabled={loading}>
                {loading ? "Generating..." : "Generate Judge Support"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {support ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
                <CardDescription>
                  Mode: {support.aiMode} {support.modelId ? `| Model: ${support.modelId}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border/80 bg-background/40 p-4 text-sm text-slate-100">
                  {support.nonBindingNotice}
                </div>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm leading-6 text-slate-100">
                  {support.aiNarrative}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Constitutional Anchors
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {support.constitutionalAnchors.map((anchor) => (
                  <div key={anchor.section} className="rounded-xl border border-border/80 bg-background/35 p-4">
                    <div className="font-semibold">{anchor.section}: {anchor.title}</div>
                    <div className="mt-2 text-sm text-slate-200">{anchor.principle}</div>
                    <div className="mt-2 text-sm text-slate-300">{anchor.relevance}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Fairness Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {support.fairnessChecks.map((check) => (
                  <div key={`${check.section}-${check.label}`} className={`rounded-xl border p-4 ${statusTone(check.status)}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{check.label}</div>
                      <Badge variant="outline">{check.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm">{check.section}</div>
                    <div className="mt-2 text-sm">{check.reason}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Issues For The Judge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {support.issuesForJudge.length ? support.issuesForJudge.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-xl border border-border/70 bg-background/35 p-3">
                      {item}
                    </div>
                  )) : <div className="rounded-xl border border-border/70 bg-background/35 p-3">No immediate constitutional issue was flagged from the supplied material.</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggested Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {support.suggestedNextSteps.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-xl border border-border/70 bg-background/35 p-3">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Draft Ruling Outline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-xl border border-border/70 bg-background/35 p-4">
                  <div className="font-semibold">{support.draftRulingTemplate.heading}</div>
                  <div className="mt-3 leading-6 text-slate-100">{support.draftRulingTemplate.summary}</div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {support.draftRulingTemplate.orders.map((order, index) => (
                    <div key={`${index}-${order}`} className="rounded-xl border border-border/70 bg-background/35 p-4">
                      {index + 1}. {order}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
