"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { AdminAnalytics } from "@/components/admin-analytics"
import { ShieldCheck, Users, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

type Overview = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  roleCounts: Record<string, number>
}

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleCounts: {},
  })

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
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <DashboardLayout allowedRoles={["admin"]} title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="All Users" value={overview.totalUsers} description="Platform-wide accounts" icon={Users} />
          <StatsCard title="Active Users" value={overview.activeUsers} description="Can sign in now" icon={UserCheck} />
          <StatsCard title="Inactive Users" value={overview.inactiveUsers} description="Need review or reactivation" icon={UserX} />
          <StatsCard title="Tracked Roles" value={Object.keys(overview.roleCounts).length} description="Distinct role groups" icon={ShieldCheck} />
        </div>

        <AdminAnalytics
          title="All User Analytics"
          totalUsers={overview.totalUsers}
          activeUsers={overview.activeUsers}
          inactiveUsers={overview.inactiveUsers}
          roleCounts={overview.roleCounts}
        />

        <div className="flex justify-end gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin/rejections">Rejected Cases Module</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/audit">Open Admin Audit Trail</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
