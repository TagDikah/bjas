"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Building2, FileText, ShieldCheck, UserPlus, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { AdminAnalytics } from "@/components/admin-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/blockchain"

type Overview = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  roleCounts: Record<string, number>
  users: User[]
}

export default function DppAdminDashboard() {
  const router = useRouter()
  const [overview, setOverview] = useState<Overview>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleCounts: {},
    users: [],
  })

  const dppUsers = useMemo(() => {
    return (overview.users || []).filter((user) =>
      ["dpp_admin", "prosecutor", "prosecution_registry"].includes(String(user?.role || "").toLowerCase())
    )
  }, [overview.users])

  const recentDppUsers = useMemo(() => {
    return [...dppUsers].slice(-6).reverse()
  }, [dppUsers])

  const dppStats = useMemo(() => {
    const prosecutors = dppUsers.filter((user) => String(user?.role || "").toLowerCase() === "prosecutor").length
    const registryUsers = dppUsers.filter((user) => String(user?.role || "").toLowerCase() === "prosecution_registry").length
    const admins = dppUsers.filter((user) => String(user?.role || "").toLowerCase() === "dpp_admin").length

    return {
      total: dppUsers.length,
      prosecutors,
      registryUsers,
      admins,
    }
  }, [dppUsers])

  function formatRole(role: string) {
    const value = String(role || "").trim()
    if (!value) return "Unknown"
    if (value === "dpp_admin") return "DPP Admin"
    if (value === "prosecution_registry") return "Prosecution Registry"
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }

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

  return (
    <DashboardLayout allowedRoles={["dpp_admin"]} title="DPP Admin Dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#5f91c7]/35 bg-gradient-to-r from-[#d9ebfb] via-[#c4dcf5] to-[#adcdec] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#133b63]">Director of Public Prosecutions Admin</h2>
              <p className="text-sm text-[#35597c]">
              Manage prosecution office users and platform-wide oversight.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dpp-admin/register")}
              className="gap-2 border border-[#2e5f93] bg-[#3b78b3] text-white hover:bg-[#2f689e]"
            >
              <UserPlus className="h-4 w-4" />
              Register DPP User
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="DPP Department"
            value={dppStats.total}
            description="Users in prosecution office"
            icon={Users}
            className="border-[#7aa6d1]/45 bg-gradient-to-br from-[#f2f8fe] to-[#dcecff]"
          />
          <StatsCard
            title="Prosecutors"
            value={dppStats.prosecutors}
            description="Review and filing team"
            icon={ShieldCheck}
            className="border-[#7aa6d1]/45 bg-gradient-to-br from-[#f4f9ff] to-[#e1eefc]"
          />
          <StatsCard
            title="Registry"
            value={dppStats.registryUsers}
            description="Registration and intake"
            icon={FileText}
            className="border-[#7aa6d1]/45 bg-gradient-to-br from-[#eef6fd] to-[#d7e8fb]"
          />
          <StatsCard
            title="DPP Admins"
            value={dppStats.admins}
            description="Office oversight"
            icon={Briefcase}
            className="border-[#7aa6d1]/45 bg-gradient-to-br from-[#f3f8fe] to-[#dbeafb]"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[#7aa6d1]/40 bg-gradient-to-b from-[#f7fbff] to-[#edf5fd]">
            <CardHeader>
              <CardTitle className="text-[#1a4b78]">Recent DPP Department Users</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDppUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No DPP department users found yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentDppUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border border-[#c3daf0] bg-white/80 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7e8f8]">
                          <Building2 className="h-5 w-5 text-[#2f6ea6]" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || user.fullName || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email || "No email recorded"}</p>
                        </div>
                      </div>
                      <Badge className="border border-[#98badb] bg-[#d8e9f8] text-[#18466f] hover:bg-[#d8e9f8]">
                        {formatRole(String(user.role || ""))}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#7aa6d1]/40 bg-gradient-to-b from-[#f7fbff] to-[#edf5fd]">
            <CardHeader>
              <CardTitle className="text-[#1a4b78]">DPP Department Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {dppUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No DPP department users available.</p>
              ) : (
                <div className="space-y-3">
                  {dppUsers.map((user) => (
                    <div key={user.id} className="rounded-lg border border-[#c3daf0] bg-white/85 p-3 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{user.name || user.fullName || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email || "No email recorded"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border border-[#98badb] bg-[#d8e9f8] text-[#18466f] hover:bg-[#d8e9f8]">
                            {formatRole(String(user.role || ""))}
                          </Badge>
                          <Badge className={user.isActive ? "bg-[#3b78b3] text-white hover:bg-[#3b78b3]" : "border border-[#98badb] bg-white text-[#486887]"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                        <div><span className="text-muted-foreground">User ID:</span> {user.id || "N/A"}</div>
                        <div><span className="text-muted-foreground">Department:</span> {user.department || "DPP"}</div>
                        <div><span className="text-muted-foreground">Office:</span> {user.station || user.office || "Head Office"}</div>
                        <div><span className="text-muted-foreground">Badge / Ref:</span> {user.badge || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AdminAnalytics
          title="DPP Admin Analytics"
          totalUsers={overview.totalUsers}
          activeUsers={overview.activeUsers}
          inactiveUsers={overview.inactiveUsers}
          roleCounts={overview.roleCounts}
        />
      </div>
    </DashboardLayout>
  )
}
