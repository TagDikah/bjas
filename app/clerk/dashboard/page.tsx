"use client"

import Link from "next/link"
import { useMemo } from "react"
import { FileText, Clock, CheckCircle, Calendar, ArrowRight, BarChart3, TrendingUp } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import type { CaseData } from "@/lib/blockchain"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type StatusKey =
  | "draft"
  | "pending_prosecutor"
  | "returned_to_police"
  | "pending_commissioner"
  | "approved"
  | "rejected"
  | "assigned_to_court"
  | "assigned_to_judge"
  | "in_progress"
  | "completed"

function safeDate(v: unknown): Date | null {
  const d = new Date(v as any)
  return Number.isNaN(d.getTime()) ? null : d
}

function monthKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, (m ?? 1) - 1, 1)
  return d.toLocaleString(undefined, { month: "short", year: "numeric" })
}

export default function ClerkDashboardPage() {
  const store = useStore()
  const currentUser = store?.currentUser
  const getAllCases = store?.getAllCases

  const allCases: CaseData[] = useMemo(() => {
    const cases = getAllCases?.()
    return Array.isArray(cases) ? (cases as CaseData[]) : []
  }, [getAllCases])

  const myCases = useMemo((): CaseData[] => {
    if (!currentUser?.id) return []
    return allCases.filter(
      (c: CaseData) => c?.courtRegistry?.assignedClerkId === currentUser.id
    )
  }, [allCases, currentUser?.id])

  const activeCases = useMemo((): CaseData[] => {
    return myCases.filter(
      (c: CaseData) =>
        c.status === "assigned_to_judge" || c.status === "in_progress"
    )
  }, [myCases])

  const completedCases = useMemo((): CaseData[] => {
    return myCases.filter((c: CaseData) => c.status === "completed")
  }, [myCases])

  const upcomingHearings = useMemo((): CaseData[] => {
    return myCases.filter((c: CaseData) => {
      if (c.status === "completed") return false

      const dates = (c.hearingDates ?? [])
        .map((x: unknown) => safeDate(x))
        .filter((d: Date | null): d is Date => !!d)

      if (!dates.length) return false

      const now = new Date()
      return dates.some((d: Date) => d.getTime() >= now.getTime())
    })
  }, [myCases])

  const recentCases = useMemo((): CaseData[] => {
    return [...activeCases]
      .sort((a: CaseData, b: CaseData) => {
        const da = safeDate(a.dateOpened)?.getTime() ?? 0
        const db = safeDate(b.dateOpened)?.getTime() ?? 0
        return db - da
      })
      .slice(0, 4)
  }, [activeCases])

  const statusCounts = useMemo((): Array<{ status: string; count: number }> => {
    const map: Record<string, number> = {}
    for (const c of myCases) {
      const k = String(c.status ?? "unknown")
      map[k] = (map[k] ?? 0) + 1
    }
    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
  }, [myCases])

  const hearingsByMonth = useMemo((): Array<{ month: string; hearings: number }> => {
    const map: Record<string, number> = {}

    for (const c of myCases) {
      const dates = (c.hearingDates ?? [])
        .map((x: unknown) => safeDate(x))
        .filter((d: Date | null): d is Date => !!d)

      for (const d of dates) {
        const k = monthKey(d)
        map[k] = (map[k] ?? 0) + 1
      }
    }

    const keys = Object.keys(map).sort()
    return keys.map((k) => ({ month: formatMonthLabel(k), hearings: map[k] }))
  }, [myCases])

  const turnaroundMetrics = useMemo(() => {
    let sumDays = 0
    let n = 0
    let fastest: number | null = null
    let slowest: number | null = null

    for (const c of completedCases) {
      const opened = safeDate(c.dateOpened)
      if (!opened) continue

      const hearingDates = (c.hearingDates ?? [])
        .map((x: unknown) => safeDate(x))
        .filter((d: Date | null): d is Date => !!d)
        .sort((a: Date, b: Date) => a.getTime() - b.getTime())

      const end = hearingDates.length ? hearingDates[hearingDates.length - 1] : null
      if (!end) continue

      const days = Math.max(
        0,
        Math.round((end.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24))
      )

      sumDays += days
      n += 1
      fastest = fastest === null ? days : Math.min(fastest, days)
      slowest = slowest === null ? days : Math.max(slowest, days)
    }

    const avg = n ? Math.round(sumDays / n) : 0
    return {
      avgDays: avg,
      fastestDays: fastest ?? 0,
      slowestDays: slowest ?? 0,
      measured: n,
    }
  }, [completedCases])

  const pieData = useMemo((): Array<{ name: string; value: number }> => {
    const top = statusCounts.slice(0, 6)
    const rest = statusCounts.slice(6).reduce((acc, r) => acc + r.count, 0)

    const data = top.map((r) => ({ name: r.status, value: r.count }))
    if (rest > 0) data.push({ name: "Other", value: rest })
    return data
  }, [statusCounts])

  const pieFills = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted-foreground))",
    "hsl(var(--foreground))",
    "hsl(var(--border))",
    "hsl(var(--ring))",
  ]

  return (
    <DashboardLayout allowedRoles={["clerk"]} title="Clerk Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}
            </h2>
            <p className="text-muted-foreground">
              Track assigned cases, hearings, and your clerk workload analytics.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/clerk/dashboardsessions">
              <Button className="bg-primary !text-white hover:bg-primary/90 [&_svg]:!text-white">
                View Session List
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/clerk/cases">
              <Button variant="outline">
                My Cases
                <FileText className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Assigned" value={myCases.length} description="Cases assigned to you" icon={FileText} />
          <StatsCard title="Active Cases" value={activeCases.length} description="Currently in progress" icon={Clock} />
          <StatsCard title="Upcoming Hearings" value={upcomingHearings.length} description="Scheduled sessions" icon={Calendar} />
          <StatsCard title="Completed" value={completedCases.length} description="Cases resolved" icon={CheckCircle} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                Case Status Distribution (My Workload)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {statusCounts.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No workload data yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Status Mix
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={pieFills[i % pieFills.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No status mix yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Hearings Scheduled by Month (My Cases)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              {hearingsByMonth.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hearingsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hearings" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No hearing schedule data yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Turnaround (Completed)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-sm text-muted-foreground">Average days</div>
                <div className="text-2xl font-bold text-foreground">{turnaroundMetrics.avgDays}</div>
                <div className="text-xs text-muted-foreground">
                  Based on {turnaroundMetrics.measured} measured cases
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-sm text-muted-foreground">Fastest</div>
                  <div className="text-xl font-semibold text-foreground">{turnaroundMetrics.fastestDays}d</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-sm text-muted-foreground">Slowest</div>
                  <div className="text-xl font-semibold text-foreground">{turnaroundMetrics.slowestDays}d</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: turnaround uses <span className="font-medium">last hearing date</span> as a completion milestone.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Active Cases</h3>
              <p className="text-sm text-muted-foreground">Cases you are currently supporting</p>
            </div>

            {activeCases.length > 4 && (
              <Link href="/clerk/cases">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  View All ({activeCases.length})
                </Button>
              </Link>
            )}
          </div>

          {recentCases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentCases.map((caseData: CaseData) => (
                <Link key={caseData.caseId} href={`/clerk/cases/${caseData.caseId}`}>
                  <CaseCard caseData={caseData} onClick={() => {}} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h4 className="mt-4 text-lg font-medium text-foreground">No active cases</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                You don&apos;t have any assigned cases at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
