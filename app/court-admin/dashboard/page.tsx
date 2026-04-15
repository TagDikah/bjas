"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Scale, FileText, UserPlus, Activity, Gavel } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { AdminAnalytics } from "@/components/admin-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useStore } from "@/lib/store"
import type { User, CaseData } from "@/lib/blockchain"

export default function CourtAdminDashboard() {
  const router = useRouter()
  const store = useStore() as any
  const [overview, setOverview] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleCounts: {} as Record<string, number>,
    users: [] as User[],
  })

  const users: User[] = (overview.users.length > 0 ? overview.users : (store.users ?? store.getUsers?.() ?? [])) as User[]
  const getAllCasesFn: (() => CaseData[]) =
    store.getAllCases ?? store.listCases ?? (() => [])

  const [recentStaff, setRecentStaff] = useState<User[]>([])

  // Court-side users
  const courtUsers = useMemo(() => {
    return (users ?? []).filter((u: User) =>
      u?.role === "court_admin" ||
      u?.role === "registry" ||
      u?.role === "judge" ||
      u?.role === "clerk" ||
      u?.role === "high_court_registry_assistant"
    )
  }, [users])

  const cases = useMemo(() => {
    try {
      return getAllCasesFn() ?? []
    } catch {
      return []
    }
  }, [getAllCasesFn])

  const stats = useMemo(() => {
    const totalCourtStaff = courtUsers.length
    const totalJudges = courtUsers.filter((u: User) => u.role === "judge").length
    const totalClerks = courtUsers.filter((u: User) => u.role === "clerk").length

    const totalCases = (cases ?? []).length

    const inCourtPipeline = (cases ?? []).filter((c: CaseData) =>
      c.status === "assigned_to_judge" ||
      c.status === "in_progress" ||
      c.status === "completed"
    ).length

    return { totalCourtStaff, totalJudges, totalClerks, totalCases, inCourtPipeline }
  }, [courtUsers, cases])

  useEffect(() => {
    setRecentStaff(courtUsers.slice(-5).reverse())
  }, [courtUsers])

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
    <DashboardLayout allowedRoles={["court_admin"]} title="Court Admin Dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Court Administration</h1>
            <p className="text-muted-foreground">Manage court staff and overview court activity</p>
          </div>

          <Button onClick={() => router.push("/court-admin/register")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register New Staff
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Court Staff" value={stats.totalCourtStaff} icon={Users} description="All court users" />
          <StatsCard title="Judges" value={stats.totalJudges} icon={Gavel} description="Active judges" />
          <StatsCard title="Clerks" value={stats.totalClerks} icon={Scale} description="Active clerks" />
          <StatsCard title="Cases in Court" value={stats.inCourtPipeline} icon={Activity} description="Assigned / In progress / Completed" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Staff Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentStaff.length === 0 ? (
                <p className="text-muted-foreground text-sm">No staff registered yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentStaff.map((user: User) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <Badge variant="secondary">
                        {user.role === "court_admin"
                          ? "Court Admin"
                          : user.role === "court_registry"
                          ? "Registry"
                          : user.role === "judge"
                          ? "Judge"
                          : "Clerk"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="justify-start gap-3 h-12 bg-transparent"
                onClick={() => router.push("/court-admin/register")}
              >
                <UserPlus className="h-5 w-5" />
                Register Staff Member
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-12 bg-transparent"
                onClick={() => router.push("/court-admin/staff")}
              >
                <Users className="h-5 w-5" />
                View All Staff
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-12 bg-transparent"
                onClick={() => router.push("/registry/cases")}
              >
                <FileText className="h-5 w-5" />
                View Registry Cases
              </Button>
            </CardContent>
          </Card>
        </div>

        <AdminAnalytics
          title="Court Admin User Analytics"
          totalUsers={overview.totalUsers}
          activeUsers={overview.activeUsers}
          inactiveUsers={overview.inactiveUsers}
          roleCounts={overview.roleCounts}
        />
      </div>
    </DashboardLayout>
  )
}
