"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  Home,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { useStore } from "@/lib/store"
import type { User, CaseData } from "@/lib/blockchain"

type NavItem = {
  label: string
  icon: typeof Home
  active?: boolean
  onClick?: () => void
}

function MetricCard({
  label,
  value,
  hint,
  accent,
  icon: Icon,
}: {
  label: string
  value: number
  hint: string
  accent: string
  icon: typeof Shield
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

export default function PoliceAdminDashboard() {
  const router = useRouter()
  const store = useStore() as any
  const currentUser = useStore((s: any) => s.currentUser) as User | null
  const logout = useStore((s: any) => s.logout) as (() => void) | undefined

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

  const policeUsers: User[] = useMemo(() => {
    return users.filter(
      (u: User) =>
        u.role === "police" ||
        u.role === "commissioner" ||
        u.role === "police_admin" ||
        u.role === "investigation"
    )
  }, [users])

  const cases: CaseData[] = useMemo(() => {
    if (typeof store.getAllCases === "function") {
      const result = store.getAllCases()
      return Array.isArray(result) ? (result as CaseData[]) : []
    }
    if (Array.isArray(store.cases)) return store.cases as CaseData[]
    return []
  }, [store])

  const stats = useMemo(() => {
    const totalOfficers = policeUsers.filter(
      (u: User) => u.role === "police" || u.role === "investigation"
    ).length
    const commissioners = policeUsers.filter((u: User) => u.role === "commissioner").length
    const totalCases = cases.length
    const pendingCases = cases.filter((c: CaseData) => c.status === "pending_commissioner").length
    return { totalOfficers, commissioners, totalCases, pendingCases }
  }, [policeUsers, cases])

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

  const navItems: NavItem[] = [
    { label: "Home", icon: Home, active: true },
    { label: "Register", icon: UserPlus, onClick: () => router.push("/police-admin/register") },
    { label: "Staff", icon: Users, onClick: () => router.push("/police-admin/staff") },
    { label: "Activity", icon: Activity, onClick: () => router.push("/police-admin/activity") },
    { label: "Analytics", icon: BarChart3, onClick: () => router.push("/police-admin/analytics") },
  ]

  return (
    <DashboardLayout allowedRoles={["police_admin"]} title="Police Admin Dashboard" hideWorkspaceShell>
      <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,25,49,0.98),rgba(9,16,31,0.98))] p-2 shadow-[0_18px_50px_rgba(6,12,28,0.28)]">
        <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col items-center rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,22,43,0.98),rgba(8,14,29,0.98))] px-2 py-3 lg:sticky lg:top-6">
            <div className="mb-4 flex w-full flex-col items-center gap-2">
              <div className="grid h-12 w-12 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                      item.active
                        ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/84"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span className="text-[10px] leading-3 font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-auto w-full space-y-2 pt-4">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] px-1 text-center text-white/84 transition hover:brightness-110"
              >
                <Settings className="h-4 w-4" />
                <span className="text-[10px] leading-3 font-medium">Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logout?.()
                  router.replace("/")
                }}
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-fuchsia-200/18 bg-[linear-gradient(135deg,rgba(111,109,255,0.2),rgba(203,93,240,0.16))] px-1 text-center text-white transition hover:brightness-110"
              >
                <div className="grid h-4 w-4 place-items-center text-[9px] font-semibold leading-none text-white">
                  {String(currentUser?.name || "PA")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="text-[10px] leading-3 font-medium">Logout</div>
              </button>
            </div>
          </aside>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-4 rounded-[1.65rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.98),rgba(14,22,43,0.98))] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-2xl font-semibold text-white">Police Administration Control Center</div>
                <div className="mt-1 text-sm text-cyan-100/52">
                  Oversee staff registration, operational activity, commissioner review, and case movement.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button className="h-11 rounded-[1rem] border border-fuchsia-200/20 bg-[linear-gradient(135deg,#6f6dff,#cb5df0)] px-5 !text-white shadow-[0_16px_34px_rgba(88,74,210,0.32)] hover:scale-[1.01] hover:brightness-110 hover:!text-white" onClick={() => router.push("/police-admin/register")}>
                  <UserPlus className="h-4 w-4" />
                  Add Staff
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95),rgba(10,18,39,0.97))] p-4 shadow-[0_16px_44px_rgba(4,10,28,0.26)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full border-0 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] px-4 py-2 text-cyan-100 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))]">Overview</Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-white/78 hover:bg-white/6">Staffing</Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-white/78 hover:bg-white/6">Cases</Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-white/78 hover:bg-white/6">Activity</Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-white/78 hover:bg-white/6">Reports</Badge>
                </div>

                <div className="flex w-full gap-3 xl:w-auto">
                  <Button variant="outline" className="h-11 rounded-full border-cyan-300/24 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(91,140,255,0.16))] px-4 !text-white shadow-[0_14px_30px_rgba(84,199,236,0.14)] hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.28),rgba(91,140,255,0.22))] hover:!text-white" onClick={() => router.push("/police-admin/activity")}>
                    Open Log
                  </Button>
                  <div className="relative min-w-0 flex-1 xl:w-72">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/42" />
                    <Input readOnly value="" placeholder="Search workspace" className="h-11 rounded-full border-white/10 bg-white/6 pl-10 text-white placeholder:text-white/36" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[1.18fr_0.94fr_0.88fr]">
                <div className="grid gap-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.96),rgba(11,20,40,0.98))] p-4 shadow-[0_16px_34px_rgba(3,8,20,0.22)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xl font-semibold text-white">Overview</div>
                        <div className="mt-1.5 text-[13px] text-white/58">
                          Use the left menu to open dedicated pages for registration, staff management, activity logs, and analytics.
                        </div>
                      </div>
                      <Badge className="border-0 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] px-3 py-1.5 text-[11px] text-cyan-100 hover:bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))]">Home</Badge>
                    </div>

                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        label="Police Officers"
                        value={stats.totalOfficers}
                        hint="Active officers and investigators"
                        accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]"
                        icon={Shield}
                      />
                      <MetricCard
                        label="Commissioners"
                        value={stats.commissioners}
                        hint="Department leadership accounts"
                        accent="bg-[linear-gradient(135deg,#6f6dff,#cb5df0)]"
                        icon={Users}
                      />
                      <MetricCard
                        label="Total Cases"
                        value={stats.totalCases}
                        hint="All recorded department cases"
                        accent="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)]"
                        icon={FileText}
                      />
                      <MetricCard
                        label="Pending Review"
                        value={stats.pendingCases}
                        hint="Awaiting commissioner decision"
                        accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]"
                        icon={Activity}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
