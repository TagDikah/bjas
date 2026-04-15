"use client"

import React from "react"
import { Activity, AlertTriangle, CheckCircle2, Filter, ShieldCheck, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Item = {
  label: string
  value: number
  tone?: "default" | "warning" | "success"
}

type Props = {
  title: string
  subtitle?: string
  items: Item[]
  recommendationTitle?: string
  recommendation?: string
  compact?: boolean
}

function toneClass(tone?: Item["tone"], solid = false) {
  if (tone === "warning") return solid ? "bg-amber-500" : "border-amber-500/40 bg-amber-500/10 text-amber-700"
  if (tone === "success") return solid ? "bg-emerald-500" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
  return solid ? "bg-primary" : "border-primary/40 bg-primary/10 text-primary"
}

function toneFill(tone?: Item["tone"]) {
  if (tone === "warning") return "#f59e0b"
  if (tone === "success") return "#10b981"
  return "#2563eb"
}

function shortLabel(value: string, max = 16) {
  const text = String(value || "")
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

const viewReadings: Record<string, { title: string; body: string }> = {
  overview: {
    title: "Overview Brief",
    body: "This summary gives a quick snapshot of total activity, pressure points, and overall workflow stability before opening charts.",
  },
  department: {
    title: "Department Brief",
    body: "This view compares department load and movement so you can see where queues are growing and where balancing is needed.",
  },
  stage: {
    title: "Workflow Brief",
    body: "This reading explains stage-to-stage progression and helps identify bottlenecks before you inspect trend charts.",
  },
  risk: {
    title: "Risk Brief",
    body: "This section highlights warning indicators and high-priority segments so teams can focus attention before chart review.",
  },
}

const viewOptions = [
  {
    key: "overview",
    label: "Overview",
    eyebrow: "Snapshot",
    description: "Quick totals, attention signals, and overall operational balance.",
  },
  {
    key: "department",
    label: "Department",
    eyebrow: "Load Split",
    description: "Compare office pressure and see which department is carrying the queue.",
  },
  {
    key: "stage",
    label: "Workflow",
    eyebrow: "Flow Map",
    description: "Track movement between stages and identify where progress is slowing.",
  },
  {
    key: "risk",
    label: "Risk",
    eyebrow: "Priority",
    description: "Highlight warning segments that need immediate command attention.",
  },
] as const

export function WorkflowAnalytics({
  title,
  subtitle,
  items,
  recommendationTitle = "Recommendation",
  recommendation,
  compact = false,
}: Props) {
  const [period, setPeriod] = React.useState("14d")
  const [viewMode, setViewMode] = React.useState("overview")
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const average = items.length ? Math.round(total / items.length) : 0
  const warningCount = items.filter((item) => item.tone === "warning").length
  const successCount = items.filter((item) => item.tone === "success").length
  const topItem = [...items].sort((a, b) => b.value - a.value)[0]

  const trendData = React.useMemo(() => {
    return items.map((item, index) => ({
      label: item.label,
      value: item.value,
      trend: Math.max(0, Math.round(item.value * (0.72 + (index % 4) * 0.08))),
    }))
  }, [items])

  const healthPercent = Math.max(
    0,
    Math.min(
      100,
      total === 0 ? 0 : Math.round((successCount / Math.max(items.length, 1)) * 100 - warningCount * 6 + 65)
    )
  )

  return (
    <div className="space-y-3">
      {compact ? (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Total Events</div><div className="mt-1 text-xl font-semibold">{total}</div></CardContent></Card>
              <Card className="border-border"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Average / Segment</div><div className="mt-1 text-xl font-semibold">{average}</div></CardContent></Card>
              <Card className="border-border"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Top Segment</div><div className="mt-1 text-sm font-semibold">{shortLabel(topItem?.label || "N/A", 18)}</div></CardContent></Card>
              <Card className="border-border"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Attention Needed</div><div className="mt-1 text-xl font-semibold">{warningCount}</div></CardContent></Card>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-primary" />
                  Segment Occurrence
                </CardTitle>
              </CardHeader>
              <CardContent className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => shortLabel(String(v), 10)} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {trendData.map((entry) => (
                        <Cell key={entry.label} fill={toneFill(items.find((i) => i.label === entry.label)?.tone)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{recommendationTitle}: </span>
              {recommendation || "No recommendation available yet."}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!compact ? (
      <>
      <div className="grid gap-3 xl:grid-cols-[160px_1fr_220px]">
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(37,99,235,0.16),rgba(37,99,235,0.05))] pb-3">
            <CardTitle className="text-sm tracking-[0.16em] uppercase">Views</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/90">Secure insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-2.5">
            {viewOptions.map((option) => {
              const active = viewMode === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setViewMode(option.key)}
                  className={[
                    "w-full rounded-xl border px-3 py-3 text-left transition",
                    active
                      ? "border-primary/60 bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
                      : "border-border bg-background/60 text-foreground hover:border-primary/30 hover:bg-background",
                  ].join(" ")}
                >
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? "text-white/75" : "text-muted-foreground"}`}>
                    {option.eyebrow}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{option.label}</div>
                  <div className={`mt-1 text-[11px] leading-4 ${active ? "text-white/85" : "text-muted-foreground"}`}>
                    {option.description}
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-primary/30 bg-primary/10 p-2.5">
              <div className="text-xs font-semibold text-foreground">
                {viewReadings[viewMode]?.title || "Insights Brief"}
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {viewReadings[viewMode]?.body || "Read this short brief before reviewing chart data."}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="14d">Last 14 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="h-9 items-center justify-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Mode: {shortLabel(viewMode, 10)}
              </Badge>

              <Badge variant="outline" className="h-9 items-center justify-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Access
              </Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border">
                <CardContent className="p-2.5">
                  <div className="text-xs text-muted-foreground">Total Events</div>
                  <div className="mt-1 text-xl font-semibold">{total}</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-2.5">
                  <div className="text-xs text-muted-foreground">Average / Segment</div>
                  <div className="mt-1 text-xl font-semibold">{average}</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-2.5">
                  <div className="text-xs text-muted-foreground">Top Segment</div>
                  <div className="mt-1 text-sm font-semibold">{shortLabel(topItem?.label || "N/A", 16)}</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-2.5">
                  <div className="text-xs text-muted-foreground">Attention Needed</div>
                  <div className="mt-1 text-xl font-semibold">{warningCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-primary" />
                    Segment Occurrence
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => shortLabel(String(v), 10)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {trendData.map((entry) => (
                          <Cell key={entry.label} fill={toneFill(items.find((i) => i.label === entry.label)?.tone)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Trend Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} tickFormatter={(v) => shortLabel(String(v), 10)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="trend" stroke="#0ea5e9" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Health</CardTitle>
            <CardDescription>Secure workflow stability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <div
                className="grid h-24 w-24 place-items-center rounded-full border border-border"
                style={{
                  background: `conic-gradient(#2563eb ${healthPercent}%, #e5e7eb ${healthPercent}% 100%)`,
                }}
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-card">
                  <div className="text-lg font-semibold">{healthPercent}%</div>
                </div>
              </div>
            </div>

            <div className="max-h-44 space-y-1.5 overflow-auto pr-1">
              {items.map((item) => (
                <div key={item.label} className={`rounded-md border px-2 py-1.5 text-xs ${toneClass(item.tone)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{shortLabel(item.label, 22)}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                {warningCount > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                {warningCount > 0 ? "Priority Review Needed" : "Workflow Stable"}
              </div>
              <div className="mt-1">{warningCount > 0 ? "Some segments are in warning tone. Prioritize those queues first." : "No immediate risk indicators in this snapshot."}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{recommendationTitle}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs leading-5 text-muted-foreground">
            {recommendation || "No recommendation available yet."}
          </p>
        </CardContent>
      </Card>
      </>
      ) : null}
    </div>
  )
}
