"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, FileSearch, MessageSquareWarning, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  status: string
  policeSections?: {
    sectionA?: {
      crimeNo?: string
      aggrievedFullName?: string
      reportingPersonFullName?: string
      allegedCrime?: string
      whereCommitted?: string
      whereCommittedSpecify?: string
      suspectDetails?: string
    }
    sectionC?: {
      latestClarificationAt?: string
      latestClarificationByName?: string
      latestClarificationStatement?: string
      latestClarificationResponseAt?: string
      latestClarificationResponseByName?: string
      latestClarificationResponseText?: string
      clarificationRequests?: Array<{
        id: string
        statement?: string
        requestedAt?: string
        requestedByName?: string
      }>
    }
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ")
}

function statusClass(status: string) {
  if (status === "pending_commissioner") {
    return "border-cyan-200/24 bg-cyan-400/12 text-cyan-100"
  }
  if (status === "commissioner_clarification") {
    return "border-pink-200/24 bg-pink-400/12 text-pink-100"
  }
  if (status === "rejected") {
    return "border-rose-200/24 bg-rose-400/12 text-rose-100"
  }
  if (status === "approved" || status === "submitted_to_dpp") {
    return "border-amber-200/24 bg-amber-400/12 text-amber-100"
  }
  return "border-white/12 bg-white/8 text-white"
}

export default function CommissionerCasesClient() {
  const sp = useSearchParams()
  const tab = sp.get("tab") || "inbox"
  const [q, setQ] = React.useState("")
  const store = useStore() as any
  const getAllCases = store.getAllCases ?? (() => [])
  const all = (getAllCases() ?? []) as AppCase[]

  const hasClarificationThread = (c: AppCase) =>
    c.status === "commissioner_clarification" ||
    Boolean(c?.policeSections?.sectionC?.latestClarificationResponseAt)

  const hasNewClarificationReply = (c: AppCase) => {
    const sC = c?.policeSections?.sectionC || {}
    if (!sC.latestClarificationResponseAt) return false
    if (!sC.latestClarificationAt) return true
    return new Date(sC.latestClarificationResponseAt).getTime() >= new Date(sC.latestClarificationAt).getTime()
  }

  const byTab = all.filter((c: AppCase) => {
    if (tab === "inbox") return c.status === "pending_commissioner"
    if (tab === "clarifications") return hasClarificationThread(c)
    if (tab === "approved") return c.status === "approved"
    if (tab === "rejected") return c.status === "rejected"
    return true
  })

  const filtered = byTab.filter((c: AppCase) => {
    const a = c.policeSections?.sectionA
    const hay = [
      c.caseNumber,
      c.caseId,
      a?.crimeNo,
      a?.aggrievedFullName,
      a?.reportingPersonFullName,
      a?.allegedCrime,
      a?.whereCommitted,
      a?.whereCommittedSpecify,
      a?.suspectDetails,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(q.toLowerCase())
  })

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Case Reviews">
      <div className="space-y-4">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_18px_44px_rgba(4,10,28,0.22)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold text-white">Search Reviews</div>
                <div className="text-sm text-white/55">Find packets by case number, crime number, complainant, suspect, or location.</div>
              </div>
            </div>

            <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 p-2">
              <div className="flex items-center gap-3 rounded-[0.9rem] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(84,199,236,0.12),rgba(91,140,255,0.08))] px-3 py-2">
                <Search className="h-4 w-4 text-cyan-100/80" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by case, crime no, complainant, suspect..."
                  className="border-0 bg-transparent px-0 text-white placeholder:text-white/38 focus-visible:ring-0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {filtered.map((c: AppCase) => {
            const a = c.policeSections?.sectionA
            const sC = c.policeSections?.sectionC
            const latestRequest = Array.isArray(sC?.clarificationRequests) ? sC?.clarificationRequests?.[0] : null
            const showClarificationMessage = tab === "clarifications" || hasClarificationThread(c)

            return (
              <Card key={c.caseId} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(18,28,55,0.95),rgba(11,19,39,0.98))] shadow-[0_18px_40px_rgba(4,10,28,0.2)] transition hover:-translate-y-0.5 hover:border-white/18">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-mono text-[11px] text-cyan-200/82">{c.caseNumber || c.caseId}</div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusClass(c.status)}`}>
                          {statusLabel(c.status)}
                        </span>
                        {hasNewClarificationReply(c) ? (
                          <span className="rounded-full border border-pink-200/24 bg-pink-400/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-pink-100">
                            New Message
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Crime No</div>
                          <div className="mt-1 text-sm font-medium text-white">{a?.crimeNo || "Not saved"}</div>
                        </div>
                        <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Alleged Crime</div>
                          <div className="mt-1 text-sm font-medium text-white">{a?.allegedCrime || "Unknown"}</div>
                        </div>
                        <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Location</div>
                          <div className="mt-1 text-sm font-medium text-white">{a?.whereCommittedSpecify || a?.whereCommitted || "Unknown"}</div>
                        </div>
                      </div>

                    {showClarificationMessage ? (
                      <div className="mt-3 rounded-[1rem] border border-pink-200/18 bg-[linear-gradient(135deg,rgba(255,94,168,0.12),rgba(111,109,255,0.08))] px-3 py-3 text-sm text-white/76">
                        <div className="flex items-center gap-2 text-pink-100">
                          <MessageSquareWarning className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Clarification Box</span>
                        </div>
                        <div className="mt-2">
                          Request:{" "}
                          {String(
                            latestRequest?.statement ||
                              sC?.latestClarificationStatement ||
                              "No clarification request text."
                          )}
                        </div>
                        {sC?.latestClarificationResponseText ? (
                          <div className="mt-2">
                            Response: {String(sC.latestClarificationResponseText)}
                          </div>
                        ) : (
                          <div className="mt-2 text-white/52">Awaiting investigator response.</div>
                        )}
                      </div>
                    ) : null}
                  </div>

                    <div className="flex min-w-[220px] flex-col gap-3 xl:w-[220px]">
                      <div className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(84,199,236,0.12),rgba(91,140,255,0.1))] p-3">
                        <div className="flex items-center gap-2 text-cyan-100">
                          <FileSearch className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Packet Action</span>
                        </div>
                        <div className="mt-2 text-sm text-white/68">Open the commissioner review packet and continue decision work.</div>
                      </div>

                      <Button asChild className="h-10 justify-between rounded-[0.95rem] bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-4 !text-white hover:brightness-110 hover:!text-white">
                        <Link href={`/commissioner/review/${c.caseId}`}>
                          <span>Open Packet</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/55">
              No cases found.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
