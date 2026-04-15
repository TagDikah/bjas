"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, MapPinned, ShieldAlert, Siren } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { mergePublicCases, toPublicCases, type PublicCaseView } from "@/lib/public-case-tracking"

function categorize(title: string) {
  const value = String(title || "").toLowerCase()
  if (value.includes("rob")) return "Robbery"
  if (value.includes("theft")) return "Theft"
  if (value.includes("fraud")) return "Fraud"
  if (value.includes("assault")) return "Assault"
  return "General crime"
}

export default function PublicSafetyPage() {
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
  const byDepartment = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of merged) map.set(item.department, (map.get(item.department) || 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [merged])
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of merged) {
      const label = categorize(item.title)
      map.set(label, (map.get(label) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [merged])
  const maxDepartment = Math.max(...byDepartment.map(([, count]) => count), 1)

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
            Safety Intelligence
          </Badge>
        </div>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Public safety intelligence from anonymized case movement.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/68 md:text-base">
                This page uses public-safe and aggregated case information to show broad location and offense signals without publishing private addresses or protected identities.
              </p>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-cyan-200" />
                District and office concentration
              </CardTitle>
              <CardDescription className="text-white/60">
                Public-safe concentration based on visible office or department location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {byDepartment.map(([department, count]) => (
                <div key={department} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{department}</div>
                    <div className="text-sm font-semibold text-cyan-100">{count}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Siren className="h-5 w-5 text-cyan-200" />
                Offense category signals
              </CardTitle>
              <CardDescription className="text-white/60">
                High-level category patterns from public-safe case titles and summaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {byCategory.map(([label, count]) => (
                <div key={label} className="rounded-[1rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-sm font-semibold text-cyan-100">{count}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardHeader>
            <CardTitle>District heat view</CardTitle>
            <CardDescription className="text-white/60">
              A public-safe heatmap-style view based on visible department concentration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {byDepartment.map(([department, count]) => {
                const intensity = Math.max(0.2, count / maxDepartment)
                return (
                  <div
                    key={department}
                    className="rounded-[1rem] border border-white/10 p-4"
                    style={{
                      background: `linear-gradient(135deg, rgba(34,211,238,${0.15 + intensity * 0.35}), rgba(99,102,241,${0.08 + intensity * 0.2}))`,
                    }}
                  >
                    <div className="text-sm font-semibold text-white">{department}</div>
                    <div className="mt-3 text-3xl font-semibold text-white">{count}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-100/76">Heat intensity</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] text-white shadow-[0_20px_60px_rgba(4,10,28,0.32)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-200" />
              Safety publication principle
            </CardTitle>
            <CardDescription className="text-white/60">
              Safety dashboards should stay aggregated and should never expose private home addresses, witness details, or live operational intelligence.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
