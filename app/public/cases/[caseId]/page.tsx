"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, QrCode, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { toPublicCaseView, type CaseActivity, type PublicCaseView, type PublicSubmissionType } from "@/lib/public-case-tracking"

const submissionTypeLabels: Record<PublicSubmissionType, string> = {
  comment: "Public Comment",
  appeal: "Appeal Submission",
  additional_info: "Additional Information",
  review_request: "Review Request",
  correction_request: "Correction Request",
}

function badgeClass(type: string) {
  if (type.includes("rejected")) return "bg-destructive/15 text-destructive border-destructive/30"
  if (type.includes("approved") || type.includes("complete")) return "bg-success/15 text-foreground border-success/30"
  if (type.includes("public_")) return "bg-primary/15 text-primary border-primary/30"
  if (type.includes("pending")) return "bg-warning/15 text-foreground border-warning/30"
  return "bg-muted text-muted-foreground border-border"
}

function activityTypeFromSubmission(type: PublicSubmissionType): CaseActivity["type"] {
  if (type === "appeal") return "public_appeal"
  if (type === "additional_info") return "public_additional_info"
  if (type === "review_request") return "public_review_request"
  if (type === "correction_request") return "public_correction_request"
  return "public_comment"
}

export default function PublicCaseDetailPage() {
  const router = useRouter()
  const params = useParams<{ caseId: string }>()
  const caseId = params.caseId
  const storeCases = useStore((s: any) => (Array.isArray(s.cases) ? s.cases : []))

  const [submitterName, setSubmitterName] = useState("")
  const [entryType, setEntryType] = useState<PublicSubmissionType>("comment")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [publicCase, setPublicCase] = useState<PublicCaseView | null>(null)
  const [timeline, setTimeline] = useState<CaseActivity[]>([])
  const [involvedUsers, setInvolvedUsers] = useState<string[]>([])
  const [rejection, setRejection] = useState<{
    hadRejection: boolean
    previousStatus: string
    publicReason: string
    update: string
    currentPosition: string
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    setLoadError("")
    fetch(`/api/public/cases?caseId=${encodeURIComponent(caseId)}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data?.ok || !data?.case) {
          const fallback = storeCases.find((item: any) => String(item?.caseId || "") === caseId)
          if (fallback) {
            setPublicCase(toPublicCaseView(fallback))
            setTimeline([])
            setInvolvedUsers([])
            setRejection(null)
            setLoadError("")
            return
          }
          setLoadError(data?.error || "Failed to load public case detail.")
          return
        }
        setPublicCase(data.case)
        setTimeline(Array.isArray(data.timeline) ? data.timeline : [])
        setInvolvedUsers(Array.isArray(data.involvedUsers) ? data.involvedUsers : [])
        setRejection(data.rejection ?? null)
      })
      .catch(() => {
        const fallback = storeCases.find((item: any) => String(item?.caseId || "") === caseId)
        if (fallback) {
          setPublicCase(toPublicCaseView(fallback))
          setTimeline([])
          setInvolvedUsers([])
          setRejection(null)
          setLoadError("")
          return
        }
        setLoadError("Failed to load public case detail.")
      })
      .finally(() => setLoading(false))
  }, [caseId, storeCases])

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Loading public case detail...
        </div>
      </div>
    )
  }

  if (loadError || !publicCase) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          {loadError || "Case not found in the public view dataset."}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/public/cases">Back to Public Cases</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back()
                  return
                }
                router.push("/public/cases")
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button asChild variant="outline">
              <Link href={`/api/public/verify/certificate/${caseId}`}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Download Certificate
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/api/public/verify/qr/${caseId}`} target="_blank">
                <QrCode className="mr-2 h-4 w-4" />
                Open Verification QR
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Public Case Detail</CardTitle>
            <CardDescription>
              This page is view-only for official records. Public interactions are saved as separate append-only entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case Number</div>
              <div className="font-mono text-foreground">{publicCase.caseNumber}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</div>
              <div className="font-semibold text-foreground">{publicCase.title}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current Status</div>
              <Badge variant="outline" className="border-primary/30 bg-primary/15 text-primary">
                {publicCase.statusLabel}
              </Badge>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Department / Stage</div>
              <div className="text-foreground">{publicCase.department}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Docket Phase</div>
              <div className="text-foreground">{publicCase.docketPhase}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date Opened</div>
              <div className="text-foreground">{new Date(publicCase.openedAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Updated</div>
              <div className="text-foreground">{new Date(publicCase.updatedAt).toLocaleString()}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Public Progress Summary</div>
              <div className="mt-1 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                {publicCase.progressSummary}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
                Sensitive records are hidden: judge names, private witnesses, confidential investigation details, internal admin notes, and restricted personal data.
              </div>
            </div>

            {rejection?.hadRejection ? (
              <div className="md:col-span-2 rounded-lg border border-border bg-background p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Public Rejection Update</div>
                <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                  <div><span className="font-medium">Previous Status:</span> {rejection.previousStatus || "Rejected"}</div>
                  <div><span className="font-medium">Current Status:</span> {publicCase.statusLabel}</div>
                  <div className="md:col-span-2"><span className="font-medium">Public Reason:</span> {rejection.publicReason || "Required case information was incomplete."}</div>
                  <div><span className="font-medium">Update:</span> {rejection.update}</div>
                  <div><span className="font-medium">Current Position:</span> {rejection.currentPosition}</div>
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Users Involved</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {involvedUsers.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No involved users listed.</span>
                ) : (
                  involvedUsers.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                    >
                      {name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Case Timeline</CardTitle>
              <CardDescription>Append-only movement and public interaction history</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No timeline events yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Badge variant="outline" className={badgeClass(entry.type)}>
                          {String(entry.type).replaceAll("_", " ")}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">{entry.actorName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{entry.message}</div>
                      {entry.metadata?.reason ? (
                        <div className="mt-2 rounded-md border border-border bg-card p-2 text-xs text-muted-foreground">
                          Reason: {String(entry.metadata.reason)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Comment / Appeal / Additional Input</CardTitle>
              <CardDescription>
                This form does not edit the official case record. It adds a separate public submission entry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
              />

              <Select value={entryType} onValueChange={(value) => setEntryType(value as PublicSubmissionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Submission type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(submissionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your comment, appeal, correction request, or additional information..."
                rows={6}
              />

              <Button
                onClick={async () => {
                  const trimmed = message.trim()
                  if (!trimmed) return
                  setSubmitError("")
                  const response = await fetch(
                    `/api/public/cases/${encodeURIComponent(caseId)}/submissions`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: entryType,
                        message: trimmed,
                        submitterName: submitterName.trim(),
                      }),
                    }
                  )

                  const data = await response.json().catch(() => ({}))
                  if (!response.ok || !data?.ok) {
                    setSubmitError(data?.error || "Failed to submit public entry.")
                    return
                  }

                  setTimeline((current) => [
                    {
                      id: `local-${Date.now()}`,
                      caseId,
                      type: activityTypeFromSubmission(entryType),
                      actorName: submitterName.trim() || "Public User",
                      actorRole: "public",
                      message: trimmed,
                      createdAt: new Date().toISOString(),
                    },
                    ...current,
                  ])
                  setMessage("")
                  setSubmitted(true)
                }}
                className="w-full"
              >
                Submit Public Entry
              </Button>

              {submitError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}

              {submitted ? (
                <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm text-foreground">
                  Submission received and logged as an append-only entry.
                </div>
              ) : null}

              <Button asChild variant="outline" className="w-full">
                <Link href="/public/cases">Back to Case List</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
