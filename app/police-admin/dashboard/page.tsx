"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Shield, FileText, UserPlus, Activity } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useStore } from "@/lib/store"
import type { User, CaseData } from "@/lib/blockchain"

export default function PoliceAdminDashboard() {
  const router = useRouter()
  const store = useStore() as any

  const [recentStaff, setRecentStaff] = useState<User[]>([])

  const users: User[] = useMemo(() => {
    if (Array.isArray(store.users)) return store.users as User[]
    if (typeof store.getUsers === "function") {
      const result = store.getUsers()
      return Array.isArray(result) ? (result as User[]) : []
    }
    return []
  }, [store])

  const policeUsers: User[] = useMemo(() => {
    return users.filter(
      (u: User) => u.role === "police_officer" || u.role === "police_commissioner"
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
      (u: User) => u.role === "police_officer"
    ).length

    const commissioners = policeUsers.filter(
      (u: User) => u.role === "police_commissioner"
    ).length

    const totalCases = cases.length

    const pendingCases = cases.filter(
      (c: CaseData) => c.status === "pending_commissioner"
    ).length

    return { totalOfficers, commissioners, totalCases, pendingCases }
  }, [policeUsers, cases])

  useEffect(() => {
    setRecentStaff(policeUsers.slice(-5).reverse())
  }, [policeUsers])

  return (
    <DashboardLayout allowedRoles={["police_admin"]} title="Police Admin Dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Police Administration</h1>
            <p className="text-muted-foreground">
              Manage police department staff and operations
            </p>
          </div>

          <Button onClick={() => router.push("/police-admin/register")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Register New Staff
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Police Officers"
            value={stats.totalOfficers}
            icon={Shield}
            description="Active officers"
          />
          <StatsCard
            title="Commissioners"
            value={stats.commissioners}
            icon={Users}
            description="Department heads"
          />
          <StatsCard
            title="Total Cases"
            value={stats.totalCases}
            icon={FileText}
            description="All recorded cases"
          />
          <StatsCard
            title="Pending Review"
            value={stats.pendingCases}
            icon={Activity}
            description="Awaiting commissioner"
          />
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
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <Badge
                        variant={user.role === "police_commissioner" ? "default" : "secondary"}
                      >
                        {user.role === "police_commissioner" ? "Commissioner" : "Officer"}
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
                onClick={() => router.push("/police-admin/register")}
              >
                <UserPlus className="h-5 w-5" />
                Register New Police Officer
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-12 bg-transparent"
                onClick={() => router.push("/police-admin/staff")}
              >
                <Users className="h-5 w-5" />
                View All Staff Members
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-12 bg-transparent"
                onClick={() => router.push("/police-admin/activity")}
              >
                <Activity className="h-5 w-5" />
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}