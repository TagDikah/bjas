"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Submission = {
  trackingNumber: string
  kind: string
  title: string
  message: string
  moderationStatus: string
}

export default function PublicModerationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [kindFilter, setKindFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [query, setQuery] = useState("")

  async function loadSubmissions() {
    const params = new URLSearchParams()
    if (kindFilter !== "all") params.set("kind", kindFilter)
    if (statusFilter !== "all") params.set("status", statusFilter)
    const response = await fetch(`/api/public/portal/submissions?${params.toString()}`)
    const data = await response.json().catch(() => ({}))
    if (data?.ok && Array.isArray(data?.submissions)) setSubmissions(data.submissions)
  }

  async function moderate(trackingNumber: string, moderationStatus: "published" | "rejected") {
    await fetch(`/api/public/portal/submissions/${encodeURIComponent(trackingNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moderationStatus,
        publishedPublicly: moderationStatus === "published",
        moderationNotes:
          moderationStatus === "published"
            ? "Published through portal moderation."
            : "Rejected through portal moderation.",
      }),
    })
    loadSubmissions()
  }

  useEffect(() => {
    loadSubmissions()
  }, [kindFilter, statusFilter])

  const filteredSubmissions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return submissions
    return submissions.filter((item) =>
      `${item.trackingNumber} ${item.kind} ${item.title} ${item.message}`
        .toLowerCase()
        .includes(needle)
    )
  }, [query, submissions])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/public/directory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Badge variant="outline" className="border-cyan-300/24 bg-cyan-400/10 text-cyan-100">
            Moderation Workspace
          </Badge>
        </div>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              Public comment and submission moderation
            </CardTitle>
            <CardDescription className="text-white/60">
              Review submissions, filter by type or state, publish safe public comments, or reject unsafe entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tracking number, title, or message"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/32"
              />
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="All kinds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All kinds</SelectItem>
                  <SelectItem value="public_comment">Public comment</SelectItem>
                  <SelectItem value="service_complaint">Service complaint</SelectItem>
                  <SelectItem value="discrepancy_report">Discrepancy report</SelectItem>
                  <SelectItem value="service_suggestion">Service suggestion</SelectItem>
                  <SelectItem value="help_request">Help request</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredSubmissions.map((item) => (
              <div key={item.trackingNumber} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title || item.kind}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/72">
                      {item.trackingNumber} | {item.kind} | {item.moderationStatus}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => moderate(item.trackingNumber, "published")} className="rounded-[0.85rem] border border-emerald-300/20 bg-emerald-400/15 text-white hover:bg-emerald-400/25">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moderate(item.trackingNumber, "rejected")} className="rounded-[0.85rem] border-rose-300/20 bg-rose-400/10 text-white hover:bg-rose-400/20">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-white/68">{item.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
