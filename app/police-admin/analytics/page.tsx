"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Shield, Users, Activity, FileText, TrendingUp, UserCheck, AlertCircle } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useStore } from "@/lib/store"
import type { User, CaseData } from "@/lib/blockchain"

const ROLE_COLORS = [
  "#54c7ec",
  "#5a8cff",
  "#6f6dff",
  "#cb5df0",
  "#ff7c87",
  "#ff8b5b",
  "#7ad7a7",
  "#ffd166",
]

const STATUS_COLORS = ["#54c7ec", "#2d3d63"]

function Metric({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  hint: string
  icon: typeof Shield
  accent: string
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.96),rgba(11,20,40,0.98))] p-4 shadow-[0_16px_34px_rgba(3,8,20,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          <div className="mt-1 text-[12px] text-white/56">{hint}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-[0.9rem] ${accent}`}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
      </div>
    </div>
  )
}

function formatRoleLabel(role: string) {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function darkenHex(hex: string, amount = 0.34) {
  const normalized = hex.replace("#", "")
  const num = Number.parseInt(normalized, 16)
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)))
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)))
  const b = Math.max(0, Math.floor((num & 255) * (1 - amount)))
  return `rgb(${r}, ${g}, ${b})`
}

export default function PoliceAdminAnalyticsPage() {
  const store = useStore() as any
  const [overview, setOverview] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleCounts: {} as Record<string, number>,
    users: [] as User[],
  })

  const users: User[] = useMemo(() => {
    if (overview.users.length > 0) return overview.users
    if (Array.isArray(store.users)) return store.users as User[]
    if (typeof store.getUsers === "function") {
      const result = store.getUsers()
      return Array.isArray(result) ? (result as User[]) : []
    }
    return []
  }, [overview.users, store])

  const cases: CaseData[] = useMemo(() => {
    if (typeof store.getAllCases === "function") {
      const result = store.getAllCases()
      return Array.isArray(result) ? (result as CaseData[]) : []
    }
    if (Array.isArray(store.cases)) return store.cases as CaseData[]
    return []
  }, [store])

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok) {
          setOverview({
            totalUsers: data.totalUsers ?? 0,
            activeUsers: data.activeUsers ?? 0,
            inactiveUsers: data.inactiveUsers ?? 0,
            roleCounts: data.roleCounts ?? {},
            users: data.users ?? [],
          })
        }
      })
      .catch(() => {})
  }, [])

  const policeUsers = useMemo(() => {
    return users.filter(
      (u: User) =>
        u.role === "police" ||
        u.role === "commissioner" ||
        u.role === "police_admin" ||
        u.role === "investigation" ||
        u.role === "police_officer"
    )
  }, [users])

  const pendingReview = useMemo(
    () => cases.filter((c: CaseData) => c.status === "pending_commissioner").length,
    [cases]
  )

  const roleEntries = useMemo(() => {
    const source = Object.entries(overview.roleCounts ?? {}).filter(([, count]) => Number(count) > 0)
    return source.sort((a, b) => Number(b[1]) - Number(a[1]))
  }, [overview.roleCounts])

  const topRoleEntries = useMemo(() => roleEntries.slice(0, 8), [roleEntries])
  const roleChartData = useMemo(
    () =>
      topRoleEntries.map(([role, count], index) => ({
        role,
        label: formatRoleLabel(role),
        value: Number(count),
        fill: ROLE_COLORS[index % ROLE_COLORS.length],
        depthFill: darkenHex(ROLE_COLORS[index % ROLE_COLORS.length]),
      })),
    [topRoleEntries]
  )
  const statusChartData = useMemo(
    () => [
      { name: "Active", value: overview.activeUsers, fill: STATUS_COLORS[0], depthFill: darkenHex(STATUS_COLORS[0]) },
      { name: "Inactive", value: overview.inactiveUsers, fill: STATUS_COLORS[1], depthFill: darkenHex(STATUS_COLORS[1], 0.16) },
    ],
    [overview.activeUsers, overview.inactiveUsers]
  )

  const maxRoleCount = roleEntries.length > 0 ? Math.max(...roleEntries.map(([, count]) => Number(count))) : 1
  const activeRatio = overview.totalUsers > 0 ? Math.round((overview.activeUsers / overview.totalUsers) * 100) : 0
  const policeRoleCount = useMemo(
    () =>
      roleEntries.reduce((total, [role, count]) => {
        if (
          role === "police" ||
          role === "commissioner" ||
          role === "police_admin" ||
          role === "investigation" ||
          role === "police_officer"
        ) {
          return total + Number(count)
        }
        return total
      }, 0),
    [roleEntries]
  )
  const topRole = roleEntries[0]

  return (
    <DashboardLayout allowedRoles={["police_admin", "admin"]} title="Police Admin Analytics">
      <div className="space-y-6">
        <div className="rounded-[1.65rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.98),rgba(14,22,43,0.98))] px-5 py-5 shadow-[0_18px_48px_rgba(5,11,28,0.3)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Police Admin Analytics</h1>
              <p className="mt-1 text-sm text-cyan-100/52">
                Monitor staffing strength, account activity, and case workload across the police workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Police Coverage</div>
                <div className="mt-1 text-xl font-semibold text-white">{policeRoleCount}</div>
                <div className="text-xs text-white/52">Accounts inside police-facing roles.</div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Largest Group</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {topRole ? formatRoleLabel(topRole[0]) : "None"}
                </div>
                <div className="text-xs text-white/52">
                  {topRole ? `${topRole[1]} active account(s)` : "No data yet"}
                </div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">Workspace Health</div>
                <div className="mt-1 text-xl font-semibold text-white">{activeRatio}%</div>
                <div className="text-xs text-white/52">Current account activity rate.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Police Users" value={policeUsers.length} hint="All police workspace accounts." icon={Users} accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]" />
          <Metric label="Active Users" value={overview.activeUsers} hint="Accounts currently active." icon={Shield} accent="bg-[linear-gradient(135deg,#6f6dff,#cb5df0)]" />
          <Metric label="Case Load" value={cases.length} hint="All recorded department cases." icon={FileText} accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]" />
          <Metric label="Pending Review" value={pendingReview} hint="Cases waiting for commissioner review." icon={Activity} accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-white">Role Distribution</CardTitle>
                <Badge className="border-0 bg-white/8 text-white/80 hover:bg-white/8">
                  Top active groups
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topRoleEntries.length === 0 ? (
                <div className="text-sm text-white/56">No analytics data available yet.</div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-3">
                    {topRoleEntries.map(([role, count], index) => {
                      const width = `${Math.max(16, (Number(count) / maxRoleCount) * 100)}%`
                      return (
                        <div key={role} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-[12px] text-white">
                            <div className="flex items-center gap-3">
                              <div className="grid h-6 w-6 place-items-center rounded-full bg-white/8 text-[10px] font-semibold text-cyan-100">
                                {index + 1}
                              </div>
                              <span>{formatRoleLabel(role)}</span>
                            </div>
                            <span className="text-white/68">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/8">
                            <div
                              className="h-2 rounded-full bg-[linear-gradient(90deg,#54c7ec,#5a8cff,#6f6dff)]"
                              style={{ width }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid gap-2.5">
                    <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-white">
                        <TrendingUp className="h-4 w-4 text-cyan-100" />
                        <span className="text-[12px] font-medium">Trend Focus</span>
                      </div>
                      <div className="mt-2 text-xl font-semibold text-white">
                        {topRole ? topRole[1] : 0}
                      </div>
                      <div className="mt-1 text-[12px] text-white/56">
                        {topRole
                          ? `${formatRoleLabel(topRole[0])} is currently the largest active role group.`
                          : "Role trends will appear here once data is available."}
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-white">
                        <UserCheck className="h-4 w-4 text-cyan-100" />
                        <span className="text-[12px] font-medium">Coverage Mix</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-2.5 rounded-full bg-[linear-gradient(90deg,#54c7ec,#5a8cff,#6f6dff)]"
                          style={{
                            width: `${overview.totalUsers > 0 ? Math.max(8, (policeRoleCount / overview.totalUsers) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 text-[12px] text-white/56">
                        Police-facing roles make up {policeRoleCount} of {overview.totalUsers} total accounts.
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-white">
                        <AlertCircle className="h-4 w-4 text-cyan-100" />
                        <span className="text-[12px] font-medium">Action Note</span>
                      </div>
                      <div className="mt-2 text-[12px] text-white/72">
                        Prioritize support for the largest role groups, then clear pending commissioner review to improve workflow speed.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-4 w-4 text-cyan-100" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/72">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Active Ratio</div>
                <div className="mt-1.5 text-xl font-semibold text-white">{activeRatio}%</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#54c7ec,#5a8cff)]"
                    style={{ width: `${activeRatio}%` }}
                  />
                </div>
                <div className="mt-1 text-[12px] text-white/56">Percentage of active accounts in the workspace.</div>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Review Queue</div>
                <div className="mt-1.5 text-xl font-semibold text-white">{pendingReview}</div>
                <div className="mt-1 text-[12px] text-white/56">Cases currently waiting for commissioner action.</div>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Inactive Accounts</div>
                <div className="mt-1.5 text-xl font-semibold text-white">{overview.inactiveUsers}</div>
                <div className="mt-1 text-[12px] text-white/56">Accounts that may need review or reactivation.</div>
              </div>
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Recommendation</div>
                <div className="mt-1.5 text-[12px] text-white">
                  Keep staffing balanced across the largest groups and use commissioner review clearance as the main workflow target.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-white">Account Health</CardTitle>
                <Badge className="border-0 bg-white/8 text-white/80 hover:bg-white/8">
                  3D pie
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                <div className="h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="activePie" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="#7be1ff" />
                          <stop offset="100%" stopColor="#5a8cff" />
                        </linearGradient>
                        <linearGradient id="inactivePie" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="#34466f" />
                          <stop offset="100%" stopColor="#202d4a" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        innerRadius={44}
                        outerRadius={72}
                        startAngle={220}
                        endAngle={-140}
                        cy="54%"
                      >
                        {statusChartData.map((entry) => (
                          <Cell key={`${entry.name}-depth`} fill={entry.depthFill} />
                        ))}
                      </Pie>
                      <Pie
                        data={statusChartData.map((entry, index) => ({
                          ...entry,
                          topFill: index === 0 ? "url(#activePie)" : "url(#inactivePie)",
                        }))}
                        dataKey="value"
                        innerRadius={44}
                        outerRadius={72}
                        startAngle={220}
                        endAngle={-140}
                        cy="48%"
                        paddingAngle={3}
                        stroke="rgba(255,255,255,0.08)"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={index === 0 ? "url(#activePie)" : "url(#inactivePie)"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,18,39,0.96)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "14px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Active Accounts</div>
                    <div className="mt-1.5 text-xl font-semibold text-white">{overview.activeUsers}</div>
                    <div className="mt-1 text-[12px] text-white/56">Users currently active across the workspace.</div>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Inactive Accounts</div>
                    <div className="mt-1.5 text-xl font-semibold text-white">{overview.inactiveUsers}</div>
                    <div className="mt-1 text-[12px] text-white/56">Accounts that may need review or reactivation.</div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[0.95rem] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(84,199,236,0.12),rgba(91,140,255,0.08))] p-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/16">
                      <UserCheck className="h-3.5 w-3.5 text-cyan-100" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-white">Workspace stability</div>
                      <div className="text-[12px] text-white/58">{activeRatio}% of accounts are currently active.</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-white">Top Role Bar Chart</CardTitle>
                <Badge className="border-0 bg-white/8 text-white/80 hover:bg-white/8">
                  Live roles
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleChartData} margin={{ top: 8, right: 12, left: -18, bottom: 8 }}>
                    <defs>
                      <linearGradient id="roleBarGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#54c7ec" />
                        <stop offset="45%" stopColor="#5a8cff" />
                        <stop offset="100%" stopColor="#6f6dff" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.56)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{
                        background: "rgba(10,18,39,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "14px",
                        color: "#fff",
                      }}
                      formatter={(value: number) => [value, "Accounts"]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 4, 4]}
                      fill="url(#roleBarGradient)"
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
