"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, BadgeCheck, Gavel, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { mergePublicCases, toPublicCases, type PublicCaseView } from "@/lib/public-case-tracking"

function isOutcomeCase(item: PublicCaseView) {
  const status = String(item.status || "").toLowerCase()
  return status.includes("court") || status.includes("judgment") || status.includes("sentenced") || status.includes("complete") || status.includes("closed") || status.includes("delivered")
}

export default function PublicOutcomesPage() {
  const storeCases = useStore((s: any) => (Array.isArray(s.cases) ? s.cases : []))
  const [publicCases, setPublicCases] = useState<PublicCaseView[]>([])

  useEffect(() => {
    fetch("/api/public/cases")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.publicCases)) setPublicCases(data.publicCases)
      })
      .catch(() => {})
  }, [])

  const merged = useMemo(() => mergePublicCases(publicCases, toPublicCases(storeCases)), [publicCases, storeCases])
  const outcomes = useMemo(() => merged.filter(isOutcomeCase).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 12), [merged])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(84,199,236,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(111,109,255,0.12),transparent_24%),linear-gradient(180deg,#06111f_0%,#09172c_42%,#071426_100%)] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/public">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Badge variant="outline" className="border-cyan-300/24 bg-cyan-400/10 text-cyan-100">
            Court Outcomes Archive
          </Badge>
        </div>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Public-facing court outcomes and final movement.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                This page groups public-safe cases that have entered court-oriented states, delivery to court, judgment, closure, or visible completion movement.
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {outcomes.length === 0 ? (
            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)] md:col-span-2 xl:col-span-3">
              <CardContent className="p-6 text-sm text-white/68">No public outcome-oriented cases are available yet.</CardContent>
            </Card>
          ) : (
            outcomes.map((item) => (
              <Link
                key={`${item.caseId}-${item.updatedAt}`}
                href={`/public/cases/${item.caseId}`}
                className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] p-5 text-white shadow-[0_20px_60px_rgba(4,10,28,0.24)] transition hover:border-cyan-300/24 hover:bg-[linear-gradient(180deg,rgba(19,31,58,0.97),rgba(12,20,42,0.99))] hover:no-underline"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{item.caseNumber}</div>
                  <Badge variant="outline" className="border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
                    {item.phaseLabel}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-base font-semibold text-white">
                  <Gavel className="h-4 w-4 text-cyan-100" />
                  {item.title && item.title !== "UNKNOWN" ? item.title : "Public outcome record"}
                </div>
                <div className="mt-3 space-y-1 text-sm leading-6 text-white/68">
                  <div>Status: {item.statusLabel}</div>
                  <div>Location: {item.department}</div>
                  <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
                </div>
              </Link>
            ))
          )}
        </section>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-cyan-200" />
              Public archive direction
            </CardTitle>
            <CardDescription className="text-white/60">
              The full portal can later publish judgment summaries, appeal outcomes, and certified public copies where lawful.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-[0.9rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] !text-white hover:brightness-110 hover:!text-white">
              <Link href="/public/cases">
                <Search className="mr-2 h-4 w-4" />
                Search public cases
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
